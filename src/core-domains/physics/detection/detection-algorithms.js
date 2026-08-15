import {
  DETECTION_SCHEMAS,
  compareCollisionDetectionResults,
  createBroadPhasePair,
  detectionBoundsOverlap,
  detectionProxyPairAllowed,
  mergeDetectionBounds,
  normalizeBroadPhasePair,
  normalizeCollisionDetectionResult,
  normalizeContinuousCollisionInput,
  normalizeDetectionBounds,
  normalizeDetectionInput,
  normalizeDetectionProxy,
  normalizeDetectionShape,
  normalizeDetectionVector,
  requireDetectionInteger,
  requireDetectionNumber
} from "./detection-contracts.js";
import {
  addVector,
  closestPointOnOrientedBox,
  computeShapeBounds,
  crossVector,
  dotVector,
  minkowskiSupport,
  negateVector,
  normalizeVector,
  perpendicularVector,
  planeWorldEquation,
  rotateVector,
  scaleVector,
  subtractVector,
  supportsConvexDetection,
  transformPoint,
  translatePose,
  vectorLength,
  vectorLengthSquared,
  worldShapeSupport
} from "./detection-math.js";

const EPSILON = 1e-12;

function normalizeProxies(inputs, label = "Detection proxies") {
  if (!Array.isArray(inputs)) throw new TypeError(`${label} must be an array.`);
  const proxies = inputs.map((entry, index) => normalizeDetectionProxy(entry, `${label}[${index}]`));
  const ids = new Set();
  for (const proxy of proxies) {
    if (ids.has(proxy.id)) throw new TypeError(`${label} contains duplicate proxy ${proxy.id}.`);
    ids.add(proxy.id);
  }
  return proxies.sort((left, right) => left.id.localeCompare(right.id));
}

function pairCandidates(proxies, pairs) {
  const byId = Object.fromEntries(proxies.map((proxy) => [proxy.id, proxy]));
  const selected = new Map();
  for (const [leftId, rightId] of pairs) {
    const left = byId[leftId];
    const right = byId[rightId];
    if (!left || !right || !detectionProxyPairAllowed(left, right)) continue;
    if (!detectionBoundsOverlap(left.bounds, right.bounds)) continue;
    const pair = createBroadPhasePair(left, right);
    selected.set(pair.id, pair);
  }
  return [...selected.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function sweepAndPrunePairs(inputs, options = {}) {
  const proxies = normalizeProxies(inputs);
  const axis = requireDetectionInteger(options.axis ?? 0, "Sweep-and-prune axis", { maximum: 2 });
  const ordered = [...proxies].sort((left, right) => {
    const leftMinimum = left.bounds.kind === "unbounded" ? Number.NEGATIVE_INFINITY : left.bounds.min[axis];
    const rightMinimum = right.bounds.kind === "unbounded" ? Number.NEGATIVE_INFINITY : right.bounds.min[axis];
    return leftMinimum - rightMinimum || left.id.localeCompare(right.id);
  });
  const active = [];
  const candidates = [];
  for (const proxy of ordered) {
    const minimum = proxy.bounds.kind === "unbounded" ? Number.NEGATIVE_INFINITY : proxy.bounds.min[axis];
    for (let index = active.length - 1; index >= 0; index -= 1) {
      const maximum = active[index].bounds.kind === "unbounded" ? Number.POSITIVE_INFINITY : active[index].bounds.max[axis];
      if (maximum < minimum) active.splice(index, 1);
    }
    for (const candidate of active) candidates.push([candidate.id, proxy.id]);
    active.push(proxy);
    active.sort((left, right) => left.id.localeCompare(right.id));
  }
  return pairCandidates(proxies, candidates);
}

function boundsCenter(bounds) {
  if (bounds.kind === "unbounded") return [0, 0, 0];
  return bounds.min.map((entry, axis) => (entry + bounds.max[axis]) / 2);
}

function largestBoundsAxis(bounds) {
  if (bounds.kind === "unbounded") return 0;
  const extents = bounds.max.map((entry, axis) => entry - bounds.min[axis]);
  let selected = 0;
  for (let axis = 1; axis < 3; axis += 1) {
    if (extents[axis] > extents[selected]) selected = axis;
  }
  return selected;
}

export function buildDynamicTree(inputs) {
  const proxies = normalizeProxies(inputs);
  if (proxies.length === 0) {
    return Object.freeze({ schema: DETECTION_SCHEMAS.tree, rootId: null, nodes: Object.freeze({}), proxyCount: 0 });
  }
  const nodes = {};
  let sequence = 0;

  function build(entries) {
    const id = `node-${String(sequence).padStart(6, "0")}`;
    sequence += 1;
    if (entries.length === 1) {
      nodes[id] = { id, bounds: entries[0].bounds, leftId: null, rightId: null, proxyId: entries[0].id };
      return id;
    }
    const bounds = mergeDetectionBounds(entries.map((entry) => entry.bounds));
    const axis = largestBoundsAxis(bounds);
    const ordered = [...entries].sort((left, right) => (
      boundsCenter(left.bounds)[axis] - boundsCenter(right.bounds)[axis]
      || left.id.localeCompare(right.id)
    ));
    const middle = Math.ceil(ordered.length / 2);
    const leftId = build(ordered.slice(0, middle));
    const rightId = build(ordered.slice(middle));
    nodes[id] = { id, bounds, leftId, rightId, proxyId: null };
    return id;
  }

  const rootId = build(proxies);
  return Object.freeze({
    schema: DETECTION_SCHEMAS.tree,
    rootId,
    nodes: Object.freeze(Object.fromEntries(Object.keys(nodes).sort().map((id) => [id, Object.freeze(nodes[id])]))),
    proxyCount: proxies.length
  });
}

function normalizeTree(tree) {
  if (!tree || typeof tree !== "object" || Array.isArray(tree)) throw new TypeError("Dynamic tree must be an object.");
  if (tree.schema !== DETECTION_SCHEMAS.tree) throw new TypeError(`Dynamic tree.schema must equal ${DETECTION_SCHEMAS.tree}.`);
  if (!tree.nodes || typeof tree.nodes !== "object" || Array.isArray(tree.nodes)) throw new TypeError("Dynamic tree.nodes must be an object.");
  if (tree.rootId !== null && !tree.nodes[tree.rootId]) throw new TypeError("Dynamic tree.rootId must identify a node.");
  const proxyIds = new Set();
  for (const [nodeId, node] of Object.entries(tree.nodes)) {
    if (!node || typeof node !== "object" || Array.isArray(node) || node.id !== nodeId) {
      throw new TypeError(`Dynamic tree node ${nodeId} must be an object whose id matches its key.`);
    }
    normalizeDetectionBounds(node.bounds, `Dynamic tree node ${nodeId}.bounds`);
    const leaf = node.proxyId !== null;
    if (leaf) {
      if (typeof node.proxyId !== "string" || node.proxyId.length === 0 || node.leftId !== null || node.rightId !== null) {
        throw new TypeError(`Dynamic tree leaf ${nodeId} must contain one proxy and no children.`);
      }
      if (proxyIds.has(node.proxyId)) throw new TypeError(`Dynamic tree contains duplicate proxy ${node.proxyId}.`);
      proxyIds.add(node.proxyId);
    } else if (!tree.nodes[node.leftId] || !tree.nodes[node.rightId] || node.leftId === node.rightId) {
      throw new TypeError(`Dynamic tree branch ${nodeId} must reference two different existing children.`);
    }
  }
  return tree;
}

export function queryDynamicTree(treeInput, boundsInput) {
  const tree = normalizeTree(treeInput);
  const bounds = normalizeDetectionBounds(boundsInput);
  if (tree.rootId === null) return [];
  const selected = [];
  const stack = [tree.rootId];
  const visited = new Set();
  while (stack.length > 0) {
    const nodeId = stack.pop();
    if (visited.has(nodeId)) throw new TypeError(`Dynamic tree contains a cycle or shared node at ${nodeId}.`);
    visited.add(nodeId);
    const node = tree.nodes[nodeId];
    if (!node) throw new TypeError(`Dynamic tree references missing node ${nodeId}.`);
    if (!detectionBoundsOverlap(node.bounds, bounds)) continue;
    if (node.proxyId !== null) selected.push(node.proxyId);
    else {
      if (!node.leftId || !node.rightId) throw new TypeError(`Dynamic tree branch ${nodeId} must have two children.`);
      stack.push(node.rightId, node.leftId);
    }
  }
  return [...new Set(selected)].sort();
}

export function dynamicTreePairs(inputs) {
  const proxies = normalizeProxies(inputs);
  const tree = buildDynamicTree(proxies);
  const candidates = [];
  for (const proxy of proxies) {
    for (const candidateId of queryDynamicTree(tree, proxy.bounds)) {
      if (proxy.id.localeCompare(candidateId) < 0) candidates.push([proxy.id, candidateId]);
    }
  }
  return pairCandidates(proxies, candidates);
}

export function detectBroadPhase(inputs, options = {}) {
  const proxies = normalizeProxies(inputs);
  const strategy = options.strategy ?? "auto";
  if (!["auto", "sweep-and-prune", "dynamic-tree"].includes(strategy)) {
    throw new TypeError("Broad phase strategy must be auto, sweep-and-prune, or dynamic-tree.");
  }
  const selected = strategy === "auto" ? (proxies.length < 64 ? "sweep-and-prune" : "dynamic-tree") : strategy;
  const pairs = selected === "sweep-and-prune"
    ? sweepAndPrunePairs(proxies, { axis: options.axis ?? 0 })
    : dynamicTreePairs(proxies);
  return Object.freeze({ strategy: selected, proxyCount: proxies.length, pairs: Object.freeze(pairs) });
}

function supportVertex(shapeA, poseA, shapeB, poseB, direction) {
  return minkowskiSupport(shapeA, poseA, shapeB, poseB, direction);
}

function tripleCross(left, middle, right) {
  return crossVector(crossVector(left, middle), right);
}

function directionOrPerpendicular(direction, basis) {
  return vectorLengthSquared(direction) <= EPSILON ? perpendicularVector(basis) : direction;
}

function lineSimplex(simplex) {
  const [a, b] = simplex;
  const ab = subtractVector(b.point, a.point);
  const ao = negateVector(a.point);
  if (dotVector(ab, ao) > 0) {
    return { containsOrigin: false, simplex: [a, b], direction: directionOrPerpendicular(tripleCross(ab, ao, ab), ab) };
  }
  return { containsOrigin: vectorLengthSquared(ao) <= EPSILON, simplex: [a], direction: ao };
}

function triangleSimplex(simplex) {
  const [a, b, c] = simplex;
  const ab = subtractVector(b.point, a.point);
  const ac = subtractVector(c.point, a.point);
  const ao = negateVector(a.point);
  const abc = crossVector(ab, ac);
  if (dotVector(crossVector(abc, ac), ao) > 0) {
    if (dotVector(ac, ao) > 0) {
      return { containsOrigin: false, simplex: [a, c], direction: directionOrPerpendicular(tripleCross(ac, ao, ac), ac) };
    }
    return dotVector(ab, ao) > 0
      ? { containsOrigin: false, simplex: [a, b], direction: directionOrPerpendicular(tripleCross(ab, ao, ab), ab) }
      : { containsOrigin: vectorLengthSquared(ao) <= EPSILON, simplex: [a], direction: ao };
  }
  if (dotVector(crossVector(ab, abc), ao) > 0) {
    return dotVector(ab, ao) > 0
      ? { containsOrigin: false, simplex: [a, b], direction: directionOrPerpendicular(tripleCross(ab, ao, ab), ab) }
      : { containsOrigin: vectorLengthSquared(ao) <= EPSILON, simplex: [a], direction: ao };
  }
  if (dotVector(abc, ao) > 0) return { containsOrigin: false, simplex: [a, b, c], direction: abc };
  return { containsOrigin: false, simplex: [a, c, b], direction: negateVector(abc) };
}

function orientedFace(a, b, c, opposite) {
  let second = b;
  let third = c;
  let normal = crossVector(subtractVector(second.point, a.point), subtractVector(third.point, a.point));
  if (dotVector(normal, subtractVector(opposite.point, a.point)) > 0) {
    [second, third] = [third, second];
    normal = negateVector(normal);
  }
  return { simplex: [a, second, third], normal };
}

function tetrahedronSimplex(simplex) {
  const [a, b, c, d] = simplex;
  const ao = negateVector(a.point);
  const faces = [
    orientedFace(a, b, c, d),
    orientedFace(a, c, d, b),
    orientedFace(a, d, b, c)
  ];
  for (const face of faces) {
    if (dotVector(face.normal, ao) > 0) return triangleSimplex(face.simplex);
  }
  return { containsOrigin: true, simplex: [a, b, c, d], direction: [0, 0, 0] };
}

function updateSimplex(simplex) {
  if (simplex.length === 2) return lineSimplex(simplex);
  if (simplex.length === 3) return triangleSimplex(simplex);
  if (simplex.length === 4) return tetrahedronSimplex(simplex);
  const direction = negateVector(simplex[0].point);
  return { containsOrigin: vectorLengthSquared(direction) <= EPSILON, simplex, direction };
}

function normalizeSupportVertex(vertex) {
  return {
    point: normalizeDetectionVector(vertex.point, "GJK simplex point"),
    pointA: normalizeDetectionVector(vertex.pointA, "GJK simplex pointA"),
    pointB: normalizeDetectionVector(vertex.pointB, "GJK simplex pointB")
  };
}

export function gjkDetect(input = {}) {
  const request = normalizeDetectionInput(input, "GJK input");
  if (!supportsConvexDetection(request.shapeA) || !supportsConvexDetection(request.shapeB)) {
    return Object.freeze({
      schema: DETECTION_SCHEMAS.gjkResult,
      status: "unsupported",
      intersects: false,
      iterations: 0,
      direction: null,
      simplex: Object.freeze([]),
      reason: `GJK requires two convex support shapes; received ${request.shapeA.type} and ${request.shapeB.type}.`
    });
  }
  let direction = subtractVector(request.poseB.position, request.poseA.position);
  if (vectorLengthSquared(direction) <= EPSILON) direction = [1, 0, 0];
  let simplex = [supportVertex(request.shapeA, request.poseA, request.shapeB, request.poseB, direction)];
  direction = negateVector(simplex[0].point);
  if (vectorLengthSquared(direction) <= request.tolerance ** 2) {
    return Object.freeze({ schema: DETECTION_SCHEMAS.gjkResult, status: "touching", intersects: true, iterations: 1, direction: [0, 0, 0], simplex: Object.freeze(simplex.map(normalizeSupportVertex)), reason: null });
  }

  for (let iteration = 1; iteration <= request.maxIterations; iteration += 1) {
    const vertex = supportVertex(request.shapeA, request.poseA, request.shapeB, request.poseB, direction);
    const projection = dotVector(vertex.point, direction);
    if (projection < request.tolerance) {
      return Object.freeze({
        schema: DETECTION_SCHEMAS.gjkResult,
        status: "separated",
        intersects: false,
        iterations: iteration,
        direction: normalizeVector(direction),
        simplex: Object.freeze(simplex.map(normalizeSupportVertex)),
        reason: null
      });
    }
    const duplicate = simplex.some((entry) => vectorLengthSquared(subtractVector(entry.point, vertex.point)) <= request.tolerance ** 2);
    if (duplicate) {
      return Object.freeze({
        schema: DETECTION_SCHEMAS.gjkResult,
        status: "indeterminate",
        intersects: false,
        iterations: iteration,
        direction: normalizeVector(direction),
        simplex: Object.freeze(simplex.map(normalizeSupportVertex)),
        reason: "GJK repeated a support point before enclosing the origin."
      });
    }
    simplex.unshift(vertex);
    const update = updateSimplex(simplex);
    simplex = update.simplex;
    direction = update.direction;
    if (update.containsOrigin) {
      return Object.freeze({
        schema: DETECTION_SCHEMAS.gjkResult,
        status: simplex.length === 4 ? "intersecting" : "touching",
        intersects: true,
        iterations: iteration,
        direction: vectorLengthSquared(direction) <= EPSILON ? [0, 0, 0] : normalizeVector(direction),
        simplex: Object.freeze(simplex.map(normalizeSupportVertex)),
        reason: null
      });
    }
    if (vectorLengthSquared(direction) <= request.tolerance ** 2) {
      return Object.freeze({ schema: DETECTION_SCHEMAS.gjkResult, status: "touching", intersects: true, iterations: iteration, direction: [0, 0, 0], simplex: Object.freeze(simplex.map(normalizeSupportVertex)), reason: null });
    }
  }
  return Object.freeze({
    schema: DETECTION_SCHEMAS.gjkResult,
    status: "indeterminate",
    intersects: false,
    iterations: request.maxIterations,
    direction: normalizeVector(direction),
    simplex: Object.freeze(simplex.map(normalizeSupportVertex)),
    reason: "GJK reached its iteration limit."
  });
}

function makeEpaFace(points, a, b, c) {
  let indices = [a, b, c];
  let normal = normalizeVector(crossVector(
    subtractVector(points[b].point, points[a].point),
    subtractVector(points[c].point, points[a].point)
  ));
  let distance = dotVector(normal, points[a].point);
  if (distance < 0) {
    indices = [a, c, b];
    normal = negateVector(normal);
    distance = -distance;
  }
  return { indices, normal, distance };
}

function barycentricCoordinates(point, a, b, c) {
  const v0 = subtractVector(b, a);
  const v1 = subtractVector(c, a);
  const v2 = subtractVector(point, a);
  const d00 = dotVector(v0, v0);
  const d01 = dotVector(v0, v1);
  const d11 = dotVector(v1, v1);
  const d20 = dotVector(v2, v0);
  const d21 = dotVector(v2, v1);
  const denominator = d00 * d11 - d01 * d01;
  if (Math.abs(denominator) <= EPSILON) return [1 / 3, 1 / 3, 1 / 3];
  const v = (d11 * d20 - d01 * d21) / denominator;
  const w = (d00 * d21 - d01 * d20) / denominator;
  const u = 1 - v - w;
  const clamped = [Math.max(0, u), Math.max(0, v), Math.max(0, w)];
  const total = clamped[0] + clamped[1] + clamped[2];
  return total <= EPSILON ? [1 / 3, 1 / 3, 1 / 3] : clamped.map((entry) => entry / total);
}

function blendWitness(points, weights, key) {
  return [0, 1, 2].map((axis) => points.reduce((sum, point, index) => sum + point[key][axis] * weights[index], 0));
}

export function epaPenetration(input = {}) {
  const { gjkResult, ...requestInput } = input;
  const request = normalizeDetectionInput(requestInput, "EPA input");
  const gjk = gjkResult ?? gjkDetect(request);
  if (!gjk?.intersects || gjk.status !== "intersecting" || !Array.isArray(gjk.simplex) || gjk.simplex.length !== 4) {
    return Object.freeze({
      schema: DETECTION_SCHEMAS.penetration,
      status: gjk?.status === "touching" ? "touching" : "unsupported",
      depth: 0,
      normal: gjk?.direction ?? null,
      pointA: null,
      pointB: null,
      iterations: gjk?.iterations ?? 0,
      reason: "EPA requires an intersecting four-point GJK simplex."
    });
  }
  const points = gjk.simplex.map(normalizeSupportVertex);
  let faces = [
    makeEpaFace(points, 0, 1, 2),
    makeEpaFace(points, 0, 3, 1),
    makeEpaFace(points, 0, 2, 3),
    makeEpaFace(points, 1, 3, 2)
  ];

  for (let iteration = 1; iteration <= request.maxIterations; iteration += 1) {
    faces.sort((left, right) => left.distance - right.distance || left.indices.join(",").localeCompare(right.indices.join(",")));
    const face = faces[0];
    const vertex = supportVertex(request.shapeA, request.poseA, request.shapeB, request.poseB, face.normal);
    const supportDistance = dotVector(face.normal, vertex.point);
    const gap = supportDistance - face.distance;
    const duplicate = points.some((entry) => vectorLengthSquared(subtractVector(entry.point, vertex.point)) <= request.tolerance ** 2);
    if (gap <= request.tolerance || duplicate) {
      const facePoints = face.indices.map((index) => points[index]);
      const projected = scaleVector(face.normal, face.distance);
      const weights = barycentricCoordinates(projected, facePoints[0].point, facePoints[1].point, facePoints[2].point);
      return Object.freeze({
        schema: DETECTION_SCHEMAS.penetration,
        status: face.distance <= request.tolerance ? "touching" : "penetrating",
        depth: face.distance <= request.tolerance ? 0 : face.distance,
        normal: face.normal,
        pointA: blendWitness(facePoints, weights, "pointA"),
        pointB: blendWitness(facePoints, weights, "pointB"),
        iterations: iteration,
        reason: null
      });
    }

    const newIndex = points.length;
    points.push(normalizeSupportVertex(vertex));
    const visible = [];
    for (let index = 0; index < faces.length; index += 1) {
      const facePoint = points[faces[index].indices[0]].point;
      if (dotVector(faces[index].normal, subtractVector(vertex.point, facePoint)) > request.tolerance) visible.push(index);
    }
    if (visible.length === 0) {
      return Object.freeze({ schema: DETECTION_SCHEMAS.penetration, status: "indeterminate", depth: 0, normal: null, pointA: null, pointB: null, iterations: iteration, reason: "EPA could not identify a visible expansion face." });
    }
    const boundary = new Map();
    for (const faceIndex of visible) {
      const [a, b, c] = faces[faceIndex].indices;
      for (const [from, to] of [[a, b], [b, c], [c, a]]) {
        const reverse = `${to}|${from}`;
        if (boundary.has(reverse)) boundary.delete(reverse);
        else boundary.set(`${from}|${to}`, [from, to]);
      }
    }
    const visibleSet = new Set(visible);
    faces = faces.filter((_, index) => !visibleSet.has(index));
    for (const edge of [...boundary.values()].sort((left, right) => left.join("|").localeCompare(right.join("|")))) {
      faces.push(makeEpaFace(points, edge[0], edge[1], newIndex));
    }
  }
  return Object.freeze({ schema: DETECTION_SCHEMAS.penetration, status: "indeterminate", depth: 0, normal: null, pointA: null, pointB: null, iterations: request.maxIterations, reason: "EPA reached its iteration limit." });
}

function result(input) {
  return Object.freeze(normalizeCollisionDetectionResult(input));
}

function sphereSphereIntersection(request) {
  const radiusA = requireDetectionNumber(request.shapeA.radius, "Sphere A radius", { minimum: 0 });
  const radiusB = requireDetectionNumber(request.shapeB.radius, "Sphere B radius", { minimum: 0 });
  if (radiusA <= 0 || radiusB <= 0) throw new TypeError("Sphere radii must be greater than zero.");
  const delta = subtractVector(request.poseB.position, request.poseA.position);
  const distance = vectorLength(delta);
  const normal = normalizeVector(delta);
  const separation = distance - radiusA - radiusB;
  if (separation > request.tolerance) return result({ status: "separated", intersects: false, algorithm: "sphere-sphere", iterations: 1, normal, depth: 0, pointA: addVector(request.poseA.position, scaleVector(normal, radiusA)), pointB: addVector(request.poseB.position, scaleVector(normal, -radiusB)), metadata: request.metadata });
  const depth = Math.max(0, -separation);
  return result({ status: depth <= request.tolerance ? "touching" : "penetrating", intersects: true, algorithm: "sphere-sphere", iterations: 1, normal, depth: depth <= request.tolerance ? 0 : depth, pointA: addVector(request.poseA.position, scaleVector(normal, radiusA)), pointB: addVector(request.poseB.position, scaleVector(normal, -radiusB)), metadata: request.metadata });
}

function sphereBoxIntersection(request, reverse = false) {
  const sphere = reverse ? request.shapeB : request.shapeA;
  const spherePose = reverse ? request.poseB : request.poseA;
  const box = reverse ? request.shapeA : request.shapeB;
  const boxPose = reverse ? request.poseA : request.poseB;
  const radius = requireDetectionNumber(sphere.radius, "Sphere radius", { minimum: 0 });
  if (radius <= 0) throw new TypeError("Sphere radius must be greater than zero.");
  let closest = closestPointOnOrientedBox(spherePose.position, box, boxPose);
  let towardBox = subtractVector(closest, spherePose.position);
  let distance = vectorLength(towardBox);
  let inside = false;
  if (distance <= EPSILON) {
    inside = true;
    const localCenter = rotateVector(subtractVector(spherePose.position, boxPose.position), [-boxPose.rotation[0], -boxPose.rotation[1], -boxPose.rotation[2], boxPose.rotation[3]]);
    const extents = normalizeDetectionVector(box.halfExtents, "Box halfExtents");
    let axis = 0;
    for (let candidate = 1; candidate < 3; candidate += 1) {
      if (extents[candidate] - Math.abs(localCenter[candidate]) < extents[axis] - Math.abs(localCenter[axis])) axis = candidate;
    }
    const localNormal = [0, 0, 0];
    localNormal[axis] = localCenter[axis] < 0 ? -1 : 1;
    const localPoint = [...localCenter];
    localPoint[axis] = localNormal[axis] * extents[axis];
    closest = transformPoint(localPoint, boxPose);
    towardBox = subtractVector(closest, spherePose.position);
    distance = vectorLength(towardBox);
  }
  let normal = normalizeVector(towardBox);
  const separation = inside ? -(distance + radius) : distance - radius;
  const depth = Math.max(0, -separation);
  let pointA = addVector(spherePose.position, scaleVector(normal, radius));
  let pointB = closest;
  if (reverse) {
    normal = negateVector(normal);
    [pointA, pointB] = [pointB, pointA];
  }
  return result({
    status: separation > request.tolerance ? "separated" : depth <= request.tolerance ? "touching" : "penetrating",
    intersects: separation <= request.tolerance,
    algorithm: "sphere-box",
    iterations: 1,
    normal,
    depth: depth <= request.tolerance ? 0 : depth,
    pointA,
    pointB,
    metadata: request.metadata
  });
}

function convexPlaneIntersection(request, reverse = false) {
  const convex = reverse ? request.shapeB : request.shapeA;
  const convexPose = reverse ? request.poseB : request.poseA;
  const plane = reverse ? request.shapeA : request.shapeB;
  const planePose = reverse ? request.poseA : request.poseB;
  if (!supportsConvexDetection(convex)) return null;
  const equation = planeWorldEquation(plane, planePose);
  const centerDistance = dotVector(equation.normal, convexPose.position) + equation.offset;
  const towardPlane = centerDistance >= 0 ? negateVector(equation.normal) : equation.normal;
  const support = worldShapeSupport(convex, convexPose, towardPlane);
  const supportDistance = dotVector(equation.normal, support) + equation.offset;
  const signedSeparation = centerDistance >= 0 ? supportDistance : -supportDistance;
  let normal = towardPlane;
  const planePoint = subtractVector(support, scaleVector(equation.normal, supportDistance));
  let pointA = support;
  let pointB = planePoint;
  if (reverse) {
    normal = negateVector(normal);
    [pointA, pointB] = [pointB, pointA];
  }
  const depth = Math.max(0, -signedSeparation);
  return result({
    status: signedSeparation > request.tolerance ? "separated" : depth <= request.tolerance ? "touching" : "penetrating",
    intersects: signedSeparation <= request.tolerance,
    algorithm: "convex-plane",
    iterations: 1,
    normal,
    depth: depth <= request.tolerance ? 0 : depth,
    pointA,
    pointB,
    metadata: request.metadata
  });
}

export function analyticShapeIntersection(input = {}) {
  const request = normalizeDetectionInput(input, "Shape intersection input");
  if (request.shapeA.type === "sphere" && request.shapeB.type === "sphere") return sphereSphereIntersection(request);
  if (request.shapeA.type === "sphere" && request.shapeB.type === "box") return sphereBoxIntersection(request, false);
  if (request.shapeA.type === "box" && request.shapeB.type === "sphere") return sphereBoxIntersection(request, true);
  if (request.shapeB.type === "plane") return convexPlaneIntersection(request, false);
  if (request.shapeA.type === "plane") return convexPlaneIntersection(request, true);
  return null;
}

export function detectNarrowPhase(input = {}) {
  const request = normalizeDetectionInput(input, "Narrow-phase input");
  const analytic = analyticShapeIntersection(request);
  if (analytic) return analytic;
  const gjk = gjkDetect(request);
  if (gjk.status === "unsupported") return result({ status: "unsupported", intersects: false, algorithm: "narrow-phase", iterations: gjk.iterations, depth: 0, reason: gjk.reason, metadata: request.metadata });
  if (gjk.status === "separated") return result({ status: "separated", intersects: false, algorithm: "gjk", iterations: gjk.iterations, normal: gjk.direction, depth: 0, metadata: request.metadata });
  if (gjk.status === "touching") return result({ status: "touching", intersects: true, algorithm: "gjk", iterations: gjk.iterations, normal: gjk.direction, depth: 0, metadata: request.metadata });
  if (gjk.status !== "intersecting") return result({ status: "indeterminate", intersects: false, algorithm: "gjk", iterations: gjk.iterations, depth: 0, reason: gjk.reason, metadata: request.metadata });
  const penetration = epaPenetration({ ...request, gjkResult: gjk });
  if (penetration.status === "penetrating") {
    return result({
      status: "penetrating",
      intersects: true,
      algorithm: "gjk-epa",
      iterations: gjk.iterations + penetration.iterations,
      normal: negateVector(penetration.normal),
      depth: penetration.depth,
      pointA: penetration.pointA,
      pointB: penetration.pointB,
      metadata: request.metadata
    });
  }
  if (penetration.status === "touching") return result({ status: "touching", intersects: true, algorithm: "gjk-epa", iterations: gjk.iterations + penetration.iterations, normal: penetration.normal, depth: 0, pointA: penetration.pointA, pointB: penetration.pointB, metadata: request.metadata });
  return result({ status: "indeterminate", intersects: false, algorithm: "gjk-epa", iterations: gjk.iterations + penetration.iterations, depth: 0, reason: penetration.reason, metadata: request.metadata });
}

export function continuousSphereCollision(input = {}) {
  const request = normalizeContinuousCollisionInput(input);
  if (request.shapeA.type !== "sphere" || request.shapeB.type !== "sphere") {
    return result({ status: "unsupported", intersects: false, algorithm: "continuous-sphere-sphere", iterations: 0, depth: 0, reason: `Continuous reference detection supports sphere-sphere only; received ${request.shapeA.type} and ${request.shapeB.type}.`, metadata: request.metadata });
  }
  const initial = sphereSphereIntersection(request);
  if (initial.intersects) return result({ ...initial, timeOfImpact: 0 });
  const radiusA = requireDetectionNumber(request.shapeA.radius, "Sphere A radius", { minimum: 0 });
  const radiusB = requireDetectionNumber(request.shapeB.radius, "Sphere B radius", { minimum: 0 });
  const relativePosition = subtractVector(request.poseB.position, request.poseA.position);
  const relativeVelocity = subtractVector(request.velocityB, request.velocityA);
  const radius = radiusA + radiusB;
  const a = dotVector(relativeVelocity, relativeVelocity);
  if (a <= EPSILON) return result({ status: "separated", intersects: false, algorithm: "continuous-sphere-sphere", iterations: 1, depth: 0, reason: null, metadata: request.metadata });
  const b = 2 * dotVector(relativePosition, relativeVelocity);
  const c = dotVector(relativePosition, relativePosition) - radius * radius;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return result({ status: "separated", intersects: false, algorithm: "continuous-sphere-sphere", iterations: 1, depth: 0, reason: null, metadata: request.metadata });
  const time = (-b - Math.sqrt(discriminant)) / (2 * a);
  if (time < 0 || time > request.maxTime) return result({ status: "separated", intersects: false, algorithm: "continuous-sphere-sphere", iterations: 1, depth: 0, reason: null, metadata: request.metadata });
  const poseA = translatePose(request.poseA, request.velocityA, time);
  const poseB = translatePose(request.poseB, request.velocityB, time);
  const impact = sphereSphereIntersection({ ...request, poseA, poseB });
  return result({ ...impact, status: "touching", intersects: true, depth: 0, algorithm: "continuous-sphere-sphere", timeOfImpact: time });
}

export function computeDetectionBounds(shape, pose) {
  return computeShapeBounds(shape, pose);
}

export function sortBroadPhasePairs(inputs) {
  if (!Array.isArray(inputs)) throw new TypeError("Broad-phase pairs must be an array.");
  const pairs = inputs.map((entry, index) => normalizeBroadPhasePair(entry, `Broad-phase pairs[${index}]`));
  const unique = new Map(pairs.map((pair) => [pair.id, pair]));
  return [...unique.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function sortCollisionResults(inputs) {
  if (!Array.isArray(inputs)) throw new TypeError("Collision results must be an array.");
  return inputs.map((entry, index) => normalizeCollisionDetectionResult(entry, `Collision results[${index}]`)).sort(compareCollisionDetectionResults);
}
