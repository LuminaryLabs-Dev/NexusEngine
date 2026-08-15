export const NEXUS_VEGETATION_SPECIES_SCHEMA = "nexus-vegetation-species/1";
export const NEXUS_VEGETATION_INSTANCE_SCHEMA = "nexus-vegetation-instance/1";
export const VEGETATION_LIFECYCLE_STATES = Object.freeze([
  "seed",
  "growing",
  "mature",
  "dormant",
  "damaged",
  "dead",
  "removed"
]);

const clone = (value) => value === undefined ? undefined : structuredClone(value);

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

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function vector(value, length, fallback, label) {
  const source = Array.isArray(value) ? value : fallback;
  if (!Array.isArray(source) || source.length !== length) throw new TypeError(`${label} must contain ${length} values.`);
  return source.map((entry, index) => finite(entry, fallback[index], `${label}[${index}]`));
}

function range(value, fallback, label) {
  const source = Array.isArray(value) ? value : fallback;
  if (!Array.isArray(source) || source.length !== 2) throw new TypeError(`${label} must contain [minimum, maximum].`);
  const minimum = finite(source[0], fallback[0], `${label}[0]`);
  const maximum = finite(source[1], fallback[1], `${label}[1]`);
  if (maximum < minimum) throw new RangeError(`${label} must be ascending.`);
  return [minimum, maximum];
}

function reference(value) {
  if (value == null) return null;
  if (typeof value === "string") return { provider: null, descriptorId: value, contentHash: null, metadata: {} };
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Vegetation references must be strings, objects, or null.");
  return {
    provider: value.provider == null ? null : String(value.provider),
    descriptorId: text(value.descriptorId ?? value.id, null, "Vegetation reference descriptorId"),
    contentHash: value.contentHash == null ? null : String(value.contentHash),
    metadata: clone(value.metadata ?? {})
  };
}

function normalizeBounds(value = {}) {
  const min = vector(value.min, 3, [0, 0, 0], "Vegetation bounds.min");
  const max = vector(value.max, 3, [1, 1, 1], "Vegetation bounds.max");
  for (let index = 0; index < 3; index += 1) {
    if (max[index] < min[index]) throw new RangeError(`Vegetation bounds.max[${index}] must be >= min.`);
  }
  return {
    min,
    max,
    size: max.map((entry, index) => entry - min[index]),
    center: max.map((entry, index) => (entry + min[index]) * 0.5)
  };
}

function normalizePart(value = {}, index = 0) {
  return {
    id: text(value.id, `part-${index}`, "Vegetation part id"),
    kind: text(value.kind, "plant-part", "Vegetation part kind"),
    parentId: value.parentId == null ? null : String(value.parentId),
    regions: [...new Set((value.regions ?? []).map(String))].sort(),
    geometry: reference(value.geometry),
    material: reference(value.material),
    collision: reference(value.collision),
    metadata: clone(value.metadata ?? {})
  };
}

function normalizeEcology(value = {}) {
  return {
    moisture: clamp(finite(value.moisture, 0.5, "ecology.moisture"), 0, 1),
    elevation: clamp(finite(value.elevation, 0.5, "ecology.elevation"), 0, 1),
    slope: clamp(finite(value.slope, 0.5, "ecology.slope"), 0, 1),
    temperature: clamp(finite(value.temperature, 0.5, "ecology.temperature"), 0, 1),
    moistureTolerance: clamp(finite(value.moistureTolerance, 0.5, "ecology.moistureTolerance"), 0.001, 1),
    elevationTolerance: clamp(finite(value.elevationTolerance, 0.5, "ecology.elevationTolerance"), 0.001, 1),
    slopeTolerance: clamp(finite(value.slopeTolerance, 0.5, "ecology.slopeTolerance"), 0.001, 1),
    temperatureTolerance: clamp(finite(value.temperatureTolerance, 0.5, "ecology.temperatureTolerance"), 0.001, 1),
    biomes: [...new Set((value.biomes ?? []).map(String))].sort(),
    clusterScale: Math.max(0.000001, finite(value.clusterScale, 0.02, "ecology.clusterScale")),
    clusterStrength: clamp(finite(value.clusterStrength, 0.75, "ecology.clusterStrength"), 0, 1),
    distributionWeight: Math.max(0, finite(value.distributionWeight, 1, "ecology.distributionWeight")),
    metadata: clone(value.metadata ?? {})
  };
}

function normalizeVariation(value = {}) {
  return {
    yawDegrees: range(value.yawDegrees, [0, 360], "variation.yawDegrees"),
    leanXDegrees: range(value.leanXDegrees, [-5, 5], "variation.leanXDegrees"),
    leanZDegrees: range(value.leanZDegrees, [-5, 5], "variation.leanZDegrees"),
    uniformScale: range(value.uniformScale, [0.84, 1.18], "variation.uniformScale"),
    heightScale: range(value.heightScale, [0.92, 1.12], "variation.heightScale"),
    crownScale: range(value.crownScale, [0.9, 1.1], "variation.crownScale"),
    groundSink: range(value.groundSink, [0.1, 0.5], "variation.groundSink"),
    hueShift: range(value.hueShift, [-0.05, 0.05], "variation.hueShift"),
    roughnessAdd: range(value.roughnessAdd, [-0.06, 0.06], "variation.roughnessAdd"),
    valueShift: range(value.valueShift, [-0.08, 0.08], "variation.valueShift"),
    metadata: clone(value.metadata ?? {})
  };
}

export function createVegetationSpeciesDescriptor(input = {}) {
  const bounds = normalizeBounds(input.bounds);
  const parts = (input.parts ?? []).map(normalizePart);
  const partIds = new Set(parts.map((part) => part.id));
  for (const part of parts) {
    if (part.parentId !== null && !partIds.has(part.parentId)) throw new TypeError(`Vegetation part ${part.id} references missing parent ${part.parentId}.`);
  }
  const descriptor = {
    schema: NEXUS_VEGETATION_SPECIES_SCHEMA,
    id: text(input.id, null, "Vegetation species id"),
    family: text(input.family, "plant", "Vegetation family"),
    kind: text(input.kind, "plant", "Vegetation kind"),
    rooted: input.rooted !== false,
    bounds,
    pivot: vector(input.pivot, 3, bounds.center, "Vegetation pivot"),
    groundAnchor: vector(input.groundAnchor, 3, [bounds.center[0], bounds.min[1], bounds.center[2]], "Vegetation groundAnchor"),
    growthStages: [...new Set((input.growthStages ?? ["seed", "growing", "mature"]).map(String))],
    defaultLifecycleState: text(input.defaultLifecycleState, "mature", "Vegetation default lifecycle state"),
    parts,
    ecology: normalizeEcology(input.ecology),
    variation: normalizeVariation(input.variation),
    environmentResponse: clone(input.environmentResponse ?? {}),
    references: {
      shape: reference(input.references?.shape ?? input.shape),
      material: reference(input.references?.material ?? input.material),
      collision: reference(input.references?.collision ?? input.collision),
      fidelity: reference(input.references?.fidelity ?? input.fidelity),
      capture: reference(input.references?.capture ?? input.capture)
    },
    metadata: clone(input.metadata ?? {})
  };
  if (!VEGETATION_LIFECYCLE_STATES.includes(descriptor.defaultLifecycleState)) {
    throw new TypeError(`Unsupported vegetation lifecycle state: ${descriptor.defaultLifecycleState}`);
  }
  descriptor.contentHash = hashText(stableStringify(descriptor));
  structuredClone(descriptor);
  return descriptor;
}

function seedNumber(value) {
  const hash = hashText(typeof value === "string" ? value : stableStringify(value));
  return Number.parseInt(hash, 16) >>> 0;
}

function randomUnit(seed, salt) {
  let value = seedNumber(`${seed}:${salt}`) || 1;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 4294967295;
}

function randomRange(seed, salt, limits) {
  return limits[0] + randomUnit(seed, salt) * (limits[1] - limits[0]);
}

export function createVegetationVariation(speciesInput, seed = "vegetation") {
  const species = createVegetationSpeciesDescriptor(speciesInput);
  const policy = species.variation;
  const hueShift = randomRange(seed, "hue", policy.hueShift);
  const valueShift = randomRange(seed, "value", policy.valueShift);
  return {
    seed: String(seed),
    yawDegrees: randomRange(seed, "yaw", policy.yawDegrees),
    leanXDegrees: randomRange(seed, "lean-x", policy.leanXDegrees),
    leanZDegrees: randomRange(seed, "lean-z", policy.leanZDegrees),
    uniformScale: randomRange(seed, "uniform-scale", policy.uniformScale),
    heightScale: randomRange(seed, "height-scale", policy.heightScale),
    crownScale: randomRange(seed, "crown-scale", policy.crownScale),
    groundSink: randomRange(seed, "ground-sink", policy.groundSink),
    hueShift,
    roughnessAdd: randomRange(seed, "roughness", policy.roughnessAdd),
    valueShift,
    tint: [
      clamp(1 + valueShift + hueShift * 0.7, 0.7, 1.3),
      clamp(1 + valueShift * 0.75, 0.7, 1.3),
      clamp(1 + valueShift - hueShift * 0.7, 0.7, 1.3)
    ]
  };
}

export function createVegetationInstanceDescriptor(input = {}, speciesInput = null) {
  const species = speciesInput ? createVegetationSpeciesDescriptor(speciesInput) : null;
  const speciesId = text(input.speciesId ?? species?.id, null, "Vegetation instance speciesId");
  const seed = String(input.seed ?? `${speciesId}:${input.id ?? "instance"}`);
  const lifecycleState = text(input.lifecycle?.state, species?.defaultLifecycleState ?? "mature", "Vegetation lifecycle state");
  if (!VEGETATION_LIFECYCLE_STATES.includes(lifecycleState)) throw new TypeError(`Unsupported vegetation lifecycle state: ${lifecycleState}`);
  const descriptor = {
    schema: NEXUS_VEGETATION_INSTANCE_SCHEMA,
    id: text(input.id, null, "Vegetation instance id"),
    speciesId,
    seed,
    position: vector(input.position, 3, [0, 0, 0], "Vegetation instance position"),
    variation: clone(input.variation ?? (species ? createVegetationVariation(species, seed) : {})),
    lifecycle: {
      state: lifecycleState,
      stage: text(input.lifecycle?.stage, lifecycleState, "Vegetation lifecycle stage"),
      health: clamp(finite(input.lifecycle?.health, 1, "Vegetation lifecycle health"), 0, 1),
      revision: Math.max(0, Math.floor(finite(input.lifecycle?.revision, 0, "Vegetation lifecycle revision")))
    },
    environment: clone(input.environment ?? {}),
    metadata: clone(input.metadata ?? {})
  };
  descriptor.contentHash = hashText(stableStringify(descriptor));
  structuredClone(descriptor);
  return descriptor;
}

function normalizedEnvironment(value = {}) {
  return {
    moisture: clamp(finite(value.moisture, 0.5), 0, 1),
    elevation: clamp(finite(value.elevation, 0.5), 0, 1),
    slope: clamp(finite(value.slope, 0.5), 0, 1),
    temperature: clamp(finite(value.temperature, 0.5), 0, 1),
    biome: value.biome == null ? null : String(value.biome),
    cluster: clamp(finite(value.cluster, 0.5), 0, 1)
  };
}

function suitability(value, target, tolerance) {
  return clamp(1 - Math.abs(value - target) / Math.max(0.001, tolerance), 0, 1);
}

export function scoreVegetationSuitability(speciesInput, environmentInput = {}) {
  const species = createVegetationSpeciesDescriptor(speciesInput);
  const environment = normalizedEnvironment(environmentInput);
  const ecology = species.ecology;
  const biome = ecology.biomes.length === 0 || ecology.biomes.includes(environment.biome) ? 1 : 0;
  const base = (
    suitability(environment.moisture, ecology.moisture, ecology.moistureTolerance) * 0.29 +
    suitability(environment.elevation, ecology.elevation, ecology.elevationTolerance) * 0.24 +
    suitability(environment.slope, ecology.slope, ecology.slopeTolerance) * 0.17 +
    suitability(environment.temperature, ecology.temperature, ecology.temperatureTolerance) * 0.2 +
    biome * 0.1
  );
  const cluster = 1 - ecology.clusterStrength + ecology.clusterStrength * environment.cluster;
  return Math.max(0, base * cluster * ecology.distributionWeight);
}

export function selectVegetationSpecies(speciesValues = [], environment = {}, seed = "vegetation-selection") {
  const species = speciesValues.map(createVegetationSpeciesDescriptor).sort((left, right) => left.id.localeCompare(right.id));
  if (!species.length) return null;
  const scores = species.map((entry) => scoreVegetationSuitability(entry, environment));
  const total = scores.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return species[Math.floor(randomUnit(seed, "fallback") * species.length) % species.length];
  let cursor = randomUnit(seed, "weighted") * total;
  for (let index = 0; index < species.length; index += 1) {
    cursor -= scores[index];
    if (cursor <= 0) return species[index];
  }
  return species.at(-1);
}

export function updateVegetationLifecycle(instanceInput, state, patch = {}) {
  const instance = createVegetationInstanceDescriptor(instanceInput);
  const nextState = text(state, null, "Vegetation lifecycle state");
  if (!VEGETATION_LIFECYCLE_STATES.includes(nextState)) throw new TypeError(`Unsupported vegetation lifecycle state: ${nextState}`);
  return createVegetationInstanceDescriptor({
    ...instance,
    lifecycle: {
      ...instance.lifecycle,
      ...clone(patch),
      state: nextState,
      revision: instance.lifecycle.revision + 1
    }
  });
}

export function validateVegetationSpecies(value) {
  const errors = [];
  if (value?.schema !== NEXUS_VEGETATION_SPECIES_SCHEMA) errors.push(`schema must be ${NEXUS_VEGETATION_SPECIES_SCHEMA}`);
  try { createVegetationSpeciesDescriptor(value); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { valid: errors.length === 0, errors };
}

export function validateVegetationInstance(value) {
  const errors = [];
  if (value?.schema !== NEXUS_VEGETATION_INSTANCE_SCHEMA) errors.push(`schema must be ${NEXUS_VEGETATION_INSTANCE_SCHEMA}`);
  try { createVegetationInstanceDescriptor(value); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { valid: errors.length === 0, errors };
}

export function equalVegetationDescriptors(left, right) {
  return stableStringify(left) === stableStringify(right);
}
