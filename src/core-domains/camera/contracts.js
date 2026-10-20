export const CAMERA_PROJECTIONS = Object.freeze(["perspective", "orthographic"]);

export const DEFAULT_CAMERA_FRAMING_POLICY = Object.freeze({
  padding: 1.18,
  smoothTime: 0.18,
  minimumDistance: 0.1,
  maximumDistance: 1000,
  teleportThreshold: 50,
  nearPadding: 0.5,
  farPadding: 4,
  preferredDirection: [0.72, 0.32, 1]
});
