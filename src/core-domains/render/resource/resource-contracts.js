import { sha256Integrity } from "../../../foundation/sha256.js";
import { canonicalizePortableValue } from "../contracts/portable-value.js";
import { normalizeRenderResource } from "../contracts/kits/render-resource-schema-kit/contracts.js";

export const RENDER_RESOURCE_IDENTITY_SCHEMA = "nexusengine.render-resource-identity/1";
export const RENDER_RESOURCE_REFERENCE_SCHEMA = "nexusengine.render-resource-reference/1";
export const RENDER_RESOURCE_STATE_SCHEMA = "nexusengine.render-resource-state/1";
export const RENDER_RESOURCE_CACHE_ENTRY_SCHEMA = "nexusengine.render-resource-cache-entry/1";
export const RENDER_RESOURCE_BUDGET_SCHEMA = "nexusengine.render-resource-budget/1";
export const RENDER_RESOURCE_CLAIM_SCHEMA = "nexusengine.render-resource-budget-claim/1";
export const RENDER_RESOURCE_UPLOAD_SCHEMA = "nexusengine.render-resource-upload/1";
export const RENDER_RESOURCE_UPLOAD_RECEIPT_SCHEMA = "nexusengine.render-resource-upload-receipt/1";
export const RENDER_RESOURCE_UPLOAD_RECORD_SCHEMA = "nexusengine.render-resource-upload-record/1";
export const RENDER_RESOURCE_RELEASE_SCHEMA = "nexusengine.render-resource-release/1";
export const RENDER_RESOURCE_RELEASE_RECEIPT_SCHEMA = "nexusengine.render-resource-release-receipt/1";
export const RENDER_RESOURCE_RELEASE_RECORD_SCHEMA = "nexusengine.render-resource-release-record/1";
export const RENDER_RESOURCE_INTEGRITY_PROOF_SCHEMA = "nexusengine.render-resource-integrity-proof/1";

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

const RESOURCE_PHASES = Object.freeze(["declared", "staged", "resident", "failed", "releasing", "released"]);
const RESOURCE_TRANSITIONS = Object.freeze({
  declared: Object.freeze(["staged", "failed", "releasing"]),
  staged: Object.freeze(["resident", "failed", "releasing"]),
  resident: Object.freeze(["failed", "releasing"]),
  failed: Object.freeze(["staged", "releasing"]),
  releasing: Object.freeze(["failed", "released"]),
  released: Object.freeze([])
});
const OPERATION_STATUSES = Object.freeze(["requested", "completed", "failed"]);
const INTEGRITY_STATUSES = Object.freeze(["matched", "mismatched"]);

export function canonicalResourceValue(value, label = "value") {
  try {
    return canonicalizePortableValue(value, label);
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireResourceObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectResourceFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireResourceText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function optionalResourceText(value, label, fallback = null) {
  return value === undefined || value === null ? fallback : requireResourceText(value, label);
}

export function requireResourceInteger(value, label, { minimum = 0 } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new TypeError(`${label} must be a safe integer of at least ${minimum}.`);
  }
  return value;
}

export function requireResourceBoolean(value, label, fallback = false) {
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
  return canonicalResourceValue(value ?? {}, `${label}.metadata`);
}

export function normalizeResourceIdList(value = [], label = "ids") {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  const normalized = value.map((entry, index) => requireResourceText(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} cannot contain duplicate IDs.`);
  return normalized.sort();
}

export function normalizeResourceOperation(input, allowedFields, label) {
  requireResourceObject(input, label);
  rejectResourceFields(input, ["operationId", ...allowedFields], label);
  const value = canonicalResourceValue(input, label);
  value.operationId = requireResourceText(value.operationId, `${label}.operationId`);
  return value;
}

export function resourceIdentityId(resourceId, revision) {
  return JSON.stringify([
    requireResourceText(resourceId, "Render resource identity.resourceId"),
    requireResourceInteger(revision, "Render resource identity.revision")
  ]);
}

export function createResourceIdentity(resourceInput) {
  const resource = normalizeRenderResource(resourceInput);
  return {
    schema: RENDER_RESOURCE_IDENTITY_SCHEMA,
    identityId: resourceIdentityId(resource.resourceId, resource.revision),
    resource,
    descriptorHash: sha256Integrity(JSON.stringify(resource))
  };
}

export function normalizeResourceIdentity(input = {}) {
  requireResourceObject(input, "Render resource identity");
  rejectResourceFields(input, ["schema", "identityId", "resource", "descriptorHash"], "Render resource identity");
  const value = canonicalResourceValue(input, "Render resource identity");
  const expected = createResourceIdentity(value.resource);
  const identity = {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_IDENTITY_SCHEMA, "Render resource identity"),
    identityId: requireResourceText(value.identityId, "Render resource identity.identityId"),
    resource: expected.resource,
    descriptorHash: requireResourceText(value.descriptorHash, "Render resource identity.descriptorHash")
  };
  if (identity.identityId !== expected.identityId) throw new TypeError("Render resource identity.identityId does not match resourceId and revision.");
  if (identity.descriptorHash !== expected.descriptorHash) throw new TypeError("Render resource identity.descriptorHash does not match its normalized resource.");
  return identity;
}

export function expectedResourceContentId(identityInput) {
  const identity = normalizeResourceIdentity(identityInput);
  return identity.resource.integrity ?? identity.descriptorHash;
}

export function normalizeResourceReference(input = {}) {
  requireResourceObject(input, "Render resource reference");
  rejectResourceFields(input, ["schema", "referenceId", "identityId", "ownerId", "usage", "metadata"], "Render resource reference");
  const value = canonicalResourceValue(input, "Render resource reference");
  return {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_REFERENCE_SCHEMA, "Render resource reference"),
    referenceId: requireResourceText(value.referenceId, "Render resource reference.referenceId"),
    identityId: requireResourceText(value.identityId, "Render resource reference.identityId"),
    ownerId: requireResourceText(value.ownerId, "Render resource reference.ownerId"),
    usage: optionalResourceText(value.usage, "Render resource reference.usage"),
    metadata: normalizeMetadata(value.metadata, "Render resource reference")
  };
}

export function normalizeResourceFailure(input = {}) {
  requireResourceObject(input, "Render resource failure");
  rejectResourceFields(input, ["code", "message", "details"], "Render resource failure");
  const value = canonicalResourceValue(input, "Render resource failure");
  return {
    code: requireResourceText(value.code, "Render resource failure.code"),
    message: requireResourceText(value.message, "Render resource failure.message"),
    details: canonicalResourceValue(value.details ?? {}, "Render resource failure.details")
  };
}

export function normalizeResourceStateRecord(input = {}) {
  requireResourceObject(input, "Render resource state");
  rejectResourceFields(input, ["schema", "identityId", "phase", "stateRevision", "uploadId", "releaseId", "failure", "metadata"], "Render resource state");
  const value = canonicalResourceValue(input, "Render resource state");
  const phase = normalizeEnum(value.phase, RESOURCE_PHASES, "Render resource state.phase", "declared");
  const state = {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_STATE_SCHEMA, "Render resource state"),
    identityId: requireResourceText(value.identityId, "Render resource state.identityId"),
    phase,
    stateRevision: requireResourceInteger(value.stateRevision ?? 0, "Render resource state.stateRevision"),
    uploadId: optionalResourceText(value.uploadId, "Render resource state.uploadId"),
    releaseId: optionalResourceText(value.releaseId, "Render resource state.releaseId"),
    failure: value.failure === undefined || value.failure === null ? null : normalizeResourceFailure(value.failure),
    metadata: normalizeMetadata(value.metadata, "Render resource state")
  };
  if (phase === "resident" && !state.uploadId) throw new TypeError("Resident Render resource state requires uploadId.");
  if (["releasing", "released"].includes(phase) && !state.releaseId) throw new TypeError(`${phase} Render resource state requires releaseId.`);
  if (phase === "failed" && !state.failure) throw new TypeError("Failed Render resource state requires failure.");
  if (phase !== "failed" && state.failure) throw new TypeError(`${phase} Render resource state cannot retain failure.`);
  return state;
}

export function canResourceTransition(from, to) {
  const source = normalizeEnum(from, RESOURCE_PHASES, "Render resource transition source");
  const target = normalizeEnum(to, RESOURCE_PHASES, "Render resource transition target");
  return RESOURCE_TRANSITIONS[source].includes(target);
}

export function assertResourceTransition(from, to) {
  if (!canResourceTransition(from, to)) throw new TypeError(`Render resource cannot transition from ${from} to ${to}.`);
  return true;
}

export function normalizeResourceCacheEntry(input = {}) {
  requireResourceObject(input, "Render resource cache entry");
  rejectResourceFields(input, ["schema", "cacheKey", "identityId", "contentId", "sizeBytes", "lastAccessSequence", "pinned", "metadata"], "Render resource cache entry");
  const value = canonicalResourceValue(input, "Render resource cache entry");
  return {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_CACHE_ENTRY_SCHEMA, "Render resource cache entry"),
    cacheKey: requireResourceText(value.cacheKey, "Render resource cache entry.cacheKey"),
    identityId: requireResourceText(value.identityId, "Render resource cache entry.identityId"),
    contentId: requireResourceText(value.contentId, "Render resource cache entry.contentId"),
    sizeBytes: requireResourceInteger(value.sizeBytes, "Render resource cache entry.sizeBytes"),
    lastAccessSequence: requireResourceInteger(value.lastAccessSequence ?? 0, "Render resource cache entry.lastAccessSequence"),
    pinned: requireResourceBoolean(value.pinned, "Render resource cache entry.pinned"),
    metadata: normalizeMetadata(value.metadata, "Render resource cache entry")
  };
}

export function normalizeResourceBudget(input = {}) {
  requireResourceObject(input, "Render resource budget");
  rejectResourceFields(input, ["schema", "budgetId", "deviceBudgetId", "allowedKinds", "maxResourceBytes", "metadata"], "Render resource budget");
  const value = canonicalResourceValue(input, "Render resource budget");
  return {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_BUDGET_SCHEMA, "Render resource budget"),
    budgetId: requireResourceText(value.budgetId, "Render resource budget.budgetId"),
    deviceBudgetId: requireResourceText(value.deviceBudgetId, "Render resource budget.deviceBudgetId"),
    allowedKinds: normalizeResourceIdList(value.allowedKinds, "Render resource budget.allowedKinds"),
    maxResourceBytes: requireResourceInteger(value.maxResourceBytes, "Render resource budget.maxResourceBytes", { minimum: 1 }),
    metadata: normalizeMetadata(value.metadata, "Render resource budget")
  };
}

export function normalizeResourceClaim(input = {}) {
  requireResourceObject(input, "Render resource budget claim");
  rejectResourceFields(input, ["schema", "claimId", "budgetId", "identityId", "reservationId", "sizeBytes", "metadata"], "Render resource budget claim");
  const value = canonicalResourceValue(input, "Render resource budget claim");
  return {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_CLAIM_SCHEMA, "Render resource budget claim"),
    claimId: requireResourceText(value.claimId, "Render resource budget claim.claimId"),
    budgetId: requireResourceText(value.budgetId, "Render resource budget claim.budgetId"),
    identityId: requireResourceText(value.identityId, "Render resource budget claim.identityId"),
    reservationId: requireResourceText(value.reservationId, "Render resource budget claim.reservationId"),
    sizeBytes: requireResourceInteger(value.sizeBytes, "Render resource budget claim.sizeBytes", { minimum: 1 }),
    metadata: normalizeMetadata(value.metadata, "Render resource budget claim")
  };
}

export function normalizeResourceUpload(input = {}) {
  requireResourceObject(input, "Render resource upload");
  rejectResourceFields(input, ["schema", "uploadId", "identityId", "queueId", "submissionId", "contentId", "sizeBytes", "metadata"], "Render resource upload");
  const value = canonicalResourceValue(input, "Render resource upload");
  return {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_UPLOAD_SCHEMA, "Render resource upload"),
    uploadId: requireResourceText(value.uploadId, "Render resource upload.uploadId"),
    identityId: requireResourceText(value.identityId, "Render resource upload.identityId"),
    queueId: requireResourceText(value.queueId, "Render resource upload.queueId"),
    submissionId: requireResourceText(value.submissionId, "Render resource upload.submissionId"),
    contentId: requireResourceText(value.contentId, "Render resource upload.contentId"),
    sizeBytes: requireResourceInteger(value.sizeBytes, "Render resource upload.sizeBytes", { minimum: 1 }),
    metadata: normalizeMetadata(value.metadata, "Render resource upload")
  };
}

export function normalizeResourceUploadReceipt(input = {}) {
  requireResourceObject(input, "Render resource upload receipt");
  rejectResourceFields(input, ["schema", "uploadId", "identityId", "submissionId", "deviceId", "providerId", "providerVersion", "completed", "contentId", "sizeBytes", "details"], "Render resource upload receipt");
  const value = canonicalResourceValue(input, "Render resource upload receipt");
  if (value.completed !== true) throw new TypeError("Render resource upload receipt.completed must be true.");
  return {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_UPLOAD_RECEIPT_SCHEMA, "Render resource upload receipt"),
    uploadId: requireResourceText(value.uploadId, "Render resource upload receipt.uploadId"),
    identityId: requireResourceText(value.identityId, "Render resource upload receipt.identityId"),
    submissionId: requireResourceText(value.submissionId, "Render resource upload receipt.submissionId"),
    deviceId: requireResourceText(value.deviceId, "Render resource upload receipt.deviceId"),
    providerId: requireResourceText(value.providerId, "Render resource upload receipt.providerId"),
    providerVersion: optionalResourceText(value.providerVersion, "Render resource upload receipt.providerVersion"),
    completed: true,
    contentId: requireResourceText(value.contentId, "Render resource upload receipt.contentId"),
    sizeBytes: requireResourceInteger(value.sizeBytes, "Render resource upload receipt.sizeBytes", { minimum: 1 }),
    details: canonicalResourceValue(value.details ?? {}, "Render resource upload receipt.details")
  };
}

export function normalizeStoredResourceOperation(input, { schema, normalizeRequest, label }) {
  requireResourceObject(input, label);
  rejectResourceFields(input, ["schema", "request", "status", "providerReceipt", "failure"], label);
  const value = canonicalResourceValue(input, label);
  const status = normalizeEnum(value.status, OPERATION_STATUSES, `${label}.status`, "requested");
  const record = {
    schema: normalizeSchema(value.schema, schema, label),
    request: normalizeRequest(value.request),
    status,
    providerReceipt: value.providerReceipt ?? null,
    failure: value.failure === undefined || value.failure === null ? null : normalizeResourceFailure(value.failure)
  };
  if (status === "requested" && (record.providerReceipt || record.failure)) throw new TypeError(`${label} requested state cannot retain a receipt or failure.`);
  if (status === "completed" && !record.providerReceipt) throw new TypeError(`${label} completed state requires providerReceipt.`);
  if (status === "completed" && record.failure) throw new TypeError(`${label} completed state cannot retain failure.`);
  if (status === "failed" && !record.failure) throw new TypeError(`${label} failed state requires failure.`);
  if (status === "failed" && record.providerReceipt) throw new TypeError(`${label} failed state cannot retain providerReceipt.`);
  return record;
}

export function normalizeResourceRelease(input = {}) {
  requireResourceObject(input, "Render resource release");
  rejectResourceFields(input, ["schema", "releaseId", "identityId", "deviceId", "metadata"], "Render resource release");
  const value = canonicalResourceValue(input, "Render resource release");
  return {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_RELEASE_SCHEMA, "Render resource release"),
    releaseId: requireResourceText(value.releaseId, "Render resource release.releaseId"),
    identityId: requireResourceText(value.identityId, "Render resource release.identityId"),
    deviceId: requireResourceText(value.deviceId, "Render resource release.deviceId"),
    metadata: normalizeMetadata(value.metadata, "Render resource release")
  };
}

export function normalizeResourceReleaseReceipt(input = {}) {
  requireResourceObject(input, "Render resource release receipt");
  rejectResourceFields(input, ["schema", "releaseId", "identityId", "deviceId", "providerId", "providerVersion", "released", "details"], "Render resource release receipt");
  const value = canonicalResourceValue(input, "Render resource release receipt");
  if (value.released !== true) throw new TypeError("Render resource release receipt.released must be true.");
  return {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_RELEASE_RECEIPT_SCHEMA, "Render resource release receipt"),
    releaseId: requireResourceText(value.releaseId, "Render resource release receipt.releaseId"),
    identityId: requireResourceText(value.identityId, "Render resource release receipt.identityId"),
    deviceId: requireResourceText(value.deviceId, "Render resource release receipt.deviceId"),
    providerId: requireResourceText(value.providerId, "Render resource release receipt.providerId"),
    providerVersion: optionalResourceText(value.providerVersion, "Render resource release receipt.providerVersion"),
    released: true,
    details: canonicalResourceValue(value.details ?? {}, "Render resource release receipt.details")
  };
}

export function normalizeIntegrityProof(input = {}) {
  requireResourceObject(input, "Render resource integrity proof");
  rejectResourceFields(input, ["schema", "proofId", "identityId", "algorithm", "expected", "actual", "status", "sourceId", "metadata"], "Render resource integrity proof");
  const value = canonicalResourceValue(input, "Render resource integrity proof");
  const algorithm = normalizeEnum(value.algorithm, ["sha256"], "Render resource integrity proof.algorithm", "sha256");
  const expected = requireResourceText(value.expected, "Render resource integrity proof.expected");
  const actual = requireResourceText(value.actual, "Render resource integrity proof.actual");
  const status = normalizeEnum(value.status ?? (expected === actual ? "matched" : "mismatched"), INTEGRITY_STATUSES, "Render resource integrity proof.status");
  if ((expected === actual) !== (status === "matched")) throw new TypeError("Render resource integrity proof.status does not match expected and actual values.");
  return {
    schema: normalizeSchema(value.schema, RENDER_RESOURCE_INTEGRITY_PROOF_SCHEMA, "Render resource integrity proof"),
    proofId: requireResourceText(value.proofId, "Render resource integrity proof.proofId"),
    identityId: requireResourceText(value.identityId, "Render resource integrity proof.identityId"),
    algorithm,
    expected,
    actual,
    status,
    sourceId: optionalResourceText(value.sourceId, "Render resource integrity proof.sourceId"),
    metadata: normalizeMetadata(value.metadata, "Render resource integrity proof")
  };
}

export function normalizeResourceState(snapshot, { domain, fields, label, validate }) {
  requireResourceObject(snapshot, label);
  rejectResourceFields(snapshot, [...COMMON_STATE_KEYS, ...fields], label);
  const normalized = canonicalResourceValue(snapshot, label);
  if (normalized.domain !== domain) throw new TypeError(`${label}.domain must equal ${domain}.`);
  requireResourceInteger(normalized.sequence, `${label}.sequence`);
  validate?.(normalized);
  return normalized;
}

export function assertSortedResourceRecords(state, { collection, order, revision, normalizeRecord, idField, label }) {
  requireResourceObject(state[collection], `${label}.${collection}`);
  const records = Object.fromEntries(Object.entries(state[collection]).map(([key, record]) => {
    const normalized = normalizeRecord(record);
    const recordId = String(idField).split(".").reduce((value, field) => value?.[field], normalized);
    if (key !== recordId) throw new TypeError(`${label}.${collection} key ${key} does not match ${idField} ${recordId}.`);
    return [key, normalized];
  }));
  const expectedOrder = Object.keys(records).sort();
  if (JSON.stringify(state[order]) !== JSON.stringify(expectedOrder)) throw new TypeError(`${label}.${order} must match sorted ${collection} keys.`);
  requireResourceInteger(state[revision], `${label}.${revision}`);
  state[collection] = records;
  return state;
}

export const renderResourceEnums = Object.freeze({
  phases: RESOURCE_PHASES,
  transitions: RESOURCE_TRANSITIONS,
  operationStatuses: OPERATION_STATUSES,
  integrityStatuses: INTEGRITY_STATUSES
});
