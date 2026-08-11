import { COLLIDER_SCHEMAS, normalizeCollisionGroup } from "../../collider-contracts.js";

export { normalizeCollisionGroup };

export function collisionGroupContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.group,
    stableIdRequired: true,
    layerCapabilityRequired: true,
    maskCapabilityRequired: true,
    metadataMustBePortable: true
  });
}
