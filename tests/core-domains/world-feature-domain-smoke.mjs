import assert from "node:assert/strict";
import { createCoreWorldDomain, createEngine } from "../../src/index.js";

const engine = createEngine({ kits: [createCoreWorldDomain()] });
const features = engine.n.worldFeatures;
assert.ok(features);
assert.equal(engine.worldFeatures, features);
assert.equal(features.hasFeatureType("mountain"), true);

const mountain = features.registerFeature({
  id: "north-peak",
  type: "mountain",
  priority: 4,
  definition: { center: { x: 100, z: 200 }, width: 1000, height: 500, sharpness: 3 }
});
assert.equal(mountain.type, "mountain");
assert.equal(features.queryFeatures({ type: "mountain", bounds: { minX: 0, minZ: 0, maxX: 300, maxZ: 300 } }).length, 1);
features.setLifecycle(mountain.id, "inactive");
assert.equal(features.getFeature(mountain.id).lifecycle, "inactive");
features.setLifecycle(mountain.id, "active");
assert.equal(features.listFeatureTypes().some((entry) => entry.id === "mountain" && entry.implemented), true);

const snapshot = features.getSnapshot();
features.reset();
assert.equal(features.listFeatures().length, 0);
assert.equal(features.hasFeatureType("mountain"), true);
features.loadSnapshot(snapshot);
assert.equal(features.getFeature("north-peak").type, "mountain");

console.log("world feature domain smoke passed");
