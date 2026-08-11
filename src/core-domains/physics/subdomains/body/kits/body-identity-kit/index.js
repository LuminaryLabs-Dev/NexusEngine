import { createAtomicBodyKit } from "../../atomic-body-kit.js";
import { BODY_IDENTITY_SCHEMA } from "../../body-contracts.js";
import { bodyIdentityContract, normalizeBodyIdentity } from "./contracts.js";

export function createBodyIdentityKit(config = {}) {
  return createAtomicBodyKit(config, {
    manifestId: "body-identity-kit",
    domain: "physics-body-identity",
    apiName: "physicsBodyIdentity",
    provides: ["physics:body-identity"],
    purpose: "Normalize stable portable Physics body identity, tags, and metadata.",
    owns: ["body identity validation", "body tag normalization", "portable identity metadata"],
    doesNotOwn: ["body lifecycle", "provider handles", "colliders", "gameplay identity"],
    schema: BODY_IDENTITY_SCHEMA,
    contract: bodyIdentityContract,
    normalize: normalizeBodyIdentity
  });
}

export default createBodyIdentityKit;

