import { createAtomicBodyKit } from "../../atomic-body-kit.js";
import { BODY_POSE_SCHEMA } from "../../body-contracts.js";
import { bodyPoseContract, normalizeBodyPose } from "./contracts.js";

export function createBodyPoseKit(config = {}) {
  return createAtomicBodyKit(config, {
    manifestId: "body-pose-kit",
    domain: "physics-body-pose",
    apiName: "physicsBodyPose",
    provides: ["physics:body-pose"],
    purpose: "Normalize portable body position and canonical quaternion orientation.",
    owns: ["body pose schema", "quaternion normalization", "signed-zero canonicalization"],
    doesNotOwn: ["Spatial transforms", "motion integration", "camera transforms", "provider handles"],
    schema: BODY_POSE_SCHEMA,
    contract: bodyPoseContract,
    normalize: normalizeBodyPose
  });
}

export default createBodyPoseKit;

