const clone = (value) => value === undefined ? undefined : structuredClone(value);

export const CORE_ASSET_SCHEMA = "nexusengine.core-assets.asset/1";
export const CORE_ASSET_BUNDLE_SCHEMA = "nexusengine.core-assets.bundle/1";
export const CORE_ASSET_JOB_SCHEMA = "nexusengine.core-assets.job/1";
export const CORE_ASSET_RECEIPT_SCHEMA = "nexusengine.core-assets.receipt/1";
export const CORE_ASSET_CACHE_RECORD_SCHEMA = "nexusengine.core-assets.cache-record/1";

export const CORE_ASSET_JOB_STATES = Object.freeze([
  "queued",
  "waiting-for-provider",
  "loading",
  "preparing",
  "ready",
  "failed",
  "cancelled",
  "stale"
]);

function requiredText(value, label) {
  const next = String(value ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function optionalText(value) {
  if (value == null || value === "") return null;
  return String(value);
}

function finite(value, fallback = 0) {
  const next = Number(value ?? fallback);
  if (!Number.isFinite(next)) throw new TypeError("Asset numeric values must be finite.");
  return next;
}

function list(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function uniqueTextList(value, label) {
  return Array.from(new Set(list(value).map((entry) => requiredText(entry, label))));
}

export function stableAssetStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableAssetStringify).join(",")}]`;
  if (ArrayBuffer.isView(value)) return stableAssetStringify(Array.from(value));
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableAssetStringify(value[key])}`).join(",")}}`;
}

export function hashAssetValue(value) {
  let hash = 2166136261;
  for (const character of stableAssetStringify(value)) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createAssetDescriptor(input = {}) {
  const descriptor = {
    schema: CORE_ASSET_SCHEMA,
    id: requiredText(input.id, "Asset descriptor id"),
    type: requiredText(input.type ?? input.kind, "Asset descriptor type"),
    version: String(input.version ?? "1"),
    providerId: optionalText(input.providerId),
    source: clone(input.source ?? null),
    dependencies: uniqueTextList(input.dependencies, "Asset dependency"),
    cache: {
      enabled: input.cache?.enabled !== false,
      namespace: String(input.cache?.namespace ?? "assets"),
      key: optionalText(input.cache?.key),
      metadata: clone(input.cache?.metadata ?? {})
    },
    fallback: clone(input.fallback ?? null),
    metadata: clone(input.metadata ?? {})
  };
  descriptor.contentHash = String(input.contentHash ?? hashAssetValue(descriptor));
  structuredClone(descriptor);
  return Object.freeze(descriptor);
}

export function createAssetBundleDescriptor(input = {}) {
  const descriptor = {
    schema: CORE_ASSET_BUNDLE_SCHEMA,
    id: requiredText(input.id, "Asset bundle id"),
    version: String(input.version ?? "1"),
    assets: uniqueTextList(input.assets, "Asset bundle member"),
    dependencies: uniqueTextList(input.dependencies, "Asset bundle dependency"),
    fallback: clone(input.fallback ?? null),
    metadata: clone(input.metadata ?? {})
  };
  descriptor.contentHash = String(input.contentHash ?? hashAssetValue(descriptor));
  structuredClone(descriptor);
  return Object.freeze(descriptor);
}

export function createAssetJob(input = {}) {
  const state = String(input.state ?? "queued");
  if (!CORE_ASSET_JOB_STATES.includes(state)) throw new TypeError(`Unsupported Core Assets job state: ${state}`);
  const completed = Math.max(0, finite(input.progress?.completed, 0));
  const total = Math.max(completed, finite(input.progress?.total, 1));
  const job = {
    schema: CORE_ASSET_JOB_SCHEMA,
    id: requiredText(input.id, "Asset job id"),
    kind: input.kind === "bundle" ? "bundle" : "asset",
    targetId: requiredText(input.targetId ?? input.assetId ?? input.bundleId, "Asset job targetId"),
    operationId: requiredText(input.operationId, "Asset job operationId"),
    state,
    providerId: optionalText(input.providerId),
    progress: { completed, total, ratio: total > 0 ? Math.min(1, completed / total) : 0 },
    receiptId: optionalText(input.receiptId),
    error: clone(input.error ?? null),
    detail: optionalText(input.detail),
    revision: Math.max(0, Math.floor(finite(input.revision, 0))),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(job);
  return Object.freeze(job);
}

export function createAssetReceipt(input = {}) {
  const receipt = {
    schema: CORE_ASSET_RECEIPT_SCHEMA,
    id: requiredText(input.id, "Asset receipt id"),
    kind: input.kind === "bundle" ? "bundle" : "asset",
    targetId: requiredText(input.targetId, "Asset receipt targetId"),
    operationId: requiredText(input.operationId, "Asset receipt operationId"),
    contentHash: requiredText(input.contentHash, "Asset receipt contentHash"),
    providerId: optionalText(input.providerId),
    cacheKey: optionalText(input.cacheKey),
    cached: Boolean(input.cached),
    dependencies: uniqueTextList(input.dependencies, "Asset receipt dependency"),
    members: uniqueTextList(input.members, "Asset receipt member"),
    result: clone(input.result ?? null),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(receipt);
  return Object.freeze(receipt);
}

export function createAssetCacheRecord(input = {}) {
  const record = {
    schema: CORE_ASSET_CACHE_RECORD_SCHEMA,
    key: requiredText(input.key, "Asset cache record key"),
    assetId: requiredText(input.assetId, "Asset cache record assetId"),
    contentHash: requiredText(input.contentHash, "Asset cache record contentHash"),
    version: String(input.version ?? "1"),
    portable: clone(input.portable ?? input.value ?? null),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(record);
  return Object.freeze(record);
}
