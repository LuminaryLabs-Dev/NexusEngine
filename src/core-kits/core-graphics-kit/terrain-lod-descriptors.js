export const TERRAIN_LOD_POLICY_SCHEMA = "nexus-terrain-lod-policy/1";
export const TERRAIN_LOD_SELECTION_SCHEMA = "nexus-terrain-lod-selection/1";

const DEFAULT_LEVELS = Object.freeze([
  Object.freeze({ id: "near", maxDistance: 32, resolution: 64 }),
  Object.freeze({ id: "medium", maxDistance: 72, resolution: 32 }),
  Object.freeze({ id: "far", maxDistance: 1_000_000_000, resolution: 16 })
]);

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const positive = (value, fallback) => Math.max(Number.EPSILON, finite(value, fallback));
const nonNegative = (value, fallback = 0) => Math.max(0, finite(value, fallback));
const positiveInteger = (value, fallback) => Math.max(1, Math.floor(finite(value, fallback)));

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function isPowerOfTwo(value) {
  return Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0;
}

function normalizeResolution(value, fallback, label) {
  const resolution = positiveInteger(value, fallback);
  if (!isPowerOfTwo(resolution)) {
    throw new RangeError(`${label} must be a power-of-two grid resolution.`);
  }
  return resolution;
}

function normalizeTextureDescriptor(value, fallbackId, resolution) {
  const source = typeof value === "string" ? { id: value } : value ?? {};
  return Object.freeze({
    id: text(source.id ?? source.assetId, fallbackId, "Terrain surface texture id"),
    kind: String(source.kind ?? "renderer-generated"),
    width: positiveInteger(source.width ?? source.resolution?.width, resolution.width),
    height: positiveInteger(source.height ?? source.resolution?.height, resolution.height),
    channel: String(source.channel ?? "rgba"),
    colorSpace: String(source.colorSpace ?? "linear"),
    metadata: Object.freeze(clone(source.metadata ?? {}))
  });
}

function normalizeLevels(levels, sourceResolution) {
  const source = Array.isArray(levels) && levels.length ? levels : DEFAULT_LEVELS;
  const normalized = source.map((level, index) => {
    const resolution = normalizeResolution(level?.resolution, Math.max(1, sourceResolution >> index), `Terrain LOD level ${index} resolution`);
    if (sourceResolution % resolution !== 0 || !isPowerOfTwo(sourceResolution / resolution)) {
      throw new RangeError(`Terrain LOD level ${index} resolution must divide sourceResolution by a power of two.`);
    }
    return {
      id: text(level?.id, `lod-${index}`, `Terrain LOD level ${index} id`),
      maxDistance: positive(level?.maxDistance, index === source.length - 1 ? 1_000_000_000 : (index + 1) * 64),
      resolution,
      quadtreeDepth: Math.log2(sourceResolution / resolution),
      metadata: Object.freeze(clone(level?.metadata ?? {}))
    };
  });

  normalized.sort((left, right) => left.maxDistance - right.maxDistance || right.resolution - left.resolution || left.id.localeCompare(right.id));
  const ids = new Set();
  let previousDistance = -Infinity;
  let previousResolution = Infinity;
  for (const level of normalized) {
    if (ids.has(level.id)) throw new TypeError(`Duplicate terrain LOD level id: ${level.id}.`);
    ids.add(level.id);
    if (level.maxDistance <= previousDistance) throw new RangeError("Terrain LOD maxDistance values must increase.");
    if (level.resolution > previousResolution) throw new RangeError("Terrain LOD resolution must stay equal or decrease with distance.");
    previousDistance = level.maxDistance;
    previousResolution = level.resolution;
  }
  if (normalized[0].resolution !== sourceResolution) {
    throw new RangeError("The nearest terrain LOD level must use sourceResolution.");
  }
  return Object.freeze(normalized.map((level) => Object.freeze(level)));
}

function normalizeTextureResolution(source = {}) {
  if (typeof source === "number") {
    const size = positiveInteger(source, 2048);
    return Object.freeze({ width: size, height: size });
  }
  return Object.freeze({
    width: positiveInteger(source.width, 2048),
    height: positiveInteger(source.height, source.width ?? 2048)
  });
}

export function createTerrainLodPolicyDescriptor(input = {}) {
  const sourceResolution = normalizeResolution(input.sourceResolution, 64, "Terrain sourceResolution");
  const textureResolution = normalizeTextureResolution(input.materialPolicy?.textureResolution ?? input.textureResolution ?? 2048);
  const levels = normalizeLevels(input.levels, sourceResolution);
  const crackSource = input.crackPolicy ?? {};
  const morphSource = input.morphPolicy ?? {};
  const materialSource = input.materialPolicy ?? {};

  const descriptor = {
    schema: TERRAIN_LOD_POLICY_SCHEMA,
    id: text(input.id, "terrain-lod-policy", "Terrain LOD policy id"),
    revision: Math.max(0, Math.floor(finite(input.revision, 0))),
    selection: String(input.selection ?? "quadtree-distance"),
    patchSize: positive(input.patchSize, 32),
    sourceResolution,
    levels,
    crackPolicy: Object.freeze({
      mode: String(crackSource.mode ?? "skirts"),
      skirtDepth: positive(crackSource.skirtDepth ?? crackSource.depth, 3),
      stitchBorders: crackSource.stitchBorders !== false,
      metadata: Object.freeze(clone(crackSource.metadata ?? {}))
    }),
    morphPolicy: Object.freeze({
      mode: String(morphSource.mode ?? "geomorph"),
      durationSeconds: nonNegative(morphSource.durationSeconds, 0.28),
      hysteresisDistance: nonNegative(morphSource.hysteresisDistance, 6),
      easing: String(morphSource.easing ?? "smoothstep"),
      metadata: Object.freeze(clone(morphSource.metadata ?? {}))
    }),
    materialPolicy: Object.freeze({
      mapping: String(materialSource.mapping ?? "world-space"),
      tileSize: positive(materialSource.tileSize, 12),
      textureResolution,
      textures: Object.freeze({
        normal: normalizeTextureDescriptor(materialSource.textures?.normal, "terrain-clay-normal", textureResolution),
        roughness: normalizeTextureDescriptor(materialSource.textures?.roughness, "terrain-clay-roughness", textureResolution)
      }),
      blendInputs: Object.freeze([...(materialSource.blendInputs ?? ["world-position", "route-distance", "surface-noise", "slope"])].map(String)),
      metadata: Object.freeze(clone(materialSource.metadata ?? {}))
    }),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  };

  if (descriptor.selection !== "quadtree-distance") {
    throw new TypeError(`Unsupported terrain LOD selection mode: ${descriptor.selection}.`);
  }
  if (descriptor.crackPolicy.mode !== "skirts" && descriptor.crackPolicy.mode !== "stitch") {
    throw new TypeError(`Unsupported terrain crack policy: ${descriptor.crackPolicy.mode}.`);
  }
  if (!new Set(["none", "geomorph"]).has(descriptor.morphPolicy.mode)) {
    throw new TypeError(`Unsupported terrain morph policy: ${descriptor.morphPolicy.mode}.`);
  }
  structuredClone(descriptor);
  return Object.freeze(descriptor);
}

function point2(value = {}) {
  if (Array.isArray(value)) return { x: finite(value[0], 0), z: finite(value[2] ?? value[1], 0) };
  return { x: finite(value.x, 0), z: finite(value.z ?? value.y, 0) };
}

function bounds2(value = {}) {
  const minimum = value.minimum ?? value.min ?? value;
  const maximum = value.maximum ?? value.max ?? value;
  return {
    minX: finite(value.minX ?? minimum?.[0] ?? minimum?.x, 0),
    minZ: finite(value.minZ ?? minimum?.[2] ?? minimum?.[1] ?? minimum?.z ?? minimum?.y, 0),
    maxX: finite(value.maxX ?? maximum?.[0] ?? maximum?.x, 0),
    maxZ: finite(value.maxZ ?? maximum?.[2] ?? maximum?.[1] ?? maximum?.z ?? maximum?.y, 0)
  };
}

function distanceToBounds(focus, bounds) {
  const dx = focus.x < bounds.minX ? bounds.minX - focus.x : focus.x > bounds.maxX ? focus.x - bounds.maxX : 0;
  const dz = focus.z < bounds.minZ ? bounds.minZ - focus.z : focus.z > bounds.maxZ ? focus.z - bounds.maxZ : 0;
  return Math.hypot(dx, dz);
}

function rawLevelIndex(policy, distance) {
  const index = policy.levels.findIndex((level) => distance <= level.maxDistance);
  return index < 0 ? policy.levels.length - 1 : index;
}

export function selectTerrainLodLevel(policyInput, query = {}) {
  const policy = policyInput?.schema === TERRAIN_LOD_POLICY_SCHEMA
    ? policyInput
    : createTerrainLodPolicyDescriptor(policyInput);
  const focus = point2(query.focus ?? query.position);
  const bounds = bounds2(query.bounds ?? query.patchBounds);
  const distance = distanceToBounds(focus, bounds);
  const previousIndex = policy.levels.findIndex((level) => level.id === query.previousLevelId);
  let index = rawLevelIndex(policy, distance);
  const hysteresis = policy.morphPolicy.hysteresisDistance;

  if (previousIndex >= 0 && index !== previousIndex) {
    if (index > previousIndex && distance <= policy.levels[previousIndex].maxDistance + hysteresis) {
      index = previousIndex;
    } else if (index < previousIndex && distance >= policy.levels[index].maxDistance - hysteresis) {
      index = previousIndex;
    }
  }

  const level = policy.levels[index];
  return Object.freeze({
    schema: TERRAIN_LOD_SELECTION_SCHEMA,
    policyId: policy.id,
    policyRevision: policy.revision,
    levelId: level.id,
    levelIndex: index,
    resolution: level.resolution,
    quadtreeDepth: level.quadtreeDepth,
    distance,
    morphDurationSeconds: policy.morphPolicy.durationSeconds,
    crackMode: policy.crackPolicy.mode,
    skirtDepth: policy.crackPolicy.skirtDepth
  });
}

export function validateTerrainLodPolicy(value) {
  const errors = [];
  try {
    createTerrainLodPolicyDescriptor(value);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}
