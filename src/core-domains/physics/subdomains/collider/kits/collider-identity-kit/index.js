import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { colliderIdentityContract, normalizeColliderIdentity } from "./contracts.js";

export function createColliderIdentityKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "collider-identity-kit",
    domain: "physics-collider-identity",
    apiName: "physicsColliderIdentity",
    provides: ["physics:collider-identity"],
    purpose: "Normalize stable portable Physics collider identity, tags, and metadata.",
    owns: ["collider identity validation", "collider tag normalization", "portable collider metadata"],
    doesNotOwn: ["collider records", "provider handles", "collision detection", "gameplay identity"],
    schema: COLLIDER_SCHEMAS.identity,
    contract: colliderIdentityContract,
    normalize: normalizeColliderIdentity
  });
}

export default createColliderIdentityKit;
