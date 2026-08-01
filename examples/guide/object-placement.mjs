import assert from "node:assert/strict";
import { createEngine } from "nexusengine";
import { createObjectPlacementKit } from "nexusengine/domains/object/placement";
import { createObjectRegistryKit } from "nexusengine/domains/object/registry";

const engine = createEngine({
  kits: [createObjectRegistryKit(), createObjectPlacementKit()]
});
const object = engine.n.object.register({
  id: "guide-crate",
  objectType: "fixture",
  bounds: { min: [-1, 0, -1], max: [1, 2, 1] },
  pivot: [0, 1, 0],
  groundAnchor: [0, 0, 0]
});
const placement = engine.n.objectPlacement.create({
  id: "guide-crate-placement",
  objectId: object.id
});

assert.equal(placement.objectId, object.id);
console.log("guide object placement example ok");
