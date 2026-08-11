import { createAtomicBodyKit } from "../../atomic-body-kit.js";
import { BODY_INERTIA_SCHEMA } from "../../body-contracts.js";
import { bodyInertiaContract, normalizeBodyInertia } from "./contracts.js";

export function createBodyInertiaKit(config = {}) {
  return createAtomicBodyKit(config, {
    manifestId: "body-inertia-kit",
    domain: "physics-body-inertia",
    apiName: "physicsBodyInertia",
    provides: ["physics:body-inertia"],
    purpose: "Normalize principal inertia, inverse inertia, and local inertia orientation.",
    owns: ["principal inertia descriptor", "inverse inertia derivation", "inertia orientation"],
    doesNotOwn: ["shape-derived tensor estimation", "angular integration", "constraints", "provider tensors"],
    schema: BODY_INERTIA_SCHEMA,
    contract: bodyInertiaContract,
    normalize: normalizeBodyInertia
  });
}

export default createBodyInertiaKit;

