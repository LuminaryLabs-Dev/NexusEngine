import assert from "node:assert/strict";
import { createRealtimeGame } from "../../src/index.js";
import {
  createCoreGraphicsKit,
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

const engine = createRealtimeGame({ kits: [createCoreGraphicsKit()] });
engine.n.coreGraphics.setDescriptor("objects", "cube", createRenderDescriptor({ id: "cube" }));
assert.equal(engine.n.coreGraphics.getDescriptors("objects").cube.id, "cube", "core graphics descriptor update works");

console.log("core-graphics-kit piece smoke ok");
