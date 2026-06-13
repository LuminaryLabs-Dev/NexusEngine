import assert from "node:assert/strict";
import { createEngine } from "../src/index.js";

function createRoot() {
  return {
    id: "frame_flow",
    type: "flow",
    completionMode: "sequence",
    driver: "hybrid",
    data: {
      framesSeen: 0
    },
    children: [
      {
        id: "wait_three_frames",
        type: "frameCondition",
        completionMode: "condition",
        driver: "frame",
        write: {
          "root.data.framesSeen": "+1"
        },
        until: {
          path: "root.data.framesSeen",
          gte: 3
        }
      },
      {
        id: "finish",
        type: "emitEvent",
        completionMode: "manual",
        config: {
          event: "FrameFlowFinished"
        }
      }
    ]
  };
}

const driven = createEngine({ driveSequenceNodesWithTick: true });
driven.mountSequenceNode(createRoot());
driven.startSequenceNode("frame_flow");
driven.tick();
driven.tick();
driven.tick();
assert.equal(driven.sequenceNodeRuntime.getNodeState("wait_three_frames"), "finished");
assert.equal(driven.sequenceNodeRuntime.getNodeState("frame_flow"), "finished");
assert.ok(driven.sequenceNodeRuntime.snapshot().roots[0].data.framesSeen >= 3);

const manual = createEngine({ driveSequenceNodesWithTick: false });
manual.mountSequenceNode(createRoot());
manual.startSequenceNode("frame_flow");
manual.tick();
manual.tick();
manual.tick();
assert.notEqual(manual.sequenceNodeRuntime.getNodeState("frame_flow"), "finished");
manual.sequenceNodeRuntime.frame();
manual.sequenceNodeRuntime.frame();
manual.sequenceNodeRuntime.frame();
assert.equal(manual.sequenceNodeRuntime.getNodeState("frame_flow"), "finished");

console.log("sequence-node-frame-driver-smoke ok");
