import {
  motionQuaternion
} from "../../../motion/kits/motion-kit/contracts.js";
import {
  quatSlerp
} from "nexusengine/domains/spatial/quaternion-math";
import {
  createJointMotorRequest
} from "../../articulated-dynamics-domain/contracts.js";
import { createDomainKit } from "../../../../domain-kit.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function blendNumber(left, right, weight) {
  return Number(left ?? 0) + (Number(right ?? left ?? 0) - Number(left ?? 0)) * weight;
}

function normalizePose(input = {}) {
  return {
    ...clone(input),
    bones: clone(input.bones ?? {})
  };
}

export function createArticulatedMotionDriveOperations(config = {}) {
  const poseToMotorRequests = ({ articulation, pose, tickId = "physical-articulation", motor = {} } = {}) => {
    if (!articulation?.id) throw new TypeError("poseToMotorRequests requires an articulation descriptor.");
    const sourcePose = normalizePose(pose);
    return (articulation.joints ?? []).flatMap((joint, index) => {
      const boneId = joint.childBoneId ?? joint.metadata?.boneId;
      const transform = boneId ? sourcePose.bones?.[boneId] : null;
      if (!transform?.rotation) return [];
      return [createJointMotorRequest({
        id: `${tickId}:${joint.id}`,
        articulationId: articulation.id,
        jointId: joint.id,
        targetRotation: motionQuaternion(transform.rotation),
        mode: motor.mode ?? "position",
        stiffness: motor.stiffness ?? config.stiffness ?? 120,
        damping: motor.damping ?? config.damping ?? 18,
        maximumForce: motor.maximumForce ?? motor.maximumTorque ?? config.maximumForce ?? 80,
        metadata: { boneId, index }
      }, index)];
    });
  };

  return Object.freeze({
    id: config.id ?? "articulated-motion-drive-adapter",
    poseToMotorRequests,
    drive({ articulation, pose, physics, tickId, motor } = {}) {
      if (!physics?.submitJointMotorRequests) {
        throw new TypeError("Physical articulation drive requires Core Physics joint-motor support.");
      }
      const requests = poseToMotorRequests({ articulation, pose, tickId, motor });
      physics.submitJointMotorRequests(requests);
      return clone(requests);
    },
    blendPhysicalPose({ targetPose, physicalPose, weight = 1 } = {}) {
      const blend = Math.max(0, Math.min(1, Number(weight) || 0));
      const target = normalizePose(targetPose);
      const physical = normalizePose(physicalPose);
      const bones = { ...target.bones };
      for (const [boneId, physicalTransform] of Object.entries(physical.bones ?? {})) {
        const targetTransform = target.bones?.[boneId] ?? {};
        bones[boneId] = {
          ...targetTransform,
          ...physicalTransform,
          position: physicalTransform.position == null
            ? targetTransform.position ?? null
            : {
                x: blendNumber(targetTransform.position?.x, physicalTransform.position.x, blend),
                y: blendNumber(targetTransform.position?.y, physicalTransform.position.y, blend),
                z: blendNumber(targetTransform.position?.z, physicalTransform.position.z, blend)
              },
          rotation: physicalTransform.rotation == null
            ? targetTransform.rotation ?? null
            : quatSlerp(
                motionQuaternion(targetTransform.rotation),
                motionQuaternion(physicalTransform.rotation),
                blend
              ),
          physicalWeight: blend
        };
      }
      return {
        ...target,
        id: `${target.id ?? "pose"}:physical-blend`,
        bones,
        metadata: {
          ...(target.metadata ?? {}),
          physicalBlendWeight: blend
        }
      };
    }
  });
}

export function createArticulatedMotionDriveAdapter(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "articulated-motion-drive-adapter-kit",
    id: "articulated-motion-drive-adapter-kit",
    domain: "articulated-motion-drive",
    domainPath: "n:simulation:physics:articulated",
    parentDomainPath: "n:simulation:physics",
    apiName: "articulatedMotionDrive",
    requires: ["motion:articulated-plan", "physics:articulated-dynamics"],
    provides: ["simulation:articulated-drive-adapter"],
    purpose: "Translate articulated Motion plans into backend-neutral Physics drive requests.",
    createApi: () => createArticulatedMotionDriveOperations(config)
  });
}

export default createArticulatedMotionDriveAdapter;
