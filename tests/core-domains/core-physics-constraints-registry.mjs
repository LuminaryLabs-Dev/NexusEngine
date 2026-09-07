import assert from "node:assert/strict";
import { createConstraintsFixture, descriptor } from "../helpers/physics-constraints-fixture.mjs";

const { engine, registry: r } = createConstraintsFixture();
const unchanged = action => { const before = r.getSnapshot(); assert.throws(action); assert.deepEqual(r.getSnapshot(), before); };
for (const id of ["constructor", "__proto__", "toString"]) {
  assert.equal(r.hasConstraint(id), false);
  const command = { operationId: `create-${id}`, constraint: descriptor("fixed", id) };
  assert.equal(r.defineConstraint(command).result.created, true);
  assert.equal(r.getRecord(id).constraint.id, id);
}
const create = { operationId: "create-joint", constraint: descriptor("hinge", "joint", { breakPolicy: { enabled: true, force: 5 } }) };
const receipt = r.defineConstraint(create);
assert.equal(receipt.result.record.revision, 1);
assert.deepEqual(r.defineConstraint(create), receipt);
unchanged(() => r.defineConstraint({ ...create, status: "disabled" }));
unchanged(() => r.defineConstraint({ operationId: "constructor", constraint: descriptor("fixed", "reserved") }));
unchanged(() => r.defineConstraint({ operationId: "missing-body", constraint: descriptor("fixed", "missing", { bodyB: "constructor" }) }));
unchanged(() => r.transitionConstraint({ operationId: "stale", constraintId: "joint", status: "disabled", expectedRevision: 2 }));
const disabled = r.transitionConstraint({ operationId: "disable", constraintId: "joint", status: "disabled", expectedRevision: 1 });
assert.equal(disabled.result.record.revision, 2);
unchanged(() => r.breakConstraint({ operationId: "break-disabled", constraintId: "joint", measurement: { force: 10 } }));
r.transitionConstraint({ operationId: "enable", constraintId: "joint", status: "enabled", expectedRevision: 2 });
const replace = { ...create.constraint, frames: { bodyA: { position: [1, 0, 0] } } };
assert.equal(r.replaceConstraint({ operationId: "replace", constraint: replace, expectedRevision: 3 }).result.record.revision, 4);
unchanged(() => r.breakConstraint({ operationId: "below", constraintId: "joint", measurement: { force: 4 } }));
const broken = r.breakConstraint({ operationId: "break", constraintId: "joint", measurement: { force: 5, tickId: 2 } });
assert.equal(broken.result.record.status, "broken"); assert.equal(broken.result.record.revision, 5);
unchanged(() => r.replaceConstraint({ operationId: "replace-broken", constraint: replace }));
unchanged(() => r.transitionConstraint({ operationId: "enable-broken", constraintId: "joint", status: "enabled" }));
assert.throws(() => r.assertBodyDetachable("a"), /constructor.*joint.*toString/);
assert.equal(r.listConstraintIdsForBody("a").length, 4);
assert.equal(r.validateReferences().valid, true);
for (const name of ["update", "configure", "setDescriptor", "applyCommand"]) unchanged(() => r[name]({ constraints: {} }, () => ({ patch: {} })));

const snapshot = r.getSnapshot();
r.reset(); assert.equal(r.listRecords().length, 0);
r.loadSnapshot(snapshot); assert.deepEqual(r.getSnapshot(), snapshot);
assert.deepEqual(r.defineConstraint(create), receipt, "retry must survive restoration even after later edits");
for (const alter of [
  s => { s.constraints.joint.breakRecord.measurement.force = 0; },
  s => { s.constraints.joint.constraint.bodyB = "missing"; },
  s => { s.order.pop(); },
  s => { s.constraintRevision = Number.MAX_SAFE_INTEGER + 1; },
  s => { s.operationReceipts["create-joint"].revision = s.sequence + 1; },
  s => { s.adapters = new Array(1); },
  s => { s.constraints.joint.revision = 0; }
]) { const bad = structuredClone(snapshot); alter(bad); unchanged(() => r.loadSnapshot(bad)); }

const overflowing = structuredClone(snapshot);
overflowing.sequence = Number.MAX_SAFE_INTEGER; overflowing.constraintRevision = Number.MAX_SAFE_INTEGER;
r.loadSnapshot(overflowing);
unchanged(() => r.removeConstraint({ operationId: "overflow", constraintId: "joint" }));
r.loadSnapshot(snapshot);
for (const id of r.listRecords().map(x => x.constraint.id)) r.removeConstraint({ operationId: `remove-${id}`, constraintId: id });
assert.equal(r.assertBodyDetachable("a"), true);
engine.n.physicsBodyRegistry.removeBody({ operationId: "remove-body", bodyId: "a" });
unchanged(() => r.loadSnapshot(snapshot));
assert.equal(createConstraintsFixture().registry.listRecords().length, 0);
const replay = () => { const { registry } = createConstraintsFixture(); registry.defineConstraint(create); registry.transitionConstraint({ operationId: "disable", constraintId: "joint", status: "disabled" }); return registry.getSnapshot(); };
assert.deepEqual(replay(), replay());
console.log("Constraints registry: atomic failures, prototype-safe IDs, retries, revisions, terminal breaks, guards, snapshot recovery and deterministic replay passed");
