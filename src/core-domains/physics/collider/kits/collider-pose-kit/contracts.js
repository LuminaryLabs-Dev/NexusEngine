import { COLLIDER_SCHEMAS, normalizeColliderPose } from "../../collider-contracts.js";

export { normalizeColliderPose };

export function colliderPoseContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.pose,
    localSpaceOnly: true,
    normalizedQuaternion: true,
    finiteComponentsRequired: true,
    providerNeutral: true
  });
}
