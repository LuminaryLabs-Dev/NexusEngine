import {
  add3,
  createCameraBasis,
  normalizeCameraFramingRequest,
  projectHalfExtents,
  scale3
} from "./perspective-fit.js";

export function calculateOrthographicCameraFit(request = {}) {
  const normalized = normalizeCameraFramingRequest(request);
  const { bounds, viewport, camera, padding } = normalized;
  const aspect = viewport.width / viewport.height;
  const basis = createCameraBasis(camera.preferredDirection, camera.up);
  const projected = projectHalfExtents(bounds.size, basis);
  const orthographicHeight = Math.max(projected.height * 2, projected.width * 2 / aspect) * padding;
  const distance = Math.max(camera.orthographicDistance, projected.depth + camera.nearPadding + 0.01);
  return {
    kind: "camera-framing",
    projection: "orthographic",
    status: bounds.empty ? "empty" : "fitted",
    target: bounds.center,
    position: add3(bounds.center, scale3(basis.direction, distance)),
    direction: basis.direction,
    distance,
    near: Math.max(0.01, distance - projected.depth - camera.nearPadding),
    far: Math.max(0.02, distance + projected.depth + camera.farPadding),
    aspect,
    orthographicHeight,
    orthographicWidth: orthographicHeight * aspect,
    projectedExtents: projected
  };
}
