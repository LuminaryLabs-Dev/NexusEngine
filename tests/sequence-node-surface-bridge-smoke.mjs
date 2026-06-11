import assert from "node:assert/strict";
import {
  createEngine,
  defineEvent
} from "../src/index.js";

const SurfaceAction = defineEvent("SurfaceAction");

const root = {
  id: "surface_flow",
  type: "flow",
  completionMode: "sequence",
  children: [
    {
      id: "wait_surface_action",
      type: "waitForEvent",
      completionMode: "event",
      driver: "surface",
      listen: ["SurfaceAction"]
    }
  ]
};

const engine = createEngine();
engine.mountSequenceNode(root);
const surface = engine.eventSurface(SurfaceAction);
engine.sequenceNodeRuntime.bindSurface(surface);
engine.startSequenceNode("surface_flow");
engine.world.emit(SurfaceAction, { ok: true });
engine.tick();
assert.equal(engine.sequenceNodeRuntime.getNodeState("surface_flow"), "finished");

const direct = createEngine({ driveSequenceNodesWithTick: false });
direct.mountSequenceNode(root);
direct.startSequenceNode("surface_flow");
direct.dispatchSequenceEvent("SurfaceAction", { ok: true });
assert.equal(direct.sequenceNodeRuntime.getNodeState("surface_flow"), "finished");

console.log("sequence-node-surface-bridge-smoke ok");
