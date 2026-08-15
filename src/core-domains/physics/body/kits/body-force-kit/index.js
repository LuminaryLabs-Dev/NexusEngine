import { createAtomicBodyKit } from "../../atomic-body-kit.js";
import { BODY_FORCE_SCHEMA } from "../../body-contracts.js";
import { bodyForceContract, normalizeBodyForce } from "./contracts.js";

export function createBodyForceKit(config = {}) {
  return createAtomicBodyKit(config, {
    manifestId: "body-force-kit",
    domain: "physics-body-force",
    apiName: "physicsBodyForce",
    provides: ["physics:body-force"],
    purpose: "Normalize portable force, torque, and impulse accumulator descriptors.",
    owns: ["force descriptor", "torque descriptor", "impulse descriptors"],
    doesNotOwn: ["force integration", "field sampling", "solver execution", "gameplay actions"],
    schema: BODY_FORCE_SCHEMA,
    contract: bodyForceContract,
    normalize: normalizeBodyForce
  });
}

export default createBodyForceKit;

