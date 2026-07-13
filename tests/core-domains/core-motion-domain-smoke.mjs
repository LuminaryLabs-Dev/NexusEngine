import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import {
  createCoreMotionDomain
} from "../../src/core-domains/core-motion-domain/index.js";

const EPSILON = 1e-5;
const quaternionLength = (value) => Math.hypot(value.x, value.y, value.z, value.w);
const distance = (left, right) => Math.hypot(
  left.x - right.x,
  left.y - right.y,
  left.z - right.z
);

const engine = createEngine({ kits: createCoreMotionDomain() });
assert.ok(engine.n.coreMotion);
assert.ok(engine.n.articulatedMotion);

const rig = engine.n.articulatedMotion.registerRig({
  id: "raptor-rig",
  rootBoneId: "root",
  bones: [
    { id: "root", parentId: null, restPosition: [0, 0, 0] },
    { id: "thigh-L", parentId: "root", restPosition: [-0.25, 0, 0] },
    { id: "shin-L", parentId: "thigh-L", restPosition: [0, -1, 0] },
    { id: "foot-L", parentId: "shin-L", restPosition: [0, -1, 0] }
  ],
  chains: {
    hindLegL: {
      bones: ["thigh-L", "shin-L", "foot-L"],
      solver: "two-bone",
      poleDirection: [-1, 0, 0.4]
    }
  }
});
assert.equal(rig.chains.hindLegL.bones.length, 3);

const pose = engine.n.articulatedMotion.registerPose({
  id: "raptor:base",
  rigId: rig.id,
  bones: {
    "foot-L": { position: [0, -1, 0] }
  }
});

const noTargetFrame = engine.n.articulatedMotion.solve({
  rigId: rig.id,
  poseId: pose.id,
  tickId: "tick:no-targets",
  targets: []
});
assert.deepEqual(noTargetFrame.pose.bones, pose.bones, "an empty target list preserves the source pose");

const target = { x: -0.4, y: -1.5, z: 0.35 };
const frame = engine.n.articulatedMotion.solve({
  rigId: rig.id,
  poseId: pose.id,
  tickId: "tick:1",
  targets: [{
    chainId: "hindLegL",
    space: "rig",
    position: target,
    weight: 1
  }]
});

assert.equal(frame.schema, "nexus-articulated-motion-frame/1");
assert.equal(frame.pose.rigId, rig.id);
assert.equal(frame.targets[0].space, "rig");
assert.ok(frame.pose.bones["thigh-L"].rotation);
assert.ok(frame.pose.bones["shin-L"].rotation);
assert.equal(frame.diagnostics[0].type, "two-bone-ik");
assert.ok(Math.abs(quaternionLength(frame.pose.bones["thigh-L"].rotation) - 1) < EPSILON);
assert.ok(Math.abs(quaternionLength(frame.pose.bones["shin-L"].rotation) - 1) < EPSILON);
assert.deepEqual(frame.pose.bones["foot-L"].position, pose.bones["foot-L"].position, "IK preserves foot-local translation");

const evaluated = engine.n.articulatedMotion.evaluatePose({
  rigId: rig.id,
  pose: frame.pose
});
assert.ok(distance(evaluated.bones["foot-L"].rigPosition, target) < EPSILON, "solved local rotations place the foot on the rig-space target");

const duplicate = engine.n.articulatedMotion.solve({
  rigId: rig.id,
  poseId: pose.id,
  tickId: "tick:1",
  targets: [{
    chainId: "hindLegL",
    space: "rig",
    position: target,
    weight: 1
  }]
});
assert.deepEqual(duplicate.pose.bones, frame.pose.bones, "identical articulated inputs solve deterministically");

const rotatedRig = engine.n.articulatedMotion.registerRig({
  id: "rotated-parent-rig",
  rootBoneId: "root",
  bones: [
    { id: "root", parentId: null, restPosition: [0, 0, 0] },
    { id: "pelvis", parentId: "root", restPosition: [0, 0, 0], restRotation: [0, Math.SQRT1_2, 0, Math.SQRT1_2] },
    { id: "thigh", parentId: "pelvis", restPosition: [1, 0, 0] },
    { id: "shin", parentId: "thigh", restPosition: [0, -1, 0] },
    { id: "foot", parentId: "shin", restPosition: [0, -1, 0] }
  ],
  chains: {
    leg: {
      bones: ["thigh", "shin", "foot"],
      solver: "two-bone",
      poleDirection: [0, 0, 1]
    }
  }
});
const rotatedEvaluation = engine.n.articulatedMotion.evaluatePose({
  rigId: rotatedRig.id,
  pose: { id: "rotated-rest", rigId: rotatedRig.id, bones: {} }
});
assert.ok(Math.abs(rotatedEvaluation.bones.thigh.rigPosition.x) < EPSILON);
assert.ok(Math.abs(rotatedEvaluation.bones.thigh.rigPosition.z + 1) < EPSILON, "parent rotation affects descendant rig positions");

const animatedEvaluation = engine.n.articulatedMotion.evaluatePose({
  rigId: rotatedRig.id,
  pose: {
    id: "rotated-animated",
    rigId: rotatedRig.id,
    bones: {
      thigh: { rotation: [0, 0, Math.SQRT1_2, Math.SQRT1_2] }
    }
  }
});
assert.notDeepEqual(
  animatedEvaluation.bones.foot.rigPosition,
  rotatedEvaluation.bones.foot.rigPosition,
  "source-pose rotations affect current chain positions"
);

const forwardPole = engine.n.articulatedMotion.solve({
  rigId: rig.id,
  poseId: pose.id,
  tickId: "tick:pole-forward",
  targets: [{
    chainId: "hindLegL",
    position: [-0.25, -1.5, 0],
    poleDirection: [0, 0, 1],
    weight: 1
  }]
});
const backwardPole = engine.n.articulatedMotion.solve({
  rigId: rig.id,
  poseId: pose.id,
  tickId: "tick:pole-backward",
  targets: [{
    chainId: "hindLegL",
    position: [-0.25, -1.5, 0],
    poleDirection: [0, 0, -1],
    weight: 1
  }]
});
const forwardMid = engine.n.articulatedMotion.evaluatePose({ rigId: rig.id, pose: forwardPole.pose }).bones["shin-L"].rigPosition;
const backwardMid = engine.n.articulatedMotion.evaluatePose({ rigId: rig.id, pose: backwardPole.pose }).bones["shin-L"].rigPosition;
assert.ok(forwardMid.z * backwardMid.z < 0, "opposite poles produce opposite stable bend sides");

const unsupported = engine.n.articulatedMotion.solve({
  rigId: rig.id,
  poseId: pose.id,
  tickId: "tick:unsupported-space",
  targets: [{
    chainId: "hindLegL",
    space: "world",
    position: target,
    weight: 1
  }]
});
assert.equal(unsupported.diagnostics[0].type, "unsupported-target-space");
assert.deepEqual(unsupported.pose.bones, pose.bones, "unsupported target spaces do not mutate the pose");

const snapshot = engine.n.articulatedMotion.getSnapshot();
engine.n.articulatedMotion.reset();
assert.equal(engine.n.articulatedMotion.getRig(rig.id), null);
engine.n.articulatedMotion.loadSnapshot(snapshot);
assert.equal(engine.n.articulatedMotion.getRig(rig.id).id, rig.id);
assert.doesNotThrow(() => structuredClone(engine.n.articulatedMotion.getFrame()));

console.log("core motion domain smoke ok");
