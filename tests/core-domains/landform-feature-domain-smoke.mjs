import assert from "node:assert/strict";
import {
  WORLD_FEATURE_KIT_METHODS,
  createMountainFeatureKit,
  createCanyonFeatureKit,
  createCliffFeatureKit,
  createPlateauFeatureKit,
  createRidgeFeatureKit,
  createHillFeatureKit,
  createEscarpmentFeatureKit,
  createValleyFeatureKit,
  createPassFeatureKit,
  createCaveOverhangFeatureKit
} from "../../src/index.js";

const mountainKit = createMountainFeatureKit();
const mountain = mountainKit.normalize({
  id: "massif",
  definition: {
    path: [{ x: -500, z: 0 }, { x: 500, z: 0 }],
    width: 1000,
    height: 500,
    sharpness: 3,
    variation: 0
  }
});
assert.equal(mountainKit.sample(mountain, { x: 0, z: 0 }), 500);
assert.equal(mountainKit.sample(mountain, { x: 0, z: 600 }), 0);
const contribution = mountainKit.compileContributions(mountain, { cellId: "cell" });
assert.equal(contribution.featureId, "massif");
assert.equal(contribution.channels.elevation.featureType, "mountain");
assert.equal(contribution.metadata.fidelity.near, "feature-mesh");

const kits = [
  mountainKit,
  createRidgeFeatureKit(),
  createHillFeatureKit(),
  createPlateauFeatureKit(),
  createCliffFeatureKit(),
  createEscarpmentFeatureKit(),
  createCanyonFeatureKit(),
  createValleyFeatureKit(),
  createPassFeatureKit(),
  createCaveOverhangFeatureKit()
];
assert.equal(kits.length, 10);
for (const kit of kits) {
  assert.equal(kit.implemented, true);
  for (const method of WORLD_FEATURE_KIT_METHODS) assert.equal(typeof kit[method], "function", `${kit.type}.${method}`);
}
assert.ok(createCanyonFeatureKit().sample({ id: "c", path: [{ x: 0, z: 0 }], width: 100, depth: 50 }, { x: 0, z: 0 }) > 0);
assert.equal(createCaveOverhangFeatureKit().compileContributions({ id: "cave", center: { x: 0, z: 0 }, radius: 20 }, { cellId: "cell" }).channels.elevation, undefined);

console.log("landform feature domain smoke passed");
