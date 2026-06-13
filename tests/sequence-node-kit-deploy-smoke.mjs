import assert from "node:assert/strict";
import {
  createEngine,
  createSequenceNodeKit,
  defineEvent,
  defineRuntimeKit,
  deploySequenceNode
} from "../src/index.js";

const DemoEvent = defineEvent("DemoEvent");

function createDemoKit() {
  return defineRuntimeKit({
    id: "demo-kit",
    events: { DemoEvent },
    provides: ["demo-kit"],
    install({ engine }) {
      engine.demoKitInstalled = true;
    }
  });
}

const root = {
  id: "kit_deploy_flow",
  type: "flow",
  completionMode: "sequence",
  kits: [
    { id: "demo-kit", config: { value: 1 } }
  ],
  children: [
    {
      id: "wait_demo",
      type: "waitForEvent",
      completionMode: "event",
      listen: ["DemoEvent"]
    }
  ]
};

const engine = createEngine({ sequenceKitRegistry: { "demo-kit": createDemoKit } });
deploySequenceNode(engine, root, {
  autoStart: true,
  kitRegistry: { "demo-kit": createDemoKit }
});
assert.equal(engine.demoKitInstalled, true);
engine.dispatchSequenceEvent("DemoEvent");
assert.equal(engine.sequenceNodeRuntime.getNodeState("kit_deploy_flow"), "finished");

const kitEngine = createEngine();
kitEngine.installKit(createSequenceNodeKit({
  id: "flow-kit",
  nodes: [root],
  autoStart: true
}));
assert.equal(kitEngine.sequenceNodeRuntime.getNodeState("kit_deploy_flow"), "running");

console.log("sequence-node-kit-deploy-smoke ok");
