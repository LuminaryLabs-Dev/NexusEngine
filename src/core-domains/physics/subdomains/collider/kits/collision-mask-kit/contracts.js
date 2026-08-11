import { COLLIDER_SCHEMAS, normalizeCollisionMask } from "../../collider-contracts.js";

export { normalizeCollisionMask };

export function collisionMaskContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.mask,
    maximumLayer: 31,
    layersSortedAndUnique: true,
    derivedBitsMustMatch: true,
    providerNeutral: true
  });
}
