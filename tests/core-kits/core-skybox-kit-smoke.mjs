import assert from "node:assert/strict";
import { createRealtimeGame } from "../../src/index.js";
import {
  CORE_SKYBOX_PRESETS,
  createCoreSkyboxKit,
  createSkyboxCloudLayerDescriptor,
  createSkyboxCompositionDescriptor,
  createSkyboxGradientDescriptor,
  createSkyboxPreset,
  createSkyboxRenderDescriptor
} from "../../src/core-kits/core-skybox-kit/index.js";

assert.equal(createSkyboxGradientDescriptor({ topColor: "#123456" }).topColor, "#123456", "gradient descriptor stores top color");
assert.equal(createSkyboxCloudLayerDescriptor({ coverage: 2 }).coverage, 1, "cloud coverage is clamped");
assert.equal(createSkyboxCompositionDescriptor({ cameraFollow: false }).cameraFollow, false, "composition stores camera-follow policy");
assert.equal(createSkyboxRenderDescriptor(createSkyboxPreset({ id: "smoke" })).kind, "skybox", "render descriptor is skybox kind");
assert.equal(Object.keys(CORE_SKYBOX_PRESETS).length >= 5, true, "core presets include baseline skies");

const engine = createRealtimeGame({ kits: [createCoreSkyboxKit()] });
assert.equal(typeof engine.n.coreSkybox.getRenderDescriptor, "function", "core skybox installs under engine.n");
assert.equal(engine.n.coreSkybox.getRenderDescriptor().type, "shader-sky-dome", "default render model is shader sky dome");

engine.n.coreSkybox.setPreset("golden-horizon");
assert.equal(engine.n.coreSkybox.getActivePreset().id, "golden-horizon", "setPreset updates active preset");
assert.equal(engine.n.coreSkybox.getRenderDescriptor().cameraFollow, true, "render descriptor follows camera by default");

engine.n.coreSkybox.setCameraFollow(false);
assert.equal(engine.n.coreSkybox.getRenderDescriptor().cameraFollow, false, "camera-follow descriptor can be disabled");

engine.n.coreSkybox.registerPreset({
  id: "test-custom",
  label: "Test Custom",
  gradient: { topColor: "#000011", horizonColor: "#ffeeaa" },
  clouds: [{ id: "test-clouds", coverage: 0.2 }]
}, { activate: true });
assert.equal(engine.n.coreSkybox.getActivePreset().id, "test-custom", "custom preset can register and activate");

engine.n.coreSkybox.compose({
  id: "manual-composition",
  gradient: { topColor: "#010203", horizonColor: "#f0c090" },
  clouds: [{ id: "manual-clouds", coverage: 0.4 }]
});
assert.equal(engine.n.coreSkybox.getComposition().id, "manual-composition", "manual composition updates active composition");

console.log("core-skybox-kit smoke ok");
