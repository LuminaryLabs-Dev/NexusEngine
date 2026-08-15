import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { colliderFilterContract, normalizeColliderFilter } from "./contracts.js";

export function createColliderFilterKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "collider-filter-kit",
    domain: "physics-collider-filter",
    apiName: "physicsColliderFilter",
    requires: ["n:physics", "physics:collision-layer", "physics:collision-mask", "physics:collision-group"],
    provides: ["physics:collider-filter"],
    purpose: "Normalize provider-neutral collider layer, mask, group, and exclusion descriptors.",
    owns: ["collider filter descriptor", "collider exclusion normalization", "optional collision group reference"],
    doesNotOwn: ["collision group registry", "broad-phase filtering", "provider-native masks", "gameplay teams"],
    schema: COLLIDER_SCHEMAS.filter,
    contract: colliderFilterContract,
    normalize: normalizeColliderFilter
  });
}

export default createColliderFilterKit;
