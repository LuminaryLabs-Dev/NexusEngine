import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const CAMERA_CONTRACT_SCHEMA = "nexusengine.render-camera-contract/1";
export const CAMERA_STATE_SCHEMA = "nexusengine.render-camera-state/1";
export const CAMERA_UPDATE_COMMAND_SCHEMA = "nexusengine.render-camera-update-command/1";

const COMMON_STATE_KEYS = Object.freeze([
  "id",
  "domain",
  "version",
  "config",
  "descriptors",
  "policies",
  "adapters",
  "metadata",
  "sequence",
  "lastEvent",
  "operationReceipts",
  "record",
  "revision"
]);

const KITS = Object.freeze({
  "camera-binding-kit": { api: "renderCameraBinding", token: "render:camera-binding", fields: ["cameraId", "targetId", "priority", "enabled"] },
  "camera-jitter-kit": { api: "renderCameraJitter", token: "render:camera-jitter", fields: ["amplitude", "frequency", "seed", "enabled"] },
  "camera-projection-kit": { api: "renderCameraProjection", token: "render:camera-projection", fields: ["projection", "near", "far", "fov", "aspect", "left", "right", "top", "bottom"] },
  "camera-reprojection-kit": { api: "renderCameraReprojection", token: "render:camera-reprojection", fields: ["mode", "previousView", "previousProjection", "motionScale"] },
  "camera-view-kit": { api: "renderCameraView", token: "render:camera-view", fields: ["position", "orientation", "up", "handedness"] },
  "camera-viewport-kit": { api: "renderCameraViewport", token: "render:camera-viewport", fields: ["x", "y", "width", "height", "minDepth", "maxDepth"] },
  "multiview-camera-kit": { api: "renderMultiviewCamera", token: "render:multiview-camera", fields: ["views", "layout", "viewMask"] },
  "stereo-camera-kit": { api: "renderStereoCamera", token: "render:stereo-camera", fields: ["ipd", "convergence", "leftOffset", "rightOffset", "enabled"] }
});

function normalizeSignedZero(value) {
  if (Array.isArray(value)) return value.map(normalizeSignedZero);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalizeSignedZero(value[key])]));
  }
  return Object.is(value, -0) ? 0 : value;
}

function canonicalCameraValue(value, label) {
  try {
    return normalizeSignedZero(canonicalizePortableValue(value, label));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  return value;
}

function rejectFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) throw new TypeError(`${label} must be a non-empty string.`);
  return value.trim();
}

function number(value, label, fallback = 0) {
  const next = value === undefined ? fallback : value;
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return Object.is(next, -0) ? 0 : next;
}

function integer(value, label, fallback = 0, minimum = Number.MIN_SAFE_INTEGER) {
  const next = value === undefined ? fallback : value;
  if (!Number.isSafeInteger(next) || next < minimum) throw new TypeError(`${label} must be a safe integer at least ${minimum}.`);
  return next;
}

function boolean(value, label, fallback) {
  const next = value === undefined ? fallback : value;
  if (typeof next !== "boolean") throw new TypeError(`${label} must be boolean.`);
  return next;
}

function vector(value, label, length = 3, fallback = null) {
  const next = value === undefined ? fallback : value;
  if (!Array.isArray(next) || next.length !== length) throw new TypeError(`${label} must be a vector of length ${length}.`);
  return next.map((entry, index) => number(entry, `${label}[${index}]`));
}

function unitVector(value, label, fallback) {
  const next = vector(value, label, 3, fallback);
  const magnitude = Math.hypot(...next);
  if (magnitude <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  return next.map((entry) => normalizeSignedZero(entry / magnitude));
}

function quaternion(value, label) {
  const next = vector(value, label, 4, [0, 0, 0, 1]);
  const magnitude = Math.hypot(...next);
  if (magnitude <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  const normalized = next.map((entry) => entry / magnitude);
  const decisive = [normalized[3], normalized[0], normalized[1], normalized[2]].find((entry) => Math.abs(entry) > 1e-12) ?? 1;
  const sign = decisive < 0 ? -1 : 1;
  return normalized.map((entry) => normalizeSignedZero(entry * sign));
}

function matrix(value, label) {
  if (value === undefined || value === null) return null;
  return vector(value, label, 16);
}

function normalizeSchema(value, schema, label) {
  const next = value ?? schema;
  if (next !== schema) throw new TypeError(`${label}.schema must equal ${schema}.`);
  return next;
}

export function cameraKitDefinition(kitId) {
  const definition = KITS[kitId];
  if (!definition) throw new TypeError(`Unknown camera Kit ${kitId}.`);
  return definition;
}

export function normalizeCameraRecord(kitId, input = {}) {
  const definition = cameraKitDefinition(kitId);
  requireObject(input, `${kitId} record`);
  rejectFields(input, ["schema", ...definition.fields], `${kitId} record`);
  const value = canonicalCameraValue(input, `${kitId} record`);
  const result = { schema: normalizeSchema(value.schema, CAMERA_STATE_SCHEMA, `${kitId} record`) };

  if (kitId === "camera-binding-kit") {
    result.cameraId = requireText(value.cameraId, "camera binding cameraId");
    result.targetId = requireText(value.targetId, "camera binding targetId");
    result.priority = integer(value.priority, "camera binding priority", 0);
    result.enabled = boolean(value.enabled, "camera binding enabled", true);
  } else if (kitId === "camera-view-kit") {
    result.position = vector(value.position, "camera view position", 3, [0, 0, 0]);
    result.orientation = quaternion(value.orientation, "camera view orientation");
    result.up = unitVector(value.up, "camera view up", [0, 1, 0]);
    result.handedness = value.handedness ?? "right";
    if (!["right", "left"].includes(result.handedness)) throw new TypeError("camera view handedness must be right or left.");
  } else if (kitId === "camera-projection-kit") {
    result.projection = value.projection ?? "perspective";
    if (!["perspective", "orthographic"].includes(result.projection)) throw new TypeError("camera projection must be perspective or orthographic.");
    result.near = number(value.near, "camera projection near", 0.01);
    result.far = number(value.far, "camera projection far", 1000);
    if (result.near <= 0 || result.far <= result.near) throw new TypeError("camera projection requires 0 < near < far.");
    result.fov = number(value.fov, "camera projection fov", Math.PI / 3);
    result.aspect = number(value.aspect, "camera projection aspect", 1);
    if (result.fov <= 0 || result.fov >= Math.PI) throw new TypeError("camera projection fov must be between zero and pi radians.");
    if (result.aspect <= 0) throw new TypeError("camera projection aspect must be greater than zero.");
    result.left = number(value.left, "camera projection left", -1);
    result.right = number(value.right, "camera projection right", 1);
    result.top = number(value.top, "camera projection top", 1);
    result.bottom = number(value.bottom, "camera projection bottom", -1);
    if (result.left >= result.right || result.bottom >= result.top) throw new TypeError("camera projection orthographic bounds must be ordered.");
  } else if (kitId === "camera-viewport-kit") {
    result.x = number(value.x, "camera viewport x", 0);
    result.y = number(value.y, "camera viewport y", 0);
    result.width = number(value.width, "camera viewport width", 1);
    result.height = number(value.height, "camera viewport height", 1);
    if (result.x < 0 || result.y < 0 || result.width <= 0 || result.height <= 0) throw new TypeError("camera viewport coordinates and dimensions are out of range.");
    result.minDepth = number(value.minDepth, "camera viewport minDepth", 0);
    result.maxDepth = number(value.maxDepth, "camera viewport maxDepth", 1);
    if (result.minDepth < 0 || result.maxDepth > 1 || result.maxDepth <= result.minDepth) {
      throw new TypeError("camera viewport depth requires 0 <= minDepth < maxDepth <= 1.");
    }
  } else if (kitId === "camera-jitter-kit") {
    result.amplitude = number(value.amplitude, "camera jitter amplitude", 0);
    result.frequency = number(value.frequency, "camera jitter frequency", 0);
    result.seed = integer(value.seed, "camera jitter seed", 0, 0);
    result.enabled = boolean(value.enabled, "camera jitter enabled", true);
    if (result.amplitude < 0 || result.frequency < 0) throw new TypeError("camera jitter amplitude and frequency cannot be negative.");
  } else if (kitId === "camera-reprojection-kit") {
    result.mode = value.mode ?? "none";
    if (!["none", "previous-frame", "velocity"].includes(result.mode)) throw new TypeError("camera reprojection mode is invalid.");
    result.previousView = matrix(value.previousView, "camera reprojection previousView");
    result.previousProjection = matrix(value.previousProjection, "camera reprojection previousProjection");
    result.motionScale = number(value.motionScale, "camera reprojection motionScale", 1);
    if (result.motionScale < 0) throw new TypeError("camera reprojection motionScale cannot be negative.");
  } else if (kitId === "stereo-camera-kit") {
    result.ipd = number(value.ipd, "stereo camera ipd", 0.064);
    result.convergence = number(value.convergence, "stereo camera convergence", 1);
    result.leftOffset = number(value.leftOffset, "stereo camera leftOffset", -result.ipd / 2);
    result.rightOffset = number(value.rightOffset, "stereo camera rightOffset", result.ipd / 2);
    result.enabled = boolean(value.enabled, "stereo camera enabled", true);
    if (result.ipd < 0 || result.convergence <= 0 || result.leftOffset > result.rightOffset) {
      throw new TypeError("stereo camera values are invalid.");
    }
  } else if (kitId === "multiview-camera-kit") {
    if (!Array.isArray(value.views) || value.views.length === 0) throw new TypeError("multiview camera views must be a non-empty array.");
    result.views = value.views.map((view, index) => requireText(view, `multiview camera views[${index}]`));
    if (new Set(result.views).size !== result.views.length) throw new TypeError("multiview camera views cannot contain duplicates.");
    result.layout = value.layout ?? "array";
    if (!["array", "side-by-side", "top-bottom"].includes(result.layout)) throw new TypeError("multiview camera layout is invalid.");
    result.viewMask = integer(value.viewMask, "multiview camera viewMask", 0, 0);
  }

  return result;
}

export function normalizeCameraUpdateCommand(kitId, command = {}) {
  const definition = cameraKitDefinition(kitId);
  requireObject(command, `${kitId} update command`);
  rejectFields(command, ["schema", "operationId", "patch"], `${kitId} update command`);
  const value = canonicalCameraValue(command, `${kitId} update command`);
  requireObject(value.patch, `${kitId} update command.patch`);
  rejectFields(value.patch, definition.fields, `${kitId} update command.patch`);
  return {
    schema: normalizeSchema(value.schema, CAMERA_UPDATE_COMMAND_SCHEMA, `${kitId} update command`),
    operationId: requireText(value.operationId, `${kitId} update command.operationId`),
    patch: value.patch
  };
}

export function normalizeCameraSnapshot(kitId, domain, snapshot) {
  requireObject(snapshot, `${kitId} snapshot`);
  rejectFields(snapshot, COMMON_STATE_KEYS, `${kitId} snapshot`);
  const value = canonicalCameraValue(snapshot, `${kitId} snapshot`);
  if (value.domain !== domain) throw new TypeError(`${kitId} snapshot.domain must equal ${domain}.`);
  if (!Number.isSafeInteger(value.sequence) || value.sequence < 0) throw new TypeError(`${kitId} snapshot.sequence must be a nonnegative safe integer.`);
  if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new TypeError(`${kitId} snapshot.revision must be a nonnegative safe integer.`);
  return { ...value, record: normalizeCameraRecord(kitId, value.record) };
}

export function inspectCameraRecord(kitId, input) {
  try {
    return Object.freeze({ schema: CAMERA_STATE_SCHEMA, valid: true, value: normalizeCameraRecord(kitId, input), errors: Object.freeze([]) });
  } catch (error) {
    return Object.freeze({
      schema: CAMERA_STATE_SCHEMA,
      valid: false,
      value: null,
      errors: Object.freeze([Object.freeze({ code: "invalid-camera-record", message: error.message })])
    });
  }
}

export function cameraContract(kitId) {
  const definition = cameraKitDefinition(kitId);
  return Object.freeze({
    schema: CAMERA_CONTRACT_SCHEMA,
    stateSchema: CAMERA_STATE_SCHEMA,
    updateCommandSchema: CAMERA_UPDATE_COMMAND_SCHEMA,
    kitId,
    api: definition.api,
    capabilityToken: definition.token,
    fields: Object.freeze([...definition.fields]),
    providerExecutionOwnedExternally: true
  });
}
