import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import {
  createCoreMotionDomain
} from "../../src/core-domains/core-motion-domain/index.js";

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
  bones: {}
});

const frame = engine.n.articulatedMotion.solve({
  rigId: rig.id,
  poseId: pose.id,
  tickId: "tick:1",
  targets: [{
    chainId: "hindLegL",
    position: [-0.4, -1.5, 0.35],
    weight: 1
  }]
});

assert.equal(frame.schema, "nexus-articulated-motion-frame/1");
assert.equal(frame.pose.rigId, rig.id);
assert.ok(frame.pose.bones["thigh-L"].rotation);
assert.ok(frame.pose.bones["shin-L"].rotation);
assert.equal(frame.diagnostics[0].type, "two-bone-ik");

const snapshot = engine.n.articulatedMotion.getSnapshot();
engine.n.articulatedMotion.reset();
assert.equal(engine.n.articulatedMotion.getRig(rig.id), null);
engine.n.articulatedMotion.loadSnapshot(snapshot);
assert.equal(engine.n.articulatedMotion.getRig(rig.id).id, rig.id);
assert.doesNotThrow(() => structuredClone(engine.n.articulatedMotion.getFrame()));

console.log("core motion domain smoke ok");
