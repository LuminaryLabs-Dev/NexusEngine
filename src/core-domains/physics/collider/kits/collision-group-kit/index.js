import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { collisionGroupContract, normalizeCollisionGroup } from "./contracts.js";

export function createCollisionGroupKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "collision-group-kit",
    domain: "physics-collision-group",
    apiName: "physicsCollisionGroup",
    requires: ["n:physics", "physics:collision-layer", "physics:collision-mask"],
    provides: ["physics:collision-group"],
    purpose: "Normalize a named collision layer-and-mask policy descriptor.",
    owns: ["collision group identity", "collision group layer and mask descriptor", "portable group metadata"],
    doesNotOwn: ["group registry state", "provider handles", "collision detection", "gameplay factions"],
    schema: COLLIDER_SCHEMAS.group,
    contract: collisionGroupContract,
    normalize: normalizeCollisionGroup
  });
}

export default createCollisionGroupKit;
