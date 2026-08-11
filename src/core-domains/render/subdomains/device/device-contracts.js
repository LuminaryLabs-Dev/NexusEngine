import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const RENDER_DEVICE_SCHEMA = "nexusengine.render-device/1";
export const DEVICE_FEATURE_SCHEMA = "nexusengine.render-device-feature/1";
export const DEVICE_LIMIT_PROFILE_SCHEMA = "nexusengine.render-device-limit-profile/1";
export const DEVICE_CAPABILITY_SCHEMA = "nexusengine.render-device-capability/1";
export const DEVICE_MEMORY_BUDGET_SCHEMA = "nexusengine.render-device-memory-budget/1";
export const DEVICE_MEMORY_RESERVATION_SCHEMA = "nexusengine.render-device-memory-reservation/1";
export const DEVICE_QUEUE_SCHEMA = "nexusengine.render-device-queue/1";
export const DEVICE_SUBMISSION_SCHEMA = "nexusengine.render-device-submission/1";
export const DEVICE_LIFECYCLE_SCHEMA = "nexusengine.render-device-lifecycle/1";
export const DEVICE_LOSS_SCHEMA = "nexusengine.render-device-loss/1";
export const DEVICE_DIAGNOSTICS_SCHEMA = "nexusengine.render-device-diagnostics/1";

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
  "operationReceipts"
]);

const DEVICE_TYPES = Object.freeze(["discrete-gpu", "integrated-gpu", "virtual", "software", "unknown"]);
const FEATURE_CATEGORIES = Object.freeze(["rendering", "compute", "texture", "shader", "synchronization", "presentation", "other"]);
const MEMORY_KINDS = Object.freeze(["buffer", "texture", "render-target", "shader", "pipeline", "other"]);
const QUEUE_TYPES = Object.freeze(["graphics", "compute", "transfer"]);
const LOSS_REASONS = Object.freeze(["device-lost", "context-lost", "reset", "removed", "unknown"]);
const LOSS_OUTCOMES = Object.freeze(["recovered", "replaced", "released", "failed"]);

export function canonicalDeviceValue(value, label = "value") {
  try {
    return canonicalizePortableValue(value, label);
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireDeviceObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectDeviceFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireDeviceText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function optionalDeviceText(value, label, fallback = null) {
  return value === undefined || value === null ? fallback : requireDeviceText(value, label);
}

export function requireDeviceInteger(value, label, { minimum = 0 } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new TypeError(`${label} must be a safe integer of at least ${minimum}.`);
  }
  return value;
}

export function requireDeviceNumber(value, label, { minimum = 0, maximum = Infinity } = {}) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new TypeError(`${label} must be finite between ${minimum} and ${maximum}.`);
  }
  return Object.is(value, -0) ? 0 : value;
}

function requireBoolean(value, label, fallback = false) {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new TypeError(`${label} must be boolean.`);
  return value;
}

function normalizeSchema(value, expected, label) {
  const normalized = value ?? expected;
  if (normalized !== expected) throw new TypeError(`${label}.schema must equal ${expected}.`);
  return normalized;
}

function normalizeEnum(value, allowed, label, fallback) {
  const normalized = String(value ?? fallback);
  if (!allowed.includes(normalized)) throw new TypeError(`${label} must be one of ${allowed.join(", ")}.`);
  return normalized;
}

function normalizeMetadata(value, label) {
  return canonicalDeviceValue(value ?? {}, `${label}.metadata`);
}

export function normalizeDeviceIdList(value = [], label = "ids") {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  const normalized = value.map((entry, index) => requireDeviceText(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} cannot contain duplicate IDs.`);
  return normalized.sort();
}

export function normalizeOperationCommand(input, allowedFields, label) {
  requireDeviceObject(input, label);
  rejectDeviceFields(input, ["operationId", ...allowedFields], label);
  const value = canonicalDeviceValue(input, label);
  value.operationId = requireDeviceText(value.operationId, `${label}.operationId`);
  return value;
}

export function normalizeRenderDevice(input = {}) {
  requireDeviceObject(input, "Render device");
  rejectDeviceFields(input, ["schema", "deviceId", "providerId", "providerVersion", "label", "deviceType", "metadata"], "Render device");
  const value = canonicalDeviceValue(input, "Render device");
  return {
    schema: normalizeSchema(value.schema, RENDER_DEVICE_SCHEMA, "Render device"),
    deviceId: requireDeviceText(value.deviceId, "Render device.deviceId"),
    providerId: requireDeviceText(value.providerId, "Render device.providerId"),
    providerVersion: optionalDeviceText(value.providerVersion, "Render device.providerVersion"),
    label: optionalDeviceText(value.label, "Render device.label"),
    deviceType: normalizeEnum(value.deviceType, DEVICE_TYPES, "Render device.deviceType", "unknown"),
    metadata: normalizeMetadata(value.metadata, "Render device")
  };
}

export function normalizeDeviceFeature(input = {}) {
  requireDeviceObject(input, "Render device feature");
  rejectDeviceFields(input, ["schema", "featureId", "label", "category", "experimental", "metadata"], "Render device feature");
  const value = canonicalDeviceValue(input, "Render device feature");
  return {
    schema: normalizeSchema(value.schema, DEVICE_FEATURE_SCHEMA, "Render device feature"),
    featureId: requireDeviceText(value.featureId, "Render device feature.featureId"),
    label: optionalDeviceText(value.label, "Render device feature.label"),
    category: normalizeEnum(value.category, FEATURE_CATEGORIES, "Render device feature.category", "other"),
    experimental: requireBoolean(value.experimental, "Render device feature.experimental"),
    metadata: normalizeMetadata(value.metadata, "Render device feature")
  };
}

export function normalizeLimitMap(input = {}, label = "limits") {
  requireDeviceObject(input, label);
  const value = canonicalDeviceValue(input, label);
  const entries = Object.entries(value).map(([key, entry]) => [
    requireDeviceText(key, `${label} key`),
    requireDeviceInteger(entry, `${label}.${key}`)
  ]);
  if (new Set(entries.map(([key]) => key)).size !== entries.length) {
    throw new TypeError(`${label} contains keys that collide after normalization.`);
  }
  return Object.fromEntries(entries);
}

export function normalizeDeviceLimitProfile(input = {}) {
  requireDeviceObject(input, "Render device limit profile");
  rejectDeviceFields(input, ["schema", "limitProfileId", "limits", "metadata"], "Render device limit profile");
  const value = canonicalDeviceValue(input, "Render device limit profile");
  return {
    schema: normalizeSchema(value.schema, DEVICE_LIMIT_PROFILE_SCHEMA, "Render device limit profile"),
    limitProfileId: requireDeviceText(value.limitProfileId, "Render device limit profile.limitProfileId"),
    limits: normalizeLimitMap(value.limits, "Render device limit profile.limits"),
    metadata: normalizeMetadata(value.metadata, "Render device limit profile")
  };
}

export function normalizeDeviceCapability(input = {}) {
  requireDeviceObject(input, "Render device capability");
  rejectDeviceFields(input, ["schema", "capabilityId", "device", "featureIds", "limitProfileId", "metadata"], "Render device capability");
  const value = canonicalDeviceValue(input, "Render device capability");
  return {
    schema: normalizeSchema(value.schema, DEVICE_CAPABILITY_SCHEMA, "Render device capability"),
    capabilityId: requireDeviceText(value.capabilityId, "Render device capability.capabilityId"),
    device: normalizeRenderDevice(value.device),
    featureIds: normalizeDeviceIdList(value.featureIds, "Render device capability.featureIds"),
    limitProfileId: requireDeviceText(value.limitProfileId, "Render device capability.limitProfileId"),
    metadata: normalizeMetadata(value.metadata, "Render device capability")
  };
}

export function normalizeMemoryBudget(input = {}) {
  requireDeviceObject(input, "Render device memory budget");
  rejectDeviceFields(input, ["schema", "budgetId", "capabilityId", "capacityBytes", "warningBytes", "metadata"], "Render device memory budget");
  const value = canonicalDeviceValue(input, "Render device memory budget");
  const capacityBytes = requireDeviceInteger(value.capacityBytes, "Render device memory budget.capacityBytes");
  const warningBytes = requireDeviceInteger(value.warningBytes ?? capacityBytes, "Render device memory budget.warningBytes");
  if (warningBytes > capacityBytes) throw new TypeError("Render device memory budget.warningBytes cannot exceed capacityBytes.");
  return {
    schema: normalizeSchema(value.schema, DEVICE_MEMORY_BUDGET_SCHEMA, "Render device memory budget"),
    budgetId: requireDeviceText(value.budgetId, "Render device memory budget.budgetId"),
    capabilityId: requireDeviceText(value.capabilityId, "Render device memory budget.capabilityId"),
    capacityBytes,
    warningBytes,
    metadata: normalizeMetadata(value.metadata, "Render device memory budget")
  };
}

export function normalizeMemoryReservation(input = {}) {
  requireDeviceObject(input, "Render device memory reservation");
  rejectDeviceFields(input, ["schema", "reservationId", "budgetId", "sizeBytes", "kind", "label", "metadata"], "Render device memory reservation");
  const value = canonicalDeviceValue(input, "Render device memory reservation");
  return {
    schema: normalizeSchema(value.schema, DEVICE_MEMORY_RESERVATION_SCHEMA, "Render device memory reservation"),
    reservationId: requireDeviceText(value.reservationId, "Render device memory reservation.reservationId"),
    budgetId: requireDeviceText(value.budgetId, "Render device memory reservation.budgetId"),
    sizeBytes: requireDeviceInteger(value.sizeBytes, "Render device memory reservation.sizeBytes"),
    kind: normalizeEnum(value.kind, MEMORY_KINDS, "Render device memory reservation.kind", "other"),
    label: optionalDeviceText(value.label, "Render device memory reservation.label"),
    metadata: normalizeMetadata(value.metadata, "Render device memory reservation")
  };
}

export function normalizeDeviceQueue(input = {}) {
  requireDeviceObject(input, "Render device queue");
  rejectDeviceFields(input, ["schema", "queueId", "capabilityId", "queueType", "priority", "metadata"], "Render device queue");
  const value = canonicalDeviceValue(input, "Render device queue");
  return {
    schema: normalizeSchema(value.schema, DEVICE_QUEUE_SCHEMA, "Render device queue"),
    queueId: requireDeviceText(value.queueId, "Render device queue.queueId"),
    capabilityId: requireDeviceText(value.capabilityId, "Render device queue.capabilityId"),
    queueType: normalizeEnum(value.queueType, QUEUE_TYPES, "Render device queue.queueType", "graphics"),
    priority: requireDeviceNumber(value.priority ?? 1, "Render device queue.priority", { minimum: 0, maximum: 1 }),
    metadata: normalizeMetadata(value.metadata, "Render device queue")
  };
}

export function normalizeDeviceSubmission(input = {}) {
  requireDeviceObject(input, "Render device submission");
  rejectDeviceFields(input, ["schema", "submissionId", "queueId", "dependencyIds", "payload", "metadata"], "Render device submission");
  const value = canonicalDeviceValue(input, "Render device submission");
  return {
    schema: normalizeSchema(value.schema, DEVICE_SUBMISSION_SCHEMA, "Render device submission"),
    submissionId: requireDeviceText(value.submissionId, "Render device submission.submissionId"),
    queueId: requireDeviceText(value.queueId, "Render device submission.queueId"),
    dependencyIds: normalizeDeviceIdList(value.dependencyIds, "Render device submission.dependencyIds"),
    payload: canonicalDeviceValue(value.payload ?? {}, "Render device submission.payload"),
    metadata: normalizeMetadata(value.metadata, "Render device submission")
  };
}

export function normalizeDeviceLossIncident(input = {}) {
  requireDeviceObject(input, "Render device loss incident");
  rejectDeviceFields(input, ["schema", "lossId", "deviceId", "reason", "message", "recoverable", "metadata"], "Render device loss incident");
  const value = canonicalDeviceValue(input, "Render device loss incident");
  return {
    schema: normalizeSchema(value.schema, DEVICE_LOSS_SCHEMA, "Render device loss incident"),
    lossId: requireDeviceText(value.lossId, "Render device loss incident.lossId"),
    deviceId: requireDeviceText(value.deviceId, "Render device loss incident.deviceId"),
    reason: normalizeEnum(value.reason, LOSS_REASONS, "Render device loss incident.reason", "unknown"),
    message: requireDeviceText(value.message, "Render device loss incident.message"),
    recoverable: requireBoolean(value.recoverable, "Render device loss incident.recoverable", true),
    metadata: normalizeMetadata(value.metadata, "Render device loss incident")
  };
}

export function normalizeLossResolution(input = {}) {
  requireDeviceObject(input, "Render device loss resolution");
  rejectDeviceFields(input, ["outcome", "details"], "Render device loss resolution");
  const value = canonicalDeviceValue(input, "Render device loss resolution");
  return {
    outcome: normalizeEnum(value.outcome, LOSS_OUTCOMES, "Render device loss resolution.outcome"),
    details: canonicalDeviceValue(value.details ?? {}, "Render device loss resolution.details")
  };
}

export function normalizeDeviceReadinessReceipt(input = {}, { ready } = {}) {
  requireDeviceObject(input, "Render device readiness receipt");
  rejectDeviceFields(input, ["schema", "deviceId", "providerId", "providerVersion", "ready", "details"], "Render device readiness receipt");
  const value = canonicalDeviceValue(input, "Render device readiness receipt");
  const normalized = {
    schema: normalizeSchema(value.schema, "nexusengine.render-device-readiness/1", "Render device readiness receipt"),
    deviceId: requireDeviceText(value.deviceId, "Render device readiness receipt.deviceId"),
    providerId: requireDeviceText(value.providerId, "Render device readiness receipt.providerId"),
    providerVersion: optionalDeviceText(value.providerVersion, "Render device readiness receipt.providerVersion"),
    ready: requireBoolean(value.ready, "Render device readiness receipt.ready"),
    details: canonicalDeviceValue(value.details ?? {}, "Render device readiness receipt.details")
  };
  if (ready !== undefined && normalized.ready !== ready) {
    throw new TypeError(`Render device readiness receipt.ready must be ${ready}.`);
  }
  return normalized;
}

export function normalizeDeviceReleaseReceipt(input = {}) {
  requireDeviceObject(input, "Render device release receipt");
  rejectDeviceFields(input, ["schema", "deviceId", "providerId", "providerVersion", "released", "details"], "Render device release receipt");
  const value = canonicalDeviceValue(input, "Render device release receipt");
  if (value.released !== true) throw new TypeError("Render device release receipt.released must be true.");
  return {
    schema: normalizeSchema(value.schema, "nexusengine.render-device-release/1", "Render device release receipt"),
    deviceId: requireDeviceText(value.deviceId, "Render device release receipt.deviceId"),
    providerId: requireDeviceText(value.providerId, "Render device release receipt.providerId"),
    providerVersion: optionalDeviceText(value.providerVersion, "Render device release receipt.providerVersion"),
    released: true,
    details: canonicalDeviceValue(value.details ?? {}, "Render device release receipt.details")
  };
}

export function normalizeQueueCompletionReceipt(input = {}) {
  requireDeviceObject(input, "Render device queue completion receipt");
  rejectDeviceFields(input, [
    "schema",
    "submissionId",
    "queueId",
    "deviceId",
    "providerId",
    "providerVersion",
    "completed",
    "details"
  ], "Render device queue completion receipt");
  const value = canonicalDeviceValue(input, "Render device queue completion receipt");
  if (value.completed !== true) throw new TypeError("Render device queue completion receipt.completed must be true.");
  return {
    schema: normalizeSchema(value.schema, "nexusengine.render-device-submission-receipt/1", "Render device queue completion receipt"),
    submissionId: requireDeviceText(value.submissionId, "Render device queue completion receipt.submissionId"),
    queueId: requireDeviceText(value.queueId, "Render device queue completion receipt.queueId"),
    deviceId: requireDeviceText(value.deviceId, "Render device queue completion receipt.deviceId"),
    providerId: requireDeviceText(value.providerId, "Render device queue completion receipt.providerId"),
    providerVersion: optionalDeviceText(value.providerVersion, "Render device queue completion receipt.providerVersion"),
    completed: true,
    details: canonicalDeviceValue(value.details ?? {}, "Render device queue completion receipt.details")
  };
}

export function normalizeDeviceFailure(input = {}) {
  requireDeviceObject(input, "Render device failure");
  rejectDeviceFields(input, ["code", "message", "details"], "Render device failure");
  const value = canonicalDeviceValue(input, "Render device failure");
  return {
    code: requireDeviceText(value.code, "Render device failure.code"),
    message: requireDeviceText(value.message, "Render device failure.message"),
    details: canonicalDeviceValue(value.details ?? {}, "Render device failure.details")
  };
}

export function assertDeviceReceiptMatches(device, receipt) {
  if (device?.deviceId !== receipt.deviceId) throw new TypeError(`Receipt device ${receipt.deviceId} does not match ${device?.deviceId ?? "none"}.`);
  if (device.providerId !== receipt.providerId) throw new TypeError(`Receipt provider ${receipt.providerId} does not match ${device.providerId}.`);
  if (device.providerVersion !== null && device.providerVersion !== receipt.providerVersion) {
    throw new TypeError(`Receipt provider version ${receipt.providerVersion ?? "none"} does not match ${device.providerVersion}.`);
  }
}

export function normalizeDeviceState(snapshot, { domain, fields, label, validate }) {
  requireDeviceObject(snapshot, label);
  rejectDeviceFields(snapshot, [...COMMON_STATE_KEYS, ...fields], label);
  const normalized = canonicalDeviceValue(snapshot, label);
  if (normalized.domain !== domain) throw new TypeError(`${label}.domain must equal ${domain}.`);
  requireDeviceInteger(normalized.sequence, `${label}.sequence`);
  validate?.(normalized);
  return normalized;
}

export function assertSortedRecordState(state, { collection, order, revision, normalizeRecord, idField, label }) {
  requireDeviceObject(state[collection], `${label}.${collection}`);
  const normalizedRecords = Object.fromEntries(Object.entries(state[collection]).map(([key, record]) => {
    const normalized = normalizeRecord(record);
    if (key !== normalized[idField]) throw new TypeError(`${label}.${collection} key ${key} does not match ${idField} ${normalized[idField]}.`);
    return [key, normalized];
  }));
  const expectedOrder = Object.keys(normalizedRecords).sort();
  if (JSON.stringify(state[order]) !== JSON.stringify(expectedOrder)) throw new TypeError(`${label}.${order} must match sorted ${collection} keys.`);
  requireDeviceInteger(state[revision], `${label}.${revision}`);
  state[collection] = normalizedRecords;
  return state;
}

export const renderDeviceEnums = Object.freeze({
  deviceTypes: DEVICE_TYPES,
  featureCategories: FEATURE_CATEGORIES,
  memoryKinds: MEMORY_KINDS,
  queueTypes: QUEUE_TYPES,
  lossReasons: LOSS_REASONS,
  lossOutcomes: LOSS_OUTCOMES
});
