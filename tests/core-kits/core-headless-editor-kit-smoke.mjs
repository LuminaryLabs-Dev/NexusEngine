import assert from "node:assert/strict";
import {
  HEADLESS_EDITOR_STAGE_ORDER,
  createCoreHeadlessEditorKit,
  createHeadlessEditorHarness,
  createMemoryHeadlessRunWorkspace,
  createRealtimeGame,
  createTextHeadlessRunWorkspace
} from "../../src/index.js";

assert.deepEqual(HEADLESS_EDITOR_STAGE_ORDER, [
  "read",
  "capture-before",
  "plan",
  "validate",
  "submit",
  "observe",
  "verify",
  "capture-after",
  "observed-differences"
]);

const workspace = createMemoryHeadlessRunWorkspace();
await workspace.writeJson("read/scene.json", { id: "demo-scene" });
await workspace.writeText("plan/plan.md", "# Plan");
assert.equal((await workspace.readJson("read/scene.json")).id, "demo-scene");
assert.deepEqual(await workspace.list("read"), ["read/scene.json"]);

const snapshot = await workspace.snapshot();
const textWorkspace = createTextHeadlessRunWorkspace(snapshot);
assert.equal(await textWorkspace.readText("plan/plan.md"), "# Plan");
assert.equal(JSON.parse(await textWorkspace.toTextBundle()).version, "0.0.1");

const adapter = {
  id: "test-adapter",
  async read() {
    return {
      ok: true,
      scene: { id: "scene-before" },
      hierarchy: { roots: ["MeadowRoot"] },
      assets: ["grass.png"],
      runtime: { frame: 1 }
    };
  },
  async capture({ phase }) {
    return {
      ok: true,
      phase,
      captures: [{ id: `${phase}-scene`, path: `${phase}/scene.txt` }],
      files: { [`capture-${phase}/scene.txt`]: `capture ${phase}` }
    };
  },
  async plan({ goal }) {
    return {
      ok: true,
      goal,
      commands: [{ action: "scene.create", id: "meadow-root" }]
    };
  },
  async validate() {
    return { ok: true, issues: [] };
  },
  async submit({ plan }) {
    return { ok: true, submitted: true, runId: "queue-1", planId: plan.id };
  },
  async observe() {
    return { ok: true, status: "completed", runId: "queue-1", logs: ["done"] };
  },
  async verify() {
    return { ok: true, checks: [{ id: "scene-exists", ok: true }], readAfter: { scene: { id: "scene-after" } } };
  }
};

const harness = createHeadlessEditorHarness({
  workspace: "memory",
  adapter,
  goal: "Build a meadow scene",
  sessionId: "headless-test-session",
  now: () => "2026-07-08T12:00:00.000Z"
});

const result = await harness.run();
assert.equal(result.ok, true);
assert.equal(result.stageResults.length, 9);
assert.equal((await harness.workspace.readJson("plan/commands.json"))[0].action, "scene.create");
assert.equal((await harness.workspace.readJson("submit/submit.json")).runId, "queue-1");
assert.equal(await harness.workspace.readText("capture-before/scene.txt"), "capture before");
assert.equal(await harness.workspace.exists("observed-differences/summary.md"), true);

const engine = createRealtimeGame({ kits: [createCoreHeadlessEditorKit()] });
const headless = engine.n.coreHeadlessEditor;
assert.equal(typeof headless.createWorkspace, "function");
assert.equal(headless.getStageOrder()[0], "read");
const apiWorkspace = headless.createWorkspace("memory");
await apiWorkspace.writeJson("run.json", { id: "api-run" });
const apiSnapshot = await headless.captureWorkspaceSnapshot(apiWorkspace, "api-snapshot");
assert.equal(apiSnapshot.files["run.json"].encoding, "utf8");
assert.equal(headless.getSnapshot().lastWorkspaceSnapshot.label, "api-snapshot");

console.log("core headless editor kit smoke ok");
