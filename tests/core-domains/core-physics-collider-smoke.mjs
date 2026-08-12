import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createPhysicsContractsDomain } from "../../src/core-domains/physics/subdomains/contracts/index.js";
import { createPhysicsBodyDomain } from "../../src/core-domains/physics/subdomains/body/index.js";
import { normalizeBodyState } from "../../src/core-domains/physics/subdomains/body/body-contracts.js";
import { createPhysicsShapeDomain } from "../../src/core-domains/physics/subdomains/shape/index.js";
import { createPhysicsMaterialDomain } from "../../src/core-domains/physics/subdomains/material/index.js";
import {
  createPhysicsColliderDomain,
  normalizeCollider,
  normalizeColliderFilter,
  normalizeCollisionGroup,
  normalizeCollisionMask
} from "../../src/core-domains/physics/subdomains/collider/index.js";

const engine = createEngine({
  kits: [
    ...createPhysicsContractsDomain(),
    ...createPhysicsBodyDomain(),
    ...createPhysicsShapeDomain(),
    ...createPhysicsMaterialDomain(),
    ...createPhysicsColliderDomain()
  ]
});

const bodyRegistry = engine.n.physicsBodyRegistry;
const shapeRegistry = engine.n.shapeRegistry;
const materialRegistry = engine.n.physicsMaterial;
const colliderRegistry = engine.n.physicsColliderRegistry;

bodyRegistry.defineBody({
  operationId: "collider-fixture:body",
  body: normalizeBodyState({ identity: { id: "body:alpha" } })
});
shapeRegistry.defineShape({
  operationId: "collider-fixture:shape",
  shape: { id: "shape:alpha", type: "sphere", radius: 1 }
});
materialRegistry.defineMaterial({
  operationId: "collider-fixture:material",
  material: { id: "material:alpha" }
});

const mask = normalizeCollisionMask({ layers: [0, 2, 4] });
assert.deepEqual(mask.layers, [0, 2, 4]);
assert.equal(mask.bits, 21);
assert.throws(() => normalizeCollisionMask({ layers: [0], bits: 2 }), /must equal/);

const group = normalizeCollisionGroup({
  id: "group:test",
  layer: 2,
  maskLayers: [0, 2]
});
assert.equal(group.layer, 2);
assert.deepEqual(group.maskLayers, [0, 2]);

const filter = normalizeColliderFilter({
  layer: 2,
  maskLayers: [0, 2],
  excludedColliderIds: ["collider:z", "collider:z"]
});
assert.deepEqual(filter.excludedColliderIds, ["collider:z"]);

const collider = normalizeCollider({
  identity: { id: "collider:alpha", tags: ["test"] },
  attachment: { bodyId: "body:alpha", shapeId: "shape:alpha", bodyRevision: 1 },
  pose: { position: [0, 0.5, 0], rotation: [0, 0, 0, -2] },
  material: { materialId: "material:alpha" },
  filter: { layer: 0, maskLayers: [0] },
  sensor: { enabled: true, reportContacts: true },
  trigger: { enabled: true, events: ["enter", "exit"] },
  lifecycle: { status: "enabled" }
});
assert.deepEqual(collider.pose.rotation, [0, 0, 0, 1]);
assert.doesNotThrow(() => structuredClone(collider));
assert.equal(JSON.stringify(collider).includes("Rapier"), false);
assert.equal(JSON.stringify(collider).includes("PhysX"), false);
assert.throws(
  () => normalizeCollider({
    ...collider,
    sensor: { enabled: false },
    trigger: { enabled: true }
  }),
  /requires sensor\.enabled/
);

const define = { operationId: "collider:define:alpha", collider };
const created = colliderRegistry.defineCollider(define);
assert.equal(created.result.created, true);
assert.equal(created.result.record.revision, 1);
assert.deepEqual(colliderRegistry.defineCollider(define), created);
assert.equal(colliderRegistry.hasCollider("collider:alpha"), true);

assert.throws(
  () => colliderRegistry.defineCollider({
    operationId: "collider:missing-body",
    collider: {
      ...collider,
      identity: { id: "collider:missing-body" },
      attachment: { bodyId: "body:missing", shapeId: "shape:alpha" }
    }
  }),
  /Unknown Physics body/
);
assert.throws(
  () => colliderRegistry.defineCollider({
    operationId: "collider:missing-shape",
    collider: {
      ...collider,
      identity: { id: "collider:missing-shape" },
      attachment: { bodyId: "body:alpha", shapeId: "shape:missing" }
    }
  }),
  /Unknown Physics shape/
);
assert.throws(
  () => colliderRegistry.defineCollider({
    operationId: "collider:missing-material",
    collider: {
      ...collider,
      identity: { id: "collider:missing-material" },
      material: { materialId: "material:missing" }
    }
  }),
  /Unknown Physics material/
);

const replacedCollider = normalizeCollider({
  ...collider,
  pose: { position: [1, 0.5, 0], rotation: [0, 0, 0, 1] }
});
const replaced = colliderRegistry.replaceCollider({
  operationId: "collider:replace:alpha",
  expectedRevision: 1,
  collider: replacedCollider
});
assert.equal(replaced.result.changed, true);
assert.equal(replaced.result.record.revision, 2);

const disabled = colliderRegistry.transitionCollider({
  operationId: "collider:disable:alpha",
  colliderId: "collider:alpha",
  expectedRevision: 2,
  status: "disabled"
});
assert.equal(disabled.result.record.collider.lifecycle.status, "disabled");

const snapshot = colliderRegistry.getSnapshot();
assert.doesNotThrow(() => structuredClone(snapshot));
colliderRegistry.reset();
assert.equal(colliderRegistry.hasCollider("collider:alpha"), false);
colliderRegistry.loadSnapshot(snapshot);
assert.equal(colliderRegistry.hasCollider("collider:alpha"), true);

const finalRevision = colliderRegistry.getRecord("collider:alpha").revision;
const removed = colliderRegistry.removeCollider({
  operationId: "collider:remove:alpha",
  colliderId: "collider:alpha",
  expectedRevision: finalRevision
});
assert.equal(removed.result.removed, true);

console.log("core physics collider smoke ok");
