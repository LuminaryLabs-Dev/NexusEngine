import { COLLIDER_SCHEMAS, normalizeColliderFilter } from "../../collider-contracts.js";

export { normalizeColliderFilter };

export function colliderFilterContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.filter,
    layerCapabilityRequired: true,
    maskCapabilityRequired: true,
    optionalGroupIdentity: true,
    exclusionsSortedAndUnique: true
  });
}
