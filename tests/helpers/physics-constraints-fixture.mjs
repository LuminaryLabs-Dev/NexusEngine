import { createEngine } from "nexusengine";
import { createPhysicsContractsDomain } from "../../src/core-domains/physics/contracts/index.js";
import { createPhysicsBodyDomain } from "../../src/core-domains/physics/body/index.js";
import { createPhysicsConstraintsDomain } from "../../src/core-domains/physics/constraints/index.js";

export function createConstraintsFixture() {
  const engine = createEngine({ kits: [...createPhysicsContractsDomain(), ...createPhysicsBodyDomain(), ...createPhysicsConstraintsDomain()] });
  for (const id of ["a", "b"]) engine.n.physicsBodyRegistry.defineBody({ operationId: `body-${id}`, body: { identity: { id }, type: { kind: "dynamic" } } });
  return { engine, registry: engine.n.physicsConstraintRegistry };
}
export const descriptor = (type = "hinge", id = "joint", extra = {}) => ({ type, id, bodyA: "a", bodyB: "b", ...extra });
