import {
  CONVEX_SUPPORT_SHAPE_TYPES,
  DETECTION_SCHEMAS,
  normalizeDetectionBounds,
  normalizeDetectionPose,
  normalizeDetectionShape,
  normalizeDetectionVector,
  requireDetectionNumber
} from "./detection-contracts.js";

const EPSILON = 1e-12;

export function addVector(left, right) {
  return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
}

export function subtractVector(left, right) {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

export function scaleVector(vector, scalar) {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

export function negateVector(vector) {
  return [-vector[0], -vector[1], -vector[2]];
}

export function dotVector(left, right) {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

export function crossVector(left, right) {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  ];
}

export function vectorLengthSquared(vector) {
  return dotVector(vector, vector);
}

export function vectorLength(vector) {
  return Math.sqrt(vectorLengthSquared(vector));
}

export function normalizeVector(vector, fallback = [1, 0, 0]) {
  const magnitude = vectorLength(vector);
  return magnitude <= EPSILON ? [...fallback] : scaleVector(vector, 1 / magnitude);
}

export function perpendicularVector(vector) {
  const axis = Math.abs(vector[0]) <= Math.abs(vector[1]) && Math.abs(vector[0]) <= Math.abs(vector[2])
    ? [1, 0, 0]
    : Math.abs(vector[1]) <= Math.abs(vector[2]) ? [0, 1, 0] : [0, 0, 1];
  return normalizeVector(crossVector(vector, axis), [1, 0, 0]);
}

export function rotateVector(vector, quaternion) {
  const [qx, qy, qz, qw] = quaternion;
  const q = [qx, qy, qz];
  const uv = crossVector(q, vector);
  const uuv = crossVector(q, uv);
  return addVector(vector, addVector(scaleVector(uv, 2 * qw), scaleVector(uuv, 2)));
}

export function inverseRotateVector(vector, quaternion) {
  return rotateVector(vector, [-quaternion[0], -quaternion[1], -quaternion[2], quaternion[3]]);
}

export function transformPoint(point, pose) {
  return addVector(rotateVector(point, pose.rotation), pose.position);
}

export function translatePose(poseInput, velocityInput, time) {
  const pose = normalizeDetectionPose(poseInput);
  const velocity = normalizeDetectionVector(velocityInput, "Detection velocity", [0, 0, 0]);
  const duration = requireDetectionNumber(time, "Detection translation time", { minimum: 0 });
  return { ...pose, position: addVector(pose.position, scaleVector(velocity, duration)) };
}

function requirePositive(value, label) {
  const number = requireDetectionNumber(value, label, { minimum: 0 });
  if (number <= 0) throw new TypeError(`${label} must be greater than zero.`);
  return number;
}

function requireHalfExtents(value, label) {
  return normalizeDetectionVector(value, label).map((entry, index) => requirePositive(entry, `${label}[${index}]`));
}

function requireVertices(value, label, minimum = 1) {
  if (!Array.isArray(value) || value.length < minimum) throw new TypeError(`${label} must contain at least ${minimum} vertices.`);
  return value.map((entry, index) => normalizeDetectionVector(entry, `${label}[${index}]`));
}

export function supportsConvexDetection(shapeInput) {
  const shape = normalizeDetectionShape(shapeInput);
  return CONVEX_SUPPORT_SHAPE_TYPES.includes(shape.type);
}

export function localShapeSupport(shapeInput, directionInput) {
  const shape = normalizeDetectionShape(shapeInput);
  if (!CONVEX_SUPPORT_SHAPE_TYPES.includes(shape.type)) {
    throw new TypeError(`Detection support mapping does not support ${shape.type} shapes.`);
  }
  const direction = normalizeDetectionVector(directionInput, "Detection support direction");
  const unit = normalizeVector(direction);

  if (shape.type === "sphere") {
    return scaleVector(unit, requirePositive(shape.radius, "Sphere radius"));
  }
  if (shape.type === "box") {
    const extents = requireHalfExtents(shape.halfExtents, "Box halfExtents");
    return extents.map((extent, axis) => direction[axis] < 0 ? -extent : extent);
  }
  if (shape.type === "capsule") {
    const radius = requirePositive(shape.radius, "Capsule radius");
    const halfHeight = requirePositive(shape.halfHeight, "Capsule halfHeight");
    return addVector(scaleVector(unit, radius), [0, direction[1] < 0 ? -halfHeight : halfHeight, 0]);
  }
  if (shape.type === "cylinder") {
    const radius = requirePositive(shape.radius, "Cylinder radius");
    const halfHeight = requirePositive(shape.halfHeight, "Cylinder halfHeight");
    const radial = Math.hypot(direction[0], direction[2]);
    return [
      radial <= EPSILON ? 0 : direction[0] * radius / radial,
      direction[1] < 0 ? -halfHeight : halfHeight,
      radial <= EPSILON ? 0 : direction[2] * radius / radial
    ];
  }
  if (shape.type === "cone") {
    const radius = requirePositive(shape.radius, "Cone radius");
    const halfHeight = requirePositive(shape.halfHeight, "Cone halfHeight");
    const apex = [0, halfHeight, 0];
    const radial = Math.hypot(direction[0], direction[2]);
    const base = [
      radial <= EPSILON ? 0 : direction[0] * radius / radial,
      -halfHeight,
      radial <= EPSILON ? 0 : direction[2] * radius / radial
    ];
    return dotVector(apex, direction) >= dotVector(base, direction) ? apex : base;
  }

  const vertices = requireVertices(shape.vertices, "Convex shape vertices", 4);
  let selected = vertices[0];
  let selectedProjection = dotVector(selected, direction);
  for (let index = 1; index < vertices.length; index += 1) {
    const projection = dotVector(vertices[index], direction);
    if (projection > selectedProjection + EPSILON) {
      selected = vertices[index];
      selectedProjection = projection;
    }
  }
  return [...selected];
}

export function worldShapeSupport(shapeInput, poseInput, directionInput) {
  const pose = normalizeDetectionPose(poseInput);
  const direction = normalizeDetectionVector(directionInput, "World support direction");
  const localDirection = inverseRotateVector(direction, pose.rotation);
  return transformPoint(localShapeSupport(shapeInput, localDirection), pose);
}

export function minkowskiSupport(shapeA, poseA, shapeB, poseB, directionInput) {
  const direction = normalizeDetectionVector(directionInput, "Minkowski support direction");
  const pointA = worldShapeSupport(shapeA, poseA, direction);
  const pointB = worldShapeSupport(shapeB, poseB, negateVector(direction));
  return { point: subtractVector(pointA, pointB), pointA, pointB };
}

function boundsFromPoints(points, label) {
  const normalized = requireVertices(points, label);
  return normalizeDetectionBounds({
    min: [0, 1, 2].map((axis) => Math.min(...normalized.map((point) => point[axis]))),
    max: [0, 1, 2].map((axis) => Math.max(...normalized.map((point) => point[axis])))
  }, label);
}

function orientedExtentBounds(localExtents, pose) {
  const axes = [
    rotateVector([1, 0, 0], pose.rotation),
    rotateVector([0, 1, 0], pose.rotation),
    rotateVector([0, 0, 1], pose.rotation)
  ];
  const worldExtents = [0, 1, 2].map((worldAxis) => (
    Math.abs(axes[0][worldAxis]) * localExtents[0]
    + Math.abs(axes[1][worldAxis]) * localExtents[1]
    + Math.abs(axes[2][worldAxis]) * localExtents[2]
  ));
  return normalizeDetectionBounds({
    min: pose.position.map((entry, axis) => entry - worldExtents[axis]),
    max: pose.position.map((entry, axis) => entry + worldExtents[axis])
  });
}

export function computeShapeBounds(shapeInput, poseInput = {}) {
  const shape = normalizeDetectionShape(shapeInput);
  const pose = normalizeDetectionPose(poseInput);
  if (shape.type === "plane") return { schema: DETECTION_SCHEMAS.bounds, kind: "unbounded" };
  if (shape.type === "sphere") {
    const radius = requirePositive(shape.radius, "Sphere radius");
    return normalizeDetectionBounds({
      min: pose.position.map((entry) => entry - radius),
      max: pose.position.map((entry) => entry + radius)
    });
  }
  if (shape.type === "box") return orientedExtentBounds(requireHalfExtents(shape.halfExtents, "Box halfExtents"), pose);
  if (["capsule", "cylinder", "cone"].includes(shape.type)) {
    const radius = requirePositive(shape.radius, `${shape.type} radius`);
    const halfHeight = requirePositive(shape.halfHeight, `${shape.type} halfHeight`);
    const vertical = shape.type === "capsule" ? halfHeight + radius : halfHeight;
    return orientedExtentBounds([radius, vertical, radius], pose);
  }
  if (shape.type === "convex" || shape.type === "triangle-mesh") {
    const vertices = requireVertices(shape.vertices, `${shape.type} vertices`, shape.type === "convex" ? 4 : 3);
    return boundsFromPoints(vertices.map((point) => transformPoint(point, pose)), `${shape.type} world vertices`);
  }
  if (shape.type === "heightfield") {
    const columns = Number(shape.columns);
    const rows = Number(shape.rows);
    const samples = shape.samples;
    const cellSize = shape.cellSize;
    if (!Number.isInteger(columns) || columns < 2 || !Number.isInteger(rows) || rows < 2) {
      throw new TypeError("Heightfield rows and columns must be integers at least two.");
    }
    if (!Array.isArray(samples) || samples.length !== columns * rows) {
      throw new TypeError("Heightfield samples must contain rows * columns values.");
    }
    const size = Array.isArray(cellSize) && cellSize.length === 2
      ? cellSize.map((entry, index) => requirePositive(entry, `Heightfield cellSize[${index}]`))
      : [1, 1];
    const minimumHeight = Math.min(...samples.map((entry, index) => requireDetectionNumber(entry, `Heightfield samples[${index}]`)));
    const maximumHeight = Math.max(...samples);
    const x = (columns - 1) * size[0];
    const z = (rows - 1) * size[1];
    const corners = [
      [0, minimumHeight, 0], [x, minimumHeight, 0], [0, minimumHeight, z], [x, minimumHeight, z],
      [0, maximumHeight, 0], [x, maximumHeight, 0], [0, maximumHeight, z], [x, maximumHeight, z]
    ];
    return boundsFromPoints(corners.map((point) => transformPoint(point, pose)), "Heightfield world bounds");
  }
  throw new TypeError(`Detection bounds require a resolved shape; ${shape.type} is unsupported.`);
}

export function planeWorldEquation(shapeInput, poseInput = {}) {
  const shape = normalizeDetectionShape(shapeInput);
  if (shape.type !== "plane") throw new TypeError("Plane equation requires a plane shape.");
  const pose = normalizeDetectionPose(poseInput);
  const localNormal = normalizeVector(normalizeDetectionVector(shape.normal, "Plane normal"));
  const normal = normalizeVector(rotateVector(localNormal, pose.rotation));
  const offset = requireDetectionNumber(shape.offset ?? 0, "Plane offset") - dotVector(normal, pose.position);
  return { normal, offset };
}

export function closestPointOnOrientedBox(pointInput, shapeInput, poseInput = {}) {
  const point = normalizeDetectionVector(pointInput, "Point");
  const shape = normalizeDetectionShape(shapeInput);
  if (shape.type !== "box") throw new TypeError("Closest box point requires a box shape.");
  const pose = normalizeDetectionPose(poseInput);
  const extents = requireHalfExtents(shape.halfExtents, "Box halfExtents");
  const local = inverseRotateVector(subtractVector(point, pose.position), pose.rotation);
  const clamped = local.map((entry, axis) => Math.max(-extents[axis], Math.min(extents[axis], entry)));
  return transformPoint(clamped, pose);
}
