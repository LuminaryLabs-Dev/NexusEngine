export const PLACEMENT_EPSILON = 1e-8;

export const clonePlacementValue = (value) => value === undefined
  ? undefined
  : structuredClone(value);

export function finitePlacementValue(value, fallback, label) {
  const next = Number(value ?? fallback);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function placementVector3(value, fallback, label) {
  const source = Array.isArray(value) ? value : fallback;
  if (!Array.isArray(source) || source.length !== 3) {
    throw new TypeError(`${label} must contain three values.`);
  }
  return source.map((entry, index) => finitePlacementValue(entry, fallback[index], `${label}[${index}]`));
}

export const addPlacementVectors = (left, right) => [
  left[0] + right[0],
  left[1] + right[1],
  left[2] + right[2]
];

export const subtractPlacementVectors = (left, right) => [
  left[0] - right[0],
  left[1] - right[1],
  left[2] - right[2]
];

export const multiplyPlacementVectors = (left, right) => [
  left[0] * right[0],
  left[1] * right[1],
  left[2] * right[2]
];

export const scalePlacementVector = (value, amount) => [
  value[0] * amount,
  value[1] * amount,
  value[2] * amount
];

export const dotPlacementVectors = (left, right) => (
  left[0] * right[0] + left[1] * right[1] + left[2] * right[2]
);

export const crossPlacementVectors = (left, right) => [
  left[1] * right[2] - left[2] * right[1],
  left[2] * right[0] - left[0] * right[2],
  left[0] * right[1] - left[1] * right[0]
];

export const placementVectorMagnitude = (value) => Math.hypot(value[0], value[1], value[2]);

export function unitPlacementVector(value, label) {
  const length = placementVectorMagnitude(value);
  if (length <= PLACEMENT_EPSILON) throw new TypeError(`${label} cannot be a zero vector.`);
  return scalePlacementVector(value, 1 / length);
}

export function normalizePlacementQuaternion(value, label) {
  const source = Array.isArray(value) ? value : [0, 0, 0, 1];
  if (source.length !== 4) throw new TypeError(`${label} must contain four values.`);
  const next = source.map((entry, index) => finitePlacementValue(entry, index === 3 ? 1 : 0, `${label}[${index}]`));
  const length = Math.hypot(...next);
  if (length <= PLACEMENT_EPSILON) throw new TypeError(`${label} cannot be a zero quaternion.`);
  return next.map((entry) => entry / length);
}

export function multiplyPlacementQuaternions(left, right) {
  const [lx, ly, lz, lw] = left;
  const [rx, ry, rz, rw] = right;
  return normalizePlacementQuaternion([
    lw * rx + lx * rw + ly * rz - lz * ry,
    lw * ry - lx * rz + ly * rw + lz * rx,
    lw * rz + lx * ry - ly * rx + lz * rw,
    lw * rw - lx * rx - ly * ry - lz * rz
  ], "quaternion product");
}

export function rotatePlacementVector(value, rotation) {
  const vector = [rotation[0], rotation[1], rotation[2]];
  const firstCross = crossPlacementVectors(vector, value);
  const secondCross = crossPlacementVectors(vector, firstCross);
  return addPlacementVectors(
    value,
    addPlacementVectors(
      scalePlacementVector(firstCross, 2 * rotation[3]),
      scalePlacementVector(secondCross, 2)
    )
  );
}

export function placementQuaternionFromUnitVectors(from, to) {
  let scalar = dotPlacementVectors(from, to) + 1;
  let axis;
  if (scalar < PLACEMENT_EPSILON) {
    scalar = 0;
    axis = Math.abs(from[0]) > Math.abs(from[2])
      ? [-from[1], from[0], 0]
      : [0, -from[2], from[1]];
  } else {
    axis = crossPlacementVectors(from, to);
  }
  return normalizePlacementQuaternion([axis[0], axis[1], axis[2], scalar], "alignment quaternion");
}

export function placementQuaternionFromAxisAngle(axis, angle) {
  const normalizedAxis = unitPlacementVector(axis, "rotation axis");
  const half = angle / 2;
  const sine = Math.sin(half);
  return normalizePlacementQuaternion([
    normalizedAxis[0] * sine,
    normalizedAxis[1] * sine,
    normalizedAxis[2] * sine,
    Math.cos(half)
  ], "axis-angle quaternion");
}

export const projectPlacementVectorToPlane = (value, normal) => (
  subtractPlacementVectors(value, scalePlacementVector(normal, dotPlacementVectors(value, normal)))
);

export function fallbackPlacementForward(normal) {
  const preferred = projectPlacementVectorToPlane([0, 0, -1], normal);
  if (placementVectorMagnitude(preferred) > PLACEMENT_EPSILON) {
    return unitPlacementVector(preferred, "anchor forward");
  }
  return unitPlacementVector(projectPlacementVectorToPlane([1, 0, 0], normal), "anchor forward");
}

export function normalizePlacementBounds(input, label = "localBounds") {
  if (!input || typeof input !== "object") throw new TypeError(`${label} is required.`);
  let minimum;
  let maximum;
  if (input.min != null || input.max != null) {
    minimum = placementVector3(input.min, [0, 0, 0], `${label}.min`);
    maximum = placementVector3(input.max, [0, 0, 0], `${label}.max`);
  } else {
    const center = placementVector3(input.center, [0, 0, 0], `${label}.center`);
    const size = placementVector3(input.size, [0, 0, 0], `${label}.size`);
    if (size.some((entry) => entry < 0)) throw new RangeError(`${label}.size cannot be negative.`);
    minimum = subtractPlacementVectors(center, scalePlacementVector(size, 0.5));
    maximum = addPlacementVectors(center, scalePlacementVector(size, 0.5));
  }
  if (minimum.some((entry, index) => entry > maximum[index])) {
    throw new RangeError(`${label}.min cannot exceed ${label}.max.`);
  }
  const size = subtractPlacementVectors(maximum, minimum);
  if (size.every((entry) => entry <= PLACEMENT_EPSILON)) {
    throw new RangeError(`${label} must occupy space on at least one axis.`);
  }
  return {
    min: minimum,
    max: maximum,
    center: scalePlacementVector(addPlacementVectors(minimum, maximum), 0.5),
    size
  };
}

export function placementBoundsCorners(bounds) {
  const result = [];
  for (const x of [bounds.min[0], bounds.max[0]]) {
    for (const y of [bounds.min[1], bounds.max[1]]) {
      for (const z of [bounds.min[2], bounds.max[2]]) result.push([x, y, z]);
    }
  }
  return result;
}

export function placementPointInsideBounds(point, bounds, tolerance = 0) {
  return point.every((entry, index) => (
    entry >= bounds.min[index] - tolerance && entry <= bounds.max[index] + tolerance
  ));
}

export function placementBoundsOverlap(left, right, padding = 0) {
  return left.min.every((minimum, axis) => (
    minimum < right.max[axis] - padding && left.max[axis] > right.min[axis] + padding
  ));
}
