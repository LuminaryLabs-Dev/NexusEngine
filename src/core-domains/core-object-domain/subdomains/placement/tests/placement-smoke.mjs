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
  id: "bridge",
  objectType: "bridge",
  bounds: { min: [-2, -1, -0.5], max: [2, 1, 0.5] },
  pivot: [0, 0, 0],
  groundAnchor: [0, -1, 0]
});

const placement = engine.n.objectPlacement.create({
  objectId: "bridge",
  localBounds: { min: [0, 0, 0], max: [100, 100, 100] },
  pivot: [50, 50, 50],
  transform: { position: [4, 3, -2] }
});
assert.deepEqual(placement.localBounds.min, [-2, -1, -0.5]);
assert.deepEqual(placement.pivot, [0, 0, 0]);
assert.deepEqual(
  placement.anchors.find(({ id }) => id === "support").position,
  [0, -1, 0]
);

const grounded = engine.n.objectPlacement.ground(placement.id, {
  point: [0, 0, 0],
  normal: [0, 1, 0]
});
assert.equal(engine.n.objectPlacement.worldBounds(grounded.id).min[1], 0);
assert.equal(engine.n.objectPlacement.validate(grounded.id, {
  contactPlane: { point: [0, 0, 0], normal: [0, 1, 0] }
}).valid, true);

const fitted = engine.n.objectPlacement.fit(grounded.id, {
  min: [-1, 0, -1],
  max: [1, 1, 1]
});
assert.ok(engine.n.objectPlacement.worldBounds(fitted.id).size.every((value) => value <= 2));
assert.throws(
  () => engine.n.objectPlacement.create({ objectId: "missing" }),
  /Unknown core object/
);
console.log("core Object Placement smoke ok");
