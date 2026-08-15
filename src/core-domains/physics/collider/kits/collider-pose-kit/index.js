import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { colliderPoseContract, normalizeColliderPose } from "./contracts.js";

export function createColliderPoseKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "collider-pose-kit",
    domain: "physics-collider-pose",
    apiName: "physicsColliderPose",
    provides: ["physics:collider-pose"],
    purpose: "Normalize provider-neutral collider-local position and orientation descriptors.",
    owns: ["collider-local position", "collider-local orientation", "pose normalization"],
    doesNotOwn: ["body world pose", "motion integration", "provider transforms", "render transforms"],
    schema: COLLIDER_SCHEMAS.pose,
    contract: colliderPoseContract,
    normalize: normalizeColliderPose
  });
}

export default createColliderPoseKit;
