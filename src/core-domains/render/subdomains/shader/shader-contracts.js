import { sha256Integrity } from "../../../../foundation/sha256.js";
import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const RENDER_SHADER_CONTRACT_SCHEMA = "nexusengine.render-shader-contract/1";
export const RENDER_SHADER_LANGUAGE_SCHEMA = "nexusengine.render-shader-language/1";
export const RENDER_SHADER_SOURCE_SCHEMA = "nexusengine.render-shader-source/1";
export const RENDER_SHADER_INCLUDE_SCHEMA = "nexusengine.render-shader-include/1";
export const RENDER_SHADER_MODULE_SCHEMA = "nexusengine.render-shader-module/1";
export const RENDER_SHADER_PROGRAM_SCHEMA = "nexusengine.render-shader-program/1";
export const RENDER_SHADER_REFLECTION_SCHEMA = "nexusengine.render-shader-reflection/1";
export const RENDER_SHADER_VARIANT_SCHEMA = "nexusengine.render-shader-variant/1";
export const RENDER_SHADER_PERMUTATION_SCHEMA = "nexusengine.render-shader-permutation/1";
export const RENDER_SHADER_ERROR_SCHEMA = "nexusengine.render-shader-error/1";
export const RENDER_SHADER_COMPILE_REQUEST_SCHEMA = "nexusengine.render-shader-compile-request/1";
export const RENDER_SHADER_COMPILE_RECEIPT_SCHEMA = "nexusengine.render-shader-compile-receipt/1";
export const RENDER_SHADER_COMPILE_RECORD_SCHEMA = "nexusengine.render-shader-compile-record/1";
export const RENDER_SHADER_CACHE_SCHEMA = "nexusengine.render-shader-cache-entry/1";

export const RENDER_SHADER_STAGES = Object.freeze([
  "any-hit",
  "callable",
  "closest-hit",
  "compute",
  "fragment",
  "geometry",
  "intersection",
  "mesh",
  "miss",
  "ray-generation",
  "task",
  "tessellation-control",
  "tessellation-evaluation",
  "vertex"
]);

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

const SOURCE_KINDS = Object.freeze(["binary", "text"]);
const PROGRAM_TYPES = Object.freeze(["compute", "graphics", "ray-tracing"]);
const AXIS_TARGETS = Object.freeze(["define", "specialization"]);
const ERROR_PHASES = Object.freeze(["compile", "link", "parse", "preprocess", "reflect", "validate"]);
const ERROR_SEVERITIES = Object.freeze(["error", "info", "warning"]);
const COMPILE_STATUSES = Object.freeze(["failed", "pending", "completed"]);
const MAX_PERMUTATION_VARIANTS = 4096;

export function canonicalShaderValue(value, label = "Shader value") {
  try {
    return canonicalizePortableValue(value, label);
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireShaderObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  return value;
}

export function rejectShaderFields(value, fields, label) {
  const allowed = new Set(fields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireShaderText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) throw new TypeError(`${label} must be a non-empty string.`);
  return value.trim();
}

export function optionalShaderText(value, label, fallback = null) {
  return value === undefined || value === null ? fallback : requireShaderText(value, label);
}

export function requireShaderInteger(value, label, { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new TypeError(`${label} must be a safe integer from ${minimum} through ${maximum}.`);
  }
  return value;
}

function normalizeSchema(value, expected, label) {
  const normalized = value ?? expected;
  if (normalized !== expected) throw new TypeError(`${label}.schema must equal ${expected}.`);
  return normalized;
}

function normalizeEnum(value, allowed, label, fallback = undefined) {
  const normalized = String(value ?? fallback);
  if (!allowed.includes(normalized)) throw new TypeError(`${label} must be one of ${allowed.join(", ")}.`);
  return normalized;
}

export function normalizeShaderTextList(value = [], label, { minimum = 0 } = {}) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  const normalized = value.map((entry, index) => requireShaderText(entry, `${label}[${index}]`)).sort();
  if (normalized.length < minimum) throw new TypeError(`${label} must contain at least ${minimum} item(s).`);
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} cannot contain duplicates.`);
  return normalized;
}

function normalizeMetadata(value, label) {
  const normalized = value ?? {};
  requireShaderObject(normalized, label);
  return canonicalShaderValue(normalized, label);
}

function normalizeScalar(value, label) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return Object.is(value, -0) ? 0 : value;
  throw new TypeError(`${label} must be a null, boolean, finite number, or string scalar.`);
}

function normalizeScalarMap(value, label) {
  const normalized = value ?? {};
  requireShaderObject(normalized, label);
  return Object.fromEntries(Object.keys(normalized).sort().map((key) => [requireShaderText(key, `${label} key`), normalizeScalar(normalized[key], `${label}.${key}`)]));
}

function exactHash(input, provided, label) {
  const hash = sha256Integrity(JSON.stringify(canonicalShaderValue(input, label)));
  if (provided !== undefined && provided !== null && provided !== hash) throw new TypeError(`${label} does not match normalized content.`);
  return hash;
}

function exactIntegrity(value, label) {
  const normalized = requireShaderText(value, label);
  if (!/^sha256:[0-9a-f]{64}$/.test(normalized)) throw new TypeError(`${label} must be a SHA-256 integrity value.`);
  return normalized;
}

function normalizePortableArray(value, label) {
  const normalized = value ?? [];
  if (!Array.isArray(normalized)) throw new TypeError(`${label} must be an array.`);
  return canonicalShaderValue(normalized, label);
}

function normalizeStage(value, label) {
  return normalizeEnum(value, RENDER_SHADER_STAGES, label);
}

export function shaderSourceKey(sourceId, revision) {
  return JSON.stringify([requireShaderText(sourceId, "Shader source ID"), requireShaderInteger(revision, "Shader source revision")]);
}

export function shaderIncludeKey(includeId, revision) {
  return JSON.stringify([requireShaderText(includeId, "Shader include ID"), requireShaderInteger(revision, "Shader include revision")]);
}

export function normalizeShaderLanguage(input = {}) {
  requireShaderObject(input, "Render Shader language");
  rejectShaderFields(input, ["schema", "languageId", "family", "version", "sourceKinds", "stages", "requiredFeatureIds", "fileExtensions", "metadata"], "Render Shader language");
  const value = canonicalShaderValue(input, "Render Shader language");
  const stages = normalizeShaderTextList(value.stages, "Render Shader language.stages", { minimum: 1 });
  stages.forEach((stage) => normalizeStage(stage, "Render Shader language stage"));
  return {
    schema: normalizeSchema(value.schema, RENDER_SHADER_LANGUAGE_SCHEMA, "Render Shader language"),
    languageId: requireShaderText(value.languageId, "Render Shader language.languageId"),
    family: requireShaderText(value.family, "Render Shader language.family"),
    version: requireShaderText(value.version, "Render Shader language.version"),
    sourceKinds: normalizeShaderTextList(value.sourceKinds, "Render Shader language.sourceKinds", { minimum: 1 }).map((kind) => normalizeEnum(kind, SOURCE_KINDS, "Render Shader language source kind")),
    stages,
    requiredFeatureIds: normalizeShaderTextList(value.requiredFeatureIds, "Render Shader language.requiredFeatureIds"),
    fileExtensions: normalizeShaderTextList(value.fileExtensions, "Render Shader language.fileExtensions"),
    metadata: normalizeMetadata(value.metadata, "Render Shader language.metadata")
  };
}

export function normalizeShaderSource(input = {}) {
  requireShaderObject(input, "Render Shader source");
  rejectShaderFields(input, ["schema", "sourceId", "revision", "sourceKey", "languageId", "sourceKind", "sourceText", "contentId", "integrity", "metadata"], "Render Shader source");
  const value = canonicalShaderValue(input, "Render Shader source");
  const sourceId = requireShaderText(value.sourceId, "Render Shader source.sourceId");
  const revision = requireShaderInteger(value.revision ?? 0, "Render Shader source.revision");
  const sourceKey = shaderSourceKey(sourceId, revision);
  if (value.sourceKey !== undefined && value.sourceKey !== sourceKey) throw new TypeError("Render Shader source.sourceKey does not match sourceId and revision.");
  const sourceKind = normalizeEnum(value.sourceKind, SOURCE_KINDS, "Render Shader source.sourceKind");
  const sourceText = sourceKind === "text" ? requireShaderText(value.sourceText, "Render Shader source.sourceText") : null;
  if (sourceKind === "binary" && value.sourceText !== undefined && value.sourceText !== null) throw new TypeError("Binary Render Shader sources cannot embed sourceText.");
  const integrity = sourceKind === "text"
    ? (() => {
        const expected = sha256Integrity(sourceText);
        if (value.integrity !== undefined && value.integrity !== null && value.integrity !== expected) throw new TypeError("Render Shader source.integrity does not match sourceText bytes.");
        return expected;
      })()
    : exactIntegrity(value.integrity, "Render Shader source.integrity");
  const contentId = optionalShaderText(value.contentId, "Render Shader source.contentId", integrity);
  return {
    schema: normalizeSchema(value.schema, RENDER_SHADER_SOURCE_SCHEMA, "Render Shader source"),
    sourceId,
    revision,
    sourceKey,
    languageId: requireShaderText(value.languageId, "Render Shader source.languageId"),
    sourceKind,
    sourceText,
    contentId,
    integrity,
    metadata: normalizeMetadata(value.metadata, "Render Shader source.metadata")
  };
}

export function normalizeShaderInclude(input = {}) {
  requireShaderObject(input, "Render Shader include");
  rejectShaderFields(input, ["schema", "includeId", "revision", "includeKey", "languageId", "sourceKey", "dependencyKeys", "includeHash", "metadata"], "Render Shader include");
  const value = canonicalShaderValue(input, "Render Shader include");
  const includeId = requireShaderText(value.includeId, "Render Shader include.includeId");
  const revision = requireShaderInteger(value.revision ?? 0, "Render Shader include.revision");
  const includeKey = shaderIncludeKey(includeId, revision);
  if (value.includeKey !== undefined && value.includeKey !== includeKey) throw new TypeError("Render Shader include.includeKey does not match includeId and revision.");
  const body = {
    schema: RENDER_SHADER_INCLUDE_SCHEMA,
    includeId,
    revision,
    includeKey,
    languageId: requireShaderText(value.languageId, "Render Shader include.languageId"),
    sourceKey: requireShaderText(value.sourceKey, "Render Shader include.sourceKey"),
    dependencyKeys: normalizeShaderTextList(value.dependencyKeys, "Render Shader include.dependencyKeys"),
    metadata: normalizeMetadata(value.metadata, "Render Shader include.metadata")
  };
  return { ...body, includeHash: exactHash(body, value.includeHash, "Render Shader include.includeHash") };
}

export function normalizeShaderModule(input = {}) {
  requireShaderObject(input, "Render Shader module");
  rejectShaderFields(input, ["schema", "moduleId", "languageId", "sourceKey", "stage", "entryPoint", "includeKeys", "defines", "requiredFeatureIds", "moduleHash", "metadata"], "Render Shader module");
  const value = canonicalShaderValue(input, "Render Shader module");
  const body = {
    schema: RENDER_SHADER_MODULE_SCHEMA,
    moduleId: requireShaderText(value.moduleId, "Render Shader module.moduleId"),
    languageId: requireShaderText(value.languageId, "Render Shader module.languageId"),
    sourceKey: requireShaderText(value.sourceKey, "Render Shader module.sourceKey"),
    stage: normalizeStage(value.stage, "Render Shader module.stage"),
    entryPoint: requireShaderText(value.entryPoint, "Render Shader module.entryPoint"),
    includeKeys: normalizeShaderTextList(value.includeKeys, "Render Shader module.includeKeys"),
    defines: normalizeScalarMap(value.defines, "Render Shader module.defines"),
    requiredFeatureIds: normalizeShaderTextList(value.requiredFeatureIds, "Render Shader module.requiredFeatureIds"),
    metadata: normalizeMetadata(value.metadata, "Render Shader module.metadata")
  };
  return { ...body, moduleHash: exactHash(body, value.moduleHash, "Render Shader module.moduleHash") };
}

export function normalizeShaderProgram(input = {}) {
  requireShaderObject(input, "Render Shader program");
  rejectShaderFields(input, ["schema", "programId", "type", "languageId", "moduleIds", "shaderInterface", "requiredFeatureIds", "programHash", "metadata"], "Render Shader program");
  const value = canonicalShaderValue(input, "Render Shader program");
  const body = {
    schema: RENDER_SHADER_PROGRAM_SCHEMA,
    programId: requireShaderText(value.programId, "Render Shader program.programId"),
    type: normalizeEnum(value.type, PROGRAM_TYPES, "Render Shader program.type"),
    languageId: requireShaderText(value.languageId, "Render Shader program.languageId"),
    moduleIds: normalizeShaderTextList(value.moduleIds, "Render Shader program.moduleIds", { minimum: 1 }),
    shaderInterface: canonicalShaderValue(requireShaderObject(value.shaderInterface, "Render Shader program.shaderInterface"), "Render Shader program.shaderInterface"),
    requiredFeatureIds: normalizeShaderTextList(value.requiredFeatureIds, "Render Shader program.requiredFeatureIds"),
    metadata: normalizeMetadata(value.metadata, "Render Shader program.metadata")
  };
  return { ...body, programHash: exactHash(body, value.programHash, "Render Shader program.programHash") };
}

export function normalizeShaderVariant(input = {}) {
  requireShaderObject(input, "Render Shader variant");
  rejectShaderFields(input, ["schema", "variantId", "programId", "defines", "specialization", "requiredFeatureIds", "variantHash", "metadata"], "Render Shader variant");
  const value = canonicalShaderValue(input, "Render Shader variant");
  const body = {
    schema: RENDER_SHADER_VARIANT_SCHEMA,
    variantId: requireShaderText(value.variantId, "Render Shader variant.variantId"),
    programId: requireShaderText(value.programId, "Render Shader variant.programId"),
    defines: normalizeScalarMap(value.defines, "Render Shader variant.defines"),
    specialization: normalizeScalarMap(value.specialization, "Render Shader variant.specialization"),
    requiredFeatureIds: normalizeShaderTextList(value.requiredFeatureIds, "Render Shader variant.requiredFeatureIds"),
    metadata: normalizeMetadata(value.metadata, "Render Shader variant.metadata")
  };
  return { ...body, variantHash: exactHash(body, value.variantHash, "Render Shader variant.variantHash") };
}

export function normalizeShaderPermutation(input = {}) {
  requireShaderObject(input, "Render Shader permutation");
  rejectShaderFields(input, ["schema", "permutationId", "programId", "axes", "maximumVariants", "requiredFeatureIds", "permutationHash", "metadata"], "Render Shader permutation");
  const value = canonicalShaderValue(input, "Render Shader permutation");
  if (!Array.isArray(value.axes) || value.axes.length === 0) throw new TypeError("Render Shader permutation.axes must contain at least one axis.");
  const axes = value.axes.map((axis, index) => {
    requireShaderObject(axis, `Render Shader permutation.axes[${index}]`);
    rejectShaderFields(axis, ["name", "target", "values"], `Render Shader permutation.axes[${index}]`);
    if (!Array.isArray(axis.values) || axis.values.length === 0) throw new TypeError(`Render Shader permutation.axes[${index}].values must not be empty.`);
    const values = axis.values.map((entry, valueIndex) => normalizeScalar(entry, `Render Shader permutation.axes[${index}].values[${valueIndex}]`));
    if (new Set(values.map((entry) => JSON.stringify(entry))).size !== values.length) throw new TypeError(`Render Shader permutation axis ${axis.name} contains duplicate values.`);
    return { name: requireShaderText(axis.name, `Render Shader permutation.axes[${index}].name`), target: normalizeEnum(axis.target, AXIS_TARGETS, `Render Shader permutation.axes[${index}].target`), values };
  }).sort((left, right) => left.name.localeCompare(right.name));
  if (new Set(axes.map((axis) => axis.name)).size !== axes.length) throw new TypeError("Render Shader permutation axes require unique names.");
  const variantCount = axes.reduce((count, axis) => count * axis.values.length, 1);
  const maximumVariants = requireShaderInteger(value.maximumVariants ?? MAX_PERMUTATION_VARIANTS, "Render Shader permutation.maximumVariants", { minimum: 1, maximum: MAX_PERMUTATION_VARIANTS });
  if (variantCount > maximumVariants) throw new TypeError(`Render Shader permutation expands to ${variantCount} variants, exceeding ${maximumVariants}.`);
  const body = {
    schema: RENDER_SHADER_PERMUTATION_SCHEMA,
    permutationId: requireShaderText(value.permutationId, "Render Shader permutation.permutationId"),
    programId: requireShaderText(value.programId, "Render Shader permutation.programId"),
    axes,
    maximumVariants,
    requiredFeatureIds: normalizeShaderTextList(value.requiredFeatureIds, "Render Shader permutation.requiredFeatureIds"),
    metadata: normalizeMetadata(value.metadata, "Render Shader permutation.metadata")
  };
  return { ...body, permutationHash: exactHash(body, value.permutationHash, "Render Shader permutation.permutationHash") };
}

export function expandShaderPermutation(permutation) {
  const normalized = normalizeShaderPermutation(permutation);
  let combinations = [{ defines: {}, specialization: {} }];
  for (const axis of normalized.axes) {
    combinations = combinations.flatMap((combination) => axis.values.map((value) => ({
      defines: axis.target === "define" ? { ...combination.defines, [axis.name]: value } : combination.defines,
      specialization: axis.target === "specialization" ? { ...combination.specialization, [axis.name]: value } : combination.specialization
    })));
  }
  return combinations.map((combination, index) => normalizeShaderVariant({
    variantId: `${normalized.permutationId}:${String(index).padStart(6, "0")}`,
    programId: normalized.programId,
    ...combination,
    requiredFeatureIds: normalized.requiredFeatureIds,
    metadata: { permutationId: normalized.permutationId, permutationHash: normalized.permutationHash }
  }));
}

export function normalizeShaderReflection(input = {}) {
  requireShaderObject(input, "Render Shader reflection");
  rejectShaderFields(input, ["schema", "reflectionId", "compileId", "programId", "variantId", "providerId", "deviceId", "capabilityId", "bindings", "attributes", "outputs", "pushConstants", "workgroupSize", "reflectionHash", "metadata"], "Render Shader reflection");
  const value = canonicalShaderValue(input, "Render Shader reflection");
  const workgroupSize = value.workgroupSize === undefined || value.workgroupSize === null
    ? null
    : (() => {
        if (!Array.isArray(value.workgroupSize) || value.workgroupSize.length !== 3) throw new TypeError("Render Shader reflection.workgroupSize must contain exactly three integers.");
        return value.workgroupSize.map((entry, index) => requireShaderInteger(entry, `Render Shader reflection.workgroupSize[${index}]`, { minimum: 1 }));
      })();
  const body = {
    schema: RENDER_SHADER_REFLECTION_SCHEMA,
    reflectionId: requireShaderText(value.reflectionId, "Render Shader reflection.reflectionId"),
    compileId: requireShaderText(value.compileId, "Render Shader reflection.compileId"),
    programId: requireShaderText(value.programId, "Render Shader reflection.programId"),
    variantId: optionalShaderText(value.variantId, "Render Shader reflection.variantId"),
    providerId: requireShaderText(value.providerId, "Render Shader reflection.providerId"),
    deviceId: requireShaderText(value.deviceId, "Render Shader reflection.deviceId"),
    capabilityId: requireShaderText(value.capabilityId, "Render Shader reflection.capabilityId"),
    bindings: normalizePortableArray(value.bindings, "Render Shader reflection.bindings"),
    attributes: normalizePortableArray(value.attributes, "Render Shader reflection.attributes"),
    outputs: normalizePortableArray(value.outputs, "Render Shader reflection.outputs"),
    pushConstants: normalizePortableArray(value.pushConstants, "Render Shader reflection.pushConstants"),
    workgroupSize,
    metadata: normalizeMetadata(value.metadata, "Render Shader reflection.metadata")
  };
  return { ...body, reflectionHash: exactHash(body, value.reflectionHash, "Render Shader reflection.reflectionHash") };
}

export function normalizeShaderError(input = {}) {
  requireShaderObject(input, "Render Shader error");
  rejectShaderFields(input, ["schema", "errorId", "compileId", "moduleId", "sourceKey", "stage", "phase", "severity", "code", "message", "location", "providerId", "details"], "Render Shader error");
  const value = canonicalShaderValue(input, "Render Shader error");
  return {
    schema: normalizeSchema(value.schema, RENDER_SHADER_ERROR_SCHEMA, "Render Shader error"),
    errorId: requireShaderText(value.errorId, "Render Shader error.errorId"),
    compileId: requireShaderText(value.compileId, "Render Shader error.compileId"),
    moduleId: optionalShaderText(value.moduleId, "Render Shader error.moduleId"),
    sourceKey: optionalShaderText(value.sourceKey, "Render Shader error.sourceKey"),
    stage: value.stage === undefined || value.stage === null ? null : normalizeStage(value.stage, "Render Shader error.stage"),
    phase: normalizeEnum(value.phase, ERROR_PHASES, "Render Shader error.phase"),
    severity: normalizeEnum(value.severity, ERROR_SEVERITIES, "Render Shader error.severity"),
    code: requireShaderText(value.code, "Render Shader error.code"),
    message: requireShaderText(value.message, "Render Shader error.message"),
    location: value.location === undefined || value.location === null ? null : normalizeMetadata(value.location, "Render Shader error.location"),
    providerId: optionalShaderText(value.providerId, "Render Shader error.providerId"),
    details: normalizeMetadata(value.details, "Render Shader error.details")
  };
}

export function normalizeShaderCompileRequest(input = {}) {
  requireShaderObject(input, "Render Shader compile request");
  rejectShaderFields(input, ["schema", "compileId", "programId", "variantId", "capabilityId", "queueId", "submissionId", "targetLanguageId", "requiredFeatureIds", "sourceClosureHash", "options", "metadata"], "Render Shader compile request");
  const value = canonicalShaderValue(input, "Render Shader compile request");
  return {
    schema: normalizeSchema(value.schema, RENDER_SHADER_COMPILE_REQUEST_SCHEMA, "Render Shader compile request"),
    compileId: requireShaderText(value.compileId, "Render Shader compile request.compileId"),
    programId: requireShaderText(value.programId, "Render Shader compile request.programId"),
    variantId: optionalShaderText(value.variantId, "Render Shader compile request.variantId"),
    capabilityId: requireShaderText(value.capabilityId, "Render Shader compile request.capabilityId"),
    queueId: requireShaderText(value.queueId, "Render Shader compile request.queueId"),
    submissionId: requireShaderText(value.submissionId, "Render Shader compile request.submissionId"),
    targetLanguageId: requireShaderText(value.targetLanguageId, "Render Shader compile request.targetLanguageId"),
    requiredFeatureIds: normalizeShaderTextList(value.requiredFeatureIds, "Render Shader compile request.requiredFeatureIds"),
    sourceClosureHash: exactIntegrity(value.sourceClosureHash, "Render Shader compile request.sourceClosureHash"),
    options: normalizeMetadata(value.options, "Render Shader compile request.options"),
    metadata: normalizeMetadata(value.metadata, "Render Shader compile request.metadata")
  };
}

export function normalizeShaderCompileReceipt(input = {}) {
  requireShaderObject(input, "Render Shader compile receipt");
  rejectShaderFields(input, ["schema", "compileId", "submissionId", "providerId", "deviceId", "artifactId", "artifactIntegrity", "binaryFormat", "details"], "Render Shader compile receipt");
  const value = canonicalShaderValue(input, "Render Shader compile receipt");
  return {
    schema: normalizeSchema(value.schema, RENDER_SHADER_COMPILE_RECEIPT_SCHEMA, "Render Shader compile receipt"),
    compileId: requireShaderText(value.compileId, "Render Shader compile receipt.compileId"),
    submissionId: requireShaderText(value.submissionId, "Render Shader compile receipt.submissionId"),
    providerId: requireShaderText(value.providerId, "Render Shader compile receipt.providerId"),
    deviceId: requireShaderText(value.deviceId, "Render Shader compile receipt.deviceId"),
    artifactId: requireShaderText(value.artifactId, "Render Shader compile receipt.artifactId"),
    artifactIntegrity: exactIntegrity(value.artifactIntegrity, "Render Shader compile receipt.artifactIntegrity"),
    binaryFormat: requireShaderText(value.binaryFormat, "Render Shader compile receipt.binaryFormat"),
    details: normalizeMetadata(value.details, "Render Shader compile receipt.details")
  };
}

export function normalizeShaderCompileRecord(input = {}) {
  requireShaderObject(input, "Render Shader compile record");
  rejectShaderFields(input, ["schema", "status", "request", "providerReceipt", "errorIds"], "Render Shader compile record");
  const value = canonicalShaderValue(input, "Render Shader compile record");
  const status = normalizeEnum(value.status, COMPILE_STATUSES, "Render Shader compile record.status");
  const request = normalizeShaderCompileRequest(value.request);
  const providerReceipt = value.providerReceipt === null || value.providerReceipt === undefined ? null : normalizeShaderCompileReceipt(value.providerReceipt);
  const errorIds = normalizeShaderTextList(value.errorIds, "Render Shader compile record.errorIds");
  if (status === "pending" && (providerReceipt || errorIds.length)) throw new TypeError("Pending Render Shader compile records cannot have a provider receipt or errors.");
  if (status === "completed" && (!providerReceipt || errorIds.length)) throw new TypeError("Completed Render Shader compile records require one provider receipt and no errors.");
  if (status === "failed" && (providerReceipt || errorIds.length === 0)) throw new TypeError("Failed Render Shader compile records require errors and no provider receipt.");
  return { schema: normalizeSchema(value.schema, RENDER_SHADER_COMPILE_RECORD_SCHEMA, "Render Shader compile record"), status, request, providerReceipt, errorIds };
}

export function normalizeShaderCacheEntry(input = {}) {
  requireShaderObject(input, "Render Shader cache entry");
  rejectShaderFields(input, ["schema", "cacheId", "compileId", "identityId", "reflectionId", "lastUsedRevision", "metadata"], "Render Shader cache entry");
  const value = canonicalShaderValue(input, "Render Shader cache entry");
  return {
    schema: normalizeSchema(value.schema, RENDER_SHADER_CACHE_SCHEMA, "Render Shader cache entry"),
    cacheId: requireShaderText(value.cacheId, "Render Shader cache entry.cacheId"),
    compileId: requireShaderText(value.compileId, "Render Shader cache entry.compileId"),
    identityId: requireShaderText(value.identityId, "Render Shader cache entry.identityId"),
    reflectionId: optionalShaderText(value.reflectionId, "Render Shader cache entry.reflectionId"),
    lastUsedRevision: requireShaderInteger(value.lastUsedRevision ?? 0, "Render Shader cache entry.lastUsedRevision"),
    metadata: normalizeMetadata(value.metadata, "Render Shader cache entry.metadata")
  };
}

export function normalizeShaderRegistrationCommand(input, field, normalizeRecord, label) {
  requireShaderObject(input, label);
  rejectShaderFields(input, ["operationId", field], label);
  const value = canonicalShaderValue(input, label);
  return { operationId: requireShaderText(value.operationId, `${label}.operationId`), [field]: normalizeRecord(value[field]) };
}

export function normalizeShaderOperation(input, fields, label) {
  requireShaderObject(input, label);
  rejectShaderFields(input, ["operationId", ...fields], label);
  const value = canonicalShaderValue(input, label);
  return { ...value, operationId: requireShaderText(value.operationId, `${label}.operationId`) };
}

export function normalizeShaderRegistrySnapshot(snapshot, { domain, collection, order, revision, normalizeRecord, idField, label }) {
  requireShaderObject(snapshot, label);
  rejectShaderFields(snapshot, [...COMMON_STATE_KEYS, collection, order, revision], label);
  const value = canonicalShaderValue(snapshot, label);
  if (value.domain !== domain) throw new TypeError(`${label}.domain must equal ${domain}.`);
  requireShaderInteger(value.sequence, `${label}.sequence`);
  requireShaderObject(value[collection], `${label}.${collection}`);
  const records = Object.fromEntries(Object.entries(value[collection]).map(([key, record]) => {
    const normalized = normalizeRecord(record);
    const recordId = String(idField).split(".").reduce((entry, field) => entry?.[field], normalized);
    if (recordId !== key) throw new TypeError(`${label}.${collection} key ${key} does not match ${idField} ${recordId}.`);
    return [key, normalized];
  }));
  const expectedOrder = Object.keys(records).sort();
  if (JSON.stringify(value[order]) !== JSON.stringify(expectedOrder)) throw new TypeError(`${label}.${order} must match sorted ${collection} keys.`);
  requireShaderInteger(value[revision], `${label}.${revision}`);
  value[collection] = records;
  return value;
}

export function normalizeShaderContractSnapshot(snapshot) {
  const label = "Render Shader contract snapshot";
  requireShaderObject(snapshot, label);
  rejectShaderFields(snapshot, [...COMMON_STATE_KEYS, "contractRevision"], label);
  const value = canonicalShaderValue(snapshot, label);
  if (value.domain !== "render-shader-contract") throw new TypeError(`${label}.domain must equal render-shader-contract.`);
  requireShaderInteger(value.sequence, `${label}.sequence`);
  requireShaderInteger(value.contractRevision, `${label}.contractRevision`, { minimum: 1 });
  return value;
}

export function shaderContract() {
  return Object.freeze({
    schema: RENDER_SHADER_CONTRACT_SCHEMA,
    stages: [...RENDER_SHADER_STAGES],
    sourceExecution: false,
    providerCompilationRequired: true,
    immutableSourceRevisions: true,
    deterministicPrograms: true,
    maximumPermutationVariants: MAX_PERMUTATION_VARIANTS
  });
}

export function shaderRegistryContract({ schema, record, providerOwned = [] }) {
  return Object.freeze({ schema, record, immutable: true, exactOnce: true, queryMutation: false, providerOwned: [...providerOwned] });
}
