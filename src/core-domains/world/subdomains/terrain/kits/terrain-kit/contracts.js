import { hashSeed } from "../../../../../../foundation/seeded-random.js";
import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";
import { sha256Integrity } from "../../../../../../foundation/sha256.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function descriptor(kind, params = {}) {
  return Object.freeze({ kind, id: String(params.id ?? kind), params: Object.freeze(cloneSerializableState(params)) });
}

export const terrainLayers = Object.freeze({
  flat: (params = {}) => descriptor("flat", params),
  heightmap: (params = {}) => descriptor("heightmap", params),
  baseNoise: (params = {}) => descriptor("base-noise", params),
  carve: (params = {}) => descriptor("carve", params),
  erosion: (params = {}) => descriptor("erosion", params),
  materials: (params = {}) => descriptor("materials", params),
  waterInfluence: (params = {}) => descriptor("water-influence", params),
  details: (params = {}) => descriptor("details", params)
});

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function normalizeTerrainConfig(input = {}) {
  if (input.preset != null) throw new TypeError("Core Terrain does not accept authored presets.");
  for (const forbidden of ["materialColors", "ledges", "steps", "climbFaces", "fallZones", "routeMarkers", "routes", "branchMarkers", "cameraVolumes"]) {
    if (input[forbidden] != null) throw new TypeError(`Core Terrain does not own ${forbidden}.`);
  }
  const chunkSize = finite(input.chunks?.size ?? input.chunkSize, "chunkSize", 32);
  const resolution = Math.floor(finite(input.chunks?.resolution ?? input.resolution, "resolution", 16));
  if (chunkSize <= 0 || resolution < 2) throw new RangeError("Terrain chunkSize must be positive and resolution at least 2.");
  const layers = cloneSerializableState(input.layers ?? [terrainLayers.flat({ height: 0 })]);
  const ids = new Set();
  for (const [index, layer] of layers.entries()) {
    if (!layer || typeof layer !== "object") throw new TypeError(`layers[${index}] must be an object.`);
    const id = String(layer.id ?? layer.kind ?? "");
    if (!id || ids.has(id)) throw new TypeError(`Terrain layer id ${id || "<empty>"} is invalid or duplicated.`);
    ids.add(id);
    if (!["flat", "heightmap", "base-noise", "carve", "erosion", "materials", "water-influence", "details"].includes(layer.kind)) {
      throw new TypeError(`Unsupported terrain layer ${layer.kind}.`);
    }
  }
  const config = {
    schema: "nexusengine.terrain-config/1",
    id: String(input.id ?? "terrain"),
    seed: String(input.seed ?? "nexus-terrain"),
    width: finite(input.width, "width", 192),
    depth: finite(input.depth, "depth", 192),
    origin: { x: finite(input.origin?.x, "origin.x", 0), z: finite(input.origin?.z, "origin.z", 0) },
    waterLevel: input.waterLevel == null ? null : finite(input.waterLevel, "waterLevel"),
    defaultMaterial: String(input.defaultMaterial ?? "default"),
    chunkSize,
    resolution,
    activeRadius: Math.max(0, Math.floor(finite(input.streaming?.activeRadius ?? input.activeRadius, "activeRadius", 2))),
    preloadRadius: Math.max(0, Math.floor(finite(input.streaming?.preloadRadius ?? input.preloadRadius, "preloadRadius", 3))),
    unloadRadius: Math.max(0, Math.floor(finite(input.streaming?.unloadRadius ?? input.unloadRadius, "unloadRadius", 4))),
    layers
  };
  if (config.preloadRadius < config.activeRadius || config.unloadRadius < config.preloadRadius) {
    throw new RangeError("Terrain radii must satisfy activeRadius <= preloadRadius <= unloadRadius.");
  }
  config.signature = sha256Integrity(JSON.stringify(stable(config)));
  return config;
}

function noise2(x, z, seed) {
  const base = hashSeed(`${seed}:${Math.floor(x * 4096)}:${Math.floor(z * 4096)}`);
  return (base / 0xffffffff) * 2 - 1;
}

function heightmapSample(params, config, x, z) {
  const width = Math.floor(finite(params.width, "heightmap.width"));
  const height = Math.floor(finite(params.height, "heightmap.height"));
  const values = params.values ?? [];
  if (width < 1 || height < 1 || values.length !== width * height) throw new TypeError("Heightmap values must match width * height.");
  const xRatio = Math.max(0, Math.min(1, (x - config.origin.x + config.width * 0.5) / config.width));
  const zRatio = Math.max(0, Math.min(1, (z - config.origin.z + config.depth * 0.5) / config.depth));
  const sx = xRatio * (width - 1);
  const sz = zRatio * (height - 1);
  const x0 = Math.floor(sx);
  const z0 = Math.floor(sz);
  const x1 = Math.min(width - 1, x0 + 1);
  const z1 = Math.min(height - 1, z0 + 1);
  const at = (cx, cz) => finite(values[cz * width + cx], "heightmap value");
  const top = at(x0, z0) + (at(x1, z0) - at(x0, z0)) * (sx - x0);
  const bottom = at(x0, z1) + (at(x1, z1) - at(x0, z1)) * (sx - x0);
  return top + (bottom - top) * (sz - z0);
}

function segmentDistance(px, pz, left, right) {
  const ax = finite(left.x, "carve point.x");
  const az = finite(left.z ?? left.y, "carve point.z");
  const bx = finite(right.x, "carve point.x");
  const bz = finite(right.z ?? right.y, "carve point.z");
  const dx = bx - ax;
  const dz = bz - az;
  const length = dx * dx + dz * dz;
  const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / length));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

export function terrainSplineBounds(points = [], falloff = 0) {
  if (!points.length) return null;
  const xs = points.map((point) => finite(point.x, "carve point.x"));
  const zs = points.map((point) => finite(point.z ?? point.y, "carve point.z"));
  const padding = Math.max(0, finite(falloff, "carve falloff", 0));
  return { minX: Math.min(...xs) - padding, maxX: Math.max(...xs) + padding, minZ: Math.min(...zs) - padding, maxZ: Math.max(...zs) + padding };
}

function rawHeight(config, x, z, includeErosion = true) {
  let height = 0;
  for (const layer of config.layers) {
    const params = layer.params ?? {};
    if (layer.kind === "flat") height += finite(params.height, `${layer.id}.height`, 0);
    if (layer.kind === "heightmap") height += heightmapSample(params, config, x, z) * finite(params.scale, `${layer.id}.scale`, 1);
    if (layer.kind === "base-noise" || layer.kind === "details") {
      const frequency = finite(params.frequency, `${layer.id}.frequency`, layer.kind === "details" ? 0.2 : 0.035);
      const amplitude = finite(params.amplitude, `${layer.id}.amplitude`, layer.kind === "details" ? 0.1 : 1);
      height += noise2(x * frequency, z * frequency, `${config.seed}:${layer.id}`) * amplitude;
    }
    if (layer.kind === "carve") {
      const points = params.points ?? [];
      if (points.length) {
        const bounds = terrainSplineBounds(points, params.falloff);
        if (x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ) {
          let distance = Number.POSITIVE_INFINITY;
          if (points.length === 1) distance = segmentDistance(x, z, points[0], points[0]);
          else for (let index = 1; index < points.length; index += 1) distance = Math.min(distance, segmentDistance(x, z, points[index - 1], points[index]));
          const falloff = Math.max(0.000001, finite(params.falloff, `${layer.id}.falloff`, 8));
          height -= finite(params.depth, `${layer.id}.depth`, 1) * Math.max(0, 1 - distance / falloff);
        }
      }
    }
  }
  if (includeErosion) {
    for (const layer of config.layers.filter((entry) => entry.kind === "erosion")) {
      const strength = Math.max(0, Math.min(1, finite(layer.params?.strength, `${layer.id}.strength`, 0.15)));
      const radius = Math.max(0.001, finite(layer.params?.radius, `${layer.id}.radius`, 1));
      const average = (rawHeight(config, x - radius, z, false) + rawHeight(config, x + radius, z, false) + rawHeight(config, x, z - radius, false) + rawHeight(config, x, z + radius, false)) * 0.25;
      height += (average - height) * strength;
    }
  }
  return height;
}

function materialAt(config, height, wetness, slope) {
  let material = config.defaultMaterial;
  for (const layer of config.layers.filter((entry) => entry.kind === "materials")) {
    for (const rule of layer.params?.rules ?? []) {
      if (rule.belowHeight != null && height >= finite(rule.belowHeight, "material belowHeight")) continue;
      if (rule.aboveHeight != null && height <= finite(rule.aboveHeight, "material aboveHeight")) continue;
      if (rule.aboveSlope != null && slope <= finite(rule.aboveSlope, "material aboveSlope")) continue;
      if (rule.nearWater === true && wetness <= 0) continue;
      material = String(rule.material ?? material);
      break;
    }
  }
  return material;
}

export function sampleTerrain(configInput = {}, point = {}) {
  const config = configInput.schema === "nexusengine.terrain-config/1" ? configInput : normalizeTerrainConfig(configInput);
  const x = finite(point.x, "point.x", 0);
  const z = finite(point.z ?? point.y, "point.z", 0);
  const height = rawHeight(config, x, z);
  const epsilon = Math.max(0.01, config.chunkSize / config.resolution);
  const dx = rawHeight(config, x + epsilon, z) - rawHeight(config, x - epsilon, z);
  const dz = rawHeight(config, x, z + epsilon) - rawHeight(config, x, z - epsilon);
  const length = Math.hypot(dx, epsilon * 2, dz) || 1;
  const normal = { x: -dx / length, y: (epsilon * 2) / length, z: -dz / length };
  const slope = 1 - normal.y;
  const waterLayers = config.layers.filter((layer) => layer.kind === "water-influence");
  const waterLevel = waterLayers.length ? finite(waterLayers.at(-1).params?.waterLevel, "waterLevel", config.waterLevel ?? 0) : config.waterLevel;
  const wetness = waterLevel == null ? 0 : Math.max(0, Math.min(1, 1 - Math.max(0, height - waterLevel) / Math.max(0.001, finite(waterLayers.at(-1)?.params?.falloff, "water falloff", 1))));
  return { x, z, height, normal, slope, wetness, material: materialAt(config, height, wetness, slope) };
}

export function bakeTerrainCell(configInput = {}, cell = {}) {
  const config = configInput.schema === "nexusengine.terrain-config/1" ? configInput : normalizeTerrainConfig(configInput);
  const x = Math.floor(finite(cell.x, "cell.x"));
  const z = Math.floor(finite(cell.z ?? cell.y, "cell.z"));
  const resolution = Math.floor(finite(cell.resolution, "cell.resolution", config.resolution));
  if (resolution < 2) throw new RangeError("Terrain cell resolution must be at least 2.");
  const minX = config.origin.x + x * config.chunkSize;
  const minZ = config.origin.z + z * config.chunkSize;
  const samples = [];
  for (let row = 0; row <= resolution; row += 1) {
    for (let column = 0; column <= resolution; column += 1) {
      samples.push(sampleTerrain(config, { x: minX + column / resolution * config.chunkSize, z: minZ + row / resolution * config.chunkSize }));
    }
  }
  const payload = { schema: "nexusengine.terrain-cell/1", id: `${x},${z}`, x, z, resolution, bounds: { minX, maxX: minX + config.chunkSize, minZ, maxZ: minZ + config.chunkSize }, samples };
  payload.contentHash = sha256Integrity(JSON.stringify(stable(payload)));
  return payload;
}
