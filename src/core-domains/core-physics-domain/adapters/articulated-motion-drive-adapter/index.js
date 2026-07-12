import {
  motionQuaternion
} from "../../../../core-kits/core-motion-kit/contracts.js";
import {
  quatSlerp
} from "../../../../core-kits/core-utility-kit/quaternion-utility-kit.js";
import {
  createJointMotorRequest
} from "../../subdomains/articulated-dynamics-domain/contracts.js";

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

export function createArticulatedMotionDriveAdapter(config = {}) {
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
    drive({ articulation, pose, corePhysics, tickId, motor } = {}) {
      if (!corePhysics?.submitJointMotorRequests) {
        throw new TypeError("Physical articulation drive requires Core Physics joint-motor support.");
      }
      const requests = poseToMotorRequests({ articulation, pose, tickId, motor });
      corePhysics.submitJointMotorRequests(requests);
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

export default createArticulatedMotionDriveAdapter;
