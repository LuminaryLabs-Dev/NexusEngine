import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createCoreObjectDomain } from "../../src/core-domains/core-object-domain/index.js";

const engine = createEngine({ kits: createCoreObjectDomain({ shape: false, fidelity: false }) });
const vegetation = engine.n.vegetation;
const ecology = engine.n.vegetationEcology;
const trees = engine.n.vegetationTree;
const foliage = engine.n.vegetationFoliage;
const bridge = engine.n.vegetationObjectBridge;

assert.ok(vegetation && ecology && trees && foliage && bridge);
assert.ok(engine.kits.some((kit) => kit.provides.includes("n:object")), "Core Object provides semantic n:object namespace");

const species = vegetation.registerSpecies({
  id: "fixture-oak",
  family: "fagaceae",
  kind: "tree",
  bounds: { min: [-4, 0, -4], max: [4, 18, 4] },
  parts: [
    { id: "trunk", kind: "trunk", regions: ["bark"] },
    { id: "canopy", parentId: "trunk", kind: "canopy", regions: ["foliage"] }
  ],
  ecology: { moisture: 0.65, elevation: 0.35, slope: 0.3, temperature: 0.55, distributionWeight: 1.2 },
  variation: { groundSink: [0.1, 0.5] }
});
assert.equal(species.schema, "nexus-vegetation-species/1");
assert.equal(vegetation.listSpecies().length, 1);

const instanceA = vegetation.createInstanceDescriptor({
  id: "fixture-oak:1",
  speciesId: species.id,
  seed: "world:cell:1",
  position: [3, 2, 8]
});
const instanceB = vegetation.createInstanceDescriptor({
  id: "fixture-oak:1",
  speciesId: species.id,
  seed: "world:cell:1",
  position: [3, 2, 8]
});
assert.deepEqual(instanceA, instanceB, "vegetation instance variation is deterministic");
assert.ok(instanceA.variation.groundSink >= 0.1 && instanceA.variation.groundSink <= 0.5);
vegetation.registerInstance(instanceA);
assert.equal(vegetation.setLifecycleState(instanceA.id, "damaged").lifecycle.state, "damaged");

assert.ok(ecology.score(species, { moisture: 0.65, elevation: 0.35, slope: 0.3, temperature: 0.55 }) > 0.9);
assert.equal(ecology.select([species], { moisture: 0.65 }, "selection").id, species.id);
assert.equal(vegetation.selectSpecies({ moisture: 0.65 }, "selection").id, species.id);

const tree = trees.register({
  id: "fixture-oak:tree",
  speciesId: species.id,
  averageHeight: 18,
  averageWidth: 8,
  shape: "broad-canopy"
});
assert.equal(trees.createShapeRecipe(tree).targets.length, 2);
assert.deepEqual(trees.createFidelityProfile(tree).forms.map((form) => form.id), ["near", "medium", "far", "horizon"]);
assert.equal(trees.createCaptureRequest(tree, "far").viewSet.azimuthCount, 8);

const leaves = foliage.register({
  id: "fixture-oak:foliage",
  speciesId: species.id,
  kind: "leaf-cluster",
  card: { crossedPlanes: 2, alphaCutoff: 0.4 },
  wind: { mode: "branch-relative", amplitude: 0.08 }
});
assert.equal(leaves.schema, "nexus-foliage-descriptor/1");

const object = bridge.registerSpeciesObject(species.id);
assert.equal(object.objectType, "vegetation:tree");
assert.equal(object.metadata.speciesId, species.id);
assert.equal(engine.n.coreObject.get(object.id).id, object.id);
const instanceObject = bridge.toInstanceObjectDescriptor(instanceA);
assert.equal(instanceObject.id, instanceA.id);
assert.equal(instanceObject.metadata.vegetationInstanceId, instanceA.id);
assert.doesNotThrow(() => structuredClone({
  vegetation: vegetation.getSnapshot(),
  tree: trees.getSnapshot(),
  foliage: foliage.getSnapshot(),
  object: engine.n.coreObject.getSnapshot()
}));

console.log("core object vegetation domain smoke passed");
