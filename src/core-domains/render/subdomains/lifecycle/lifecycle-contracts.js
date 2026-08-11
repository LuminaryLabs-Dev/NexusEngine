import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

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

function sortPortable(value) {
  if (Array.isArray(value)) return value.map(sortPortable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, sortPortable(value[key])])
  );
}

export function canonicalPortable(value, label = "value") {
  try {
    return sortPortable(cloneSerializableState(value));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectUnknownFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) {
    throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
  }
}

export function requireText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function optionalText(value, label, fallback = null) {
  return value === undefined || value === null ? fallback : requireText(value, label);
}

export function requireNonnegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a nonnegative integer.`);
  }
  return value;
}

export function normalizeOperationCommand(command, allowedFields, label) {
  requireObject(command, label);
  rejectUnknownFields(command, ["schema", "operationId", ...allowedFields], label);
  const normalized = canonicalPortable(command, label);
  normalized.operationId = requireText(normalized.operationId, `${label}.operationId`);
  return normalized;
}

export function normalizeProviderReceipt(value, { ready } = {}) {
  requireObject(value, "providerReceipt");
  rejectUnknownFields(value, ["schema", "providerId", "providerVersion", "ready", "details"], "providerReceipt");
  const normalized = canonicalPortable(value, "providerReceipt");
  normalized.schema = normalized.schema ?? "nexusengine.render-provider-readiness/1";
  if (normalized.schema !== "nexusengine.render-provider-readiness/1") {
    throw new TypeError("providerReceipt.schema is unsupported.");
  }
  normalized.providerId = requireText(normalized.providerId, "providerReceipt.providerId");
  normalized.providerVersion = optionalText(normalized.providerVersion, "providerReceipt.providerVersion");
  if (typeof normalized.ready !== "boolean") throw new TypeError("providerReceipt.ready must be boolean.");
  if (ready !== undefined && normalized.ready !== ready) {
    throw new TypeError(`providerReceipt.ready must be ${ready}.`);
  }
  normalized.details = canonicalPortable(normalized.details ?? {}, "providerReceipt.details");
  return normalized;
}

export function normalizeFailure(value) {
  requireObject(value, "failure");
  rejectUnknownFields(value, ["code", "message", "details"], "failure");
  const normalized = canonicalPortable(value, "failure");
  normalized.code = requireText(normalized.code, "failure.code");
  normalized.message = requireText(normalized.message, "failure.message");
  normalized.details = canonicalPortable(normalized.details ?? {}, "failure.details");
  return normalized;
}

export function assertProviderReceiptMatchesInstallation(installation, providerReceipt) {
  if (installation?.providerId !== providerReceipt.providerId) {
    throw new TypeError(
      `Provider receipt ${providerReceipt.providerId} does not match installed provider ${installation?.providerId ?? "none"}.`
    );
  }
  if (
    installation.providerVersion !== null
    && installation.providerVersion !== providerReceipt.providerVersion
  ) {
    throw new TypeError(
      `Provider receipt version ${providerReceipt.providerVersion ?? "none"} does not match installed provider version ${installation.providerVersion}.`
    );
  }
}

export function normalizeLifecycleState(snapshot, { domain, fields, label, validate }) {
  requireObject(snapshot, label);
  rejectUnknownFields(snapshot, [...COMMON_STATE_KEYS, ...fields], label);
  const normalized = canonicalPortable(snapshot, label);
  if (normalized.domain !== domain) {
    throw new TypeError(`${label}.domain must equal ${domain}.`);
  }
  requireNonnegativeInteger(normalized.sequence, `${label}.sequence`);
  validate?.(normalized);
  return normalized;
}

export function requirePhase(value, phases, label = "phase") {
  if (!phases.includes(value)) {
    throw new TypeError(`${label} must be one of ${phases.join(", ")}.`);
  }
  return value;
}

export function derivedOperationId(operationId, suffix) {
  return `${requireText(operationId, "operationId")}:${requireText(suffix, "suffix")}`;
}

export function samePortableValue(left, right) {
  return JSON.stringify(canonicalPortable(left)) === JSON.stringify(canonicalPortable(right));
}

export function rollbackSnapshots(records) {
  for (const record of [...records].reverse()) {
    record.api.loadSnapshot(record.snapshot);
  }
}
