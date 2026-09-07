import assert from "node:assert/strict";
import { PHYSICS_CONSTRAINT_KIT_MANIFESTS } from "nexusengine/domains/physics/constraints";
import { createEngine } from "nexusengine";
import { createPhysicsContractsDomain } from "nexusengine/domains/physics/contracts";
import { createPhysicsBodyDomain } from "nexusengine/domains/physics/body";
import { descriptor } from "../helpers/physics-constraints-fixture.mjs";

const kits = [];
for (const manifest of PHYSICS_CONSTRAINT_KIT_MANIFESTS) {
  const entry = await import(`nexusengine${manifest.source.publicSubpath.slice(1)}`);
  assert.equal(typeof entry[manifest.source.exportName], "function", manifest.source.publicSubpath);
  kits.push(entry[manifest.source.exportName]());
}
assert.equal(kits.length, 12);
const engine = createEngine({ kits: [...createPhysicsContractsDomain(), ...createPhysicsBodyDomain(), ...kits] });
for (const id of ["a", "b"]) engine.n.physicsBodyRegistry.defineBody({ operationId: `body-${id}`, body: { identity: { id } } });
engine.n.physicsConstraintRegistry.defineConstraint({ operationId: "public", constraint: descriptor("distance") });
assert.equal(engine.n.physicsConstraintRegistry.getConstraint("joint").parameters.maximumDistance, 1);
console.log("Constraints public exports: all twelve independent factories install and execute through Engine APIs");
