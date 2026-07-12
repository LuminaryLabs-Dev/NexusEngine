import { DEFAULT_CAMERA_FRAMING_POLICY } from "../../core-domains/core-presentation-domain/contracts.js";

export const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
export const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scale3 = (v, scalar) => [v[0] * scalar, v[1] * scalar, v[2] * scalar];
export const subtract3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const length3 = (v) => Math.hypot(v[0], v[1], v[2]);
export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];

export function normalizeVector3(value, fallback = [0, 0, 1]) {
  const vector = Array.isArray(value)
    ? [finite(value[0], fallback[0]), finite(value[1], fallback[1]), finite(value[2], fallback[2])]
    : [finite(value?.x, fallback[0]), finite(value?.y, fallback[1]), finite(value?.z, fallback[2])];
  const magnitude = length3(vector);
  return magnitude > 1e-8 ? scale3(vector, 1 / magnitude) : [...fallback];
}

export function normalizeBounds(input = {}) {
  const minimum = Array.isArray(input.minimum ?? input.min) ? [...(input.minimum ?? input.min)] : [0, 0, 0];
  const maximum = Array.isArray(input.maximum ?? input.max) ? [...(input.maximum ?? input.max)] : [0, 0, 0];
  const min = minimum.map((value, index) => Math.min(finite(value, 0), finite(maximum[index], 0)));
  const max = maximum.map((value, index) => Math.max(finite(value, 0), finite(minimum[index], 0)));
  const center = min.map((value, index) => (value + max[index]) * 0.5);
  const size = max.map((value, index) => value - min[index]);
  return { minimum: min, maximum: max, center, size, empty: size.every((value) => value <= 1e-9) };
}

export function createCameraBasis(directionInput, upInput = [0, 1, 0]) {
  const direction = normalizeVector3(directionInput, DEFAULT_CAMERA_FRAMING_POLICY.preferredDirection);
  const forward = scale3(direction, -1);
  let right = normalizeVector3(cross3(upInput, forward), [1, 0, 0]);
  if (Math.abs(dot3(right, forward)) > 0.99) right = [1, 0, 0];
  const up = normalizeVector3(cross3(forward, right), [0, 1, 0]);
  return { direction, forward, right, up };
}

export function projectHalfExtents(size, basis) {
  const half = size.map((value) => value * 0.5);
  const project = (axis) => Math.abs(axis[0]) * half[0] + Math.abs(axis[1]) * half[1] + Math.abs(axis[2]) * half[2];
  return {
    width: project(basis.right),
    height: project(basis.up),
    depth: project(basis.forward)
  };
}

export function normalizeCameraFramingRequest(request = {}) {
  const viewportSource = request.viewport ?? {};
  const camera = request.camera ?? {};
  const bounds = normalizeBounds(request.subjectBounds ?? request.bounds ?? {});
  return {
    bounds,
    viewport: {
      width: Math.max(1e-6, finite(viewportSource.width, 1)),
      height: Math.max(1e-6, finite(viewportSource.height, 1))
    },
    camera: {
      projection: camera.projection === "orthographic" ? "orthographic" : "perspective",
      verticalFov: clamp(finite(camera.verticalFov ?? camera.fov, 42), 1, 179),
      preferredDirection: normalizeVector3(camera.preferredDirection, DEFAULT_CAMERA_FRAMING_POLICY.preferredDirection),
      up: normalizeVector3(camera.up, [0, 1, 0]),
      nearPadding: Math.max(0, finite(camera.nearPadding, DEFAULT_CAMERA_FRAMING_POLICY.nearPadding)),
      farPadding: Math.max(0, finite(camera.farPadding, DEFAULT_CAMERA_FRAMING_POLICY.farPadding)),
      orthographicDistance: Math.max(0.01, finite(camera.orthographicDistance, 10))
    },
    padding: Math.max(1, finite(request.padding, DEFAULT_CAMERA_FRAMING_POLICY.padding))
  };
}

export function calculatePerspectiveCameraFit(request = {}) {
  const normalized = normalizeCameraFramingRequest(request);
  const { bounds, viewport, camera, padding } = normalized;
  const aspect = viewport.width / viewport.height;
  const basis = createCameraBasis(camera.preferredDirection, camera.up);
  const projected = projectHalfExtents(bounds.size, basis);
  const verticalFov = camera.verticalFov * Math.PI / 180;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov * 0.5) * aspect);
  const fitHeight = projected.height / Math.max(1e-6, Math.tan(verticalFov * 0.5));
  const fitWidth = projected.width / Math.max(1e-6, Math.tan(horizontalFov * 0.5));
  const distance = Math.max(fitHeight, fitWidth) * padding + projected.depth;
  const position = add3(bounds.center, scale3(basis.direction, distance));
  return {
    kind: "camera-framing",
    projection: "perspective",
    status: bounds.empty ? "empty" : "fitted",
    target: bounds.center,
    position,
    direction: basis.direction,
    distance,
    near: Math.max(0.01, distance - projected.depth - camera.nearPadding),
    far: Math.max(0.02, distance + projected.depth + camera.farPadding),
    aspect,
    verticalFov: camera.verticalFov,
    projectedExtents: projected
  };
}
