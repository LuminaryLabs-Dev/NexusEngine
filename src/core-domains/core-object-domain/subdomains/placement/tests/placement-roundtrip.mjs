import assert from "node:assert/strict";
import { createEngine } from "../../../../../engine.js";
import { createCoreObjectDomain } from "../../../index.js";

const engine = createEngine({
  kits: createCoreObjectDomain({
    shape: false,
    fidelity: false,
    vegetation: false
  })
});
engine.n.coreObject.register({
  id: "column",
  bounds: { min: [-0.5, 0, -0.5], max: [0.5, 3, 0.5] },
  pivot: [0, 0, 0],
  groundAnchor: [0, 0, 0]
});
engine.n.objectPlacement.create({ id: "left", objectId: "column" });
engine.n.objectPlacement.create({
  id: "right",
  objectId: "column",
  transform: { position: [4, 0, 0] }
});
engine.n.objectPlacement.revise("right", {
  transform: { position: [5, 0, 0], scale: [2, 1, 2] }
});

const snapshot = engine.n.objectPlacement.getSnapshot();
engine.n.objectPlacement.reset();
assert.equal(engine.n.objectPlacement.list().length, 0);
assert.deepEqual(engine.n.objectPlacement.loadSnapshot(snapshot), snapshot);
assert.deepEqual(engine.n.objectPlacement.getSnapshot(), snapshot);
console.log("core Object Placement roundtrip ok");
