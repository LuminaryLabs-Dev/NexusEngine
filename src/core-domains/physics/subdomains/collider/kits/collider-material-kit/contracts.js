import { COLLIDER_SCHEMAS, normalizeColliderMaterial } from "../../collider-contracts.js";

export { normalizeColliderMaterial };

export function colliderMaterialContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.material,
    stableMaterialIdRequired: true,
    validatesExistenceAtRegistryBoundary: true,
    visualMaterialForbidden: true,
    providerNeutral: true
  });
}
