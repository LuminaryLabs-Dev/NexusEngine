import { defineResource } from "../../../../ecs.js";
import { defineDomainServiceKit } from "../../../../domain-service-kit.js";
import {
  add,
  length,
  normalize,
  sub
} from "../../../../core-kits/core-utility-kit/transform-math-utility-kit.js";
import {
  quatFromUnitVectors,
  quatIdentity,
  quatSlerp
} from "../../../../core-kits/core-utility-kit/quaternion-utility-kit.js";
import {
  solveTwoBoneIK
} from "../../../../core-kits/core-utility-kit/two-bone-ik-utility-kit.js";
import {
  createArticulatedMotionFrame,
  createArticulatedPoseDescriptor,
  createArticulatedRigDescriptor,
  createArticulatedTargetDescriptor,
  validateArticulatedRigDescriptor
} from "./contracts.js";

export * from "./contracts.js";

export const ARTICULATED_MOTION_DOMAIN_VERSION = "0.1.0";
export const ArticulatedMotionState = defineResource("core.motion.articulation.state");

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function createState(config = {}) {
  return {
    version: ARTICULATED_MOTION_DOMAIN_VERSION,
    status: "ready",
    rigs: {},
    poses: {},
    targets: {},
    currentFrame: null,
    frames: [],
    diagnostics: [],
    frameHistoryLimit: Math.max(1, Number(config.frameHistoryLimit ?? 120))
  };
}

function boneMap(rig) {
  return new Map(rig.bones.map((bone) => [bone.id, bone]));
}

function worldRestPositions(rig) {
  const bones = boneMap(rig);
  const cache = new Map();
  const resolve = (boneId, stack = new Set()) => {
    if (cache.has(boneId)) return cache.get(boneId);
    if (stack.has(boneId)) throw new TypeError(`Articulated rig ${rig.id} contains a parent cycle at ${boneId}.`);
    const bone = bones.get(boneId);
    if (!bone) throw new RangeError(`Unknown articulated bone ${boneId}.`);
    stack.add(boneId);
    const parent = bone.parentId == null ? { x: 0, y: 0, z: 0 } : resolve(bone.parentId, stack);
    const position = add(parent, bone.restPosition);
    stack.delete(boneId);
    cache.set(boneId, position);
    return position;
  };
  for (const bone of rig.bones) resolve(bone.id);
  return Object.fromEntries(cache);
}

function chainLengths(rig, chain, restPositions) {
  if (chain.lengths?.upper > 0 && chain.lengths?.lower > 0) return chain.lengths;
  const [rootId, midId, endId] = chain.bones;
  return {
    upper: length(sub(restPositions[midId], restPositions[rootId])),
    lower: length(sub(restPositions[endId], restPositions[midId]))
  };
}

function solveChain(rig, chain, target, poseBones) {
  if (chain.solver !== "two-bone" || chain.bones.length !== 3) {
    return {
      solved: false,
      diagnostic: {
        type: "unsupported-chain",
        chainId: chain.id,
        solver: chain.solver,
        boneCount: chain.bones.length
      }
    };
  }

  const positions = worldRestPositions(rig);
  const [rootId, midId, endId] = chain.bones;
  const lengths = chainLengths(rig, chain, positions);
  const solution = solveTwoBoneIK({
    root: positions[rootId],
    target: target.position,
    upperLength: lengths.upper,
    lowerLength: lengths.lower,
    poleDirection: target.poleDirection ?? chain.poleDirection
  });
  const restUpper = normalize(sub(positions[midId], positions[rootId]));
  const restLower = normalize(sub(positions[endId], positions[midId]));
  const rootRotation = quatFromUnitVectors(restUpper, solution.upperDirection);
  const midRotation = quatFromUnitVectors(restLower, solution.lowerDirection);
  const weight = target.weight;

  poseBones[rootId] = {
    ...(poseBones[rootId] ?? {}),
    rotation: quatSlerp(poseBones[rootId]?.rotation ?? quatIdentity(), rootRotation, weight),
    weight
  };
  poseBones[midId] = {
    ...(poseBones[midId] ?? {}),
    rotation: quatSlerp(poseBones[midId]?.rotation ?? quatIdentity(), midRotation, weight),
    weight
  };
  poseBones[endId] = {
    ...(poseBones[endId] ?? {}),
    position: solution.end,
    weight
  };

  return {
    solved: true,
    diagnostic: {
      type: "two-bone-ik",
      chainId: chain.id,
      clamped: solution.clamped,
      clampedMinimum: solution.clampedMinimum,
      clampedMaximum: solution.clampedMaximum,
      targetError: length(sub(solution.end, target.position)),
      bendNormal: solution.bendNormal,
      solvedPositions: {
        root: solution.root,
        mid: solution.mid,
        end: solution.end
      }
    }
  };
}

function createApi(config, world) {
  const state = () => world.getResource(ArticulatedMotionState);
  const setState = (next) => {
    structuredClone(next);
    world.setResource(ArticulatedMotionState, next);
    return next;
  };
  const update = (patch) => setState({ ...state(), ...patch });

  return Object.freeze({
    registerRig(input = {}) {
      const rig = createArticulatedRigDescriptor(input);
      const validation = validateArticulatedRigDescriptor(rig);
      if (!validation.valid) throw new TypeError(`Invalid articulated rig: ${validation.issues.join("; ")}`);
      return clone(update({ rigs: { ...(state().rigs ?? {}), [rig.id]: rig } }).rigs[rig.id]);
    },
    removeRig(id) {
      const key = String(id);
      const next = { ...(state().rigs ?? {}) };
      const removed = delete next[key];
      if (removed) update({ rigs: next });
      return removed;
    },
    getRig(id) {
      return clone(state().rigs?.[String(id)] ?? null);
    },
    registerPose(input = {}) {
      const pose = createArticulatedPoseDescriptor(input);
      if (!state().rigs?.[pose.rigId]) throw new RangeError(`Unknown articulated rig ${pose.rigId}.`);
      return clone(update({ poses: { ...(state().poses ?? {}), [pose.id]: pose } }).poses[pose.id]);
    },
    getPose(id) {
      return clone(state().poses?.[String(id)] ?? null);
    },
    submitTargets(inputs = []) {
      const targets = (Array.isArray(inputs) ? inputs : [inputs]).map(createArticulatedTargetDescriptor);
      const next = { ...(state().targets ?? {}) };
      for (const target of targets) {
        const rig = state().rigs?.[target.rigId];
        if (!rig) throw new RangeError(`Unknown articulated rig ${target.rigId}.`);
        if (!rig.chains?.[target.chainId]) throw new RangeError(`Unknown articulated chain ${target.chainId}.`);
        next[target.id] = target;
      }
      update({ targets: next });
      return clone(targets);
    },
    solve(input = {}) {
      const current = state();
      const rigId = String(input.rigId ?? "");
      const rig = current.rigs?.[rigId];
      if (!rig) throw new RangeError(`Unknown articulated rig ${rigId}.`);
      const sourcePose = input.pose
        ? createArticulatedPoseDescriptor({ ...input.pose, rigId })
        : current.poses?.[String(input.poseId ?? "")] ?? createArticulatedPoseDescriptor({ rigId, id: `${rigId}:rest-pose` });
      const targetInputs = input.targets ?? Object.values(current.targets ?? {}).filter((target) => target.rigId === rigId);
      const targets = (Array.isArray(targetInputs) ? targetInputs : [targetInputs]).map((target) =>
        target?.schema === "nexus-articulated-target/1"
          ? clone(target)
          : createArticulatedTargetDescriptor({ ...target, rigId })
      );
      const poseBones = clone(sourcePose.bones ?? {});
      const diagnostics = [];
      for (const target of targets) {
        const chain = rig.chains?.[target.chainId];
        if (!chain) {
          diagnostics.push({ type: "missing-chain", chainId: target.chainId });
          continue;
        }
        diagnostics.push(solveChain(rig, chain, target, poseBones).diagnostic);
      }
      const pose = createArticulatedPoseDescriptor({
        id: input.outputPoseId ?? `${rigId}:solved:${input.tickId ?? Number(current.frames?.length ?? 0) + 1}`,
        rigId,
        bones: poseBones,
        metadata: { sourcePoseId: sourcePose.id }
      });
      const frame = createArticulatedMotionFrame({
        id: input.id,
        tickId: input.tickId,
        frame: input.frame,
        rigId,
        sourcePoseId: sourcePose.id,
        pose,
        targets,
        diagnostics,
        metadata: input.metadata
      });
      const frames = [...(current.frames ?? []), frame].slice(-current.frameHistoryLimit);
      setState({
        ...current,
        poses: { ...(current.poses ?? {}), [pose.id]: pose },
        currentFrame: frame,
        frames,
        diagnostics
      });
      return clone(frame);
    },
    getFrame() {
      return clone(state().currentFrame ?? null);
    },
    getDiagnostics() {
      return clone(state().diagnostics ?? []);
    },
    getSnapshot() {
      return clone(state());
    },
    loadSnapshot(snapshot = {}) {
      if (snapshot.version !== ARTICULATED_MOTION_DOMAIN_VERSION || snapshot.status !== "ready") {
        throw new TypeError("Unsupported articulated motion snapshot.");
      }
      for (const rig of Object.values(snapshot.rigs ?? {})) {
        const validation = validateArticulatedRigDescriptor(rig);
        if (!validation.valid) throw new TypeError(`Invalid articulated motion snapshot rig: ${validation.issues.join("; ")}`);
      }
      return clone(setState({
        ...createState(config),
        ...clone(snapshot),
        frameHistoryLimit: Math.max(1, Number(snapshot.frameHistoryLimit ?? config.frameHistoryLimit ?? 120))
      }));
    },
    reset() {
      return clone(setState(createState(config)));
    }
  });
}

export function createArticulatedMotionDomain(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "articulated-motion-domain-kit",
    domain: "articulated-motion",
    domainPath: "n:core-motion:articulation",
    parentDomainPath: "n:core-motion",
    apiName: config.apiName ?? "articulatedMotion",
    stability: config.stability ?? "stable-candidate",
    version: ARTICULATED_MOTION_DOMAIN_VERSION,
    services: ["rig", "pose", "targets", "inverse-kinematics", "pose-resolution", "frames", "snapshot", "reset"],
    requires: config.requires ?? ["n:core-motion"],
    provides: [
      "motion:articulated-rig",
      "motion:articulated-pose",
      "motion:inverse-kinematics",
      "motion:articulated-frame"
    ],
    resources: { ArticulatedMotionState },
    initWorld({ world }) {
      world.setResource(ArticulatedMotionState, createState(config));
    },
    createApi({ world }) {
      return createApi(config, world);
    },
    metadata: {
      coreSubdomain: true,
      rendererAgnostic: true,
      physicsIndependent: true,
      owns: ["rig descriptors", "pose descriptors", "IK targets", "kinematic pose solving", "articulated motion frames"],
      doesNotOwn: ["rigid bodies", "contact impulses", "physics joints", "renderer bones", "authored animation clips"]
    }
  });
}

export default createArticulatedMotionDomain;
