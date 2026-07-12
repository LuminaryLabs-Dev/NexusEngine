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

export function createPhysicalBodyDescriptor(input = {}, index = 0) {
  return {
    id: text(input.id ?? input.bodyId, `body-${index}`, "Articulated body id"),
    boneId: input.boneId == null ? null : String(input.boneId),
    kind: String(input.kind ?? "dynamic"),
    mass: Math.max(0, finite(input.mass, 1)),
    transform: {
      position: motionVector3(input.transform?.position ?? input.position),
      rotation: motionQuaternion(input.transform?.rotation ?? input.rotation)
    },
    collider: clone(input.collider ?? input.collision ?? null),
    tags: (Array.isArray(input.tags) ? input.tags : []).map(String),
    metadata: clone(input.metadata ?? {})
  };
}

export function createPhysicalJointDescriptor(input = {}, index = 0) {
  const id = text(input.id ?? input.jointId ?? input.constraintId, `joint-${index}`, "Physical joint id");
  return {
    schema: "nexus-physical-joint/1",
    id,
    articulationId: text(input.articulationId, null, "Physical joint articulationId"),
    parentBodyId: text(input.parentBodyId, null, "Physical joint parentBodyId"),
    childBodyId: text(input.childBodyId, null, "Physical joint childBodyId"),
    childBoneId: input.childBoneId == null ? null : String(input.childBoneId),
    type: String(input.type ?? input.kind ?? "fixed"),
    anchorA: motionVector3(input.anchorA),
    anchorB: motionVector3(input.anchorB),
    axis: motionVector3(input.axis, { x: 1, y: 0, z: 0 }),
    limits: input.limits == null
      ? null
      : {
          minimum: finite(input.limits.minimum ?? input.limits.min, 0),
          maximum: finite(input.limits.maximum ?? input.limits.max, 0)
        },
    metadata: clone(input.metadata ?? {})
  };
}

export function createPhysicalArticulationDescriptor(input = {}) {
  const id = text(input.id ?? input.articulationId, null, "Physical articulation id");
  const bodies = (Array.isArray(input.bodies) ? input.bodies : []).map(createPhysicalBodyDescriptor);
  const joints = (Array.isArray(input.joints ?? input.constraints) ? input.joints ?? input.constraints : [])
    .map((joint, index) => createPhysicalJointDescriptor({ ...joint, articulationId: joint?.articulationId ?? id }, index));
  return {
    schema: "nexus-physical-articulation/1",
    id,
    rigId: input.rigId == null ? null : String(input.rigId),
    bodies,
    joints,
    ragdollWeight: Math.max(0, Math.min(1, finite(input.ragdollWeight, 0))),
    metadata: clone(input.metadata ?? {})
  };
}

export function validatePhysicalArticulationDescriptor(value) {
  const issues = [];
  if (value?.schema !== "nexus-physical-articulation/1") issues.push("schema must be nexus-physical-articulation/1");
  if (!value?.id) issues.push("id is required");
  if (!Array.isArray(value?.bodies)) issues.push("bodies must be an array");
  const bodyIds = new Set((value?.bodies ?? []).map((body) => body.id));
  for (const joint of value?.joints ?? []) {
    if (!bodyIds.has(joint.parentBodyId)) issues.push(`joint ${joint.id} has missing parent body ${joint.parentBodyId}`);
    if (!bodyIds.has(joint.childBodyId)) issues.push(`joint ${joint.id} has missing child body ${joint.childBodyId}`);
  }
  return { valid: issues.length === 0, issues };
}

export function createJointMotorRequest(input = {}, index = 0) {
  const jointId = text(input.jointId ?? input.constraintId, null, "Joint motor jointId");
  const request = {
    schema: "nexus-joint-motor-request/1",
    id: text(input.id, `${jointId}:motor:${index}`, "Joint motor request id"),
    articulationId: input.articulationId == null ? null : String(input.articulationId),
    jointId,
    mode: String(input.mode ?? (input.targetVelocity == null ? "position" : "velocity")),
    stiffness: Math.max(0, finite(input.stiffness, 120)),
    damping: Math.max(0, finite(input.damping, 18)),
    maximumForce: Math.max(0, finite(input.maximumForce ?? input.maximumTorque, 80)),
    metadata: clone(input.metadata ?? {})
  };
  if (input.targetRotation != null) request.targetRotation = motionQuaternion(input.targetRotation);
  if (input.targetPosition != null) request.targetPosition = finite(input.targetPosition, 0);
  if (input.targetVelocity != null) request.targetVelocity = finite(input.targetVelocity, 0);
  return request;
}

export function createArticulatedDynamicsFrame(input = {}) {
  const tickId = text(input.tickId ?? input.stepId, "articulated-dynamics-frame", "Articulated dynamics frame tickId");
  return {
    schema: "nexus-articulated-dynamics-frame/1",
    id: text(input.id, tickId, "Articulated dynamics frame id"),
    tickId,
    frame: Math.max(0, Math.floor(finite(input.frame, 0))),
    articulationResults: clone(input.articulationResults ?? []),
    jointResults: clone(input.jointResults ?? []),
    constraintResults: clone(input.constraintResults ?? []),
    diagnostics: clone(input.diagnostics ?? []),
    metadata: clone(input.metadata ?? {})
  };
}
