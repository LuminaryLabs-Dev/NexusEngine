import {
  COLLIDER_SCHEMAS,
  normalizeCollider,
  normalizeColliderDefinitionCommand,
  normalizeColliderLifecycleCommand,
  normalizeColliderRecord,
  normalizeColliderRegistrySnapshot,
  normalizeColliderRemovalCommand,
  normalizeColliderReplacementCommand
} from "../../collider-contracts.js";

export {
  normalizeCollider,
  normalizeColliderDefinitionCommand,
  normalizeColliderLifecycleCommand,
  normalizeColliderRecord,
  normalizeColliderRegistrySnapshot,
  normalizeColliderRemovalCommand,
  normalizeColliderReplacementCommand
};

export function colliderRegistryContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.record,
    soleMutableColliderOwner: true,
    exactOnceCommands: true,
    sameIdentityDifferentContentIsConflict: true,
    bodyShapeAndMaterialReferencesRequired: true,
    recordsSortedByColliderId: true,
    collisionExecutionForbidden: true,
    providerHandlesForbidden: true
  });
}
