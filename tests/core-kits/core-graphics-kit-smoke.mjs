import assert from "node:assert/strict";
import { createRealtimeGame } from "../../src/index.js";
import {
  createCoreGraphicsKit,
  createGraphicsAdapterBoundary,
  createRenderDescriptor,
  createInstanceDescriptor,
  createMaterialDescriptor,
  createLightingDescriptor,
  createVFXDescriptor,
  createQualityProfile
} from "../../src/core-kits/core-graphics-kit/index.js";

assert.equal(createRenderDescriptor({ id: "cube", kind: "mesh" }).kind, "mesh", "render descriptor stores kind");
assert.equal(createInstanceDescriptor({ count: 3 }).count, 3, "instance descriptor stores count");
assert.equal(createMaterialDescriptor({ id: "mat", color: "#fff" }).color, "#fff", "material descriptor stores color");
assert.equal(createLightingDescriptor({ intensity: 2 }).intensity, 2, "lighting descriptor stores intensity");
assert.equal(createVFXDescriptor({ kind: "spark" }).kind, "spark", "vfx descriptor stores kind");
assert.equal(createQualityProfile({ renderScale: 0.5 }).renderScale, 0.5, "quality profile stores render scale");

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
assert.equal(engine.n.coreGraphics.getDescriptors("objects").cube.id, "cube", "core graphics descriptor update works");

console.log("core-graphics-kit piece smoke ok");
