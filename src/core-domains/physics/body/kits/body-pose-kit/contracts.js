import { BODY_POSE_SCHEMA, normalizeBodyPose } from "../../body-contracts.js";

export { normalizeBodyPose };

export function bodyPoseContract() {
  return Object.freeze({
    schema: BODY_POSE_SCHEMA,
    positionUnits: "physics-world-units",
    rotationRepresentation: "normalized-canonical-quaternion-xyzw",
    spatialSynchronizationOwnedExternally: true
  });
}

