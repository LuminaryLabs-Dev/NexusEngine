import assert from "node:assert/strict";
import {
  CONSTRAINT_TYPES, normalizeConstraintDescriptor as normalize, normalizeConstraintAxis,
  normalizeConstraintQuaternion, normalizeConstraintVector, normalizeConstraintBreakMeasurement,
  normalizeConstraintRecord, evaluateConstraintBreak
} from "../../src/core-domains/physics/constraints/constraints-contracts.js";
import { descriptor } from "../helpers/physics-constraints-fixture.mjs";

for (const type of CONSTRAINT_TYPES) {
  const input = descriptor(type, type, { frames: { bodyA: { position: [1, 2, 3], rotation: [0, 0, 0, -2] } } });
  const before = structuredClone(input), result = normalize(input);
  assert.deepEqual(input, before);
  assert.deepEqual(result.frames.bodyA.position, [1, 2, 3]);
  assert.deepEqual(result.frames.bodyA.rotation, [0, 0, 0, 1]);
  assert.deepEqual(normalize(result), result);
  for (const patch of [{ id: "" }, { bodyB: "a" }, { bodyA: null }, { type: "constructor" }, { extra: true }, { schema: "future" }, { parameters: { unknown: 1 } }, { frames: { bodyB: { position: [Infinity, 0, 0] } } }]) {
    assert.throws(() => normalize({ ...input, ...patch }), TypeError, `${type}: ${JSON.stringify(patch)}`);
  }
}
for (const vector of [[Number.MAX_VALUE, Number.MAX_VALUE, 0], [1e308, 0, 1e308]]) {
  assert.ok(Math.abs(Math.hypot(...normalizeConstraintAxis(vector, "axis")) - 1) < 1e-14);
}
const q = normalizeConstraintQuaternion([Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], "rotation");
assert.deepEqual(q, [0.5, 0.5, 0.5, 0.5]);
assert.throws(() => normalizeConstraintAxis([0, 0, 0], "axis"));
assert.throws(() => normalizeConstraintQuaternion([0, 0, 0, 0], "rotation"));
assert.throws(() => normalizeConstraintVector(new Array(3), "vector"));
assert.throws(() => normalize(descriptor("hinge", "sparse", { parameters: { axisA: [1, , 0] } })));
assert.throws(() => normalizeConstraintBreakMeasurement({ tickId: Number.MAX_SAFE_INTEGER + 1 }));
assert.throws(() => normalizeConstraintRecord({ constraint: descriptor(), revision: Number.MAX_SAFE_INTEGER + 1 }));

const invalid = [
  ["distance", { minimumDistance: 2, maximumDistance: 1 }], ["distance", { minimumDistance: -1 }],
  ["hinge", { axisA: [0, 0, 0] }], ["slider", { axisB: [0, 0, 0] }],
  ["cone-twist", { coneAngle: Math.PI + 1 }], ["cone-twist", { twistMinimum: 1, twistMaximum: -1 }],
  ["spring", { rest: -1 }], ["spring", { stiffness: 0 }], ["spring", { damping: -1 }],
  ["limit", { minimum: 2, maximum: 1 }], ["limit", { mode: "other" }],
  ["motor", { mode: "linear", maxTorque: 2 }], ["motor", { targetVelocity: NaN }],
  ["drive", { mode: "angular", maxForce: 2 }], ["drive", { stiffness: -1 }]
];
for (const [type, parameters] of invalid) assert.throws(() => normalize(descriptor(type, "invalid", { parameters })));
for (const type of ["spring", "limit", "motor", "drive"]) for (const mode of ["linear", "angular"]) {
  assert.equal(normalize(descriptor(type, type, { parameters: { mode } })).parameters.mode, mode);
}
const policy = { enabled: true, force: 10, torque: 20 };
assert.equal(evaluateConstraintBreak(policy, { force: 9, torque: 19 }).shouldBreak, false);
assert.equal(evaluateConstraintBreak(policy, { force: 10 }).forceExceeded, true);
assert.equal(evaluateConstraintBreak(policy, { torque: 20 }).torqueExceeded, true);
assert.equal(evaluateConstraintBreak(policy, { force: 11, torque: 21 }).shouldBreak, true);
assert.equal(evaluateConstraintBreak({}, { force: 1000 }).shouldBreak, false);
assert.throws(() => evaluateConstraintBreak({ enabled: false, force: 1 }, {}));
assert.throws(() => evaluateConstraintBreak({ enabled: true }, {}));
console.log("Constraints descriptors: all ten types, units/defaults, boundaries, portability, large finite normalization and break thresholds passed");
