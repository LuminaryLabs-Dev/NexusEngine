import assert from "node:assert/strict";
import {
  createCoreComputeDomain,
  createComputeGraphDescriptor,
  createHeadlessEditorHarness,
  createHeadlessEditorRouter,
  createRealtimeGame
} from "../../src/index.js";

const provider = {
  id: "headless-compute-provider",
  synced: null,
  executions: 0,
  syncDescriptors(descriptors) {
    this.synced = structuredClone(descriptors);
  },
  async executeGraph(request) {
    this.executions += 1;
    return {
      status: "completed",
      outputs: {
        executionOrder: request.executionOrder,
        execution: this.executions
      }
    };
  },
  reset() {
    this.executions = 0;
  },
  dispose() {}
};

const engine = createRealtimeGame({
  kits: createCoreComputeDomain({
    root: {
      buffers: [
        { id: "previous-transforms", byteLength: 64, usage: ["storage"] },
        { id: "current-transforms", byteLength: 64, usage: ["storage"] },
        { id: "visible-instances", byteLength: 64, usage: ["storage", "indirect"] }
      ],
      kernels: [
        { id: "interpolate-transforms", entryPoint: "interpolateTransforms" },
        { id: "frustum-cull", entryPoint: "frustumCull" }
      ],
      graphs: [{
        id: "gpu-scene-frame",
        nodes: [
          {
            id: "interpolate",
            kernelId: "interpolate-transforms",
            reads: ["previous-transforms", "current-transforms"],
            writes: ["visible-instances"]
          },
          {
            id: "cull",
            kernelId: "frustum-cull",
            dependsOn: ["interpolate"],
            reads: ["visible-instances"],
            writes: ["visible-instances"]
          }
        ]
      }]
    }
  })
});

const compute = engine.n.coreCompute;
assert.ok(compute, "Core Compute installs under engine.n.coreCompute");
assert.equal(engine.n.ownerOf("n:compute"), "core-compute-domain");
assert.deepEqual(compute.getExecutionPlan("gpu-scene-frame").executionOrder, ["interpolate", "cull"]);
assert.equal(compute.validateGraph("gpu-scene-frame").valid, true);

compute.setProvider(provider);
const first = await compute.executeGraph("gpu-scene-frame", { interpolation: 0.5 });
assert.equal(first.status, "completed");
assert.deepEqual(first.outputs.executionOrder, ["interpolate", "cull"]);
assert.equal(provider.synced.graphs["gpu-scene-frame"].id, "gpu-scene-frame");
structuredClone(compute.getSnapshot());

assert.throws(() => createComputeGraphDescriptor({
  id: "cycle",
  nodes: [
    { id: "a", kernelId: "interpolate-transforms", dependsOn: ["b"] },
    { id: "b", kernelId: "frustum-cull", dependsOn: ["a"] }
  ]
}, {
  buffers: compute.getSnapshot().descriptors.buffers,
  kernels: compute.getSnapshot().descriptors.kernels
}), /cycle/);

compute.reset();
assert.equal(compute.getSnapshot().lastExecution, null);

const adapter = {
  id: "core-compute-headless-validation-adapter",
  async read() {
    return { ok: true, runtime: { compute: compute.getSnapshot() } };
  },
  async capture({ phase }) {
    return {
      ok: true,
      phase,
      captures: [{ id: `${phase}-compute-snapshot`, kind: "state" }]
    };
  },
  async plan() {
    return {
      ok: true,
      commands: [{ action: "compute.execute-graph", arguments: { graphId: "gpu-scene-frame" } }],
      notes: ["Validate provider-neutral compute graph execution."]
    };
  },
  async validate() {
    const validation = compute.validateGraph("gpu-scene-frame");
    return {
      ok: validation.valid,
      issues: validation.errors.map((message) => ({
        severity: "error",
        code: "compute-graph-invalid",
        message
      }))
    };
  },
  async submit() {
    const result = await compute.executeGraph("gpu-scene-frame", { source: "headless-editor" });
    return { ok: true, submitted: true, runId: "core-compute-smoke", result };
  },
  async observe() {
    return {
      ok: true,
      status: "completed",
      result: compute.getSnapshot().lastExecution
    };
  },
  async verify() {
    const snapshot = compute.getSnapshot();
    const ok = snapshot.lastExecution?.status === "completed";
    return {
      ok,
      checks: [{ id: "compute-executed", ok }],
      readAfter: { compute: snapshot }
    };
  },
  async observedDifferences({ readBefore, readAfter }) {
    return {
      ok: readAfter?.compute?.lastExecution?.status === "completed",
      structured: [{
        key: "compute.lastExecution",
        before: readBefore?.runtime?.compute?.lastExecution ?? null,
        after: readAfter?.compute?.lastExecution ?? null
      }],
      visual: [],
      validation: [{ id: "compute-graph", ok: true }],
      regressions: [],
      unverifiedClaims: []
    };
  }
};

const harness = createHeadlessEditorHarness({
  workspace: "memory",
  adapter,
  goal: "Validate the optional Core Compute domain without renderer or GPU submission dependencies.",
  sessionId: "core-compute-domain-smoke",
  now: () => "2026-07-12T16:00:00.000Z"
});
const router = createHeadlessEditorRouter({
  harness,
  now: () => "2026-07-12T16:00:00.000Z"
});

assert.equal((await router.dispatch("status")).ok, true);
assert.equal((await router.dispatch("next")).ok, true);
assert.equal((await router.dispatch("run read")).ok, true);
assert.equal((await router.dispatch("inspect read/packet.json")).result.ok, true);
const run = await router.dispatch("run-until observed-differences");
assert.equal(run.result.ok, true);
const difference = await router.dispatch("inspect observed-differences/difference.json");
assert.equal(JSON.parse(difference.result.text).regressions.length, 0);
assert.equal((await router.dispatch("report")).result.ok, true);

console.log("core compute domain and Headless Editor smoke ok");
