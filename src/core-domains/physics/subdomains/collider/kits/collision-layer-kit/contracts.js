import { COLLIDER_SCHEMAS, normalizeCollisionLayer } from "../../collider-contracts.js";

export { normalizeCollisionLayer };

export function collisionLayerContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.layer,
    minimumLayer: 0,
    maximumLayer: 31,
    integerOnly: true,
    providerNeutral: true
  });
}
