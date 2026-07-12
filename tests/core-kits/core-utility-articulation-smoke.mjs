import assert from "node:assert/strict";
import {
  solveTwoBoneIK
} from "../../src/core-kits/core-utility-kit/two-bone-ik-utility-kit.js";
import {
  quatFromUnitVectors,
  quatRotateVector,
  quatSlerp
} from "../../src/core-kits/core-utility-kit/quaternion-utility-kit.js";

const solution = solveTwoBoneIK({
  root: { x: 0, y: 0, z: 0 },
  target: { x: 0.5, y: -1.4, z: 0.2 },
  upperLength: 1,
  lowerLength: 1,
  poleDirection: { x: 0, y: 0, z: 1 }
});

assert.ok(Math.abs(Math.hypot(
  solution.mid.x - solution.root.x,
  solution.mid.y - solution.root.y,
  solution.mid.z - solution.root.z
) - 1) < 1e-6);
assert.ok(Math.abs(Math.hypot(
  solution.end.x - solution.mid.x,
  solution.end.y - solution.mid.y,
  solution.end.z - solution.mid.z
) - 1) < 1e-6);
assert.ok(Object.values(solution.bendNormal).every(Number.isFinite));

const quarterTurn = quatFromUnitVectors(
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 }
);
const rotated = quatRotateVector(quarterTurn, { x: 1, y: 0, z: 0 });
assert.ok(Math.abs(rotated.x) < 1e-6);
assert.ok(Math.abs(rotated.y - 1) < 1e-6);

const halfway = quatSlerp({ x: 0, y: 0, z: 0, w: 1 }, quarterTurn, 0.5);
assert.ok(Object.values(halfway).every(Number.isFinite));

console.log("core utility articulation smoke ok");
