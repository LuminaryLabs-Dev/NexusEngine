import {
  motionQuaternion,
  motionVector3
} from "../../../../core-kits/core-motion-kit/contracts.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

export function createArticulatedRigDescriptor(input = {}) {
  const id = text(input.id, null, "Articulated rig id");
  const bones = (Array.isArray(input.bones) ? input.bones : []).map((bone, index) => ({
    id: text(bone?.id, `${id}:bone:${index}`, "Articulated bone id"),
    parentId: bone?.parentId == null ? null : String(bone.parentId),
    restPosition: motionVector3(bone?.restPosition ?? bone?.position),
    restRotation: motionQuaternion(bone?.restRotation ?? bone?.rotation),
    metadata: clone(bone?.metadata ?? {})
  }));
  const rootBoneId = text(input.rootBoneId ?? bones.find((bone) => bone.parentId == null)?.id, null, "Articulated rig rootBoneId");
  const chains = Object.fromEntries(
    Object.entries(input.chains ?? {}).map(([chainId, chain]) => [
      chainId,
      {
        id: String(chain?.id ?? chainId),
        bones: (Array.isArray(chain?.bones) ? chain.bones : []).map(String),
        solver: String(chain?.solver ?? "two-bone"),
        poleDirection: motionVector3(chain?.poleDirection ?? chain?.pole, { x: 0, y: 1, z: 0 }),
        lengths: chain?.lengths == null
          ? null
          : {
              upper: Math.max(0, finite(chain.lengths.upper, 0)),
              lower: Math.max(0, finite(chain.lengths.lower, 0))
            },
        jointLimits: clone(chain?.jointLimits ?? {}),
        metadata: clone(chain?.metadata ?? {})
      }
    ])
  );
  return {
    schema: "nexus-articulated-rig/1",
    id,
    rootBoneId,
    bones,
    chains,
    metadata: clone(input.metadata ?? {})
  };
}

export function validateArticulatedRigDescriptor(rig) {
  const issues = [];
  if (rig?.schema !== "nexus-articulated-rig/1") issues.push("schema must be nexus-articulated-rig/1");
  if (!rig?.id) issues.push("id is required");
  if (!Array.isArray(rig?.bones) || rig.bones.length === 0) issues.push("bones are required");
  const boneIds = new Set((rig?.bones ?? []).map((bone) => bone.id));
  if (!boneIds.has(rig?.rootBoneId)) issues.push("rootBoneId must reference a bone");
  for (const bone of rig?.bones ?? []) {
    if (bone.parentId != null && !boneIds.has(bone.parentId)) issues.push(`bone ${bone.id} has missing parent ${bone.parentId}`);
  }
  for (const [chainId, chain] of Object.entries(rig?.chains ?? {})) {
    if (!Array.isArray(chain.bones) || chain.bones.length < 2) issues.push(`chain ${chainId} requires at least two bones`);
    for (const boneId of chain.bones ?? []) {
      if (!boneIds.has(boneId)) issues.push(`chain ${chainId} references missing bone ${boneId}`);
    }
  }
  return { valid: issues.length === 0, issues };
}

export function createArticulatedPoseDescriptor(input = {}) {
  const rigId = text(input.rigId, null, "Articulated pose rigId");
  return {
    schema: "nexus-articulated-pose/1",
    id: text(input.id, `${rigId}:pose`, "Articulated pose id"),
    rigId,
    bones: Object.fromEntries(
      Object.entries(input.bones ?? {}).map(([boneId, transform]) => [
        boneId,
        {
          position: transform?.position == null ? null : motionVector3(transform.position),
          rotation: transform?.rotation == null
            ? motionQuaternion(transform?.rotationQuaternion ?? transform?.rotation)
            : motionQuaternion(transform.rotation),
          weight: Math.max(0, Math.min(1, finite(transform?.weight, 1))),
          metadata: clone(transform?.metadata ?? {})
        }
      ])
    ),
    metadata: clone(input.metadata ?? {})
  };
}

export function createArticulatedTargetDescriptor(input = {}) {
  const rigId = text(input.rigId, null, "Articulated target rigId");
  const chainId = text(input.chainId, null, "Articulated target chainId");
  return {
    schema: "nexus-articulated-target/1",
    id: text(input.id, `${rigId}:${chainId}:target`, "Articulated target id"),
    rigId,
    chainId,
    position: motionVector3(input.position ?? input.target),
    poleDirection: input.poleDirection == null ? null : motionVector3(input.poleDirection),
    weight: Math.max(0, Math.min(1, finite(input.weight, 1))),
    metadata: clone(input.metadata ?? {})
  };
}

export function createArticulatedMotionFrame(input = {}) {
  const tickId = text(input.tickId ?? input.stepId, "articulated-motion-frame", "Articulated motion frame tickId");
  return {
    schema: "nexus-articulated-motion-frame/1",
    id: text(input.id, tickId, "Articulated motion frame id"),
    tickId,
    frame: Math.max(0, Math.floor(finite(input.frame, 0))),
    rigId: text(input.rigId, null, "Articulated motion frame rigId"),
    sourcePoseId: input.sourcePoseId == null ? null : String(input.sourcePoseId),
    pose: clone(input.pose ?? null),
    targets: clone(input.targets ?? []),
    diagnostics: clone(input.diagnostics ?? []),
    metadata: clone(input.metadata ?? {})
  };
}
