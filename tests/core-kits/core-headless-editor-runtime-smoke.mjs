import assert from "node:assert/strict";
import {
  createBrowserDriverHeadlessEditorAdapter,
  createHeadlessEditorEnvironment,
  createHeadlessEditorHarness,
  createHeadlessEditorRouter,
  createHeadlessEditorRuntime,
  createHeadlessEditorTerminalClient,
  createInProcessHeadlessEditorTransport
} from "../../src/index.js";

let frame = 0;
const environment = createHeadlessEditorEnvironment({
  id: "fixture-environment",
  label: "Fixture Environment",
  domains: ["runtime", "renderer"],
  capabilities: [
    {
      id: "runtime.getState",
      domain: "runtime",
      execute() { return { data: { frame } }; }
    },
    {
      id: "runtime.tick",
      domain: "runtime",
      execute({ amount = 1 }) { frame += Number(amount); return { data: { frame } }; }
    },
    {
      id: "renderer.capture",
      domain: "renderer",
      execute({ label = "frame" }) {
        return {
          data: { frame, label },
          artifacts: [{ id: `${label}-${frame}`, kind: "capture", path: `${label}-${frame}.png` }],
          observations: [{ code: "capture-created", message: `Captured frame ${frame}.` }]
        };
      }
    }
  ]
});

const runtime = createHeadlessEditorRuntime({
  id: "runtime-smoke",
  environment,
  session: { id: "smoke-session" }
});

assert.equal(runtime.listEnvironments().length, 1);
assert.deepEqual(runtime.listDomains(), ["renderer", "runtime"]);
assert.equal(runtime.hasCapability("runtime.tick"), true);
assert.equal(runtime.describeCapability("renderer.capture").domain, "renderer");

const unavailable = await runtime.executeAction("scene.inspect");
assert.equal(unavailable.status, "unavailable");

const tick = await runtime.executeAction("runtime.tick", { amount: 2 });
assert.equal(tick.data.frame, 2);

const script = await runtime.runScript({
  id: "tick-and-capture",
  steps: [
    { action: "runtime.tick", arguments: { amount: 3 } },
    { action: "renderer.capture", arguments: { label: "after" } }
  ]
});
assert.equal(script.ok, true);
assert.equal(frame, 5);
assert.equal(runtime.snapshot().artifacts.length, 1);
assert.equal(runtime.snapshot().observations.length, 1);

runtime.select({ objectId: "hero-tree" });
assert.equal(runtime.getState().currentSelection.objectId, "hero-tree");

const loop = runtime.createLoop({
  id: "visual-loop",
  goal: "Improve the fixture",
  stages: ["inspect", "capture", "decide"],
  stageActions: {
    inspect: "runtime.getState",
    capture: "renderer.capture"
  }
});
assert.equal(loop.currentStage, "inspect");
assert.equal((await runtime.loopNext()).ok, true);
assert.equal((await runtime.loopNext()).loop.status, "waiting-decision");
const accepted = runtime.acceptLoop("visual-loop", { note: "Improved", finish: true });
assert.equal(accepted.status, "finished");

const snapshot = runtime.snapshot();
const restored = createHeadlessEditorRuntime({ id: "restored", environment });
restored.loadSnapshot(snapshot);
assert.equal(restored.history().length, runtime.history().length);
assert.equal(restored.getLoop("visual-loop").status, "finished");

const client = createHeadlessEditorTerminalClient({ runtime });
assert.equal((await client.dispatch("status")).ok, true);
assert.equal((await client.dispatch("capabilities runtime")).capabilities.length, 2);
assert.equal((await client.dispatch("call runtime.tick --amount 2")).data.frame, 7);
assert.equal((await client.dispatch("inspect runtime")).data.frame, 7);
assert.equal((await client.dispatch("loop status")).loop.status, "finished");

const transport = createInProcessHeadlessEditorTransport({ runtime });
assert.equal((await transport.dispatch("runtime.tick", { amount: 1 })).data.frame, 8);
assert.equal(transport.disconnect().connected, false);
assert.equal((await transport.dispatch("runtime.tick", { amount: 1 })).status, "disconnected");
transport.connect();

const browserAdapter = createBrowserDriverHeadlessEditorAdapter({
  driver: {
    async capabilities() { return { screenshot: true }; },
    async capture(args) { return { ok: true, data: { label: args.label ?? "capture" } }; }
  }
});
assert.equal((await browserAdapter.connect()).connected, true);
assert.equal((await browserAdapter.discover()).capabilities.screenshot, true);
assert.equal((await browserAdapter.invoke({ action: "browser.capture", arguments: { label: "smoke" } })).data.label, "smoke");

const harness = createHeadlessEditorHarness({
  workspace: "memory",
  adapter: {
    id: "runtime-router-adapter",
    async read() { return { ok: true, scene: { id: "fixture" } }; }
  },
  sessionId: "runtime-router-session",
  now: () => "2026-07-10T12:00:00.000Z"
});
const router = createHeadlessEditorRouter({ harness, runtime, now: () => "2026-07-10T12:00:00.000Z" });
const routedCapabilities = await router.dispatch("capabilities renderer");
assert.equal(routedCapabilities.ok, true);
assert.equal(routedCapabilities.result.capabilities.length, 1);
const routedCall = await router.dispatch("call runtime.tick --amount 1");
assert.equal(routedCall.result.data.frame, 9);

runtime.reset({ keepEnvironment: true });
assert.equal(runtime.history().length, 0);
assert.equal(runtime.listEnvironments().length, 1);

console.log("core headless editor runtime smoke ok");
