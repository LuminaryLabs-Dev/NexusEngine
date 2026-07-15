import assert from "node:assert/strict";
import * as RootAPI from "../../src/index.js";
const { createRealtimeGame } = RootAPI;
import {
  createCoreGraphicsKit,
  createGraphicsAdapterBoundary,
  createRenderDescriptor,
  createInstanceDescriptor,
  createMaterialDescriptor,
  createLightingDescriptor,
  createVFXDescriptor,
  createQualityProfile,
  createTerrainLodPolicyDescriptor,
  selectTerrainLodLevel,
  validateTerrainLodPolicy
} from "../../src/core-kits/core-graphics-kit/index.js";

assert.equal(createRenderDescriptor({ id: "cube", kind: "mesh" }).kind, "mesh", "render descriptor stores kind");
assert.equal(createInstanceDescriptor({ count: 3 }).count, 3, "instance descriptor stores count");
assert.equal(createMaterialDescriptor({ id: "mat", color: "#fff" }).color, "#fff", "material descriptor stores color");
assert.equal(createLightingDescriptor({ intensity: 2 }).intensity, 2, "lighting descriptor stores intensity");
assert.equal(createVFXDescriptor({ kind: "spark" }).kind, "spark", "vfx descriptor stores kind");
assert.equal(createQualityProfile({ renderScale: 0.5 }).renderScale, 0.5, "quality profile stores render scale");
assert.equal(typeof RootAPI.createTerrainLodPolicyDescriptor, "function", "terrain LOD policy is exported from the root API");
assert.equal(typeof RootAPI.selectTerrainLodLevel, "function", "terrain LOD selection is exported from the root API");

const foam = createRenderDescriptor({
  id: "foam",
  passId: "foam-overlay",
  layer: "shoreline-foam",
  order: 40,
  reads: ["water-mask"],
  writes: ["final-scene-color"],
  depth: { test: true, write: false },
  blend: { mode: "premultiplied-alpha", premultipliedAlpha: true }
});
assert.equal(foam.passId, "foam-overlay");
assert.equal(foam.depth.write, false);
assert.equal(foam.blend.premultipliedAlpha, true);

const water = createMaterialDescriptor({
  id: "anime-water",
  transparent: true,
  opacity: 0.2,
  transmission: 0.92,
  ior: 1.333,
  depthWrite: false,
  blendMode: "premultiplied-alpha",
  premultipliedAlpha: true
});
assert.equal(water.transmission, 0.92);
assert.equal(water.depthWrite, false);
assert.equal(water.premultipliedAlpha, true);

const clay = createMaterialDescriptor({
  id: "shiny-clay",
  kind: "physical",
  textures: {
    baseColor: { assetId: "clay-base-color.png", colorSpace: "srgb" },
    normal: "clay-normal.png",
    roughness: { assetId: "clay-mask.png", channel: "g" },
    ambientOcclusion: { assetId: "clay-mask.png", channel: "r", uvSet: 1 },
    clearcoat: { assetId: "clay-mask.png", channel: "b" }
  },
  textureResolution: 2048,
  clearcoat: 0.72,
  clearcoatRoughness: 0.24,
  normalScale: 0.25,
  environmentIntensity: 1.15,
  uv: { scale: [2, 2], texelDensity: 512 }
});
assert.equal(clay.textureResolution.width, 2048);
assert.equal(clay.textures.baseColor.colorSpace, "srgb");
assert.equal(clay.textures.roughness.channel, "g");
assert.deepEqual(clay.normalScale, [0.25, 0.25]);
assert.equal(clay.clearcoat, 0.72);
assert.equal(clay.environmentIntensity, 1.15);

const terrainLod = createTerrainLodPolicyDescriptor({
  id: "clay-terrain-lod",
  patchSize: 56,
  sourceResolution: 64,
  levels: [
    { id: "near", maxDistance: 28, resolution: 64 },
    { id: "medium", maxDistance: 68, resolution: 32 },
    { id: "far", maxDistance: 1_000_000, resolution: 16 }
  ],
  crackPolicy: { mode: "skirts", skirtDepth: 3.5 },
  morphPolicy: { mode: "geomorph", durationSeconds: 0.3, hysteresisDistance: 6 },
  materialPolicy: {
    mapping: "world-space",
    tileSize: 11,
    textureResolution: 2048,
    textures: {
      normal: { id: "clay-normal", kind: "renderer-generated" },
      roughness: { id: "clay-roughness", kind: "renderer-generated", channel: "g" }
    }
  }
});
assert.deepEqual(terrainLod.levels.map((level) => level.quadtreeDepth), [0, 1, 2]);
assert.equal(terrainLod.materialPolicy.textureResolution.width, 2048);
assert.equal(selectTerrainLodLevel(terrainLod, {
  focus: { x: 80, z: 0 },
  bounds: { minX: -28, minZ: -28, maxX: 28, maxZ: 28 }
}).levelId, "medium");
assert.equal(selectTerrainLodLevel(terrainLod, {
  focus: { x: 99, z: 0 },
  bounds: { minX: -28, minZ: -28, maxX: 28, maxZ: 28 },
  previousLevelId: "medium"
}).levelId, "medium");
assert.equal(validateTerrainLodPolicy(terrainLod).valid, true);
assert.equal(validateTerrainLodPolicy({ sourceResolution: 30 }).valid, false);

const adapter = createGraphicsAdapterBoundary({
  id: "webgl-adapter",
  capabilities: { reflectionTechniques: ["environment-probe", "screen-space"] }
});
const negotiation = adapter.negotiate({
  preferredTechnique: "ray-traced",
  fallbackOrder: ["environment-probe"],
  materialRevision: 2,
  reflectionRevision: 3
});
assert.equal(negotiation.status, "degraded");
assert.equal(negotiation.acceptedTechnique, "environment-probe");
assert.equal(adapter.createFrameReceipt({ frameId: "frame-1" }).adapterId, "webgl-adapter");

const engine = createRealtimeGame({ kits: [createCoreGraphicsKit()] });
engine.n.coreGraphics.setDescriptor("objects", "cube", createRenderDescriptor({ id: "cube" }));
engine.n.coreGraphics.setDescriptor("terrainLodPolicies", terrainLod.id, terrainLod);
assert.equal(engine.n.coreGraphics.getDescriptors("objects").cube.id, "cube", "core graphics descriptor update works");
assert.equal(engine.n.coreGraphics.getDescriptors("terrainLodPolicies")[terrainLod.id].sourceResolution, 64);

console.log("core-graphics-kit piece smoke ok");
