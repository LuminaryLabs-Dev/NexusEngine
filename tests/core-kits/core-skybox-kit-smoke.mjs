import assert from "node:assert/strict";
import { createEngine, createPresentationKit } from "../helpers/public-package-surface.mjs";
import {
  createSkyDescriptorKit,
  createSkyboxCloudLayerDescriptor,
  createSkyboxCompositionDescriptor,
  createSkyboxGradientDescriptor,
  createSkyboxPreset,
  createSkyboxRenderDescriptor
} from "../../src/core-domains/presentation/subdomains/sky/kits/sky-kit/index.js";

assert.equal(createSkyboxGradientDescriptor({ topColor: "#123456" }).topColor, "#123456", "gradient descriptor stores top color");
assert.equal(createSkyboxCloudLayerDescriptor({ coverage: 2 }).coverage, 1, "cloud coverage is clamped");
assert.equal(createSkyboxCompositionDescriptor({ cameraFollow: false }).cameraFollow, false, "composition stores camera-follow policy");
assert.equal(createSkyboxRenderDescriptor(createSkyboxPreset({ id: "smoke" })).kind, "skybox", "render descriptor is skybox kind");
assert.throws(() => createSkyboxPreset(), /requires an id/, "authored presets must be supplied explicitly");

const engine = createEngine({ kits: [createPresentationKit(), createSkyDescriptorKit()] });
assert.equal(typeof engine.n.sky.getRenderDescriptor, "function", "core skybox installs under engine.n");
assert.equal(engine.n.sky.getRenderDescriptor().type, "shader-sky-dome", "default render model is shader sky dome");
assert.equal(engine.n.sky.getActivePreset(), undefined, "Core ships no authored sky presets");
assert.equal(engine.n.sky.listPresets().length, 0, "preset registry starts empty");
assert.equal(engine.n.sky.getRenderDescriptor().cameraFollow, true, "render descriptor follows camera by default");

engine.n.sky.setCameraFollow(false);
assert.equal(engine.n.sky.getRenderDescriptor().cameraFollow, false, "camera-follow descriptor can be disabled");

engine.n.sky.registerPreset({
  id: "test-custom",
  label: "Test Custom",
  gradient: { topColor: "#000011", horizonColor: "#ffeeaa" },
  clouds: [{ id: "test-clouds", coverage: 0.2 }]
}, { activate: true });
assert.equal(engine.n.sky.getActivePreset().id, "test-custom", "custom preset can register and activate");

engine.n.sky.registerPreset({
  id: "test-second",
  label: "Test Second",
  gradient: { topColor: "#001122", horizonColor: "#eedd99" }
});
engine.n.sky.setPreset("test-second");
assert.equal(engine.n.sky.getActivePreset().id, "test-second", "setPreset selects caller-owned data");

engine.n.sky.compose({
  id: "manual-composition",
  gradient: { topColor: "#010203", horizonColor: "#f0c090" },
  clouds: [{ id: "manual-clouds", coverage: 0.4 }]
});
assert.equal(engine.n.sky.getComposition().id, "manual-composition", "manual composition updates active composition");
assert.equal(engine.n.sky.getActivePreset(), undefined, "manual composition is not mislabeled as an authored preset");

console.log("core-skybox-kit smoke ok");
