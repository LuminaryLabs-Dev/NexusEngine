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
  quatInverse,
  quatMultiply,
  quatRotateVector,
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

function evaluatePoseTransforms(rig, pose) {
  const bones = boneMap(rig);
  const cache = new Map();

  const resolve = (boneId, stack = new Set()) => {
    if (cache.has(boneId)) return cache.get(boneId);
    if (stack.has(boneId)) throw new TypeError(`Articulated rig ${rig.id} contains a parent cycle at ${boneId}.`);
    const bone = bones.get(boneId);
    if (!bone) throw new RangeError(`Unknown articulated bone ${boneId}.`);

    stack.add(boneId);
    const transform = pose?.bones?.[boneId] ?? {};
    const localPosition = clone(transform.position ?? bone.restPosition);
    const localRotation = clone(transform.rotation ?? bone.restRotation ?? quatIdentity());
    const parent = bone.parentId == null ? null : resolve(bone.parentId, stack);
    const rigRotation = parent
      ? quatMultiply(parent.rigRotation, localRotation)
      : localRotation;
    const rigPosition = parent
      ? add(parent.rigPosition, quatRotateVector(parent.rigRotation, localPosition))
      : localPosition;
    stack.delete(boneId);

    const evaluated = {
      boneId,
      parentId: bone.parentId,
      localPosition,
      localRotation,
      rigPosition,
      rigRotation
    };
    cache.set(boneId, evaluated);
    return evaluated;
  };

  for (const bone of rig.bones) resolve(bone.id);
  const result = {
    schema: "nexus-articulated-pose-evaluation/1",
    rigId: rig.id,
    poseId: pose?.id ?? null,
    bones: Object.fromEntries(cache)
  };
  structuredClone(result);
  return result;
}

function chainLengths(chain, transforms) {
  if (chain.lengths?.upper > 0 && chain.lengths?.lower > 0) return chain.lengths;
  const [rootId, midId, endId] = chain.bones;
  return {
    upper: length(sub(transforms.bones[midId].rigPosition, transforms.bones[rootId].rigPosition)),
    lower: length(sub(transforms.bones[endId].rigPosition, transforms.bones[midId].rigPosition))
  };
}

function solveChain(rig, chain, target, poseBones, transforms) {
  if (target.space !== "rig") {
    return {
      solved: false,
      diagnostic: {
        type: "unsupported-target-space",
        chainId: chain.id,
        targetSpace: target.space
      }
    };
  }

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

  const bones = boneMap(rig);
  const [rootId, midId, endId] = chain.bones;
  const rootBone = bones.get(rootId);
  const midBone = bones.get(midId);
  const endBone = bones.get(endId);
  if (midBone?.parentId !== rootId || endBone?.parentId !== midId) {
    return {
      solved: false,
      diagnostic: {
        type: "non-contiguous-chain",
        chainId: chain.id,
        bones: chain.bones.slice()
      }
    };
  }

  const rootTransform = transforms.bones[rootId];
  const midTransform = transforms.bones[midId];
  const endTransform = transforms.bones[endId];
  const lengths = chainLengths(chain, transforms);
  const currentUpperDirection = normalize(sub(midTransform.rigPosition, rootTransform.rigPosition));
  const currentLowerDirection = normalize(sub(endTransform.rigPosition, midTransform.rigPosition));
  const solution = solveTwoBoneIK({
    root: rootTransform.rigPosition,
    target: target.position,
    upperLength: lengths.upper,
    lowerLength: lengths.lower,
    poleDirection: target.poleDirection ?? chain.poleDirection
  });

  const rootDelta = quatFromUnitVectors(currentUpperDirection, solution.upperDirection);
  const solvedRootRigRotation = quatMultiply(rootDelta, rootTransform.rigRotation);
  const provisionalLowerDirection = quatRotateVector(rootDelta, currentLowerDirection);
  const provisionalMidRigRotation = quatMultiply(rootDelta, midTransform.rigRotation);
  const midDelta = quatFromUnitVectors(provisionalLowerDirection, solution.lowerDirection);
  const solvedMidRigRotation = quatMultiply(midDelta, provisionalMidRigRotation);
  const rootParentRigRotation = rootBone.parentId == null
    ? quatIdentity()
    : transforms.bones[rootBone.parentId].rigRotation;
  const solvedRootLocalRotation = quatMultiply(
    quatInverse(rootParentRigRotation),
    solvedRootRigRotation
  );
  const solvedMidLocalRotation = quatMultiply(
    quatInverse(solvedRootRigRotation),
    solvedMidRigRotation
  );
  const weight = target.weight;

  poseBones[rootId] = {
    ...(poseBones[rootId] ?? {}),
    rotation: quatSlerp(rootTransform.localRotation, solvedRootLocalRotation, weight)
  };
  poseBones[midId] = {
    ...(poseBones[midId] ?? {}),
    rotation: quatSlerp(midTransform.localRotation, solvedMidLocalRotation, weight)
  };

  return {
    solved: true,
    diagnostic: {
      type: "two-bone-ik",
      chainId: chain.id,
      targetSpace: target.space,
      clamped: solution.clamped,
      clampedMinimum: solution.clampedMinimum,
      clampedMaximum: solution.clampedMaximum,
      targetError: length(sub(solution.end, target.position)),
      bendNormal: solution.bendNormal,
      chainLengths: lengths,
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
  const resolveRigAndPose = (input = {}) => {
    const current = state();
    const rigId = String(input.rigId ?? "");
    const rig = current.rigs?.[rigId];
    if (!rig) throw new RangeError(`Unknown articulated rig ${rigId}.`);
    const pose = input.pose
      ? createArticulatedPoseDescriptor({ ...input.pose, rigId })
      : current.poses?.[String(input.poseId ?? "")]
        ?? createArticulatedPoseDescriptor({ rigId, id: `${rigId}:rest-pose` });
    return { current, rigId, rig, pose };
  };

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
    evaluatePose(input = {}) {
      const { rig, pose } = resolveRigAndPose(input);
      return clone(evaluatePoseTransforms(rig, pose));
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
      const { current, rigId, rig, pose: sourcePose } = resolveRigAndPose(input);
      const targetInputs = input.targets ?? Object.values(current.targets ?? {}).filter((target) => target.rigId === rigId);
      const targets = (Array.isArray(targetInputs) ? targetInputs : [targetInputs]).map((target) =>
        createArticulatedTargetDescriptor({ ...target, rigId: target?.rigId ?? rigId })
      );
      const poseBones = clone(sourcePose.bones ?? {});
      const diagnostics = [];
      for (const target of targets) {
        const chain = rig.chains?.[target.chainId];
        if (!chain) {
          diagnostics.push({ type: "missing-chain", chainId: target.chainId });
          continue;
        }
        const transforms = evaluatePoseTransforms(rig, { ...sourcePose, bones: poseBones });
        diagnostics.push(solveChain(rig, chain, target, poseBones, transforms).diagnostic);
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
    services: ["rig", "pose", "forward-kinematics", "targets", "inverse-kinematics", "pose-resolution", "frames", "snapshot", "reset"],
    requires: config.requires ?? ["n:core-motion"],
    provides: [
      "motion:articulated-rig",
      "motion:articulated-pose",
      "motion:forward-kinematics",
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
      owns: ["rig descriptors", "pose descriptors", "forward kinematics", "IK targets", "kinematic pose solving", "articulated motion frames"],
      doesNotOwn: ["rigid bodies", "contact impulses", "physics joints", "renderer bones", "authored animation clips"]
    }
  });
}

export default createArticulatedMotionDomain;
