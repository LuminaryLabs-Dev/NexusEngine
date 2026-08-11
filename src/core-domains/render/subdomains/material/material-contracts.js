import { sha256Integrity } from "../../../../foundation/sha256.js";
import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const RENDER_MATERIAL_CONTRACT_SCHEMA = "nexusengine.render-material-contract/1";
export const RENDER_MATERIAL_BINDING_SCHEMA = "nexusengine.render-material-binding/1";
export const RENDER_MATERIAL_PARAMETER_SET_SCHEMA = "nexusengine.render-material-parameter-set/1";
export const RENDER_TEXTURE_BINDING_SCHEMA = "nexusengine.render-material-texture-binding/1";
export const RENDER_SAMPLER_BINDING_SCHEMA = "nexusengine.render-material-sampler-binding/1";
export const RENDER_MATERIAL_INSTANCE_SCHEMA = "nexusengine.render-material-instance/1";
export const RENDER_MATERIAL_VARIANT_SCHEMA = "nexusengine.render-material-variant/1";
export const RENDER_MATERIAL_VALIDATION_SCHEMA = "nexusengine.render-material-validation/1";
export const RENDER_MATERIAL_CACHE_SCHEMA = "nexusengine.render-material-cache-entry/1";

export const MATERIAL_BINDING_KINDS = Object.freeze(["parameter", "sampler", "texture"]);
export const MATERIAL_PARAMETER_TYPES = Object.freeze(["bool", "float", "int", "mat3", "mat4", "uint", "vec2", "vec3", "vec4"]);
export const MATERIAL_TEXTURE_VIEW_TYPES = Object.freeze(["2d", "array", "cube"]);

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

const ADDRESS_MODES = Object.freeze(["clamp-to-edge", "mirror-repeat", "repeat"]);
const FILTER_MODES = Object.freeze(["linear", "nearest"]);
const COMPARE_FUNCTIONS = Object.freeze(["always", "equal", "greater", "greater-equal", "less", "less-equal", "never", "not-equal"]);
const TARGET_TYPES = Object.freeze(["instance", "variant"]);
const SHA256_INTEGRITY_PATTERN = /^sha256:[0-9a-f]{64}$/;

export function canonicalMaterialValue(value, label = "Render Material value") {
  try {
    return canonicalizePortableValue(value, label);
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireMaterialObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  return value;
}

export function rejectMaterialFields(value, fields, label) {
  const allowed = new Set(fields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireMaterialText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) throw new TypeError(`${label} must be a non-empty string.`);
  return value.trim();
}

function requireMaterialIntegrity(value, label) {
  const normalized = requireMaterialText(value, label);
  if (!SHA256_INTEGRITY_PATTERN.test(normalized)) throw new TypeError(`${label} must be a lowercase SHA-256 integrity string.`);
  return normalized;
}

export function optionalMaterialText(value, label, fallback = null) {
  return value === undefined || value === null ? fallback : requireMaterialText(value, label);
}

export function requireMaterialInteger(value, label, { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new TypeError(`${label} must be a safe integer from ${minimum} through ${maximum}.`);
  }
  return value;
}

function requireFinite(value, label, { minimum = -Number.MAX_VALUE, maximum = Number.MAX_VALUE } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new TypeError(`${label} must be a finite number from ${minimum} through ${maximum}.`);
  }
  return Object.is(value, -0) ? 0 : value;
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

export function normalizeMaterialTextList(value = [], label, { minimum = 0 } = {}) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  const normalized = value.map((entry, index) => requireMaterialText(entry, `${label}[${index}]`)).sort();
  if (normalized.length < minimum) throw new TypeError(`${label} must contain at least ${minimum} item(s).`);
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} cannot contain duplicates.`);
  return normalized;
}

function normalizeMetadata(value, label) {
  const normalized = value ?? {};
  requireMaterialObject(normalized, `${label}.metadata`);
  return canonicalMaterialValue(normalized, `${label}.metadata`);
}

function exactHash(input, provided, label) {
  const hash = sha256Integrity(JSON.stringify(canonicalMaterialValue(input, label)));
  if (provided !== undefined && provided !== null && provided !== hash) throw new TypeError(`${label} does not match normalized content.`);
  return hash;
}

function normalizeBindingSlot(input, index) {
  const label = `Render Material binding.slots[${index}]`;
  requireMaterialObject(input, label);
  rejectMaterialFields(input, ["slotId", "shaderBindingId", "group", "binding", "kind", "valueType", "required", "stages", "metadata"], label);
  const value = canonicalMaterialValue(input, label);
  const kind = normalizeEnum(value.kind, MATERIAL_BINDING_KINDS, `${label}.kind`);
  const valueType = kind === "parameter"
    ? normalizeEnum(value.valueType, MATERIAL_PARAMETER_TYPES, `${label}.valueType`)
    : optionalMaterialText(value.valueType, `${label}.valueType`);
  if (kind !== "parameter" && valueType !== null) throw new TypeError(`${label}.valueType is only valid for parameter slots.`);
  return {
    slotId: requireMaterialText(value.slotId, `${label}.slotId`),
    shaderBindingId: requireMaterialText(value.shaderBindingId, `${label}.shaderBindingId`),
    group: requireMaterialInteger(value.group, `${label}.group`),
    binding: requireMaterialInteger(value.binding, `${label}.binding`),
    kind,
    valueType,
    required: value.required !== false,
    stages: normalizeMaterialTextList(value.stages ?? [], `${label}.stages`, { minimum: 1 }),
    metadata: normalizeMetadata(value.metadata, label)
  };
}

export function normalizeMaterialBinding(input = {}) {
  requireMaterialObject(input, "Render Material binding");
  rejectMaterialFields(input, ["schema", "bindingId", "programId", "slots", "requiredFeatureIds", "bindingHash", "metadata"], "Render Material binding");
  const value = canonicalMaterialValue(input, "Render Material binding");
  if (!Array.isArray(value.slots) || value.slots.length === 0) throw new TypeError("Render Material binding.slots must contain at least one slot.");
  const slots = value.slots.map(normalizeBindingSlot).sort((left, right) => left.group - right.group || left.binding - right.binding || left.slotId.localeCompare(right.slotId));
  if (new Set(slots.map((slot) => slot.slotId)).size !== slots.length) throw new TypeError("Render Material binding.slots cannot repeat slotId.");
  if (new Set(slots.map((slot) => slot.shaderBindingId)).size !== slots.length) throw new TypeError("Render Material binding.slots cannot repeat shaderBindingId.");
  if (new Set(slots.map((slot) => `${slot.group}:${slot.binding}`)).size !== slots.length) throw new TypeError("Render Material binding.slots cannot repeat group and binding coordinates.");
  const normalized = {
    schema: normalizeSchema(value.schema, RENDER_MATERIAL_BINDING_SCHEMA, "Render Material binding"),
    bindingId: requireMaterialText(value.bindingId, "Render Material binding.bindingId"),
    programId: requireMaterialText(value.programId, "Render Material binding.programId"),
    slots,
    requiredFeatureIds: normalizeMaterialTextList(value.requiredFeatureIds ?? [], "Render Material binding.requiredFeatureIds"),
    metadata: normalizeMetadata(value.metadata, "Render Material binding")
  };
  return { ...normalized, bindingHash: exactHash(normalized, value.bindingHash, "Render Material binding.bindingHash") };
}

function normalizeParameter(input, index) {
  const label = `Render Material parameter set.parameters[${index}]`;
  requireMaterialObject(input, label);
  rejectMaterialFields(input, ["slotId", "value"], label);
  return {
    slotId: requireMaterialText(input.slotId, `${label}.slotId`),
    value: canonicalMaterialValue(input.value, `${label}.value`)
  };
}

export function normalizeMaterialParameterValue(value, valueType, label = "Render Material parameter") {
  const normalizedType = normalizeEnum(valueType, MATERIAL_PARAMETER_TYPES, `${label}.valueType`);
  if (normalizedType === "bool") {
    if (typeof value !== "boolean") throw new TypeError(`${label} must be a boolean.`);
    return value;
  }
  if (normalizedType === "float") return requireFinite(value, label);
  if (normalizedType === "int") return requireMaterialInteger(value, label, { minimum: Number.MIN_SAFE_INTEGER });
  if (normalizedType === "uint") return requireMaterialInteger(value, label);
  const lengths = { vec2: 2, vec3: 3, vec4: 4, mat3: 9, mat4: 16 };
  const expectedLength = lengths[normalizedType];
  if (!Array.isArray(value) || value.length !== expectedLength) throw new TypeError(`${label} must contain exactly ${expectedLength} finite numbers.`);
  return value.map((entry, index) => requireFinite(entry, `${label}[${index}]`));
}

export function normalizeMaterialParameterSet(input = {}) {
  requireMaterialObject(input, "Render Material parameter set");
  rejectMaterialFields(input, ["schema", "parameterSetId", "bindingId", "parameters", "parameterHash", "metadata"], "Render Material parameter set");
  const value = canonicalMaterialValue(input, "Render Material parameter set");
  if (!Array.isArray(value.parameters)) throw new TypeError("Render Material parameter set.parameters must be an array.");
  const parameters = value.parameters.map(normalizeParameter).sort((left, right) => left.slotId.localeCompare(right.slotId));
  if (new Set(parameters.map((entry) => entry.slotId)).size !== parameters.length) throw new TypeError("Render Material parameter set.parameters cannot repeat slotId.");
  const normalized = {
    schema: normalizeSchema(value.schema, RENDER_MATERIAL_PARAMETER_SET_SCHEMA, "Render Material parameter set"),
    parameterSetId: requireMaterialText(value.parameterSetId, "Render Material parameter set.parameterSetId"),
    bindingId: requireMaterialText(value.bindingId, "Render Material parameter set.bindingId"),
    parameters,
    metadata: normalizeMetadata(value.metadata, "Render Material parameter set")
  };
  return { ...normalized, parameterHash: exactHash(normalized, value.parameterHash, "Render Material parameter set.parameterHash") };
}

function normalizeTextureSubresource(input, index) {
  const label = `Render Material Texture binding.requiredSubresources[${index}]`;
  requireMaterialObject(input, label);
  rejectMaterialFields(input, ["mipLevel", "arrayLayer"], label);
  return {
    mipLevel: requireMaterialInteger(input.mipLevel, `${label}.mipLevel`),
    arrayLayer: requireMaterialInteger(input.arrayLayer ?? 0, `${label}.arrayLayer`)
  };
}

export function normalizeMaterialTextureBinding(input = {}) {
  requireMaterialObject(input, "Render Material Texture binding");
  rejectMaterialFields(input, ["schema", "textureBindingId", "bindingId", "slotId", "viewType", "viewId", "identityId", "requiredSubresources", "textureHash", "metadata"], "Render Material Texture binding");
  const value = canonicalMaterialValue(input, "Render Material Texture binding");
  if (!Array.isArray(value.requiredSubresources) || value.requiredSubresources.length === 0) throw new TypeError("Render Material Texture binding.requiredSubresources must contain at least one subresource.");
  const requiredSubresources = value.requiredSubresources.map(normalizeTextureSubresource).sort((left, right) => left.mipLevel - right.mipLevel || left.arrayLayer - right.arrayLayer);
  if (new Set(requiredSubresources.map((entry) => `${entry.mipLevel}:${entry.arrayLayer}`)).size !== requiredSubresources.length) throw new TypeError("Render Material Texture binding.requiredSubresources cannot contain duplicates.");
  const normalized = {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_BINDING_SCHEMA, "Render Material Texture binding"),
    textureBindingId: requireMaterialText(value.textureBindingId, "Render Material Texture binding.textureBindingId"),
    bindingId: requireMaterialText(value.bindingId, "Render Material Texture binding.bindingId"),
    slotId: requireMaterialText(value.slotId, "Render Material Texture binding.slotId"),
    viewType: normalizeEnum(value.viewType, MATERIAL_TEXTURE_VIEW_TYPES, "Render Material Texture binding.viewType"),
    viewId: requireMaterialText(value.viewId, "Render Material Texture binding.viewId"),
    identityId: requireMaterialText(value.identityId, "Render Material Texture binding.identityId"),
    requiredSubresources,
    metadata: normalizeMetadata(value.metadata, "Render Material Texture binding")
  };
  return { ...normalized, textureHash: exactHash(normalized, value.textureHash, "Render Material Texture binding.textureHash") };
}

function normalizeSamplerDescriptor(input = {}) {
  requireMaterialObject(input, "Render Material sampler descriptor");
  rejectMaterialFields(input, ["addressU", "addressV", "addressW", "magFilter", "minFilter", "mipmapFilter", "lodMin", "lodMax", "maxAnisotropy", "compare", "metadata"], "Render Material sampler descriptor");
  const value = canonicalMaterialValue(input, "Render Material sampler descriptor");
  const lodMin = requireFinite(value.lodMin ?? 0, "Render Material sampler descriptor.lodMin", { minimum: 0 });
  const lodMax = requireFinite(value.lodMax ?? 32, "Render Material sampler descriptor.lodMax", { minimum: 0 });
  if (lodMax < lodMin) throw new TypeError("Render Material sampler descriptor.lodMax cannot be less than lodMin.");
  return {
    addressU: normalizeEnum(value.addressU, ADDRESS_MODES, "Render Material sampler descriptor.addressU", "repeat"),
    addressV: normalizeEnum(value.addressV, ADDRESS_MODES, "Render Material sampler descriptor.addressV", "repeat"),
    addressW: normalizeEnum(value.addressW, ADDRESS_MODES, "Render Material sampler descriptor.addressW", "repeat"),
    magFilter: normalizeEnum(value.magFilter, FILTER_MODES, "Render Material sampler descriptor.magFilter", "linear"),
    minFilter: normalizeEnum(value.minFilter, FILTER_MODES, "Render Material sampler descriptor.minFilter", "linear"),
    mipmapFilter: normalizeEnum(value.mipmapFilter, FILTER_MODES, "Render Material sampler descriptor.mipmapFilter", "linear"),
    lodMin,
    lodMax,
    maxAnisotropy: requireMaterialInteger(value.maxAnisotropy ?? 1, "Render Material sampler descriptor.maxAnisotropy", { minimum: 1 }),
    compare: value.compare === null || value.compare === undefined ? null : normalizeEnum(value.compare, COMPARE_FUNCTIONS, "Render Material sampler descriptor.compare"),
    metadata: normalizeMetadata(value.metadata, "Render Material sampler descriptor")
  };
}

export function normalizeMaterialSamplerBinding(input = {}) {
  requireMaterialObject(input, "Render Material sampler binding");
  rejectMaterialFields(input, ["schema", "samplerBindingId", "bindingId", "slotId", "descriptor", "samplerHash", "metadata"], "Render Material sampler binding");
  const value = canonicalMaterialValue(input, "Render Material sampler binding");
  const normalized = {
    schema: normalizeSchema(value.schema, RENDER_SAMPLER_BINDING_SCHEMA, "Render Material sampler binding"),
    samplerBindingId: requireMaterialText(value.samplerBindingId, "Render Material sampler binding.samplerBindingId"),
    bindingId: requireMaterialText(value.bindingId, "Render Material sampler binding.bindingId"),
    slotId: requireMaterialText(value.slotId, "Render Material sampler binding.slotId"),
    descriptor: normalizeSamplerDescriptor(value.descriptor),
    metadata: normalizeMetadata(value.metadata, "Render Material sampler binding")
  };
  return { ...normalized, samplerHash: exactHash(normalized, value.samplerHash, "Render Material sampler binding.samplerHash") };
}

export function normalizeMaterialInstance(input = {}) {
  requireMaterialObject(input, "Render Material instance");
  rejectMaterialFields(input, ["schema", "instanceId", "bindingId", "parameterSetId", "textureBindingIds", "samplerBindingIds", "instanceHash", "metadata"], "Render Material instance");
  const value = canonicalMaterialValue(input, "Render Material instance");
  const normalized = {
    schema: normalizeSchema(value.schema, RENDER_MATERIAL_INSTANCE_SCHEMA, "Render Material instance"),
    instanceId: requireMaterialText(value.instanceId, "Render Material instance.instanceId"),
    bindingId: requireMaterialText(value.bindingId, "Render Material instance.bindingId"),
    parameterSetId: optionalMaterialText(value.parameterSetId, "Render Material instance.parameterSetId"),
    textureBindingIds: normalizeMaterialTextList(value.textureBindingIds ?? [], "Render Material instance.textureBindingIds"),
    samplerBindingIds: normalizeMaterialTextList(value.samplerBindingIds ?? [], "Render Material instance.samplerBindingIds"),
    metadata: normalizeMetadata(value.metadata, "Render Material instance")
  };
  return { ...normalized, instanceHash: exactHash(normalized, value.instanceHash, "Render Material instance.instanceHash") };
}

function normalizeOptionalTextList(value, label) {
  return value === undefined || value === null ? null : normalizeMaterialTextList(value, label);
}

export function normalizeMaterialVariant(input = {}) {
  requireMaterialObject(input, "Render Material variant");
  rejectMaterialFields(input, ["schema", "materialVariantId", "baseInstanceId", "shaderVariantId", "parameterSetId", "textureBindingIds", "samplerBindingIds", "variantHash", "metadata"], "Render Material variant");
  const value = canonicalMaterialValue(input, "Render Material variant");
  const normalized = {
    schema: normalizeSchema(value.schema, RENDER_MATERIAL_VARIANT_SCHEMA, "Render Material variant"),
    materialVariantId: requireMaterialText(value.materialVariantId, "Render Material variant.materialVariantId"),
    baseInstanceId: requireMaterialText(value.baseInstanceId, "Render Material variant.baseInstanceId"),
    shaderVariantId: requireMaterialText(value.shaderVariantId, "Render Material variant.shaderVariantId"),
    parameterSetId: optionalMaterialText(value.parameterSetId, "Render Material variant.parameterSetId"),
    textureBindingIds: normalizeOptionalTextList(value.textureBindingIds, "Render Material variant.textureBindingIds"),
    samplerBindingIds: normalizeOptionalTextList(value.samplerBindingIds, "Render Material variant.samplerBindingIds"),
    metadata: normalizeMetadata(value.metadata, "Render Material variant")
  };
  return { ...normalized, variantHash: exactHash(normalized, value.variantHash, "Render Material variant.variantHash") };
}

export function normalizeMaterialValidation(input = {}) {
  requireMaterialObject(input, "Render Material validation");
  rejectMaterialFields(input, ["schema", "validationId", "targetType", "targetId", "compileId", "reflectionId", "status", "targetHash", "materialHash", "metadata"], "Render Material validation");
  const value = canonicalMaterialValue(input, "Render Material validation");
  const status = String(value.status ?? "valid");
  if (status !== "valid") throw new TypeError("Render Material validation.status must equal valid.");
  return {
    schema: normalizeSchema(value.schema, RENDER_MATERIAL_VALIDATION_SCHEMA, "Render Material validation"),
    validationId: requireMaterialText(value.validationId, "Render Material validation.validationId"),
    targetType: normalizeEnum(value.targetType, TARGET_TYPES, "Render Material validation.targetType"),
    targetId: requireMaterialText(value.targetId, "Render Material validation.targetId"),
    compileId: requireMaterialText(value.compileId, "Render Material validation.compileId"),
    reflectionId: requireMaterialText(value.reflectionId, "Render Material validation.reflectionId"),
    status,
    targetHash: requireMaterialIntegrity(value.targetHash, "Render Material validation.targetHash"),
    materialHash: requireMaterialIntegrity(value.materialHash, "Render Material validation.materialHash"),
    metadata: normalizeMetadata(value.metadata, "Render Material validation")
  };
}

export function normalizeMaterialCacheEntry(input = {}) {
  requireMaterialObject(input, "Render Material cache entry");
  rejectMaterialFields(input, ["schema", "cacheId", "validationId", "identityId", "lastUsedRevision", "cacheHash", "metadata"], "Render Material cache entry");
  const value = canonicalMaterialValue(input, "Render Material cache entry");
  const normalized = {
    schema: normalizeSchema(value.schema, RENDER_MATERIAL_CACHE_SCHEMA, "Render Material cache entry"),
    cacheId: requireMaterialText(value.cacheId, "Render Material cache entry.cacheId"),
    validationId: requireMaterialText(value.validationId, "Render Material cache entry.validationId"),
    identityId: requireMaterialText(value.identityId, "Render Material cache entry.identityId"),
    lastUsedRevision: requireMaterialInteger(value.lastUsedRevision ?? 0, "Render Material cache entry.lastUsedRevision"),
    metadata: normalizeMetadata(value.metadata, "Render Material cache entry")
  };
  return { ...normalized, cacheHash: exactHash(normalized, value.cacheHash, "Render Material cache entry.cacheHash") };
}

export function normalizeMaterialOperation(input, fields, label) {
  requireMaterialObject(input, label);
  rejectMaterialFields(input, ["operationId", ...fields], label);
  const value = canonicalMaterialValue(input, label);
  return { ...value, operationId: requireMaterialText(value.operationId, `${label}.operationId`) };
}

export function normalizeMaterialRegistrationCommand(input, field, normalizeRecord, label) {
  const value = normalizeMaterialOperation(input, [field], label);
  return { operationId: value.operationId, [field]: normalizeRecord(value[field]) };
}

export function normalizeMaterialValidationCommand(input) {
  const value = normalizeMaterialOperation(input, ["validation"], "Render Material validation command");
  requireMaterialObject(value.validation, "Render Material validation command.validation");
  rejectMaterialFields(value.validation, ["validationId", "targetType", "targetId", "compileId", "reflectionId", "metadata"], "Render Material validation command.validation");
  return {
    operationId: value.operationId,
    validation: canonicalMaterialValue({
      validationId: requireMaterialText(value.validation.validationId, "Render Material validation command.validation.validationId"),
      targetType: normalizeEnum(value.validation.targetType, TARGET_TYPES, "Render Material validation command.validation.targetType"),
      targetId: requireMaterialText(value.validation.targetId, "Render Material validation command.validation.targetId"),
      compileId: requireMaterialText(value.validation.compileId, "Render Material validation command.validation.compileId"),
      reflectionId: requireMaterialText(value.validation.reflectionId, "Render Material validation command.validation.reflectionId"),
      metadata: normalizeMetadata(value.validation.metadata, "Render Material validation command.validation")
    })
  };
}

export function normalizeMaterialState(snapshot, { domain, fields, label, validate = () => {} }) {
  requireMaterialObject(snapshot, label);
  rejectMaterialFields(snapshot, [...COMMON_STATE_KEYS, ...fields], label);
  const state = canonicalMaterialValue(snapshot, label);
  if (state.domain !== domain) throw new TypeError(`${label}.domain must equal ${domain}.`);
  requireMaterialInteger(state.sequence, `${label}.sequence`);
  validate(state);
  return state;
}

export function assertSortedMaterialRecords(state, { collection, order, revision, normalizeRecord, idField, label }) {
  requireMaterialObject(state[collection], `${label}.${collection}`);
  const normalizedRecords = Object.fromEntries(Object.entries(state[collection]).map(([recordId, record]) => [recordId, normalizeRecord(record)]));
  for (const [recordId, record] of Object.entries(normalizedRecords)) {
    if (record[idField] !== recordId) throw new TypeError(`${label}.${collection} key ${recordId} does not match ${idField}.`);
  }
  const normalizedOrder = normalizeMaterialTextList(state[order], `${label}.${order}`);
  const expectedOrder = Object.keys(normalizedRecords).sort();
  if (JSON.stringify(normalizedOrder) !== JSON.stringify(expectedOrder)) throw new TypeError(`${label}.${order} must equal sorted ${collection} keys.`);
  requireMaterialInteger(state[revision], `${label}.${revision}`);
  state[collection] = normalizedRecords;
  state[order] = normalizedOrder;
}

export function normalizeMaterialRegistrySnapshot(snapshot, { domain, collection, order, revision, normalizeRecord, idField, label }) {
  return normalizeMaterialState(snapshot, {
    domain,
    fields: [collection, order, revision],
    label,
    validate(state) {
      assertSortedMaterialRecords(state, { collection, order, revision, normalizeRecord, idField, label });
    }
  });
}

export function materialRegistryContract({ schema, record }) {
  return Object.freeze({
    schema,
    record,
    exactOnceMutations: true,
    duplicateIdentityConflict: true,
    queriesAreReadOnly: true,
    snapshotsAreStrictAndPortable: true,
    providerExecution: false
  });
}

export function materialCompositionHash(value) {
  return sha256Integrity(JSON.stringify(canonicalMaterialValue(value, "Render Material composition")));
}
