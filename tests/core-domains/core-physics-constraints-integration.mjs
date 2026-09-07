import assert from "node:assert/strict";
import { createPhysicsConstraintsDomain, PHYSICS_CONSTRAINT_KIT_MANIFESTS } from "nexusengine/domains/physics/constraints";
import { createConstraintsFixture, descriptor } from "../helpers/physics-constraints-fixture.mjs";

const { engine } = createConstraintsFixture();
assert.ok(engine.n.paths().some(entry => entry.path === "n:physics:constraints"));
const snapshots = new Map();
for (const manifest of PHYSICS_CONSTRAINT_KIT_MANIFESTS) {
  const api = engine.n[manifest.apiName];
  assert.ok(api, manifest.id);
  assert.equal(engine.n.api(manifest.apiName).domainPath ?? engine.n.api(manifest.apiName).path, "n:physics:constraints");
  if (manifest.id === "constraint-break-kit") {
    assert.equal(api.evaluate({ enabled: true, torque: 5 }, { torque: 5 }).shouldBreak, true);
  } else if (manifest.id === "constraint-registry-kit") {
    assert.equal(api.defineConstraint({ operationId: "installed", constraint: descriptor() }).result.created, true);
  } else {
    const type = manifest.id.replace(/-constraint-kit$/, "");
    assert.equal(api.normalize(descriptor(type)).type, type);
    assert.equal(api.inspect({}).valid, false);
  }
  const before = api.getSnapshot();
  for (const mutation of ["update", "applyCommand", "configure", "setDescriptor"]) {
    assert.throws(() => api[mutation]({ sequence: -1 }, () => ({ patch: {} })), /raw mutation/);
    assert.deepEqual(api.getSnapshot(), before);
  }
  assert.throws(() => api.loadSnapshot({ ...before, id: "another-kit" }));
  assert.deepEqual(api.getSnapshot(), before);
  api.reset(); api.loadSnapshot(before);
  assert.deepEqual(api.getSnapshot(), before);
  snapshots.set(manifest.apiName, before);
}
const kitCount = engine.kits.length;
for (const kit of createPhysicsConstraintsDomain()) engine.installKit(kit);
assert.equal(engine.kits.length, kitCount);
for (const [apiName, snapshot] of snapshots) assert.deepEqual(engine.n[apiName].getSnapshot(), snapshot);
assert.equal(createConstraintsFixture().registry.listConstraints().length, 0);
console.log("Constraints integration: twelve installed kits, public discovery, direct behavior, duplicate installation, snapshot identity, reset/load and isolated instances passed");
