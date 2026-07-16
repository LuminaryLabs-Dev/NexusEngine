export const PROCEDURAL_MATERIAL_SCHEMA = "nexus-procedural-material-library/1";
export const PROCEDURAL_MATERIAL_ASSIGNMENT_SCHEMA = "nexus-procedural-material-assignment/1";

export const PROCEDURAL_MAPPING_TYPES = Object.freeze(["triplanar"]);
export const PROCEDURAL_MAPPING_SPACES = Object.freeze(["world", "object", "bind-pose"]);
export const PROCEDURAL_TEXTURE_CHANNELS = Object.freeze(["baseColor", "normal", "packedSurface", "height"]);

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value, fallback = 0) => Math.max(0, Math.min(1, finite(value, fallback)));
const positive = (value, fallback = 1) => Math.max(Number.EPSILON, finite(value, fallback));
const integer = (value, fallback = 0) => Math.max(0, Math.floor(finite(value, fallback)));

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function color(value, fallback = "#ffffff") {
  if (Array.isArray(value)) {
    return Object.freeze([
      clamp01(value[0], 1),
      clamp01(value[1], 1),
      clamp01(value[2], 1)
    ]);
  }
  return String(value ?? fallback);
}

function normalizeAtlas(input = {}) {
  const resolution = input.resolution ?? input.textureResolution ?? 2048;
  const width = typeof resolution === "number" ? integer(resolution, 2048) : integer(resolution.width, 2048);
  const height = typeof resolution === "number" ? width : integer(resolution.height, width);
  const columns = Math.max(1, integer(input.columns, 4));
  const rows = Math.max(1, integer(input.rows, 2));
  return Object.freeze({
    id: text(input.id, "procedural-material-atlas", "Procedural material atlas id"),
    width,
    height,
    columns,
    rows,
    paddingPixels: integer(input.paddingPixels, 4),
    mipmaps: input.mipmaps !== false,
    compression: String(input.compression ?? "ktx2-basis-preferred"),
    assets: Object.freeze(Object.fromEntries(
      Object.entries(input.assets ?? {}).map(([channel, asset]) => [String(channel), String(asset)])
    )),
    runtimeFallback: String(input.runtimeFallback ?? "canvas-generated"),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

function normalizeGenerator(input = {}, index = 0) {
  return Object.freeze({
    kind: String(input.kind ?? "periodic-clay"),
    seed: integer(input.seed, index + 1),
    scale: positive(input.scale, 1),
    grain: clamp01(input.grain, 0.35),
    cavity: clamp01(input.cavity, 0.3),
    streak: clamp01(input.streak, 0),
    speckle: clamp01(input.speckle, 0.15),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

function normalizeSurface(input = {}) {
  return Object.freeze({
    metalness: clamp01(input.metalness, 0),
    roughness: clamp01(input.roughness, 0.72),
    clearcoat: clamp01(input.clearcoat, 0.35),
    clearcoatRoughness: clamp01(input.clearcoatRoughness, 0.45),
    normalStrength: Math.max(0, finite(input.normalStrength, 0.25)),
    environmentIntensity: Math.max(0, finite(input.environmentIntensity, 1)),
    aoStrength: clamp01(input.aoStrength, 0.65),
    heightStrength: Math.max(0, finite(input.heightStrength, 0)),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

function normalizeFamily(input = {}, index = 0) {
  return Object.freeze({
    id: text(input.id, `material-family-${index}`, `Procedural material family ${index} id`),
    label: String(input.label ?? input.id ?? `Material ${index}`),
    baseColor: color(input.baseColor, "#ffffff"),
    generator: normalizeGenerator(input.generator, index),
    surface: normalizeSurface(input.surface),
    textureChannels: Object.freeze(
      [...(input.textureChannels ?? ["baseColor", "normal", "packedSurface"])].map(String)
    ),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

function normalizeQualityTier(input = {}, index = 0) {
  const channels = [...(input.channels ?? input.textureChannels ?? ["baseColor"])].map(String);
  for (const channel of channels) {
    if (!PROCEDURAL_TEXTURE_CHANNELS.includes(channel)) {
      throw new TypeError(`Unsupported procedural texture channel: ${channel}.`);
    }
  }
  return Object.freeze({
    id: text(input.id, `quality-${index}`, `Procedural material quality ${index} id`),
    channels: Object.freeze(channels),
    maxAnisotropy: Math.max(1, integer(input.maxAnisotropy, 4)),
    textureScale: positive(input.textureScale, 1),
    maximumSamples: Math.max(1, integer(input.maximumSamples, channels.length * 3)),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

function normalizeMapping(input = {}) {
  const type = String(input.type ?? "triplanar");
  const space = String(input.space ?? "world");
  if (!PROCEDURAL_MAPPING_TYPES.includes(type)) throw new TypeError(`Unsupported procedural mapping type: ${type}.`);
  if (!PROCEDURAL_MAPPING_SPACES.includes(space)) throw new TypeError(`Unsupported procedural mapping space: ${space}.`);
  return Object.freeze({
    type,
    space,
    scale: positive(input.scale, 0.12),
    blendSharpness: positive(input.blendSharpness, 4),
    rotation: finite(input.rotation, 0),
    seed: integer(input.seed, 1),
    instanceTransform: input.instanceTransform !== false,
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

function normalizeMask(input = {}) {
  const kind = String(input.kind ?? "none");
  if (!["none", "attribute", "vertex-color-key", "constant"].includes(kind)) {
    throw new TypeError(`Unsupported procedural material mask kind: ${kind}.`);
  }
  return Object.freeze({
    kind,
    attribute: input.attribute == null ? null : String(input.attribute),
    channel: String(input.channel ?? "r"),
    keyColor: color(input.keyColor, "#ffffff"),
    threshold: clamp01(input.threshold, 0.22),
    softness: clamp01(input.softness, 0.12),
    value: clamp01(input.value, 0),
    invert: input.invert === true,
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

function normalizeAssignment(input = {}, index = 0) {
  const families = [...(input.families ?? [input.familyId].filter(Boolean))].map(String);
  if (!families.length || families.length > 2) {
    throw new RangeError("Procedural material assignments require one or two family ids.");
  }
  return Object.freeze({
    schema: PROCEDURAL_MATERIAL_ASSIGNMENT_SCHEMA,
    id: text(input.id, `material-assignment-${index}`, `Procedural material assignment ${index} id`),
    target: text(input.target, input.id ?? `target-${index}`, `Procedural material assignment ${index} target`),
    families: Object.freeze(families),
    mapping: normalizeMapping(input.mapping),
    mask: normalizeMask(input.mask),
    surface: normalizeSurface(input.surface),
    quality: String(input.quality ?? "high"),
    qualityByLod: Object.freeze(clone(input.qualityByLod ?? {})),
    vertexColors: input.vertexColors === true,
    tint: color(input.tint, "#ffffff"),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function createProceduralMaterialDescriptor(input = {}) {
  const atlas = normalizeAtlas(input.atlas);
  const families = (input.families ?? []).map(normalizeFamily);
  const qualityTiers = (input.qualityTiers ?? [
    { id: "high", channels: ["baseColor", "normal", "packedSurface"], maxAnisotropy: 8, maximumSamples: 9 },
    { id: "medium", channels: ["baseColor", "packedSurface"], maxAnisotropy: 4, maximumSamples: 6 },
    { id: "low", channels: ["baseColor"], maxAnisotropy: 2, maximumSamples: 3 }
  ]).map(normalizeQualityTier);
  const assignments = (input.assignments ?? []).map(normalizeAssignment);

  const familyIds = new Set();
  for (const family of families) {
    if (familyIds.has(family.id)) throw new TypeError(`Duplicate procedural material family id: ${family.id}.`);
    familyIds.add(family.id);
  }
  if (families.length > atlas.columns * atlas.rows) {
    throw new RangeError("Procedural material atlas does not have enough cells for all families.");
  }

  const qualityIds = new Set();
  for (const quality of qualityTiers) {
    if (qualityIds.has(quality.id)) throw new TypeError(`Duplicate procedural material quality id: ${quality.id}.`);
    qualityIds.add(quality.id);
  }

  const assignmentIds = new Set();
  for (const assignment of assignments) {
    if (assignmentIds.has(assignment.id)) throw new TypeError(`Duplicate procedural material assignment id: ${assignment.id}.`);
    assignmentIds.add(assignment.id);
    for (const familyId of assignment.families) {
      if (!familyIds.has(familyId)) throw new TypeError(`Assignment ${assignment.id} references missing family ${familyId}.`);
    }
    if (!qualityIds.has(assignment.quality)) {
      throw new TypeError(`Assignment ${assignment.id} references missing quality ${assignment.quality}.`);
    }
    for (const qualityId of Object.values(assignment.qualityByLod)) {
      if (!qualityIds.has(String(qualityId))) {
        throw new TypeError(`Assignment ${assignment.id} references missing LOD quality ${qualityId}.`);
      }
    }
  }

  const descriptor = {
    schema: PROCEDURAL_MATERIAL_SCHEMA,
    id: text(input.id, "procedural-material-library", "Procedural material descriptor id"),
    revision: integer(input.revision, 0),
    atlas,
    families: Object.freeze(families),
    qualityTiers: Object.freeze(qualityTiers),
    assignments: Object.freeze(assignments),
    defaultQuality: String(input.defaultQuality ?? qualityTiers[0]?.id ?? "high"),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  };

  if (!qualityIds.has(descriptor.defaultQuality)) {
    throw new TypeError(`Procedural material defaultQuality ${descriptor.defaultQuality} is not defined.`);
  }
  structuredClone(descriptor);
  return Object.freeze(descriptor);
}

export function resolveProceduralMaterialAssignment(descriptorInput, target, options = {}) {
  const descriptor = descriptorInput?.schema === PROCEDURAL_MATERIAL_SCHEMA
    ? descriptorInput
    : createProceduralMaterialDescriptor(descriptorInput);
  const assignment = descriptor.assignments.find((entry) => entry.target === target || entry.id === target);
  if (!assignment) return null;
  const requestedLod = options.lodId == null ? null : String(options.lodId);
  const qualityId = String(
    options.qualityId ??
    (requestedLod ? assignment.qualityByLod[requestedLod] : null) ??
    assignment.quality ??
    descriptor.defaultQuality
  );
  const quality = descriptor.qualityTiers.find((entry) => entry.id === qualityId);
  if (!quality) throw new TypeError(`Procedural material quality ${qualityId} is not defined.`);
  return Object.freeze({ descriptorId: descriptor.id, assignment, quality });
}

export function validateProceduralMaterialDescriptor(value) {
  const errors = [];
  try {
    createProceduralMaterialDescriptor(value);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}
