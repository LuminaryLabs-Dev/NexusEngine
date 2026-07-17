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
assert.equal(engine.n.ownerOf("n:object"), "n-core-object-kit");
assert.equal(engine.n.path("n:object").metadata.aliasOf, "n:core-object");
assert.equal(engine.n.path("n:object:vegetation").parentPath, "n:object");
assert.equal(engine.n.path("n:object:vegetation:tree").parentPath, "n:object:vegetation");
assert.equal(engine.n.path("n:object:vegetation:foliage").parentPath, "n:object:vegetation");

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

const idealEnvironment = { moisture: 0.65, elevation: 0.35, slope: 0.3, temperature: 0.55, cluster: 1 };
assert.ok(ecology.score(species, idealEnvironment) > 1);
assert.equal(ecology.select([species], idealEnvironment, "selection").id, species.id);
assert.equal(vegetation.selectSpecies(idealEnvironment, "selection").id, species.id);

const cardFamily = foliage.createCardFamily({
  id: "fixture-oak:broadleaf-card",
  kind: "broadleaf-spray",
  atlas: { assetId: "fixture-foliage-atlas", frameId: "broadleaf", uvRect: [0, 0.5, 0.25, 0.5] },
  size: { minimum: [0.45, 0.4], maximum: [1.8, 1.4] },
  alphaCutoff: 0.42,
  wind: { amplitude: 0.11, frequency: 0.74 }
});
assert.equal(cardFamily.schema, "nexus-foliage-card-family/1");
const cluster = foliage.createCluster({
  id: "fixture-oak:crown-ring",
  familyId: cardFamily.id,
  mode: "crown-ring",
  count: 18,
  position: [0, 14, 0],
  extent: [4, 2.5, 4],
  fidelity: { nearMultiplier: 1, mediumMultiplier: 0.45 }
});
assert.equal(cluster.schema, "nexus-foliage-cluster/1");

const leaves = foliage.register({
  id: "fixture-oak:foliage",
  speciesId: species.id,
  kind: "leaf-cluster",
  card: { familyId: cardFamily.id, crossedPlanes: 2, alphaCutoff: 0.42 },
  cardFamilies: [cardFamily],
  clusters: [cluster],
  wind: { mode: "branch-relative", amplitude: 0.08 },
  fidelity: {
    near: { mode: "cards", density: 1 },
    medium: { mode: "cards", density: 0.45 },
    far: { mode: "captured-impostor" },
    horizon: { mode: "captured-impostor" }
  }
});
assert.equal(leaves.schema, "nexus-foliage-descriptor/2");
assert.equal(leaves.cardFamilies.length, 1);
assert.equal(leaves.clusters[0].familyId, cardFamily.id);
const placement = foliage.createPlacementRecipe(leaves);
assert.equal(placement.schema, "nexus-foliage-placement-recipe/1");
assert.deepEqual(placement.cardFamilyIds, [cardFamily.id]);

const tree = trees.register({
  id: "fixture-oak:tree",
  speciesId: species.id,
  averageHeight: 18,
  averageWidth: 8,
  shape: "broad-canopy",
  canopy: {
    foliageIds: [leaves.id],
    clusterCount: 18,
    layerCount: 3,
    edgeIrregularity: 0.42,
    hangingFoliage: 0.12,
    anchors: [{ id: "left-crown", position: [-2.5, 14, 0], foliageId: leaves.id }]
  },
  foliage: { ids: [leaves.id], nearDensity: 1, mediumDensity: 0.45 }
});
assert.equal(tree.schema, "nexus-tree-structure/2");
assert.equal(tree.canopy.schema, "nexus-tree-canopy-composition/1");
assert.equal(tree.canopy.foliageIds[0], leaves.id);
assert.equal(trees.createShapeRecipe(tree).targets.length, 2);
const fidelityProfile = trees.createFidelityProfile(tree);
assert.deepEqual(fidelityProfile.forms.map((form) => form.id), ["near", "medium", "far", "horizon"]);
assert.equal(fidelityProfile.forms[0].metadata.foliageDensity, 1);
assert.equal(fidelityProfile.forms[1].metadata.foliageDensity, 0.45);
assert.equal(trees.createCaptureRequest(tree, "far").viewSet.azimuthCount, 8);

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
