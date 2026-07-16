import assert from "node:assert/strict";
import {
  createCoreCameraKit,
  createCoreDataKit,
  createCoreGraphicsKit,
  createCoreSimulationKit,
  createCoreTransactionLedgerKit,
  createDataSchema,
  createRealtimeGame,
  createWorldPatchPreparationController
} from "../../src/index.js";

const engine = createRealtimeGame({
  kits: [
    createCoreDataKit({ random: { seed: "course-42", streams: ["layout", "valid-depot"] } }),
    createCoreSimulationKit({
      resourceMeters: [
        { id: "fuel", initial: 100, min: 0, max: 100 },
        { id: "remaining-time", initial: 300, min: 0, max: 300, ratePerSecond: -1 }
      ]
    }),
    createCoreCameraKit(),
    createCoreGraphicsKit(),
    createCoreTransactionLedgerKit()
  ]
});

const random = engine.n.coreData.random;
const firstLayout = random.nextUint32("layout");
const randomSnapshot = random.getSnapshot();
const nextLayout = random.nextUint32("layout");
random.loadSnapshot(randomSnapshot);
assert.equal(random.nextUint32("layout"), nextLayout, "named random streams replay exactly");
assert.notEqual(firstLayout, nextLayout, "named random stream advances");

const packageSchema = createDataSchema({
  id: "long-haul.course-package",
  version: "1.0.0",
  required: ["schema", "packageId", "seed", "delivery"],
  additionalProperties: false,
  fields: {
    schema: { type: "string", const: "long-haul.course-package/1" },
    packageId: { type: "string", minLength: 1 },
    seed: { type: "string", minLength: 1 },
    delivery: {
      type: "object",
      required: ["candidateDepotIds", "validDepotId"],
      properties: {
        candidateDepotIds: { type: "array", minLength: 5, maxLength: 5, items: { type: "string", minLength: 1 } },
        validDepotId: { type: "string", minLength: 1 }
      },
      additionalProperties: false
    }
  }
});
engine.n.coreData.packages.registerSchema(packageSchema);
const payload = {
  schema: "long-haul.course-package/1",
  packageId: "course-42",
  seed: "42",
  delivery: { candidateDepotIds: ["a", "b", "c", "d", "e"], validDepotId: "c" }
};
const envelope = engine.n.coreData.packages.createEnvelope({ packageId: payload.packageId, schemaId: packageSchema.id, payload });
assert.equal(engine.n.coreData.packages.verifyEnvelope(envelope).valid, true, "package envelope verifies");
assert.throws(() => engine.n.coreData.packages.verifyEnvelope({ ...envelope, payload: { ...payload, seed: "changed" } }), /digest mismatch/, "package corruption is rejected");
assert.throws(() => engine.n.coreData.packages.createEnvelope({ packageId: "bad", schemaId: packageSchema.id, payload: { ...payload, delivery: { candidateDepotIds: ["a"], validDepotId: "a" } } }), /at least 5/, "nested package rules validate");

const meters = engine.n.coreSimulation.resources;
meters.spend("fuel", 12, "truck-motion");
assert.equal(meters.get("fuel").value, 88, "Core Simulation owns bounded meters");
meters.tick(1);
assert.equal(meters.get("remaining-time").value, 299, "meter rates advance deterministically");

const smoothing = engine.n.coreCamera.smoothing;
smoothing.createController({ id: "player", position: [0, 4, 10], lookPoint: [0, 0, 0], fov: 60, positionSharpness: 3, teleportThreshold: 80 });
smoothing.setTarget("player", { position: [10, 6, 12], lookPoint: [5, 1, 0], fov: 55, mode: "chase" });
smoothing.update("player", 1 / 60);
const cameraDescriptor = smoothing.getDescriptor("player");
assert.equal(cameraDescriptor.kind, "camera-pose", "camera smoothing publishes portable pose descriptors");
const smoothingSnapshot = structuredClone(smoothing.getSnapshot());
assert.equal(smoothingSnapshot.schema, "nexusengine.core-camera.smoothing/1", "camera smoothing snapshots clone");
smoothing.reset();
smoothing.loadSnapshot(smoothingSnapshot);
assert.equal(smoothing.getSnapshot().controllers[0].config.positionSharpness, 3, "camera tuning survives snapshot restore");
assert.equal(smoothing.getSnapshot().controllers[0].config.teleportThreshold, 80, "camera teleport policy survives snapshot restore");

const batches = engine.n.coreGraphics.instanceBatches;
batches.createBatch({ id: "trees", assetId: "pine", materialId: "pine-material", capacity: 4, updateMode: "incremental" });
batches.replaceCell("trees", "0:0", [
  { id: "tree-a", position: [0, 0, 0] },
  { id: "tree-b", position: [2, 0, 0] }
]);
let flush = batches.flush("trees");
assert.equal(flush.activeCount, 2, "instance batch activates cell instances");
batches.removeCell("trees", "0:0");
flush = batches.flush("trees");
assert.deepEqual(flush.releasedInstanceIds, ["tree-a", "tree-b"], "instance batch reports released instances");
assert.equal(structuredClone(batches.getSnapshot()).schema, "nexusengine.core-graphics.instance-batches/1", "instance batch snapshots clone");

const preparation = createWorldPatchPreparationController({
  id: "terrain",
  patchSize: 192,
  prefetchDistance: 1,
  generationBudget: 2,
  activationBudget: 2,
  generatePatch(request) { return { id: request.patchId, x: request.x, z: request.z }; }
});
preparation.setFocus({ position: { x: 0, z: 0 }, forward: { x: 0, z: 1 } });
preparation.updateDesired([{ x: 0, z: 0 }]);
preparation.pump();
const readyPatches = preparation.takeReady();
assert.equal(readyPatches.length, 1, "prefetched patches do not enter the active-ready queue");
assert.equal(readyPatches[0].patch.id, "0:0", "patch preparation produces the active descriptor");
assert.equal(preparation.hasPatch("0:1"), true, "forward patch is prepared for prefetch");
preparation.release("0:0");
assert.deepEqual(preparation.takeReleased(), ["0:0"], "patch preparation reports provider releases");
assert.equal(structuredClone(preparation.getSnapshot()).schema, "nexusengine.core-world.patch-preparation/1", "patch preparation snapshots clone");

const ledger = engine.n.coreTransactionLedger;
let applications = 0;
const first = ledger.applyOnce("course-42", "depot:a:check", () => ++applications);
const duplicate = ledger.applyOnce("course-42", "depot:a:check", () => ++applications);
assert.equal(first.applied, true, "ledger applies first operation");
assert.equal(duplicate.duplicate, true, "ledger rejects duplicate operation");
assert.equal(applications, 1, "duplicate operation has no side effect");

console.log("core child capabilities smoke ok");
