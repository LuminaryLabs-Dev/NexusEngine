import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { collisionMaskContract, normalizeCollisionMask } from "./contracts.js";

export function createCollisionMaskKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "collision-mask-kit",
    domain: "physics-collision-mask",
    apiName: "physicsCollisionMask",
    provides: ["physics:collision-mask"],
    purpose: "Normalize a deterministic bounded set of collision layers and its portable bit value.",
    owns: ["collision mask layers", "portable collision mask bit derivation"],
    doesNotOwn: ["collision filtering policy", "provider-native masks", "collision detection", "gameplay factions"],
    schema: COLLIDER_SCHEMAS.mask,
    contract: collisionMaskContract,
    normalize: normalizeCollisionMask
  });
}

export default createCollisionMaskKit;
