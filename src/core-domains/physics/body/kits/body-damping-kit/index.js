import { createAtomicBodyKit } from "../../atomic-body-kit.js";
import { BODY_DAMPING_SCHEMA } from "../../body-contracts.js";
import { bodyDampingContract, normalizeBodyDamping } from "./contracts.js";

export function createBodyDampingKit(config = {}) {
  return createAtomicBodyKit(config, {
    manifestId: "body-damping-kit",
    domain: "physics-body-damping",
    apiName: "physicsBodyDamping",
    provides: ["physics:body-damping"],
    purpose: "Normalize finite nonnegative linear and angular damping descriptors.",
    owns: ["linear damping descriptor", "angular damping descriptor"],
    doesNotOwn: ["velocity integration", "drag fields", "material friction", "provider execution"],
    schema: BODY_DAMPING_SCHEMA,
    contract: bodyDampingContract,
    normalize: normalizeBodyDamping
  });
}

export default createBodyDampingKit;

