const clone = (value) => value === undefined ? undefined : structuredClone(value);

export const NEXUS_OBJECT_FIDELITY_PROFILE_SCHEMA = "nexus-object-fidelity-profile/1";
export const NEXUS_OBJECT_FORM_SCHEMA = "nexus-object-form/1";
export const NEXUS_OBJECT_FIDELITY_BUILD_SCHEMA = "nexus-object-fidelity-build/1";
export const NEXUS_OBJECT_FIDELITY_PACKAGE_SCHEMA = "nexus-object-fidelity-package/1";

export const OBJECT_FORM_STATES = Object.freeze(["declared", "preparing", "awaiting-views", "ready", "failed", "retired"]);
export const FIDELITY_BUILD_STATES = Object.freeze(["queued", "preparing", "awaiting-views", "validating", "ready", "failed", "cancelled", "stale"]);

const DEFAULT_IDENTITY = Object.freeze({
  preserveSilhouette: true,
  preserveGrounding: true,
  preserveMajorStructure: true,
  preserveMaterialResponse: true
});

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function finite(value, fallback = 0, label = "value") {
  const next = Number(value ?? fallback);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function uniqueTextList(value = [], label = "value") {
  const source = value == null ? [] : Array.isArray(value) ? value : [value];
  return Array.from(new Set(source.map((entry) => text(entry, null, label))));
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

export function hashFidelityValue(value) {
  return hashText(stableStringify(value));
}

function normalizeReference(value, label) {
  if (value == null) return null;
  if (typeof value === "string") return { assetId: text(value, null, `${label}.assetId`) };
  if (typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be a reference object or asset id.`);
  const reference = {};
  if (value.assetId != null || value.id != null) reference.assetId = text(value.assetId ?? value.id, null, `${label}.assetId`);
  if (value.provider != null) reference.provider = text(value.provider, null, `${label}.provider`);
  if (value.descriptorId != null) reference.descriptorId = text(value.descriptorId, null, `${label}.descriptorId`);
  if (value.contentHash != null) reference.contentHash = text(value.contentHash, null, `${label}.contentHash`);
  if (!reference.assetId && !reference.descriptorId) throw new TypeError(`${label} requires assetId or descriptorId.`);
  if (value.metadata != null) reference.metadata = clone(value.metadata);
  return reference;
}

function normalizeLayer(input = {}, index = 0) {
  const reference = normalizeReference(input.reference ?? input.asset ?? input.assetId ?? input.source, `form layer ${index}`);
  return {
    id: text(input.id, `layer-${index}`, "form layer id"),
    role: text(input.role, "appearance", "form layer role"),
    kind: text(input.kind, "asset", "form layer kind"),
    reference,
    orientation: input.orientation == null ? null : text(input.orientation, null, "form layer orientation"),
    metadata: clone(input.metadata ?? {})
  };
}

function normalizeRequirement(input = {}, index = 0) {
  const minimumProjectedSize = Math.max(0, finite(input.minimumProjectedSize, 0, "fidelity minimumProjectedSize"));
  const maximumProjectedSize = input.maximumProjectedSize == null
    ? null
    : Math.max(minimumProjectedSize, finite(input.maximumProjectedSize, minimumProjectedSize, "fidelity maximumProjectedSize"));
  return {
    id: text(input.id, `form-${index}`, "fidelity form requirement id"),
    fidelity: text(input.fidelity, input.id ?? `form-${index}`, "fidelity form requirement"),
    builderId: text(input.builderId, input.kind ?? "source-form", "fidelity builderId"),
    required: input.required !== false,
    order: Math.max(0, Math.floor(finite(input.order, index, "fidelity form order"))),
    requiredTraits: uniqueTextList(input.requiredTraits, "fidelity required trait"),
    minimumProjectedSize,
    maximumProjectedSize,
    qualities: uniqueTextList(input.qualities ?? ["low", "medium", "high"], "fidelity quality"),
    capture: input.capture == null ? null : clone(input.capture),
    layers: input.layers == null ? null : clone(input.layers),
    metadata: clone(input.metadata ?? {})
  };
}

export function createObjectFidelityProfile(input = {}) {
  const forms = (input.forms ?? []).map(normalizeRequirement);
  if (!forms.length) throw new TypeError("Object fidelity profile requires at least one form requirement.");
  const ids = new Set();
  for (const form of forms) {
    if (ids.has(form.id)) throw new TypeError(`Duplicate fidelity form requirement id: ${form.id}.`);
    ids.add(form.id);
  }
  const profile = {
    schema: NEXUS_OBJECT_FIDELITY_PROFILE_SCHEMA,
    id: text(input.id, null, "object fidelity profile id"),
    version: Math.max(1, Math.floor(finite(input.version, 1, "object fidelity profile version"))),
    identity: { ...DEFAULT_IDENTITY, ...clone(input.identity ?? {}) },
    forms,
    change: {
      mode: text(input.change?.mode, "blend", "fidelity change mode"),
      duration: Math.max(0, finite(input.change?.duration, 0.18, "fidelity change duration")),
      hysteresis: Math.max(0, Math.min(0.95, finite(input.change?.hysteresis, 0.12, "fidelity hysteresis")))
    },
    metadata: clone(input.metadata ?? {})
  };
  profile.contentHash = hashFidelityValue(profile);
  structuredClone(profile);
  return Object.freeze(profile);
}

export function createObjectForm(input = {}) {
  const state = text(input.state, "declared", "object form state");
  if (!OBJECT_FORM_STATES.includes(state)) throw new TypeError(`Unsupported object form state: ${state}`);
  const form = {
    schema: NEXUS_OBJECT_FORM_SCHEMA,
    id: text(input.id, null, "object form id"),
    objectId: text(input.objectId, null, "object form objectId"),
    requirementId: text(input.requirementId, input.fidelity ?? "form", "object form requirementId"),
    fidelity: text(input.fidelity, input.requirementId ?? "form", "object form fidelity"),
    state,
    traits: uniqueTextList(input.traits, "object form trait"),
    layers: (input.layers ?? []).map(normalizeLayer),
    captureDependencies: uniqueTextList(input.captureDependencies, "object form capture dependency"),
    metadata: clone(input.metadata ?? {})
  };
  form.contentHash = hashFidelityValue(form);
  structuredClone(form);
  return Object.freeze(form);
}

export function createObjectFidelityBuild(input = {}) {
  const state = text(input.state, "queued", "fidelity build state");
  if (!FIDELITY_BUILD_STATES.includes(state)) throw new TypeError(`Unsupported fidelity build state: ${state}`);
  const build = {
    schema: NEXUS_OBJECT_FIDELITY_BUILD_SCHEMA,
    id: text(input.id, null, "fidelity build id"),
    objectId: text(input.objectId, null, "fidelity build objectId"),
    objectContentHash: text(input.objectContentHash, null, "fidelity build objectContentHash"),
    profileId: text(input.profileId, null, "fidelity build profileId"),
    quality: text(input.quality, "high", "fidelity build quality"),
    state,
    readiness: { visible: input.readiness?.visible === true, complete: input.readiness?.complete === true },
    availableForms: uniqueTextList(input.availableForms, "fidelity available form"),
    awaiting: (input.awaiting ?? []).map((entry) => ({
      requirementId: text(entry.requirementId, null, "fidelity awaiting requirementId"),
      builderId: text(entry.builderId, null, "fidelity awaiting builderId"),
      captureJobId: text(entry.captureJobId, null, "fidelity awaiting captureJobId"),
      form: clone(entry.form),
      required: entry.required !== false
    })),
    errors: (input.errors ?? []).map((entry) => typeof entry === "string" ? { message: entry } : clone(entry)),
    packageId: input.packageId == null ? null : text(input.packageId, null, "fidelity build packageId"),
    revision: Math.max(0, Math.floor(finite(input.revision, 0, "fidelity build revision"))),
    operationId: text(input.operationId, `${input.objectId}:${input.profileId}:${input.objectContentHash}:${input.quality ?? "high"}`, "fidelity build operationId")
  };
  structuredClone(build);
  return Object.freeze(build);
}

export function createObjectFidelityPackage(input = {}) {
  const packageValue = {
    schema: NEXUS_OBJECT_FIDELITY_PACKAGE_SCHEMA,
    id: text(input.id, null, "fidelity package id"),
    objectId: text(input.objectId, null, "fidelity package objectId"),
    objectContentHash: text(input.objectContentHash, null, "fidelity package objectContentHash"),
    profileId: text(input.profileId, null, "fidelity package profileId"),
    buildId: text(input.buildId, null, "fidelity package buildId"),
    revision: Math.max(1, Math.floor(finite(input.revision, 1, "fidelity package revision"))),
    forms: Object.fromEntries(Object.entries(input.forms ?? {}).map(([requirementId, formId]) => [text(requirementId, null, "fidelity package requirement id"), text(formId, null, "fidelity package form id")])),
    readiness: { visible: input.readiness?.visible === true, complete: input.readiness?.complete === true },
    metadata: clone(input.metadata ?? {})
  };
  packageValue.contentHash = hashFidelityValue(packageValue);
  structuredClone(packageValue);
  return Object.freeze(packageValue);
}

export function validateObjectFidelityProfile(value) {
  const errors = [];
  try { createObjectFidelityProfile(value); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { valid: errors.length === 0, errors };
}

export function validateObjectForm(value) {
  const errors = [];
  try { createObjectForm(value); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { valid: errors.length === 0, errors };
}

export function validateObjectFidelityPackage(value) {
  const errors = [];
  try { createObjectFidelityPackage(value); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { valid: errors.length === 0, errors };
}
