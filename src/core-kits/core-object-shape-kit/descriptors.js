import { clonePortableGeometry, compareShapeMetrics, computeShapeMetrics } from "./metrics.js";
import { createObjectShapeQualification, NEXUS_OBJECT_SHAPE_QUALIFICATION_SCHEMA } from "./qualification.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export const NEXUS_OBJECT_SHAPE_PROFILE_SCHEMA = "nexus-object-shape-profile/1";
export const NEXUS_OBJECT_SHAPE_SOURCE_SCHEMA = "nexus-object-shape-source/1";
export const NEXUS_OBJECT_SHAPE_JOB_SCHEMA = "nexus-object-shape-job/1";
export const NEXUS_OBJECT_SHAPE_CANDIDATE_SCHEMA = "nexus-object-shape-candidate/1";
export const NEXUS_OBJECT_SHAPE_SCHEMA = "nexus-object-shape/1";
export { createObjectShapeQualification, NEXUS_OBJECT_SHAPE_QUALIFICATION_SCHEMA };

export const OBJECT_SHAPE_JOB_STATES = Object.freeze([
  "queued",
  "waiting-for-provider",
  "preparing",
  "simplifying",
  "optimizing",
  "validating",
  "qualifying",
  "ready",
  "rejected",
  "failed",
  "cancelled",
  "stale"
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
    qualification: clone(input.qualification ?? {}),
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
    qualification: clone(input.qualification ?? {}),
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
    candidateShapeId: input.candidateShapeId == null ? null : text(input.candidateShapeId, null, "shape job candidateShapeId"),
    qualificationId: input.qualificationId == null ? null : text(input.qualificationId, null, "shape job qualificationId"),
    resultShapeId: input.resultShapeId == null ? null : text(input.resultShapeId, null, "shape job resultShapeId"),
    attempt: Math.max(0, Math.floor(finite(input.attempt, 0, "shape job attempt"))),
    attemptedRatio: input.attemptedRatio == null ? null : Math.max(0.001, Math.min(1, finite(input.attemptedRatio, 1, "shape job attemptedRatio"))),
    fallbackUsed: Boolean(input.fallbackUsed),
    error: input.error == null ? null : clone(input.error),
    revision: Math.max(0, Math.floor(finite(input.revision, 0, "shape job revision"))),
    operationId: text(input.operationId, null, "shape job operationId")
  };
  structuredClone(job);
  return Object.freeze(job);
}

function normalizeShapeBase(input = {}, source = null, label = "object shape") {
  const geometry = input.geometry == null ? null : clonePortableGeometry(input.geometry);
  const asset = normalizeAssetReference(input.asset, label);
  if (!geometry && !asset) throw new TypeError(`${label} requires geometry or an asset reference.`);
  const metrics = geometry ? computeShapeMetrics(geometry) : clone(input.metrics ?? null);
  return {
    id: text(input.id, null, `${label} id`),
    objectId: text(input.objectId, source?.objectId, `${label} objectId`),
    objectContentHash: text(input.objectContentHash, source?.objectContentHash, `${label} objectContentHash`),
    sourceShapeId: text(input.sourceShapeId, source?.id, `${label} sourceShapeId`),
    sourceContentHash: text(input.sourceContentHash, source?.contentHash, `${label} sourceContentHash`),
    profileId: text(input.profileId, null, `${label} profileId`),
    targetId: text(input.targetId, null, `${label} targetId`),
    purpose: text(input.purpose, input.targetId ?? "derived", `${label} purpose`),
    geometry,
    asset,
    metrics,
    quality: clone(input.quality ?? (source?.metrics && metrics ? compareShapeMetrics(source.metrics, metrics) : {})),
    preservation: clone(input.preservation ?? {}),
    provider: {
      id: text(input.provider?.id ?? input.providerId, "object-shape-provider", `${label} provider id`),
      version: text(input.provider?.version, "0.1.0", `${label} provider version`)
    },
    metadata: clone(input.metadata ?? {})
  };
}

export function createObjectShapeCandidate(input = {}, source = null) {
  const base = normalizeShapeBase(input, source, "object shape candidate");
  const candidate = {
    schema: NEXUS_OBJECT_SHAPE_CANDIDATE_SCHEMA,
    ...base,
    requestedTargetId: text(input.requestedTargetId, input.targetId, "object shape candidate requestedTargetId"),
    requestedRatio: Math.max(0.001, Math.min(1, finite(input.requestedRatio, 1, "candidate requestedRatio"))),
    attemptedRatio: Math.max(0.001, Math.min(1, finite(input.attemptedRatio, input.requestedRatio ?? 1, "candidate attemptedRatio"))),
    attempt: Math.max(0, Math.floor(finite(input.attempt, 0, "candidate attempt"))),
    fallback: Boolean(input.fallback),
    state: "candidate"
  };
  candidate.contentHash = hashShapeValue(candidate);
  structuredClone(candidate);
  return Object.freeze(candidate);
}

export function createObjectShape(input = {}, source = null) {
  const base = normalizeShapeBase(input, source, "derived object shape");
  const qualification = input.qualification == null ? null : createObjectShapeQualification(input.qualification);
  if (qualification && qualification.status !== "approved") {
    throw new TypeError("Derived object shape can only publish approved qualification evidence.");
  }
  const shape = {
    schema: NEXUS_OBJECT_SHAPE_SCHEMA,
    ...base,
    candidateShapeId: input.candidateShapeId == null ? null : text(input.candidateShapeId, null, "derived object shape candidateShapeId"),
    qualification,
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
