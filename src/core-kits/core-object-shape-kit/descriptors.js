import { clonePortableGeometry, compareShapeMetrics, computeShapeMetrics } from "./metrics.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export const NEXUS_OBJECT_SHAPE_PROFILE_SCHEMA = "nexus-object-shape-profile/1";
export const NEXUS_OBJECT_SHAPE_SOURCE_SCHEMA = "nexus-object-shape-source/1";
export const NEXUS_OBJECT_SHAPE_JOB_SCHEMA = "nexus-object-shape-job/1";
export const NEXUS_OBJECT_SHAPE_SCHEMA = "nexus-object-shape/1";

export const OBJECT_SHAPE_JOB_STATES = Object.freeze([
  "queued", "waiting-for-provider", "preparing", "simplifying", "optimizing", "validating", "ready", "failed", "cancelled", "stale"
]);

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function finite(value, fallback, label) {
  const next = Number(value ?? fallback);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (ArrayBuffer.isView(value)) return stableStringify(Array.from(value));
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function hashShapeValue(value) {
  return hashText(stableStringify(value));
}

function normalizeAssetReference(value, label) {
  if (value == null) return null;
  if (typeof value === "string") return { assetId: text(value, null, `${label}.assetId`) };
  if (typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an asset reference.`);
  const result = {
    assetId: text(value.assetId ?? value.id, null, `${label}.assetId`),
    kind: text(value.kind, "mesh", `${label}.kind`),
    metadata: clone(value.metadata ?? {})
  };
  if (value.contentHash != null) result.contentHash = text(value.contentHash, null, `${label}.contentHash`);
  return result;
}

function normalizeTarget(input = {}, index = 0) {
  const ratio = Math.max(0.001, Math.min(1, finite(input.ratio ?? input.targetRatio, index === 0 ? 1 : 0.5, "shape target ratio")));
  return {
    id: text(input.id, `target-${index}`, "shape target id"),
    ratio,
    maximumDeviation: Math.max(0, finite(input.maximumDeviation ?? input.targetError, ratio === 1 ? 0 : 0.01, "shape maximumDeviation")),
    mode: text(input.mode, ratio === 1 ? "source" : "simplify", "shape target mode"),
    preserve: clone(input.preserve ?? {}),
    options: clone(input.options ?? {})
  };
}

export function createObjectShapeProfile(input = {}) {
  const targets = (input.targets ?? []).map(normalizeTarget);
  if (!targets.length) throw new TypeError("Object shape profile requires at least one target.");
  const ids = new Set();
  for (const target of targets) {
    if (ids.has(target.id)) throw new TypeError(`Duplicate object shape target id: ${target.id}.`);
    ids.add(target.id);
  }
  const profile = {
    schema: NEXUS_OBJECT_SHAPE_PROFILE_SCHEMA,
    id: text(input.id, null, "object shape profile id"),
    version: Math.max(1, Math.floor(finite(input.version, 1, "object shape profile version"))),
    preserve: {
      silhouette: input.preserve?.silhouette !== false,
      borders: input.preserve?.borders !== false,
      materialBoundaries: input.preserve?.materialBoundaries !== false,
      uvSeams: input.preserve?.uvSeams !== false,
      normals: input.preserve?.normals !== false,
      vertexColors: input.preserve?.vertexColors !== false,
      ...clone(input.preserve ?? {})
    },
    targets,
    metadata: clone(input.metadata ?? {})
  };
  profile.contentHash = hashShapeValue(profile);
  structuredClone(profile);
  return Object.freeze(profile);
}

export function createObjectShapeSource(input = {}) {
  const geometry = input.geometry == null ? null : clonePortableGeometry(input.geometry);
  const asset = normalizeAssetReference(input.asset, "shape source asset");
  if (!geometry && !asset) throw new TypeError("Object shape source requires inline geometry or an asset reference.");
  const source = {
    schema: NEXUS_OBJECT_SHAPE_SOURCE_SCHEMA,
    id: text(input.id, null, "object shape source id"),
    objectId: text(input.objectId, null, "object shape source objectId"),
    objectContentHash: text(input.objectContentHash, null, "object shape source objectContentHash"),
    kind: text(input.kind, "triangle-mesh", "object shape source kind"),
    geometry,
    asset,
    metrics: geometry ? computeShapeMetrics(geometry) : clone(input.metrics ?? null),
    metadata: clone(input.metadata ?? {})
  };
  source.contentHash = hashShapeValue(source);
  structuredClone(source);
  return Object.freeze(source);
}

export function createObjectShapeJob(input = {}) {
  const state = text(input.state, "queued", "object shape job state");
  if (!OBJECT_SHAPE_JOB_STATES.includes(state)) throw new TypeError(`Unsupported object shape job state: ${state}`);
  const job = {
    schema: NEXUS_OBJECT_SHAPE_JOB_SCHEMA,
    id: text(input.id, null, "object shape job id"),
    objectId: text(input.objectId, null, "object shape job objectId"),
    objectContentHash: text(input.objectContentHash, null, "object shape job objectContentHash"),
    sourceShapeId: text(input.sourceShapeId, null, "object shape job sourceShapeId"),
    sourceContentHash: text(input.sourceContentHash, null, "object shape job sourceContentHash"),
    profileId: text(input.profileId, null, "object shape job profileId"),
    targetId: text(input.targetId, null, "object shape job targetId"),
    providerId: input.providerId == null ? null : text(input.providerId, null, "object shape job providerId"),
    state,
    progress: {
      completed: Math.max(0, finite(input.progress?.completed, 0, "shape job completed")),
      total: Math.max(1, finite(input.progress?.total, 1, "shape job total"))
    },
    resultShapeId: input.resultShapeId == null ? null : text(input.resultShapeId, null, "shape job resultShapeId"),
    error: input.error == null ? null : clone(input.error),
    revision: Math.max(0, Math.floor(finite(input.revision, 0, "shape job revision"))),
    operationId: text(input.operationId, null, "shape job operationId")
  };
  structuredClone(job);
  return Object.freeze(job);
}

export function createObjectShape(input = {}, source = null) {
  const geometry = input.geometry == null ? null : clonePortableGeometry(input.geometry);
  const asset = normalizeAssetReference(input.asset, "derived shape asset");
  if (!geometry && !asset) throw new TypeError("Derived object shape requires geometry or an asset reference.");
  const metrics = geometry ? computeShapeMetrics(geometry) : clone(input.metrics ?? null);
  const shape = {
    schema: NEXUS_OBJECT_SHAPE_SCHEMA,
    id: text(input.id, null, "derived object shape id"),
    objectId: text(input.objectId, source?.objectId, "derived object shape objectId"),
    objectContentHash: text(input.objectContentHash, source?.objectContentHash, "derived object shape objectContentHash"),
    sourceShapeId: text(input.sourceShapeId, source?.id, "derived object shape sourceShapeId"),
    sourceContentHash: text(input.sourceContentHash, source?.contentHash, "derived object shape sourceContentHash"),
    profileId: text(input.profileId, null, "derived object shape profileId"),
    targetId: text(input.targetId, null, "derived object shape targetId"),
    purpose: text(input.purpose, input.targetId ?? "derived", "derived object shape purpose"),
    geometry,
    asset,
    metrics,
    quality: clone(input.quality ?? (source?.metrics && metrics ? compareShapeMetrics(source.metrics, metrics) : {})),
    preservation: clone(input.preservation ?? {}),
    provider: {
      id: text(input.provider?.id ?? input.providerId, "object-shape-provider", "derived shape provider id"),
      version: text(input.provider?.version, "0.1.0", "derived shape provider version")
    },
    metadata: clone(input.metadata ?? {}),
    state: "ready"
  };
  shape.contentHash = hashShapeValue(shape);
  structuredClone(shape);
  return Object.freeze(shape);
}

export function validateObjectShape(value) {
  const errors = [];
  try { createObjectShape(value); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { valid: errors.length === 0, errors };
}
