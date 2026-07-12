import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createCoreMotionKit } from "../../src/core-kits/core-motion-kit/index.js";

const engine = createEngine({
  kits: [createCoreMotionKit({
    frameHistoryLimit: 4,
    createApi() {
      return { customMotionHook: () => "preserved" };
    }
  })]
});
const motion = engine.n.coreMotion;
assert.equal(typeof engine.coreMotion?.submitIntent, "function", "Core Motion keeps its root compatibility API");
assert.equal(engine.coreMotion.submitIntent, motion.submitIntent);
assert.equal(motion.customMotionHook(), "preserved", "custom Core Motion API extensions remain composed");

const mode = motion.registerMovementMode({
  id: "run",
  maximumSpeed: 24,
  acceleration: 18,
  deceleration: 14
});
assert.equal(mode.id, "run");

const intent = motion.submitIntent({
  id: "dino:motion",
  actorId: "dino",
  mode: "run",
  desiredVelocity: { x: 0, y: 0, z: 18 },
  desiredFacing: { x: 0, y: 0, z: 1 },
  acceleration: 18,
  grounded: true
});
assert.equal(intent.actorId, "dino");

motion.submitTrajectory({
  id: "dino:path",
  actorId: "dino",
  points: [
    { time: 0, position: [0, 0, 0] },
    { time: 1, position: [0, 0, 18] }
  ]
});

const frame = motion.commitMotionFrame({
  tickId: "tick:1",
  frame: 1,
  requests: [{
    id: "tick:1:dino",
    bodyId: "dino",
    position: [0, 0, 0.3],
    linearVelocity: [0, 0, 18]
  }]
});
assert.equal(frame.schema, "nexus-motion-frame/1");
assert.equal(frame.intents.length, 1);
assert.equal(frame.trajectories.length, 1);
assert.equal(frame.requests[0].bodyId, "dino");

const snapshot = motion.getSnapshot();
motion.reset();
assert.equal(motion.getMotionFrame(), null);
motion.loadSnapshot(snapshot);
assert.equal(motion.getMotionFrame().tickId, "tick:1");
assert.doesNotThrow(() => structuredClone(motion.getSnapshot()));

console.log("core motion kit smoke ok");
