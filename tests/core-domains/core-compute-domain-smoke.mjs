import assert from "node:assert/strict";
import {
  createComputeKit,
  createComputeGraphDescriptor,
  createComputeHost,
  createJavaScriptComputeProvider,
  createVulkanComputeContract,
  createOpenGLComputeContract,
  createNativeComputeContract,
  createComputeResourceDescriptor,
  createComputeDispatchRequest,
  createEngine
} from "../helpers/public-package-surface.mjs";

const provider = {
  id: "headless-compute-provider",
  synced: null,
  executions: 0,
  syncDescriptors(descriptors) { this.synced = structuredClone(descriptors); },
  async executeGraph(request) {
    this.executions += 1;
    return { status: "completed", outputs: { executionOrder: request.executionOrder, execution: this.executions } };
  },
  reset() { this.executions = 0; },
  dispose() {}
};

const engine = createEngine({
  kits: [createComputeKit({
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
        { id: "interpolate", kernelId: "interpolate-transforms", reads: ["previous-transforms", "current-transforms"], writes: ["visible-instances"] },
        { id: "cull", kernelId: "frustum-cull", dependsOn: ["interpolate"], reads: ["visible-instances"], writes: ["visible-instances"] }
      ]
    }]
  })]
});

const compute = engine.n.compute;
assert.ok(compute, "Core Compute installs under engine.n.compute");
assert.equal(engine.n.ownerOf("n:compute"), "compute-graph-kit");
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
}, { buffers: compute.getSnapshot().descriptors.buffers, kernels: compute.getSnapshot().descriptors.kernels }), /cycle/);
compute.reset();
assert.equal(compute.getSnapshot().lastExecution, null);
const afterReset = await compute.executeGraph("gpu-scene-frame", { source: "direct-contract-test" });
assert.equal(afterReset.status, "completed", "injected provider remains available after deterministic reset");

const resource = createComputeResourceDescriptor({ id: "instances", kind: "buffer", byteLength: 128, usage: ["storage", "indirect"] });
assert.equal(resource.id, "instances");
assert.equal(createComputeDispatchRequest({ graphId: "gpu-scene-frame", dispatch: [4, 2, 1] }).workgroup.x, 4);

const javascript = createJavaScriptComputeProvider({ kernels: { add({ input }) { return Number(input.a ?? 0) + Number(input.b ?? 0); } } });
const host = createComputeHost({ providers: [javascript] });
const hostRequest = {
  graph: { id: "host-math", nodes: [{ id: "add", kernelId: "add", reads: [], writes: [], bindings: [], dispatch: { x: 1, y: 1, z: 1 }, indirect: null }] },
  executionOrder: ["add"], buffers: {}, kernels: { add: { id: "add", entryPoint: "add" } }, input: { a: 2, b: 5 }, context: {}
};
host.syncDescriptors({ buffers: {}, kernels: hostRequest.kernels, graphs: { "host-math": hostRequest.graph } });
const hostResult = await host.executeGraph(hostRequest);
assert.equal(hostResult.providerId, "javascript-compute");
assert.equal(hostResult.outputs.add, 7);
assert.equal(host.selectProvider({ requiredBackend: "webgpu", allowFallback: true }), null);

assert.equal(createVulkanComputeContract().backend, "vulkan");
assert.equal(createOpenGLComputeContract().backend, "opengl");
assert.equal(createNativeComputeContract().backend, "native");

console.log("core compute provider-neutral domain smoke ok");
