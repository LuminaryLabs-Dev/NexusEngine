import { COLLIDER_SCHEMAS, normalizeColliderIdentity } from "../../collider-contracts.js";

export { normalizeColliderIdentity };

export function colliderIdentityContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.identity,
    stableIdRequired: true,
    tagsSortedAndUnique: true,
    metadataMustBePortable: true,
    providerHandlesForbidden: true
  });
}
