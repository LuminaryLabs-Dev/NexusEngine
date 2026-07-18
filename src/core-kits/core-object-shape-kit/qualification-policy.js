import {
  createObjectShapeQualification,
  qualifyObjectShapeCandidate as qualifyCandidateBase
} from "./qualification.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function withSafeDefaults(profile = {}, target = {}) {
  const skinned = Boolean(profile.preserve?.skinning)
    || String(target.qualification?.mode ?? profile.qualification?.mode ?? "").includes("skinned");
  if (skinned) return { profile: clone(profile), target: clone(target), skinned: true };
  return {
    skinned: false,
    profile: {
      ...clone(profile),
      qualification: {
        ...clone(profile.qualification ?? {}),
        deformation: {
          enabled: false,
          ...clone(profile.qualification?.deformation ?? {})
        },
        silhouette: {
          enabled: false,
          ...clone(profile.qualification?.silhouette ?? {})
        }
      }
    },
    target: clone(target)
  };
}

function hasDeterministicPoseSuite(source = {}) {
  const skinning = source.metadata?.skinning ?? source.metadata?.deformation;
  const poses = skinning?.validationPoses ?? skinning?.poses;
  return Array.isArray(poses) && poses.length > 0;
}

export function qualifyObjectShapeCandidate(input = {}) {
  const normalized = withSafeDefaults(input.profile, input.target);
  if (!normalized.skinned || hasDeterministicPoseSuite(input.source)) {
    return qualifyCandidateBase({
      ...input,
      profile: normalized.profile,
      target: normalized.target
    });
  }

  const provisional = qualifyCandidateBase({
    ...input,
    profile: {
      ...normalized.profile,
      qualification: {
        ...clone(normalized.profile.qualification ?? {}),
        deformation: {
          ...clone(normalized.profile.qualification?.deformation ?? {}),
          enabled: false
        },
        silhouette: {
          ...clone(normalized.profile.qualification?.silhouette ?? {}),
          enabled: false
        }
      }
    },
    target: normalized.target
  });
  const failure = {
    check: "pose-suite",
    message: "Safe skinned qualification requires at least one deterministic validation pose."
  };
  return createObjectShapeQualification({
    ...provisional,
    status: "rejected",
    deformation: {
      status: "failed",
      poseCount: 0,
      failures: [failure]
    },
    failures: [...(provisional.failures ?? []), failure],
    metadata: {
      ...clone(provisional.metadata ?? {}),
      policy: "safe-skinned-requires-deterministic-poses"
    }
  });
}
