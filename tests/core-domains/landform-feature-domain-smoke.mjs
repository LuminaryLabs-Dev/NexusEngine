import assert from "node:assert/strict";
import {
  createMountainFeatureKit,
  createCanyonFeatureKit,
  createCliffFeatureKit,
  createPlateauFeatureKit
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
const contribution = mountainKit.compile(mountain, { cellId: "cell" });
assert.equal(contribution.featureId, "massif");
assert.equal(contribution.channels.elevation.featureType, "mountain");
assert.equal(contribution.metadata.fidelity.near, "feature-mesh");
assert.equal(createCanyonFeatureKit().implemented, false);
assert.equal(createCliffFeatureKit().implemented, false);
assert.equal(createPlateauFeatureKit().implemented, false);

console.log("landform feature domain smoke passed");
