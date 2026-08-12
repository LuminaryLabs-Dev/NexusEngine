import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createPhysicsContractsDomain } from "../../src/core-domains/physics/subdomains/contracts/index.js";
import {
  createPhysicsBodyDomain,
  normalizeBodyDamping,
  normalizeBodyInertia,
  normalizeBodyMass,
  normalizeBodyState
} from "../../src/core-domains/physics/subdomains/body/index.js";

const engine = createEngine({
  kits: [
    ...createPhysicsContractsDomain(),
    ...createPhysicsBodyDomain()
  ]
});

const expectedApis = [
  "physicsBodyIdentity",
  "physicsBodyType",
  "physicsBodyPose",
  "physicsBodyVelocity",
  "physicsBodyForce",
  "physicsBodyMass",
  "physicsBodyInertia",
  "physicsBodyDamping",
  "physicsBodySleep",
  "physicsBodyWake",
  "physicsBodyLifecycle",
  "physicsBodyState",
  "physicsBodyRegistry"
];
for (const apiName of expectedApis) {
  assert.ok(engine.n[apiName], `missing ${apiName}`);
}

const body = normalizeBodyState({
  identity: { id: "body:alpha", tags: ["dynamic", "test"] },
  type: { kind: "dynamic" },
  pose: { position: [1, 2, 3], rotation: [0, 0, 0, -2] },
  velocity: { linear: [4, 0, 0], angular: [0, 1, 0] },
  mass: { kilograms: 2 },
  inertia: { principal: [2, 4, 8] },
  damping: { linear: 0.1, angular: 0.2 }
});

assert.equal(body.identity.id, "body:alpha");
assert.deepEqual(body.pose.rotation, [0, 0, 0, 1]);
assert.equal(body.mass.inverseMass, 0.5);
assert.deepEqual(body.inertia.inversePrincipal, [0.5, 0.25, 0.125]);
assert.doesNotThrow(() => structuredClone(body));
assert.equal(JSON.stringify(body).includes("Rapier"), false);
assert.equal(JSON.stringify(body).includes("PhysX"), false);
assert.equal(JSON.stringify(body).includes("GPUBuffer"), false);

assert.throws(() => normalizeBodyMass({ kilograms: 0 }, { bodyType: "dynamic" }), /greater than 0/);
assert.throws(() => normalizeBodyMass({ kilograms: 1 }, { bodyType: "static" }), /must equal 0/);
assert.throws(() => normalizeBodyInertia({ principal: [1, 0, 1] }, { bodyType: "dynamic" }), /greater than 0/);
assert.throws(() => normalizeBodyDamping({ linear: -1 }), /at least 0/);

const registry = engine.n.physicsBodyRegistry;
const define = {
  operationId: "body:define:alpha",
  body
};
const created = registry.defineBody(define);
assert.equal(created.result.created, true);
assert.equal(created.result.record.revision, 1);
assert.deepEqual(registry.defineBody(define), created, "exact command replay must be idempotent");
assert.equal(registry.hasBody("body:alpha"), true);
assert.equal(registry.getBody("body:alpha").identity.id, "body:alpha");

const changedBody = normalizeBodyState({
  ...body,
  pose: { position: [2, 2, 3], rotation: [0, 0, 0, 1] }
});
const replaced = registry.replaceBody({
  operationId: "body:replace:alpha",
  expectedRevision: 1,
  body: changedBody
});
assert.equal(replaced.result.changed, true);
assert.equal(replaced.result.record.revision, 2);
assert.deepEqual(registry.listBodies().map((entry) => entry.identity.id), ["body:alpha"]);

const beforeSleep = registry.getRecord("body:alpha").revision;
const slept = registry.sleepBody({
  operationId: "body:sleep:alpha",
  bodyId: "body:alpha",
  expectedRevision: beforeSleep,
  reason: "test",
  tickId: 1
});
assert.equal(slept.result.record.body.sleep.sleeping, true);
const woke = registry.wakeBody({
  operationId: "body:wake:alpha",
  bodyId: "body:alpha",
  expectedRevision: slept.result.record.revision,
  reason: "test",
  tickId: 2
});
assert.equal(woke.result.record.body.sleep.sleeping, false);

const snapshot = registry.getSnapshot();
assert.doesNotThrow(() => structuredClone(snapshot));
registry.reset();
assert.equal(registry.hasBody("body:alpha"), false);
registry.loadSnapshot(snapshot);
assert.equal(registry.getRecord("body:alpha").revision, woke.result.record.revision);

const removed = registry.removeBody({
  operationId: "body:remove:alpha",
  bodyId: "body:alpha",
  expectedRevision: woke.result.record.revision
});
assert.equal(removed.result.removed, true);
assert.equal(registry.hasBody("body:alpha"), false);

console.log("core physics body smoke ok");
