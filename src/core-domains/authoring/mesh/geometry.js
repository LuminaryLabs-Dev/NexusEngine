import {
  quaternion,
  quatRotate,
  inverseMatrix,
  transformPoint,
  identityMatrix,
} from "../contracts/transforms.js";
import * as math from "nexusengine/domains/spatial/transform-math";
import {
  authoringError as error,
  canonical,
  sharedCanonical,
  freeze,
  requireFields,
  requireInteger,
  requireNumber,
  requireText,
  vector,
} from "../contracts/value.js";

const point = ([x, y, z]) => math.vec3(x, y, z);
const array = ({ x, y, z }) => [x, y, z];
const cross = (a, b) => array(math.cross(point(a), point(b)));
const sub = (a, b) => array(math.sub(point(a), point(b)));
const dot = (a, b) => math.dot(point(a), point(b));
const edgeId = (a, b) => `edge:${JSON.stringify([a, b].sort())}`;
const cornerId = (face, i) => `corner:${JSON.stringify([face, i])}`;
const area2 = (a, b, c) =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

export function triangulateAuthoringPolygon(positions) {
  if (positions.length < 3)
    throw error(
      "AUTHORING_INVALID_TOPOLOGY",
      "A face needs at least three vertices.",
    );
  const local = positions.map((p) => sub(p, positions[0]));
  const extent = Math.max(...local.flat().map(Math.abs));
  const normal = local.reduce(
    (n, p, i) => {
      const c = cross(p, local[(i + 1) % local.length]);
      return n.map((v, j) => v + c[j]);
    },
    [0, 0, 0],
  );
  const magnitude = Math.hypot(...normal);
  if (!(magnitude > Math.max(1e-24, 1e-14 * extent * extent)))
    throw error(
      "AUTHORING_DEGENERATE_FACE",
      "Face area is zero or below the supported tolerance.",
    );
  const unit = normal.map((v) => v / magnitude);
  for (const p of positions)
    if (
      positions.length !== 4 &&
      Math.abs(dot(sub(p, positions[0]), unit)) > Math.max(1e-12, 1e-8 * extent)
    )
      throw error(
        "AUTHORING_NONPLANAR_FACE",
        "Nonplanar n-gons need explicit triangulation; quads use deterministic projected triangulation.",
      );
  const axis = normal.map(Math.abs).indexOf(Math.max(...normal.map(Math.abs)));
  const projected = local.map((p) => p.filter((_, i) => i !== axis));
  const sign = Math.sign(
    projected.reduce((sum, a, i) => {
      const b = projected[(i + 1) % projected.length];
      return sum + a[0] * b[1] - b[0] * a[1];
    }, 0),
  );
  const epsilon = Math.max(1e-24, 1e-12 * extent * extent);
  // Boundary intersections are invalid; touching nonadjacent edges is also rejected.
  const onSegment = (a, b, p) =>
    Math.abs(area2(a, b, p)) <= epsilon &&
    p[0] >= Math.min(a[0], b[0]) &&
    p[0] <= Math.max(a[0], b[0]) &&
    p[1] >= Math.min(a[1], b[1]) &&
    p[1] <= Math.max(a[1], b[1]);
  for (let i = 0; i < projected.length; i++)
    for (let j = i + 1; j < projected.length; j++) {
      if (j === i + 1 || (i === 0 && j === projected.length - 1)) continue;
      const a = projected[i],
        b = projected[(i + 1) % projected.length],
        c = projected[j],
        d = projected[(j + 1) % projected.length];
      if (
        (area2(a, b, c) * area2(a, b, d) < 0 &&
          area2(c, d, a) * area2(c, d, b) < 0) ||
        onSegment(a, b, c) ||
        onSegment(a, b, d) ||
        onSegment(c, d, a) ||
        onSegment(c, d, b)
      )
        throw error(
          "AUTHORING_SELF_INTERSECTION",
          "Face boundary intersects itself.",
        );
    }
  const pending = positions.map((_, i) => i),
    triangles = [];
  while (pending.length > 3) {
    let clipped = false;
    for (let i = 0; i < pending.length; i++) {
      const a = pending[(i + pending.length - 1) % pending.length],
        b = pending[i],
        c = pending[(i + 1) % pending.length];
      if (sign * area2(projected[a], projected[b], projected[c]) <= epsilon)
        continue;
      if (
        pending.some(
          (p) =>
            p !== a &&
            p !== b &&
            p !== c &&
            sign * area2(projected[a], projected[b], projected[p]) >=
              -epsilon &&
            sign * area2(projected[b], projected[c], projected[p]) >=
              -epsilon &&
            sign * area2(projected[c], projected[a], projected[p]) >= -epsilon,
        )
      )
        continue;
      triangles.push([a, b, c]);
      pending.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped)
      throw error(
        "AUTHORING_DEGENERATE_FACE",
        "Polygon cannot be triangulated within the supported tolerance.",
      );
  }
  if (sign * area2(...pending.map((i) => projected[i])) <= epsilon)
    throw error("AUTHORING_DEGENERATE_FACE", "Degenerate triangle.");
  triangles.push(pending);
  return { triangles, normal: unit };
}

const validatedGeometry = new WeakMap();
function knownGeometry(value) {
  return validatedGeometry
    .get(value.vertices)
    ?.get(value.faces)
    ?.has(value.attributes);
}
export function normalizeAuthoringMesh(input) {
  const value = { ...sharedCanonical(input) };
  requireFields(value, ["vertices", "faces", "attributes"], "mesh");
  if (knownGeometry(value)) return value;
  if (!Array.isArray(value.vertices) || !Array.isArray(value.faces))
    throw error(
      "AUTHORING_INVALID_TOPOLOGY",
      "Mesh needs vertices and faces arrays.",
    );
  requireInteger(value.vertices.length, "vertex count", 0, 100000);
  requireInteger(value.faces.length, "face count", 0, 200000);
  const vertices = new Map(),
    faces = new Set(),
    corners = new Set(),
    edges = new Map(),
    incident = new Map();
  for (const v of value.vertices) {
    requireFields(v, ["id", "position"], "vertex");
    requireText(v.id, "vertex ID");
    if (vertices.has(v.id))
      throw error("AUTHORING_DUPLICATE_ELEMENT", `Duplicate vertex ${v.id}.`);
    if (!Object.isFrozen(v)) v.position = vector(v.position);
    for (const n of v.position) requireNumber(n, "position", -1e12, 1e12);
    vertices.set(v.id, v);
    incident.set(v.id, []);
  }
  for (const face of value.faces) {
    requireFields(face, ["id", "vertices", "corners"], "face");
    requireText(face.id, "face ID");
    if (faces.has(face.id))
      throw error("AUTHORING_DUPLICATE_ELEMENT", `Duplicate face ${face.id}.`);
    faces.add(face.id);
    if (
      !Array.isArray(face.vertices) ||
      face.vertices.length < 3 ||
      face.vertices.length > 4096 ||
      new Set(face.vertices).size !== face.vertices.length
    )
      throw error(
        "AUTHORING_INVALID_TOPOLOGY",
        "Faces need 3–4096 distinct vertices.",
      );
    const positions = face.vertices.map((id) => {
      if (!vertices.has(id))
        throw error("AUTHORING_ELEMENT_MISSING", `Unknown vertex ${id}.`);
      return vertices.get(id).position;
    });
    triangulateAuthoringPolygon(positions);
    face.corners ??= face.vertices.map((_, i) => cornerId(face.id, i));
    if (
      !Array.isArray(face.corners) ||
      face.corners.length !== face.vertices.length
    )
      throw error("AUTHORING_INVALID_TOPOLOGY", "Face corner count differs.");
    for (let i = 0; i < face.vertices.length; i++) {
      requireText(face.corners[i], "corner ID");
      if (corners.has(face.corners[i]))
        throw error(
          "AUTHORING_DUPLICATE_ELEMENT",
          "Corner IDs must be globally unique.",
        );
      corners.add(face.corners[i]);
      const a = face.vertices[i],
        b = face.vertices[(i + 1) % face.vertices.length];
      if (
        Math.hypot(
          ...sub(vertices.get(a).position, vertices.get(b).position),
        ) <= 1e-12
      )
        throw error("AUTHORING_DEGENERATE_EDGE", "Zero-length edge.");
      const id = edgeId(a, b),
        uses = edges.get(id) ?? [];
      if (uses.length >= 2 || uses.some((use) => use.a === a))
        throw error(
          "AUTHORING_NONMANIFOLD_EDGE",
          "Edge has too many faces or conflicting winding.",
        );
      uses.push({ a, b, face: face.id });
      edges.set(id, uses);
      incident.get(a).push(id);
      incident.get(b).push(id);
    }
  }
  // Reject bow-tie vertices even when each individual edge has at most two uses.
  for (const edgeIds of incident.values()) {
    const adjacent = new Map();
    let boundaries = 0;
    for (const id of new Set(edgeIds)) {
      const uses = edges.get(id);
      if (uses.length === 1) boundaries++;
      for (const use of uses) {
        if (!adjacent.has(use.face)) adjacent.set(use.face, new Set());
        for (const other of uses) adjacent.get(use.face).add(other.face);
      }
    }
    if (boundaries !== 0 && boundaries !== 2)
      throw error(
        "AUTHORING_NONMANIFOLD_VERTEX",
        "Vertex boundary is not a single fan.",
      );
    if (adjacent.size) {
      const stack = [adjacent.keys().next().value],
        visited = new Set();
      while (stack.length) {
        const face = stack.pop();
        if (visited.has(face)) continue;
        visited.add(face);
        stack.push(...adjacent.get(face));
      }
      if (visited.size !== adjacent.size)
        throw error(
          "AUTHORING_NONMANIFOLD_VERTEX",
          "Vertex has disconnected face fans.",
        );
    }
  }
  const elementSets = {
      vertex: new Set(vertices.keys()),
      edge: new Set(edges.keys()),
      face: faces,
      corner: corners,
    },
    attributeIds = new Set();
  value.attributes ??= [];
  if (!Array.isArray(value.attributes))
    throw error("AUTHORING_INVALID_ATTRIBUTE", "Attributes must be an array.");
  for (const attribute of value.attributes) {
    requireFields(attribute, ["id", "domain", "arity", "values"], "attribute");
    requireText(attribute.id, "attribute ID");
    if (
      attributeIds.has(attribute.id) ||
      !Object.hasOwn(elementSets, attribute.domain)
    )
      throw error(
        "AUTHORING_INVALID_ATTRIBUTE",
        "Duplicate attribute or unknown element domain.",
      );
    attributeIds.add(attribute.id);
    requireInteger(attribute.arity, "attribute arity", 1, 16);
    const reserved = {
      uv0: ["corner", 2],
      color: ["vertex", 4],
      mask: ["vertex", 1],
      material: ["face", 1],
      seam: ["edge", 1],
      sharp: ["edge", 1],
      crease: ["edge", 1],
    };
    if (
      Object.hasOwn(reserved, attribute.id) &&
      (attribute.domain !== reserved[attribute.id][0] ||
        attribute.arity !== reserved[attribute.id][1])
    )
      throw error(
        "AUTHORING_INVALID_ATTRIBUTE",
        `Reserved attribute ${attribute.id} has a fixed domain and arity.`,
      );
    if (
      !attribute.values ||
      typeof attribute.values !== "object" ||
      Array.isArray(attribute.values)
    )
      throw error(
        "AUTHORING_INVALID_ATTRIBUTE",
        "Attribute values must be an element map.",
      );
    for (const [id, data] of Object.entries(attribute.values)) {
      if (!elementSets[attribute.domain].has(id))
        throw error(
          "AUTHORING_INVALID_ATTRIBUTE",
          `Attribute references missing element ${id}.`,
        );
      vector(data, attribute.arity, "attribute value");
    }
  }
  freeze(value.vertices);
  freeze(value.faces);
  freeze(value.attributes);
  const byFaces = validatedGeometry.get(value.vertices) ?? new WeakMap(),
    byAttributes = byFaces.get(value.faces) ?? new WeakSet();
  byAttributes.add(value.attributes);
  byFaces.set(value.faces, byAttributes);
  validatedGeometry.set(value.vertices, byFaces);
  return value;
}

export function inspectAuthoringMesh(input) {
  const mesh = normalizeAuthoringMesh(input),
    edges = new Set();
  for (const f of mesh.faces)
    f.vertices.forEach((v, i) =>
      edges.add(edgeId(v, f.vertices[(i + 1) % f.vertices.length])),
    );
  const bounds = mesh.vertices.length
    ? {
        min: [0, 1, 2].map((i) =>
          mesh.vertices.reduce((a, v) => Math.min(a, v.position[i]), Infinity),
        ),
        max: [0, 1, 2].map((i) =>
          mesh.vertices.reduce((a, v) => Math.max(a, v.position[i]), -Infinity),
        ),
      }
    : null;
  return {
    vertices: mesh.vertices.length,
    edges: edges.size,
    faces: mesh.faces.length,
    corners: mesh.faces.reduce((n, f) => n + f.vertices.length, 0),
    bounds,
  };
}

export function createAuthoringCube({ size = 2 } = {}) {
  requireNumber(size, "size", 1e-6, 1e9);
  const vertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ].map((p, i) => ({ id: `v${i}`, position: p.map((n) => (n * size) / 2) }));
  const faces = [
    [0, 3, 2, 1],
    [4, 5, 6, 7],
    [0, 1, 5, 4],
    [1, 2, 6, 5],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
  ].map((ids, i) => ({ id: `f${i}`, vertices: ids.map((id) => `v${id}`) }));
  return normalizeAuthoringMesh({ vertices, faces, attributes: [] });
}

export function resolveAuthoringSelection(meshInput, selection) {
  return resolveNormalizedSelection(
    normalizeAuthoringMesh(meshInput),
    selection,
  );
}
function resolveNormalizedSelection(mesh, { mode, ids }) {
  if (
    !["vertex", "edge", "face", "object"].includes(mode) ||
    !Array.isArray(ids) ||
    new Set(ids).size !== ids.length
  )
    throw error(
      "AUTHORING_INVALID_SELECTION",
      "Invalid selection mode or IDs.",
    );
  const selected = new Set(),
    byId = new Map();
  if (mode === "object") {
    if (ids.length)
      throw error(
        "AUTHORING_INVALID_SELECTION",
        "Object mode uses an empty element list.",
      );
    return mesh.vertices.map((v) => v.id);
  }
  if (mode === "vertex") for (const v of mesh.vertices) byId.set(v.id, [v.id]);
  if (mode === "face") for (const f of mesh.faces) byId.set(f.id, f.vertices);
  if (mode === "edge")
    for (const f of mesh.faces)
      f.vertices.forEach((a, i) => {
        const b = f.vertices[(i + 1) % f.vertices.length];
        byId.set(edgeId(a, b), [a, b]);
      });
  for (const id of ids) {
    if (!byId.has(id))
      throw error(
        "AUTHORING_ELEMENT_MISSING",
        `Selected ${mode} ${id} is missing.`,
      );
    for (const v of byId.get(id)) selected.add(v);
  }
  return [...selected].sort();
}

export function transformAuthoringMesh(
  input,
  {
    selection = { mode: "object", ids: [] },
    translation = [0, 0, 0],
    rotation = [0, 0, 0, 1],
    scale = [1, 1, 1],
    pivot = [0, 0, 0],
    coordinateFrame = identityMatrix(),
    proportionalRadius = 0,
  } = {},
) {
  const mesh = normalizeAuthoringMesh(input),
    selected = new Set(resolveNormalizedSelection(mesh, selection));
  translation = vector(translation);
  rotation = quaternion(rotation);
  scale = vector(scale);
  pivot = vector(pivot);
  coordinateFrame = vector(coordinateFrame, 16);
  const inverse = inverseMatrix(coordinateFrame);
  requireNumber(proportionalRadius, "proportional radius", 0, 1e9);
  if (scale.some((n) => Math.abs(n) < 1e-9))
    throw error(
      "AUTHORING_UNSUPPORTED_TRANSFORM",
      "Scale must be nonsingular.",
    );
  const mirrored = scale[0] * scale[1] * scale[2] < 0;
  if (
    mirrored &&
    (selected.size !== mesh.vertices.length || proportionalRadius)
  )
    throw error(
      "AUTHORING_UNSUPPORTED_TRANSFORM",
      "Mirrored scale requires a complete mesh selection without proportional falloff.",
    );
  if (proportionalRadius && selected.size * mesh.vertices.length > 10000000)
    throw error(
      "AUTHORING_TRANSFORM_BUDGET",
      "Proportional distance queries exceed the 10M budget.",
    );
  const seeds = mesh.vertices
    .filter((v) => selected.has(v.id))
    .map((v) => transformPoint(coordinateFrame, v.position));
  const vertices = mesh.vertices.map((v) => {
    if (!selected.has(v.id) && !proportionalRadius) return v;
    const point = transformPoint(coordinateFrame, v.position);
    let strength = selected.has(v.id) ? 1 : 0;
    if (!strength && proportionalRadius && seeds.length) {
      const distance = seeds.reduce(
        (d, p) => Math.min(d, Math.hypot(...point.map((n, i) => n - p[i]))),
        Infinity,
      );
      const x = Math.max(0, 1 - distance / proportionalRadius);
      strength = x * x * (3 - 2 * x);
    }
    if (!strength) return v;
    const rotated = quatRotate(
      rotation,
      point.map((n, i) => (n - pivot[i]) * scale[i]),
    );
    const target = transformPoint(
      inverse,
      rotated.map((n, i) => n + pivot[i] + translation[i]),
    );
    return {
      ...v,
      position: v.position.map((n, i) => n + (target[i] - n) * strength),
    };
  });
  const faces = mirrored
    ? mesh.faces.map((f) => ({
        ...f,
        vertices: [...f.vertices].reverse(),
        corners: [...f.corners].reverse(),
      }))
    : mesh.faces;
  return normalizeAuthoringMesh({ ...mesh, vertices, faces });
}
