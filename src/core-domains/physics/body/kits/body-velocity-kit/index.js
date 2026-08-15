import { createAtomicBodyKit } from "../../atomic-body-kit.js";
import { BODY_VELOCITY_SCHEMA } from "../../body-contracts.js";
import { bodyVelocityContract, normalizeBodyVelocity } from "./contracts.js";

export function createBodyVelocityKit(config = {}) {
  return createAtomicBodyKit(config, {
    manifestId: "body-velocity-kit",
    domain: "physics-body-velocity",
    apiName: "physicsBodyVelocity",
    provides: ["physics:body-velocity"],
    purpose: "Normalize finite linear and angular Physics body velocities.",
    owns: ["linear velocity descriptor", "angular velocity descriptor"],
    doesNotOwn: ["time integration", "constraints", "locomotion intent", "provider stepping"],
    schema: BODY_VELOCITY_SCHEMA,
    contract: bodyVelocityContract,
    normalize: normalizeBodyVelocity
  });
}

export default createBodyVelocityKit;

