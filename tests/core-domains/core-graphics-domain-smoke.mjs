import assert from "node:assert/strict";
import {
  createGraphicsKit,
  createReflectionKit,
  createRenderLayerGraphKit,
  createPresentationKit,
  createEngine
} from "../helpers/public-package-surface.mjs";

const engine = createEngine({
  kits: [
    createPresentationKit(),
    createGraphicsKit({
      descriptors: {
        materials: {
          clay: { id: "clay", kind: "physical", roughness: 0.4, clearcoat: 0.7 }
        }
      }
    }),
    createRenderLayerGraphKit({
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
    }),
    createReflectionKit({
      reflections: [{ id: "environment", kind: "environment-probe", textureId: "environment.ktx2" }],
      policy: { preferredTechnique: "environment-probe", fallbackOrder: ["screen-space"] }
    })
  ]
});

assert.equal(typeof engine.n.graphics.getSnapshot, "function");
assert.equal(typeof engine.n.renderLayerGraph.getSnapshot, "function");
assert.equal(typeof engine.n.reflection.getSnapshot, "function");
assert.ok(engine.n.ownersOf("n:presentation:graphics").includes("reflection-descriptor-kit"));
assert.equal(engine.n.graphics.getDescriptors("materials").clay.id, "clay");
assert.deepEqual(engine.n.renderLayerGraph.getOrderedPasses().map(pass => pass.id), [
  "reflection-capture",
  "reflection-filter",
  "opaque-world",
  "reflection-composite",
  "output-transform"
]);
assert.equal(engine.n.renderLayerGraph.validate(undefined, { requiredResources: ["display-color"] }).valid, true);

console.log("core graphics domain smoke ok");
