import assert from "node:assert/strict";
import { createRealtimeGame } from "../../src/index.js";
import {
  createRenderPassContract,
  createRenderLayerGraph,
  validateRenderLayerGraph,
  resolveRenderLayerGraph,
  createRenderLayerGraphKit
} from "../../src/core-kits/core-graphics-kit/index.js";

const graph = createRenderLayerGraph({
  id: "anime-water-stack",
  externalInputs: ["sky-environment", "fog-density", "shoreline-distance"],
  finalScenePassId: "foam-overlay",
  passes: [
    createRenderPassContract({
      id: "opaque-world",
      order: 10,
      reads: [],
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
      writes: ["atmosphere-composited-color"],
      transparent: true,
      depth: { test: false, write: false },
      blend: { mode: "additive" }
    }),
    createRenderPassContract({
      id: "foam-overlay",
      order: 40,
      requires: ["atmosphere-composite"],
      reads: ["atmosphere-composited-color", "water-mask", "shoreline-distance"],
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

const validation = validateRenderLayerGraph(graph, { requiredResources: ["display-color"] });
assert.equal(validation.valid, true, validation.issues.join("\n"));
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
    { id: "foam", order: 40, writes: ["final-scene-color"], transparent: true, depth: { write: true } },
    { id: "late-world-content", order: 50, writes: ["bad"], sceneContent: true }
  ]
}));
assert.equal(invalid.valid, false);
assert.ok(invalid.issues.includes("transparent-pass-writes-depth:foam"));
assert.ok(invalid.issues.includes("scene-content-after-final:late-world-content"));

const engine = createRealtimeGame({ kits: [createRenderLayerGraphKit({ graph })] });
assert.equal(engine.n.renderLayerGraph.validate().valid, true);
assert.equal(engine.n.renderLayerGraph.getOrderedPasses().at(-2).id, "foam-overlay");
assert.doesNotThrow(() => JSON.stringify(engine.n.renderLayerGraph.getSnapshot()));

console.log("core graphics render-layer graph smoke ok");
