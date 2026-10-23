import {
  defineComponent,
  defineEvent,
  defineResource
} from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fract(value) {
  return value - Math.floor(value);
}

function hashString(value) {
  const input = String(value ?? "");
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function layer(kind, params = {}) {
  return Object.freeze({
    kind,
    id: params.id ?? kind,
    params: Object.freeze({ ...params })
  });
}

export const terrainLayers = Object.freeze({
  flat: (params = {}) => layer("flat", params),
  heightmap: (params = {}) => layer("heightmap", params),
  baseNoise: (params = {}) => layer("baseNoise", params),
  carve: (params = {}) => layer("carve", params),
  erosion: (params = {}) => layer("erosion", params),
  materials: (params = {}) => layer("materials", params),
  waterInfluence: (params = {}) => layer("waterInfluence", params),
  details: (params = {}) => layer("details", params)
});

function createDefinitions() {
  const components = {
    TerrainChunk: defineComponent("terrain-chunk"),
    TerrainRenderable: defineComponent("terrain-renderable")
  };

  const resources = {
    TerrainState: defineResource("terrain-state"),
    TerrainFocusState: defineResource("terrain-focus-state"),
    TerrainSnapshot: defineResource("terrain-snapshot"),
    TerrainQuery: defineResource("terrain-query")
  };

  const events = {
    TerrainChunksUpdated: defineEvent("TerrainChunksUpdated"),
    TerrainChunkVisible: defineEvent("TerrainChunkVisible"),
    TerrainChunkHidden: defineEvent("TerrainChunkHidden")
  };

  return { components, resources, events };
}

const presets = Object.freeze({
  "cozy-beach": {
    id: "cozy-beach",
    width: 192,
    depth: 192,
    waterLevel: 0,
    shorelineZ: -2.6,
    materialColors: {
      sand: "#d9b66f",
      "wet-sand": "#9d8051",
      rock: "#6e7268",
      grass: "#547c4d",
      seabed: "#3e8f86"
    },
    layers: [
      terrainLayers.baseNoise({ id: "beach-form", amplitude: 1.8, frequency: 0.035, seed: "cozy-beach" }),
      terrainLayers.carve({ id: "shoreline", shape: "spline", depth: 1.25, falloff: 8 }),
      terrainLayers.erosion({ id: "beach-soften", iterations: 6, strength: 0.18, preserveRidges: true }),
      terrainLayers.waterInfluence({ id: "shore-wetness", waterLevel: 0, falloff: 6 }),
      terrainLayers.materials({
        id: "beach-materials",
        rules: [
          { material: "wet-sand", nearWater: true },
          { material: "rock", aboveSlope: 0.72 },
          { material: "seabed", belowWater: true },
          { material: "sand", belowSlope: 0.72 }
        ]
      })
    ]
  }
});

function normalizeConfig(config = {}) {
  const preset = presets[config.preset] ?? {};
  const chunksConfig = {
    size: 32,
    viewRadius: 3,
    lod: [
      { distance: 48, resolution: 32 },
      { distance: 96, resolution: 16 },
      { distance: 160, resolution: 8 }
    ],
    ...(preset.chunks ?? {}),
    ...(config.chunks ?? {})
  };
  const chunks = {
    ...chunksConfig,
    activeRadius: number(config.activeRadius, number(chunksConfig.activeRadius, number(chunksConfig.viewRadius, 3))),
    preloadRadius: number(config.preloadRadius, number(chunksConfig.preloadRadius, number(chunksConfig.viewRadius, 3) + 1)),
    unloadRadius: number(config.unloadRadius, number(chunksConfig.unloadRadius, number(chunksConfig.viewRadius, 3) + 2))
  };
  const smoothing = {
    extraPasses: Math.max(0, Math.floor(number(config.smoothing?.extraPasses, number(chunksConfig.smoothing?.extraPasses, 0)))),
    slopeLimit: config.smoothing?.slopeLimit ?? chunksConfig.smoothing?.slopeLimit ?? null
  };
  const layers = config.layers ?? preset.layers ?? [terrainLayers.flat()];
  const materialColors = {
    sand: "#d9b66f",
    "wet-sand": "#9d8051",
    rock: "#6e7268",
    grass: "#547c4d",
    seabed: "#3e8f86",
    ...(preset.materialColors ?? {}),
    ...(config.materialColors ?? {})
  };
  const surfaceDescriptors = normalizeSurfaceDescriptors(config.surfaceDescriptors ?? config.surfaces, materialColors);
  return {
    id: config.id ?? preset.id ?? config.preset ?? "terrain",
    preset: config.preset ?? null,
    width: number(config.width, number(preset.width, 192)),
    depth: number(config.depth, number(preset.depth, 192)),
    waterLevel: number(config.waterLevel, number(preset.waterLevel, 0)),
    shorelineZ: number(config.shorelineZ, number(preset.shorelineZ, -2.6)),
    streaming: {
      activeRadius: chunks.activeRadius,
      infinite: config.infinite ?? true,
      preloadRadius: chunks.preloadRadius,
      unloadRadius: chunks.unloadRadius
    },
    smoothing,
    chunks,
    layers,
    materialColors,
    surfaceDescriptors,
    ledges: normalizeFeatureList(config.ledges),
    steps: normalizeFeatureList(config.steps),
    climbFaces: normalizeFeatureList(config.climbFaces),
    fallZones: normalizeFeatureList(config.fallZones),
    routeMarkers: normalizeFeatureList(config.routeMarkers ?? config.routes),
    branchMarkers: normalizeFeatureList(config.branchMarkers),
    cameraVolumes: normalizeFeatureList(config.cameraVolumes)
  };
}

function normalizeSurfaceDescriptors(descriptors = {}, materialColors = {}) {
  const defaults = {
    sand: { traction: 0.82, slipperiness: 0.18, stability: 0.78, impactHardness: 0.35, climbable: false, slide: false },
    "wet-sand": { traction: 0.68, slipperiness: 0.34, stability: 0.62, impactHardness: 0.32, climbable: false, slide: false },
    rock: { traction: 0.74, slipperiness: 0.2, stability: 0.88, impactHardness: 0.82, climbable: true, slide: false },
    grass: { traction: 0.86, slipperiness: 0.12, stability: 0.8, impactHardness: 0.28, climbable: false, slide: false },
    moss: { traction: 0.62, slipperiness: 0.38, stability: 0.58, impactHardness: 0.3, climbable: false, slide: true },
    seabed: { traction: 0.48, slipperiness: 0.52, stability: 0.48, impactHardness: 0.22, climbable: false, slide: true },
    corruption: { traction: 0.5, slipperiness: 0.42, stability: 0.36, impactHardness: 0.5, climbable: false, slide: true }
  };
  const output = {};
  for (const name of Object.keys(materialColors)) {
    output[name] = {
      traction: 0.8,
      slipperiness: 0.2,
      stability: 0.75,
      impactHardness: 0.4,
      climbable: false,
      slide: false,
      ...(defaults[name] ?? {}),
      ...(descriptors[name] ?? {})
    };
  }
  for (const [name, value] of Object.entries(descriptors)) {
    output[name] = {
      traction: 0.8,
      slipperiness: 0.2,
      stability: 0.75,
      impactHardness: 0.4,
      climbable: false,
      slide: false,
      ...(defaults[name] ?? {}),
      ...(value ?? {})
    };
  }
  return output;
}

function normalizeFeatureList(features) {
  return Array.isArray(features) ? features.map((feature, index) => ({
    id: feature.id ?? `feature-${index}`,
    type: feature.type ?? inferFeatureType(feature),
    ...feature
  })) : [];
}

function inferFeatureType(feature = {}) {
  if (feature.radius !== undefined) return "circle";
  if (feature.width !== undefined || feature.depth !== undefined) return "box";
  if (feature.points?.length) return "path";
  return "point";
}

function createMaterialPalette(config) {
  const names = Object.keys(config.materialColors);
  const ids = new Map(names.map((name, index) => [name, index]));
  return {
    names,
    colors: { ...config.materialColors },
    idOf(name) {
      if (!ids.has(name)) {
        ids.set(name, names.length);
        names.push(name);
      }
      return ids.get(name);
    }
  };
}

function noise2(x, z, seed) {
  const h = hashString(seed);
  const a = Math.sin(x * 127.1 + z * 311.7 + h * 0.0001) * 43758.5453;
  const b = Math.sin(x * 269.5 + z * 183.3 + h * 0.0002) * 24634.6345;
  return (fract(a) + fract(b)) * 0.5 * 2 - 1;
}

function sampleHeightmap(params, xRatio, zRatio) {
  const data = params.data;
  const width = Math.max(1, Math.floor(number(params.width, Math.sqrt(data?.length ?? 1))));
  const height = Math.max(1, Math.floor(number(params.height, width)));
  if (!data?.length) return number(params.fallback, 0);
  const x = clamp(xRatio, 0, 1) * (width - 1);
  const z = clamp(zRatio, 0, 1) * (height - 1);
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const x1 = Math.min(width - 1, x0 + 1);
  const z1 = Math.min(height - 1, z0 + 1);
  const tx = x - x0;
  const tz = z - z0;
  const a = number(data[z0 * width + x0]);
  const b = number(data[z0 * width + x1]);
  const c = number(data[z1 * width + x0]);
  const d = number(data[z1 * width + x1]);
  return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
}

function distanceToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const lengthSq = dx * dx + dz * dz || 1;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / lengthSq, 0, 1);
  const x = ax + dx * t;
  const z = az + dz * t;
  return Math.hypot(px - x, pz - z);
}

function carveDistance(params, config, x, z) {
  if (params.shape === "circle") {
    return Math.hypot(x - number(params.x), z - number(params.z ?? params.y));
  }
  if (params.shape === "box") {
    const dx = Math.max(Math.abs(x - number(params.x)) - number(params.width, 8) * 0.5, 0);
    const dz = Math.max(Math.abs(z - number(params.z ?? params.y)) - number(params.depth, 8) * 0.5, 0);
    return Math.hypot(dx, dz);
  }
  const points = params.points?.length
    ? params.points
    : [{ x: -config.width * 0.5, z: config.shorelineZ }, { x: config.width * 0.5, z: config.shorelineZ }];
  let distance = Infinity;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    distance = Math.min(distance, distanceToSegment(x, z, number(a.x), number(a.z ?? a.y), number(b.x), number(b.z ?? b.y)));
  }
  return distance;
}

function layerAffectsChunk(layerConfig, config, bounds) {
  if (layerConfig.kind !== "carve") return true;
  const params = layerConfig.params ?? {};
  const falloff = number(params.falloff, 6) + number(params.radius, 0) + Math.max(number(params.width, 0), number(params.depth, 0)) * 0.5;
  const center = params.shape === "circle" || params.shape === "box"
    ? { x: number(params.x), z: number(params.z ?? params.y) }
    : { x: 0, z: config.shorelineZ };
  const closestX = clamp(center.x, bounds.minX, bounds.maxX);
  const closestZ = clamp(center.z, bounds.minZ, bounds.maxZ);
  return Math.hypot(center.x - closestX, center.z - closestZ) <= Math.max(falloff, 1);
}

function applyHeightLayer(layerConfig, config, chunk, heights, wetness) {
  const params = layerConfig.params ?? {};
  const size = chunk.resolution + 1;
  if (layerConfig.kind === "erosion" || layerConfig.kind === "materials" || layerConfig.kind === "details") return;

  for (let zIndex = 0; zIndex < size; zIndex += 1) {
    for (let xIndex = 0; xIndex < size; xIndex += 1) {
      const i = zIndex * size + xIndex;
      const x = chunk.bounds.minX + (xIndex / chunk.resolution) * chunk.size;
      const z = chunk.bounds.minZ + (zIndex / chunk.resolution) * chunk.size;
      if (layerConfig.kind === "flat") {
        heights[i] += number(params.height, 0);
      } else if (layerConfig.kind === "heightmap") {
        const xRatio = (x + config.width * 0.5) / config.width;
        const zRatio = (z + config.depth * 0.5) / config.depth;
        heights[i] += sampleHeightmap(params, xRatio, zRatio) * number(params.scale, 1);
      } else if (layerConfig.kind === "baseNoise") {
        const frequency = number(params.frequency, 0.035);
        heights[i] += noise2(x * frequency, z * frequency, params.seed ?? config.id) * number(params.amplitude, 1);
      } else if (layerConfig.kind === "carve") {
        const falloff = Math.max(0.001, number(params.falloff, 6));
        const d = carveDistance(params, config, x, z);
        const strength = clamp(1 - d / falloff, 0, 1);
        heights[i] -= strength * strength * number(params.depth, 1);
      } else if (layerConfig.kind === "waterInfluence") {
        const waterLevel = number(params.waterLevel, config.waterLevel);
        const falloff = Math.max(0.001, number(params.falloff, 5));
        wetness[i] = Math.max(wetness[i], clamp(1 - Math.abs(heights[i] - waterLevel) / falloff, 0, 1));
      }
    }
  }
}

function applyErosion(layerConfig, chunk, heights) {
  const params = layerConfig.params ?? {};
  const iterations = Math.max(0, Math.floor(number(params.iterations, 4)));
  const strength = clamp(number(params.strength, 0.2), 0, 1);
  const size = chunk.resolution + 1;
  const preserve = params.preserveRidges !== false;
  let source = heights;
  let target = new Float32Array(heights.length);

  for (let pass = 0; pass < iterations; pass += 1) {
    target.set(source);
    for (let z = 1; z < size - 1; z += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const i = z * size + x;
        const avg = (
          source[i - 1] +
          source[i + 1] +
          source[i - size] +
          source[i + size]
        ) * 0.25;
        const delta = (avg - source[i]) * strength;
        target[i] = source[i] + (preserve && delta < 0 ? delta * 0.45 : delta);
      }
    }
    const swap = source;
    source = target;
    target = swap;
  }

  if (source !== heights) {
    heights.set(source);
  }
}

function applySlopeLimit(config, chunk, heights) {
  const slopeLimit = config.smoothing?.slopeLimit;
  const extraPasses = Math.max(0, Math.floor(number(config.smoothing?.extraPasses, 0)));
  if (slopeLimit === null && extraPasses <= 0) return;

  const size = chunk.resolution + 1;
  const step = chunk.size / chunk.resolution;
  const maxRise = slopeLimit === null ? Infinity : Math.max(0.05, number(slopeLimit, 0.75) * step);
  const source = new Float32Array(heights.length);

  for (let pass = 0; pass < Math.max(1, extraPasses + 1); pass += 1) {
    source.set(heights);
    for (let z = 1; z < size - 1; z += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const i = z * size + x;
        const left = source[i - 1];
        const right = source[i + 1];
        const down = source[i - size];
        const up = source[i + size];
        const average = (left + right + down + up) * 0.25;
        const limited = clamp(source[i], average - maxRise, average + maxRise);
        const smoothFactor = extraPasses > 0 ? 0.28 : 0.12;
        heights[i] = limited + (average - limited) * smoothFactor;
      }
    }
  }
}

function generateHeightFields(config, chunk, layers) {
  const sampleCount = (chunk.resolution + 1) * (chunk.resolution + 1);
  const heights = new Float32Array(sampleCount);
  const wetness = new Float32Array(sampleCount);
  for (const entry of layers) {
    if (entry.kind === "erosion") applyErosion(entry, chunk, heights);
    else applyHeightLayer(entry, config, chunk, heights, wetness);
  }
  applySlopeLimit(config, chunk, heights);
  return { heights, wetness };
}

function computeNormals(config, chunk, heights) {
  const size = chunk.resolution + 1;
  const normals = new Float32Array(heights.length * 3);
  const step = chunk.size / chunk.resolution;
  const neighborFields = new Map();
  const sample = (x, z) => {
    if (x >= 0 && x < size && z >= 0 && z < size) return heights[z * size + x];
    const dx = x < 0 ? -1 : x >= size ? 1 : 0;
    const dz = z < 0 ? -1 : z >= size ? 1 : 0;
    const key = `${dx},${dz}`;
    if (!neighborFields.has(key)) {
      const bounds = makeBounds(chunk.cx + dx, chunk.cz + dz, chunk.size);
      const neighbor = { ...chunk, id: `${chunk.cx + dx},${chunk.cz + dz}`, cx: chunk.cx + dx, cz: chunk.cz + dz, bounds };
      const layers = config.layers.filter((entry) => layerAffectsChunk(entry, config, bounds));
      neighborFields.set(key, generateHeightFields(config, neighbor, layers).heights);
    }
    const localX = x < 0 ? x + chunk.resolution : x >= size ? x - chunk.resolution : x;
    const localZ = z < 0 ? z + chunk.resolution : z >= size ? z - chunk.resolution : z;
    return neighborFields.get(key)[localZ * size + localX];
  };
  for (let z = 0; z < size; z += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = z * size + x;
      const left = sample(x - 1, z);
      const right = sample(x + 1, z);
      const down = sample(x, z - 1);
      const up = sample(x, z + 1);
      const nx = left - right;
      const ny = step * 2;
      const nz = down - up;
      const length = Math.hypot(nx, ny, nz) || 1;
      normals[i * 3] = nx / length;
      normals[i * 3 + 1] = ny / length;
      normals[i * 3 + 2] = nz / length;
    }
  }
  return normals;
}

function assignMaterials(layers, config, chunk, heights, normals, wetness, palette) {
  const size = chunk.resolution + 1;
  const field = new Uint8Array(heights.length);
  const materialsLayer = layers.find((entry) => entry.kind === "materials");
  const rules = materialsLayer?.params?.rules ?? [{ material: "sand" }];
  for (let zIndex = 0; zIndex < size; zIndex += 1) {
    for (let xIndex = 0; xIndex < size; xIndex += 1) {
      const i = zIndex * size + xIndex;
      const slope = 1 - normals[i * 3 + 1];
      const belowWater = heights[i] < config.waterLevel;
      let material = rules[rules.length - 1]?.material ?? "sand";
      for (const rule of rules) {
        const nearWater = wetness[i] > 0.25;
        if (rule.belowWater && belowWater) material = rule.material;
        else if (rule.nearWater && nearWater) material = rule.material;
        else if (rule.aboveSlope !== undefined && slope >= number(rule.aboveSlope)) material = rule.material;
        else if (rule.belowSlope !== undefined && slope <= number(rule.belowSlope)) material = rule.material;
      }
      field[i] = palette.idOf(material);
    }
  }
  return field;
}

function computeRealismFields(config, chunk, heights, normals, wetness, materials, palette) {
  const roughness = new Float32Array(heights.length);
  const ao = new Float32Array(heights.length);
  const detail = new Float32Array(heights.length);
  const scatter = new Float32Array(heights.length);
  const shoreline = new Float32Array(heights.length);
  const size = chunk.resolution + 1;
  const waterLevel = number(config.waterLevel, 0);

  for (let zIndex = 0; zIndex < size; zIndex += 1) {
    for (let xIndex = 0; xIndex < size; xIndex += 1) {
      const i = zIndex * size + xIndex;
      const x = chunk.bounds.minX + (xIndex / chunk.resolution) * chunk.size;
      const z = chunk.bounds.minZ + (zIndex / chunk.resolution) * chunk.size;
      const slope = clamp(1 - normals[i * 3 + 1], 0, 1);
      const waterDepth = clamp(waterLevel - heights[i], 0, 8) / 8;
      const shore = clamp(1 - Math.abs(heights[i] - waterLevel) / 1.35, 0, 1);
      const material = palette.names[materials[i]] ?? "sand";
      const fineNoise = noise2(x * 0.73, z * 0.73, `${config.id}:detail`) * 0.5 + 0.5;
      const coarseNoise = noise2(x * 0.17, z * 0.17, `${config.id}:scatter`) * 0.5 + 0.5;

      let baseRoughness = 0.88;
      if (material === "wet-sand") baseRoughness = 0.58;
      else if (material === "rock") baseRoughness = 0.78;
      else if (material === "seabed") baseRoughness = 0.84;
      roughness[i] = clamp(baseRoughness + fineNoise * 0.08 - wetness[i] * 0.16, 0.38, 0.98);

      const left = heights[zIndex * size + Math.max(0, xIndex - 1)];
      const right = heights[zIndex * size + Math.min(size - 1, xIndex + 1)];
      const down = heights[Math.max(0, zIndex - 1) * size + xIndex];
      const up = heights[Math.min(size - 1, zIndex + 1) * size + xIndex];
      const cavity = clamp((Math.abs(heights[i] - left) + Math.abs(heights[i] - right) + Math.abs(heights[i] - down) + Math.abs(heights[i] - up)) * 0.18, 0, 0.35);
      ao[i] = clamp(0.92 - cavity - slope * 0.18 + waterDepth * 0.08, 0.52, 1);

      detail[i] = clamp(fineNoise * (material === "sand" || material === "wet-sand" ? 0.72 : 0.45) + slope * 0.24, 0, 1);
      shoreline[i] = shore;

      const canScatter = heights[i] >= waterLevel - 0.15 && slope < 0.52;
      const dryScatter = clamp(1 - wetness[i], 0, 1) * 0.55;
      const shoreScatter = shore * 0.65;
      scatter[i] = canScatter ? clamp((dryScatter + shoreScatter) * coarseNoise, 0, 1) : 0;
    }
  }

  return {
    roughnessField: roughness,
    aoField: ao,
    detailMaskField: detail,
    scatterMaskField: scatter,
    shorelineMaskField: shoreline
  };
}

function selectLod(chunks, focus, bounds) {
  const cx = (bounds.minX + bounds.maxX) * 0.5;
  const cz = (bounds.minZ + bounds.maxZ) * 0.5;
  const distance = Math.hypot(cx - number(focus.x), cz - number(focus.z ?? focus.y));
  const levels = (chunks.lod ?? []).slice().sort((a, b) => number(a.distance) - number(b.distance));
  for (const level of levels) {
    if (distance <= number(level.distance, Infinity)) {
      return {
        distance,
        resolution: Math.max(2, Math.floor(number(level.resolution, 16)))
      };
    }
  }
  const last = levels[levels.length - 1] ?? { resolution: 8 };
  return { distance, resolution: Math.max(2, Math.floor(number(last.resolution, 8))) };
}

function makeBounds(cx, cz, size) {
  return {
    minX: cx * size,
    minZ: cz * size,
    maxX: (cx + 1) * size,
    maxZ: (cz + 1) * size
  };
}

function bakeChunk(config, palette, cx, cz, lod, previous) {
  const size = number(config.chunks.size, 32);
  const bounds = makeBounds(cx, cz, size);
  const chunk = {
    id: `${cx},${cz}`,
    cx,
    cz,
    size,
    bounds,
    lod,
    resolution: lod.resolution
  };
  const layers = config.layers.filter((entry) => layerAffectsChunk(entry, config, bounds));
  const signature = stableStringify({
    bounds,
    resolution: chunk.resolution,
    waterLevel: config.waterLevel,
    layers
  });
  if (previous?.signature === signature) {
    return { chunk: previous, rebuilt: false };
  }

  const { heights, wetness } = generateHeightFields(config, chunk, layers);
  const normals = computeNormals(config, chunk, heights);
  const materials = assignMaterials(layers, config, chunk, heights, normals, wetness, palette);
  const realismFields = computeRealismFields(config, chunk, heights, normals, wetness, materials, palette);
  return {
    rebuilt: true,
    chunk: {
      ...chunk,
      signature,
      version: number(previous?.version, 0) + 1,
      heightField: heights,
      normalField: normals,
      materialField: materials,
      wetnessField: wetness,
      ...realismFields,
      materialPalette: palette.names.slice(),
      materialColors: { ...palette.colors }
    }
  };
}

function samplePoint(config, x, z) {
  const pseudoChunk = {
    resolution: 1,
    size: 1,
    bounds: { minX: x, minZ: z, maxX: x + 1, maxZ: z + 1 }
  };
  const heights = new Float32Array(4);
  const wetness = new Float32Array(4);
  for (const entry of config.layers) {
    if (entry.kind !== "erosion" && entry.kind !== "materials" && entry.kind !== "details") {
      applyHeightLayer(entry, config, pseudoChunk, heights, wetness);
    }
  }
  return heights[0];
}

function bilinearChunkSample(chunk, x, z) {
  const resolution = chunk.resolution;
  const size = resolution + 1;
  const tx = clamp((x - chunk.bounds.minX) / chunk.size, 0, 1) * resolution;
  const tz = clamp((z - chunk.bounds.minZ) / chunk.size, 0, 1) * resolution;
  const x0 = Math.floor(tx);
  const z0 = Math.floor(tz);
  const x1 = Math.min(resolution, x0 + 1);
  const z1 = Math.min(resolution, z0 + 1);
  const fx = tx - x0;
  const fz = tz - z0;
  const a = chunk.heightField[z0 * size + x0];
  const b = chunk.heightField[z0 * size + x1];
  const c = chunk.heightField[z1 * size + x0];
  const d = chunk.heightField[z1 * size + x1];
  return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz;
}

function distanceToPath(points = [], x, z) {
  let distance = Infinity;
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    distance = Math.min(distance, distanceToSegment(x, z, number(a.x), number(a.z ?? a.y), number(b.x), number(b.z ?? b.y)));
  }
  return distance;
}

function featureContains(feature, x, z) {
  const type = feature.type ?? inferFeatureType(feature);
  if (type === "circle") {
    return Math.hypot(number(feature.x) - x, number(feature.z ?? feature.y) - z) <= number(feature.radius, 1);
  }
  if (type === "box") {
    return Math.abs(number(feature.x) - x) <= number(feature.width, 1) * 0.5
      && Math.abs(number(feature.z ?? feature.y) - z) <= number(feature.depth ?? feature.height, 1) * 0.5;
  }
  if (type === "path") {
    return distanceToPath(feature.points, x, z) <= number(feature.width, number(feature.radius, 2));
  }
  return Math.hypot(number(feature.x) - x, number(feature.z ?? feature.y) - z) <= number(feature.radius, 1);
}

function firstFeature(features, x, z) {
  return features.find((feature) => featureContains(feature, x, z)) ?? null;
}

function makeQueryApi(state) {
  function findChunk(x, z) {
    const size = number(state.config.chunks.size, 32);
    return state.chunks.get(`${Math.floor(x / size)},${Math.floor(z / size)}`) ?? null;
  }

  return {
    queryVersion: state.queryVersion,
    heightAt(x, z) {
      const chunk = findChunk(number(x), number(z));
      return chunk ? bilinearChunkSample(chunk, number(x), number(z)) : samplePoint(state.config, number(x), number(z));
    },
    normalAt(x, z) {
      const step = 0.5;
      const hL = this.heightAt(number(x) - step, number(z));
      const hR = this.heightAt(number(x) + step, number(z));
      const hD = this.heightAt(number(x), number(z) - step);
      const hU = this.heightAt(number(x), number(z) + step);
      const nx = hL - hR;
      const ny = step * 4;
      const nz = hD - hU;
      const length = Math.hypot(nx, ny, nz) || 1;
      return { x: nx / length, y: ny / length, z: nz / length };
    },
    slopeAt(x, z) {
      return 1 - this.normalAt(x, z).y;
    },
    materialAt(x, z) {
      const chunk = findChunk(number(x), number(z));
      if (!chunk) return "sand";
      const resolution = chunk.resolution;
      const size = resolution + 1;
      const tx = Math.round(clamp((number(x) - chunk.bounds.minX) / chunk.size, 0, 1) * resolution);
      const tz = Math.round(clamp((number(z) - chunk.bounds.minZ) / chunk.size, 0, 1) * resolution);
      return chunk.materialPalette[chunk.materialField[tz * size + tx]] ?? "sand";
    },
    waterDepthAt(x, z) {
      return Math.max(0, number(state.config.waterLevel) - this.heightAt(x, z));
    },
    surfaceAt(x, z) {
      const material = this.materialAt(x, z);
      const descriptor = state.config.surfaceDescriptors?.[material] ?? {};
      const fallZone = this.fallZoneAt(x, z);
      const ledge = this.ledgeAt(x, z);
      return {
        material,
        traction: number(descriptor.traction, 0.8),
        slipperiness: number(descriptor.slipperiness, 0.2),
        stability: number(descriptor.stability, 0.75),
        impactHardness: number(descriptor.impactHardness, 0.4),
        climbable: Boolean(descriptor.climbable || ledge?.climbable),
        slide: Boolean(descriptor.slide),
        fallZone: Boolean(fallZone),
        ledge,
        waterDepth: this.waterDepthAt(x, z),
        slope: this.slopeAt(x, z)
      };
    },
    tractionAt(x, z) {
      return this.surfaceAt(x, z).traction;
    },
    footingAt(x, z) {
      const surface = this.surfaceAt(x, z);
      return {
        material: surface.material,
        traction: surface.traction,
        slipperiness: surface.slipperiness,
        stability: surface.stability,
        slope: surface.slope,
        slide: surface.slide || surface.slope > 0.72,
        safe: !surface.fallZone && surface.stability > 0.25
      };
    },
    ledgeAt(x, z) {
      return firstFeature(state.config.ledges, number(x), number(z))
        ?? firstFeature(state.config.steps, number(x), number(z))
        ?? firstFeature(state.config.climbFaces, number(x), number(z));
    },
    fallZoneAt(x, z) {
      return firstFeature(state.config.fallZones, number(x), number(z));
    },
    routeAt(x, z) {
      return firstFeature(state.config.routeMarkers, number(x), number(z))
        ?? firstFeature(state.config.branchMarkers, number(x), number(z));
    },
    cameraVolumeAt(x, z) {
      return firstFeature(state.config.cameraVolumes, number(x), number(z));
    }
  };
}

function createTerrainSystem(definitions, config) {
  const { TerrainState, TerrainFocusState, TerrainSnapshot, TerrainQuery } = definitions.resources;
  const { TerrainChunksUpdated, TerrainChunkVisible, TerrainChunkHidden } = definitions.events;

  return function terrainChunkSystem(world) {
    const state = world.getResource(TerrainState);
    if (!state) return;
    const currentConfig = state.config ?? config;
    const focus = world.getResource(TerrainFocusState) ?? { x: 0, z: 0 };
    const size = number(currentConfig.chunks.size, 32);
    const radius = Math.max(0, Math.floor(number(currentConfig.streaming?.activeRadius ?? currentConfig.chunks.viewRadius, 3)));
    const centerX = Math.floor(number(focus.x) / size);
    const centerZ = Math.floor(number(focus.z ?? focus.y) / size);
    const visible = new Set();
    const rebuilt = [];
    const reused = [];
    const hidden = [];

    for (let dz = -radius; dz <= radius; dz += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        const cx = centerX + dx;
        const cz = centerZ + dz;
        const bounds = makeBounds(cx, cz, size);
        const lod = selectLod(currentConfig.chunks, focus, bounds);
        const id = `${cx},${cz}`;
        visible.add(id);
        const previous = state.chunks.get(id);
        const result = bakeChunk(currentConfig, state.palette, cx, cz, lod, previous);
        state.chunks.set(id, result.chunk);
        if (!state.visibleChunkIds.has(id)) {
          world.emit(TerrainChunkVisible, { chunkId: id, bounds });
        }
        if (result.rebuilt) rebuilt.push(id);
        else reused.push(id);
      }
    }

    for (const id of state.visibleChunkIds) {
      if (!visible.has(id)) {
        hidden.push(id);
        world.emit(TerrainChunkHidden, { chunkId: id });
      }
    }

    const visibleChunks = Array.from(visible).map((id) => state.chunks.get(id)).filter(Boolean);
    const changed = rebuilt.length > 0 || hidden.length > 0 || visible.size !== state.visibleChunkIds.size;
    state.visibleChunkIds = visible;
    state.cacheStats = {
      rebuilt: rebuilt.length,
      reused: reused.length,
      hidden: hidden.length,
      totalCached: state.chunks.size
    };
    const previousSnapshot = world.getResource(TerrainSnapshot);
    if (previousSnapshot) {
      previousSnapshot.cacheStats = state.cacheStats;
      previousSnapshot.focus = focus;
    }

    if (changed) {
      state.queryVersion += 1;
      world.emit(TerrainChunksUpdated, { rebuilt, reused, hidden, visible: Array.from(visible) });
      world.setResource(TerrainState, state);
      world.setResource(TerrainQuery, makeQueryApi(state));
      world.setResource(TerrainSnapshot, {
        id: currentConfig.id,
        queryVersion: state.queryVersion,
        visibleChunks,
        materialColors: { ...currentConfig.materialColors },
        cacheStats: state.cacheStats,
        focus
      });
    }
  };
}

export function createTerrainKit(options = {}) {
  const definitions = createDefinitions();
  const config = normalizeConfig(options);
  const palette = createMaterialPalette(config);

  const kit = defineRuntimeKit({
    id: options.id ?? "terrain",
    components: definitions.components,
    resources: definitions.resources,
    events: definitions.events,
    systems: [
      { phase: "simulate", name: "TerrainChunkSystem", system: createTerrainSystem(definitions, config) }
    ],
    initWorld({ world }) {
      world.setResource(definitions.resources.TerrainState, {
        config,
        chunks: new Map(),
        visibleChunkIds: new Set(),
        queryVersion: 0,
        cacheStats: { rebuilt: 0, reused: 0, hidden: 0, totalCached: 0 },
        palette
      });
      world.setResource(definitions.resources.TerrainFocusState, options.focus ?? { x: 0, z: 0 });
      world.setResource(definitions.resources.TerrainQuery, makeQueryApi({
        config,
        chunks: new Map(),
        queryVersion: 0
      }));
      world.setResource(definitions.resources.TerrainSnapshot, {
        id: config.id,
        queryVersion: 0,
        visibleChunks: [],
        materialColors: { ...config.materialColors },
        cacheStats: { rebuilt: 0, reused: 0, hidden: 0, totalCached: 0 },
        focus: options.focus ?? { x: 0, z: 0 }
      });
    },
    metadata: {
      terrain: true,
      preset: config.preset,
      chunkSize: config.chunks.size,
      layers: config.layers.map((entry) => entry.kind)
    }
  });

  return {
    ...kit,
    definitions,
    config
  };
}

export function createTerrainQuery(world, terrainKit) {
  const resource = terrainKit.resources?.TerrainQuery ?? terrainKit.definitions?.resources?.TerrainQuery;
  const current = () => world.getResource(resource);
  return {
    get queryVersion() {
      return current()?.queryVersion ?? 0;
    },
    heightAt(x, z) {
      return current()?.heightAt(x, z) ?? 0;
    },
    materialAt(x, z) {
      return current()?.materialAt(x, z) ?? "sand";
    },
    normalAt(x, z) {
      return current()?.normalAt(x, z) ?? { x: 0, y: 1, z: 0 };
    },
    slopeAt(x, z) {
      return current()?.slopeAt(x, z) ?? 0;
    },
    waterDepthAt(x, z) {
      return current()?.waterDepthAt(x, z) ?? 0;
    },
    surfaceAt(x, z) {
      return current()?.surfaceAt(x, z) ?? {
        material: "sand",
        traction: 0.8,
        slipperiness: 0.2,
        stability: 0.75,
        impactHardness: 0.4,
        climbable: false,
        slide: false,
        fallZone: false,
        ledge: null,
        waterDepth: 0,
        slope: 0
      };
    },
    tractionAt(x, z) {
      return current()?.tractionAt(x, z) ?? this.surfaceAt(x, z).traction;
    },
    footingAt(x, z) {
      return current()?.footingAt(x, z) ?? {
        material: this.materialAt(x, z),
        traction: this.tractionAt(x, z),
        slipperiness: 0.2,
        stability: 0.75,
        slope: this.slopeAt(x, z),
        slide: false,
        safe: true
      };
    },
    ledgeAt(x, z) {
      return current()?.ledgeAt(x, z) ?? null;
    },
    fallZoneAt(x, z) {
      return current()?.fallZoneAt(x, z) ?? null;
    },
    routeAt(x, z) {
      return current()?.routeAt(x, z) ?? null;
    },
    cameraVolumeAt(x, z) {
      return current()?.cameraVolumeAt(x, z) ?? null;
    }
  };
}
