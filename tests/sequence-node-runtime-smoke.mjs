import assert from "node:assert/strict";
import { createEngine } from "../src/index.js";

const root = {
  id: "simple_collect_game",
  type: "flow",
  completionMode: "sequence",
  driver: "hybrid",
  data: {
    cargoRecovered: 0
  },
  children: [
    {
      id: "start",
      type: "waitForEvent",
      completionMode: "event",
      driver: "event",
      listen: ["PlayerMoved"]
    },
    {
      id: "collect_three",
      type: "collect",
      completionMode: "condition",
      driver: "event",
      listen: ["CargoPickedUp"],
      write: {
        "root.data.cargoRecovered": "+1"
      },
      until: {
        path: "root.data.cargoRecovered",
        gte: 3
      }
    },
    {
      id: "finish",
      type: "emitEvent",
      completionMode: "manual",
      driver: "manual",
      config: {
        event: "GameFinished"
      }
    }
  ]
};

const engine = createEngine({ driveSequenceNodesWithTick: false });
engine.mountSequenceNode(root);
engine.startSequenceNode("simple_collect_game");
engine.dispatchSequenceEvent("PlayerMoved");
engine.dispatchSequenceEvent("CargoPickedUp", { cargoId: "a" });
engine.dispatchSequenceEvent("CargoPickedUp", { cargoId: "b" });
engine.dispatchSequenceEvent("CargoPickedUp", { cargoId: "c" });

const snapshot = engine.sequenceNodeRuntime.snapshot();
const mountedRoot = snapshot.roots[0];
assert.equal(mountedRoot.data.cargoRecovered, 3);
assert.equal(engine.sequenceNodeRuntime.getNodeState("simple_collect_game"), "finished");
assert.equal(engine.clock.frame, 0);

console.log("sequence-node-runtime-smoke ok");
