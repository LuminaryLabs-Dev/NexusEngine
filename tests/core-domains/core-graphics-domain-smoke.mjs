import assert from "node:assert/strict";
import {
  createCoreGraphicsDomain,
  createRealtimeGame
} from "../../src/index.js";

const engine = createRealtimeGame({
  kits: createCoreGraphicsDomain({
    root: {
      descriptors: {
        materials: {
          clay: { id: "clay", kind: "physical", roughness: 0.4, clearcoat: 0.7 }
        }
      }
    },
    layers: {
      graph: {
        id: "reflection-pipeline",
        version: "1.0.0",
        externalInputs: ["scene-probe-input"],
        finalScenePassId: "reflection-composite",
        passes: [
          {
            id: "reflection-capture",
            order: 5,
            sceneContent: false,
            technical: true,
            reads: ["scene-probe-input"],
            writes: ["reflection-radiance"]
          },
          {
            id: "reflection-filter",
            order: 6,
            sceneContent: false,
            technical: true,
            requires: ["reflection-capture"],
            reads: ["reflection-radiance"],
            writes: ["filtered-reflection"]
          },
          {
            id: "opaque-world",
            order: 10,
            requires: ["reflection-filter"],
            reads: ["filtered-reflection"],
            writes: ["scene-color", "scene-depth"]
          },
          {
            id: "reflection-composite",
            order: 20,
            requires: ["opaque-world"],
            reads: ["scene-color", "scene-depth", "filtered-reflection"],
            writes: ["final-scene-color"]
          },
          {
            id: "output-transform",
            order: 90,
            sceneContent: false,
            technical: true,
            requires: ["reflection-composite"],
            reads: ["final-scene-color"],
            writes: ["display-color"]
          }
        ]
      }
    },
    reflections: {
      reflections: [{ id: "environment", kind: "environment-probe", textureId: "environment.ktx2" }],
      policy: { preferredTechnique: "environment-probe", fallbackOrder: ["screen-space"] }
    }
  })
});

assert.equal(typeof engine.n.coreGraphics.getSnapshot, "function");
assert.equal(typeof engine.n.renderLayerGraph.getSnapshot, "function");
assert.equal(typeof engine.n.coreReflection.getSnapshot, "function");
assert.equal(engine.n.ownerOf("n:graphics:reflection"), "n-core-graphics-reflection-kit");
assert.equal(engine.n.coreGraphics.getDescriptors("materials").clay.id, "clay");
assert.deepEqual(engine.n.renderLayerGraph.getOrderedPasses().map(pass => pass.id), [
  "reflection-capture",
  "reflection-filter",
  "opaque-world",
  "reflection-composite",
  "output-transform"
]);
assert.equal(engine.n.renderLayerGraph.validate(undefined, { requiredResources: ["display-color"] }).valid, true);

console.log("core graphics domain smoke ok");
