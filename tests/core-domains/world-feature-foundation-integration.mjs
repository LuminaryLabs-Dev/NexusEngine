import assert from "node:assert/strict";
import { createCoreWorldDomain, createEngine } from "../../src/index.js";

function createProof(order) {
  const engine = createEngine({ kits: [createCoreWorldDomain()] });
  for (const id of order) {
    engine.n.worldFeatures.registerFeature({
      id,
      type: "mountain",
      priority: id === "large" ? 10 : 20,
      definition: {
        center: { x: 0, z: 0 },
        width: id === "large" ? 1600 : 800,
        height: id === "large" ? 400 : 100,
        sharpness: 2,
        variation: 0
      }
    });
  }
  const result = engine.n.worldFeatures.compileCell({
    id: "cell-0",
    bounds: { minX: -1000, minZ: -1000, maxX: 1000, maxZ: 1000 }
  }, { baseFoundation: { elevation: 5 } });
  const sample = engine.n.worldFoundation.sampleElevation("cell-0", { x: 0, z: 0 }, engine.n.worldFeatures.getSamplers());
  return { result, sample };
}

const first = createProof(["small", "large"]);
const second = createProof(["large", "small"]);
assert.equal(first.sample, 505);
assert.equal(second.sample, first.sample);
assert.deepEqual(first.result.resolved.contributionIds, second.result.resolved.contributionIds);

const dependencyEngine = createEngine({ kits: [createCoreWorldDomain()] });
dependencyEngine.n.worldFoundation.setContributions("missing", [{
  id: "dependent",
  featureId: "dependent",
  cellId: "missing",
  dependsOn: ["absent"],
  channels: { elevation: 1 }
}]);
assert.throws(() => dependencyEngine.n.worldFoundation.resolveCell("missing"), /missing dependency/);

console.log("world feature foundation integration passed");
