import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function positive(value, label, fallback) {
  const next = finite(value, label, fallback);
  if (next <= 0) throw new RangeError(`${label} must be positive.`);
  return next;
}

function vector(value = {}, label = "vector", fallback = {}) {
  return {
    x: finite(value.x, `${label}.x`, fallback.x ?? 0),
    y: finite(value.y, `${label}.y`, fallback.y ?? 0),
    z: finite(value.z, `${label}.z`, fallback.z ?? 0)
  };
}

export function normalizeThirdPersonCameraConfig(config = {}) {
  const characterId = String(config.characterId ?? "").trim();
  if (!characterId) throw new TypeError("Third-Person Camera characterId is required.");
  return {
    characterId,
    distance: positive(config.distance, "distance", 9),
    height: finite(config.height, "height", 4.5),
    lookHeight: finite(config.lookHeight, "lookHeight", 1.7),
    yaw: finite(config.yaw, "yaw", 0),
    pitch: finite(config.pitch, "pitch", 0.28),
    minimumPitch: finite(config.minimumPitch, "minimumPitch", -0.2),
    maximumPitch: finite(config.maximumPitch, "maximumPitch", 1.1),
    positionSmoothing: Math.max(0, finite(config.positionSmoothing, "positionSmoothing", 12)),
    lookSmoothing: Math.max(0, finite(config.lookSmoothing, "lookSmoothing", 16))
  };
}

export function createThirdPersonCameraState(config = {}) {
  const normalized = normalizeThirdPersonCameraConfig(config);
  return { characterId: normalized.characterId, yaw: normalized.yaw, pitch: normalized.pitch, descriptor: null, sequence: 0 };
}

export function createThirdPersonCameraDescriptor(state = {}, command = {}, rawConfig = {}) {
  const config = normalizeThirdPersonCameraConfig(rawConfig);
  const subject = vector(command.subject, "subject");
  const delta = Math.max(0, finite(command.delta, "delta", 1 / 60));
  const yaw = finite(state.yaw, "state.yaw", config.yaw) + finite(command.orbit?.yaw, "orbit.yaw", 0);
  const pitch = Math.max(config.minimumPitch, Math.min(config.maximumPitch, finite(state.pitch, "state.pitch", config.pitch) + finite(command.orbit?.pitch, "orbit.pitch", 0)));
  const distance = positive(command.distance, "command.distance", config.distance);
  const desiredLookAt = { x: subject.x, y: subject.y + config.lookHeight, z: subject.z };
  const horizontal = Math.cos(pitch) * distance;
  const desiredPosition = {
    x: desiredLookAt.x - Math.sin(yaw) * horizontal,
    y: desiredLookAt.y + config.height + Math.sin(pitch) * distance,
    z: desiredLookAt.z - Math.cos(yaw) * horizontal
  };
  const smoothing = 1 - Math.exp(-config.positionSmoothing * delta);
  const previousPosition = state.descriptor?.position ?? desiredPosition;
  const previousLookAt = state.descriptor?.lookAt ?? desiredLookAt;
  const lerp = (from, to, alpha) => from + (to - from) * alpha;
  const position = {
    x: lerp(previousPosition.x, desiredPosition.x, smoothing),
    y: lerp(previousPosition.y, desiredPosition.y, smoothing),
    z: lerp(previousPosition.z, desiredPosition.z, smoothing)
  };
  const lookAlpha = 1 - Math.exp(-config.lookSmoothing * delta);
  const lookAt = {
    x: lerp(previousLookAt.x, desiredLookAt.x, lookAlpha),
    y: lerp(previousLookAt.y, desiredLookAt.y, lookAlpha),
    z: lerp(previousLookAt.z, desiredLookAt.z, lookAlpha)
  };
  return cloneSerializableState({
    schema: "nexusengine.camera-descriptor/1",
    id: `${config.characterId}:third-person-camera`,
    mode: "third-person",
    characterId: config.characterId,
    motionActorId: String(command.motionActorId ?? config.characterId),
    sequence: Number(state.sequence ?? 0) + 1,
    position,
    lookAt,
    yaw,
    pitch,
    distance,
    metadata: { occlusionResolved: false }
  });
}
