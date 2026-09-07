import {
  registerDocumentService,
  typedDocument,
} from "../contracts/services.js";
import {
  canonical,
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
  requireText,
  vector,
} from "../contracts/value.js";
import {
  normalizeTransform,
  transformMatrix,
  multiplyMatrix,
  identityMatrix,
  transformPoint,
  quatMultiply,
  quatInverse,
  quatBetween,
  quatAngle,
  quatSlerp,
} from "../contracts/transforms.js";
import { vsub } from "../mesh/evaluate.js";
export function normalizeAuthoringRig(c) {
  c = canonical(c);
  requireFields(c, ["bones", "constraints"], "rig");
  if (!Array.isArray(c.bones) || !c.bones.length)
    throw error("AUTHORING_INVALID_RIG", "Rig needs bones.");
  requireInteger(c.bones.length, "bones", 1, 512);
  const byId = new Map();
  c.bones = c.bones.map((b) => {
    requireFields(b, ["id", "name", "parent", "rest", "length"], "bone");
    requireText(b.id, "bone ID");
    requireText(b.name, "bone name");
    if (byId.has(b.id)) throw error("AUTHORING_INVALID_RIG", "Duplicate bone.");
    if (b.parent !== null) requireText(b.parent, "parent ID");
    const normalized = {
      ...b,
      rest: normalizeTransform(b.rest),
      length: requireNumber(b.length ?? 1, "bone length", 1e-6, 1e6),
    };
    byId.set(b.id, normalized);
    return normalized;
  });
  const done = new Set(),
    active = new Set(),
    visit = (id) => {
      if (!byId.has(id))
        throw error("AUTHORING_INVALID_RIG", `Missing parent bone ${id}.`);
      if (active.has(id))
        throw error("AUTHORING_INVALID_RIG", "Bone hierarchy cycle.");
      if (done.has(id)) return;
      active.add(id);
      const b = byId.get(id);
      if (b.parent !== null) visit(b.parent);
      active.delete(id);
      done.add(id);
    };
  for (const id of byId.keys()) visit(id);
  c.constraints ??= [];
  if (!Array.isArray(c.constraints) || c.constraints.length > 512)
    throw error("AUTHORING_INVALID_RIG", "Invalid constraints.");
  for (const constraint of c.constraints) {
    requireText(constraint.boneId, "constraint bone");
    if (!byId.has(constraint.boneId))
      throw error("AUTHORING_INVALID_RIG", "Constraint bone missing.");
    switch (constraint.type) {
      case "limit":
        requireFields(
          constraint,
          ["type", "boneId", "min", "max", "rotationAngle"],
          "limit",
        );
        vector(constraint.min);
        vector(constraint.max);
        if (constraint.min.some((n, i) => n > constraint.max[i]))
          throw error("AUTHORING_INVALID_RIG", "Reversed limits.");
        requireNumber(
          constraint.rotationAngle ?? Math.PI,
          "rotation angle",
          0,
          Math.PI,
        );
        break;
      case "copy":
        requireFields(constraint, ["type", "boneId", "targetId"], "copy");
        if (
          !byId.has(constraint.targetId) ||
          constraint.targetId === constraint.boneId
        )
          throw error("AUTHORING_INVALID_RIG", "Invalid copy target.");
        break;
      case "look-at":
        requireFields(constraint, ["type", "boneId", "target"], "look-at");
        vector(constraint.target);
        break;
      case "ik":
        requireFields(
          constraint,
          ["type", "boneId", "chain", "target", "iterations", "tolerance"],
          "IK",
        );
        if (
          !Array.isArray(constraint.chain) ||
          constraint.chain.length < 2 ||
          constraint.chain.length > 16 ||
          new Set(constraint.chain).size !== constraint.chain.length ||
          constraint.chain.at(-1) !== constraint.boneId
        )
          throw error(
            "AUTHORING_INVALID_RIG",
            "IK needs a unique 2–16 bone chain ending at boneId.",
          );
        for (let i = 0; i < constraint.chain.length; i++) {
          const b = byId.get(constraint.chain[i]);
          if (!b || (i > 0 && b.parent !== constraint.chain[i - 1]))
            throw error(
              "AUTHORING_INVALID_RIG",
              "IK chain must follow parents.",
            );
        }
        vector(constraint.target);
        requireInteger(constraint.iterations ?? 32, "IK iterations", 1, 256);
        requireNumber(constraint.tolerance ?? 0.0001, "IK tolerance", 1e-8, 1);
        break;
      default:
        throw error(
          "AUTHORING_UNSUPPORTED_RIG_CONSTRAINT",
          `Unknown rig constraint ${constraint.type}.`,
        );
    }
  }
  return c;
}
export function evaluateAuthoringRig(
  input,
  pose = {},
  { constraints = true } = {},
) {
  const rig = normalizeAuthoringRig(structuredClone(input)),
    bones = new Map(rig.bones.map((b) => [b.id, b])),
    locals = Object.fromEntries(
      rig.bones.map((b) => [
        b.id,
        normalizeTransform(Object.hasOwn(pose, b.id) ? pose[b.id] : b.rest),
      ]),
    );
  for (const id of Object.keys(pose))
    if (!bones.has(id))
      throw error("AUTHORING_INVALID_POSE", `Unknown posed bone ${id}.`);
  let matrices, rotations;
  const build = () => {
    matrices = Object.create(null);
    rotations = Object.create(null);
    const visit = (id) => {
      if (Object.hasOwn(matrices, id)) return;
      const b = bones.get(id);
      if (b.parent !== null) visit(b.parent);
      matrices[id] = multiplyMatrix(
        b.parent === null ? identityMatrix() : matrices[b.parent],
        transformMatrix(locals[id]),
      );
      rotations[id] = quatMultiply(
        b.parent === null ? [0, 0, 0, 1] : rotations[b.parent],
        locals[id].rotation,
      );
    };
    for (const b of rig.bones) visit(b.id);
  };
  build();
  const diagnostics = [];
  const aim = (id, target, end) => {
    const b = bones.get(id),
      origin = transformPoint(matrices[id], [0, 0, 0]),
      from = vsub(end, origin),
      to = vsub(target, origin);
    if (Math.hypot(...from) < 1e-9 || Math.hypot(...to) < 1e-9)
      throw error(
        "AUTHORING_RIG_SINGULARITY",
        "Constraint target coincides with joint.",
      );
    const delta = quatBetween(from, to),
      parent = b.parent === null ? [0, 0, 0, 1] : rotations[b.parent];
    locals[id] = {
      ...locals[id],
      rotation: quatMultiply(
        quatMultiply(quatMultiply(quatInverse(parent), delta), parent),
        locals[id].rotation,
      ),
    };
    build();
  };
  if (constraints)
    for (const c of rig.constraints) {
      const local = locals[c.boneId],
        bone = bones.get(c.boneId);
      if (c.type === "limit") {
        const angle = quatAngle(bone.rest.rotation, local.rotation),
          limit = c.rotationAngle ?? Math.PI;
        locals[c.boneId] = {
          ...local,
          translation: local.translation.map((n, i) =>
            Math.max(c.min[i], Math.min(c.max[i], n)),
          ),
          rotation:
            angle > limit
              ? quatSlerp(bone.rest.rotation, local.rotation, limit / angle)
              : local.rotation,
        };
        build();
      } else if (c.type === "copy") {
        locals[c.boneId] = structuredClone(locals[c.targetId]);
        build();
      } else {
        if (
          rig.bones.some(
            (b) =>
              b.rest.scale.some((n) => n <= 0) ||
              Math.max(...locals[b.id].scale) -
                Math.min(...locals[b.id].scale) >
                1e-8,
          )
        )
          throw error(
            "AUTHORING_UNSUPPORTED_RIG_SCALE",
            "Look-at/IK require positive uniform joint scale.",
          );
        if (c.type === "look-at")
          aim(
            c.boneId,
            c.target,
            transformPoint(matrices[c.boneId], [0, bone.length, 0]),
          );
        else {
          let distance = Infinity,
            iterations = 0;
          for (; iterations < (c.iterations ?? 32); iterations++) {
            const end = () =>
              transformPoint(matrices[c.boneId], [0, bone.length, 0]);
            distance = Math.hypot(...vsub(end(), c.target));
            if (distance <= (c.tolerance ?? 0.0001)) break;
            for (const id of [...c.chain].reverse()) aim(id, c.target, end());
          }
          distance = Math.hypot(
            ...vsub(
              transformPoint(matrices[c.boneId], [0, bone.length, 0]),
              c.target,
            ),
          );
          diagnostics.push({
            type: "ik",
            boneId: c.boneId,
            iterations,
            distance,
            reached: distance <= (c.tolerance ?? 0.0001),
          });
        }
      }
    }
  return { locals, matrices, diagnostics };
}
export function installAuthoringRigServices(project) {
  const register = registerDocumentService(project, {
    kind: "rig",
    normalize: normalizeAuthoringRig,
    profile: "trs-bones-local-copy-lookat-ccd-ik/1",
  });
  register("bone", ["id", "expectedRevision", "bone"], (tx, a) => {
    const d = typedDocument(tx, a.id, "rig", a.expectedRevision),
      bones = d.content.bones.filter((b) => b.id !== a.bone.id);
    bones.push(a.bone);
    tx.put({ ...d, content: { ...d.content, bones } }, a.expectedRevision);
    return { id: d.id, boneId: a.bone.id };
  });
  register("remove-bone", ["id", "expectedRevision", "boneId"], (tx, a) => {
    const d = typedDocument(tx, a.id, "rig", a.expectedRevision);
    if (!d.content.bones.some((b) => b.id === a.boneId))
      throw error("AUTHORING_ELEMENT_MISSING", "Bone missing.");
    tx.put(
      {
        ...d,
        content: {
          ...d.content,
          bones: d.content.bones.filter((b) => b.id !== a.boneId),
        },
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  return {
    normalize: normalizeAuthoringRig,
    evaluateContent: evaluateAuthoringRig,
    evaluate: (id, pose, options) =>
      evaluateAuthoringRig(project.getDocument(id).content, pose, options),
  };
}
