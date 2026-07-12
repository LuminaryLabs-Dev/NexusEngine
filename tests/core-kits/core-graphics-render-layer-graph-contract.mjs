import assert from "node:assert/strict";
import {
  createRenderLayerGraph,
  createRenderPassContract,
  resolveRenderLayerGraph,
  validateRenderLayerGraph
} from "../../src/core-kits/core-graphics-kit/render-layer-graph-kit/contract.js";

const graph = createRenderLayerGraph({
  id: "contract-only-anime-water-stack",
  externalInputs: ["sky-environment", "fog-density", "shoreline-distance"],
  finalScenePassId: "foam-overlay",
  passes: [
    createRenderPassContract({
      id: "opaque-world",
      order: 10,
      writes: ["opaque-color", "opaque-depth"],
      depth: { test: true, write: true }
    }),
    createRenderPassContract({
      id: "water-composite",
      order: 20,
      requires: ["opaque-world"],
      reads: ["opaque-color", "opaque-depth", "sky-environment"],
      writes: ["water-composited-color", "water-mask"],
      transparent: true,
      depth: { test: true, write: false, source: "opaque-depth" },
      blend: { mode: "premultiplied-alpha", premultipliedAlpha: true }
    }),
    createRenderPassContract({
      id: "atmosphere-composite",
      order: 30,
      requires: ["water-composite"],
      reads: ["water-composited-color", "fog-density"],
      writes: ["atmosphere-composited-color", "fog-transmittance"],
      transparent: true,
      depth: { test: false, write: false },
      blend: { mode: "additive" }
    }),
    createRenderPassContract({
      id: "foam-overlay",
      order: 40,
      requires: ["atmosphere-composite"],
      reads: ["atmosphere-composited-color", "water-mask", "shoreline-distance", "fog-transmittance"],
      writes: ["final-scene-color"],
      transparent: true,
      depth: { test: true, write: false, source: "opaque-depth" },
      blend: { mode: "premultiplied-alpha", premultipliedAlpha: true }
    }),
    createRenderPassContract({
      id: "output-transform",
      order: 90,
      sceneContent: false,
      technical: true,
      requires: ["foam-overlay"],
      reads: ["final-scene-color"],
      writes: ["display-color"],
      depth: { test: false, write: false }
    })
  ]
});

const result = validateRenderLayerGraph(graph, { requiredResources: ["display-color"] });
assert.equal(result.valid, true, result.issues.join("\n"));
assert.deepEqual(resolveRenderLayerGraph(graph).orderedPasses.map(pass => pass.id), [
  "opaque-world",
  "water-composite",
  "atmosphere-composite",
  "foam-overlay",
  "output-transform"
]);

const invalid = validateRenderLayerGraph(createRenderLayerGraph({
  finalScenePassId: "foam",
  passes: [
    { id: "foam", transparent: true, depth: { write: true }, writes: ["final-scene-color"] },
    { id: "late-content", order: 1, sceneContent: true, writes: ["bad"] }
  ]
}));
assert.equal(invalid.valid, false);
assert.ok(invalid.issues.includes("transparent-pass-writes-depth:foam"));
assert.ok(invalid.issues.includes("scene-content-after-final:late-content"));

console.log("core graphics render-layer contract test ok");
