import { COLLIDER_SCHEMAS, normalizeColliderAttachment } from "../../collider-contracts.js";

export { normalizeColliderAttachment };

export function colliderAttachmentContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.attachment,
    stableBodyIdRequired: true,
    stableShapeIdRequired: true,
    optionalBodyRevisionGuard: true,
    shapeReferenceUsesStableIdOnly: true,
    validatesExistenceAtRegistryBoundary: true
  });
}
