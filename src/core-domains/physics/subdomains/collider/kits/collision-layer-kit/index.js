import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { collisionLayerContract, normalizeCollisionLayer } from "./contracts.js";

export function createCollisionLayerKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "collision-layer-kit",
    domain: "physics-collision-layer",
    apiName: "physicsCollisionLayer",
    provides: ["physics:collision-layer"],
    purpose: "Normalize one bounded provider-neutral collision layer.",
    owns: ["collision layer range", "collision layer normalization"],
    doesNotOwn: ["collision filtering policy", "provider filter bits", "collision detection", "gameplay teams"],
    schema: COLLIDER_SCHEMAS.layer,
    contract: collisionLayerContract,
    normalize: normalizeCollisionLayer
  });
}

export default createCollisionLayerKit;
