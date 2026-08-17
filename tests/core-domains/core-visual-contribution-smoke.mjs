import assert from "node:assert/strict";
import {
  composeVisualContributions,
  defineVisualContribution,
  validateVisualContribution
} from "../../src/core-domains/presentation/graphics/kits/graphics-kit/visual-contributions.js";

const terrain = defineVisualContribution({
  semanticId: "synthetic:terrain:cell-0",
  sourceDomain: "n:world:terrain",
  bounds: { min: [0, -20, 0], max: [64, 40, 64] },
  geometry: { ref: "terrain-cell" },
  material: { ref: "terrain-surface" },
  generation: { seed: 17, resolution: 49 },
  lodPolicy: { levels: [1, 2, 4] },
  visibilityPolicy: { mode: "bounds" },
  resourceRequirements: [{ capability: "storage" }, { capability: "vertex" }]
});

const ecology = defineVisualContribution({
  semanticId: "synthetic:ecology:cell-0",
  sourceDomain: "n:world:feature:ecology",
  bounds: { min: [0, 0, 0], max: [64, 48, 64] },
  geometry: { ref: "tree-species-set" },
  material: { ref: "tree-fidelity-materials" },
  generation: { seed: 17, density: 0.72 },
  lodPolicy: { levels: [0, 1, 2] },
  visibilityPolicy: { mode: "bounds" },
  resourceRequirements: [{ capability: "storage" }, { capability: "indirect" }]
});

assert.equal(validateVisualContribution(terrain), true);
assert.ok(Object.isFrozen(terrain));
assert.ok(Object.isFrozen(terrain.bounds));
assert.deepEqual(
  composeVisualContributions(terrain, ecology).map((entry) => entry.semanticId),
  ["synthetic:ecology:cell-0", "synthetic:terrain:cell-0"]
);
assert.throws(
  () => defineVisualContribution({ semanticId: "invalid:webgpu", generation: { wgsl: "@compute fn main() {}" } }),
  /leaks backend execution state/
);
assert.throws(() => composeVisualContributions(terrain, terrain), /Duplicate VisualContribution/);

console.log("Portable VisualContribution contract OK");
