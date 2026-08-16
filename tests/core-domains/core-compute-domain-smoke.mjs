import assert from "node:assert/strict";
import {
  createComputeKit,
  createComputeGraphDescriptor,
  createComputeHost,
  createJavaScriptComputeProvider,
  createWebGPUComputeProvider,
  createVulkanComputeContract,
  createOpenGLComputeContract,
  createNativeComputeContract,
  createComputeResourceDescriptor,
  createComputeDispatchRequest,
  resolveComputeProviderResource,
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

const calls = [];
const mockDevice = {
  queue: { writeBuffer() { calls.push("write-buffer"); }, submit() { calls.push("submit"); }, async onSubmittedWorkDone() { calls.push("complete"); } },
  createBuffer(descriptor) { calls.push("buffer"); return { descriptor, destroy() {} }; },
  createShaderModule() { calls.push("shader"); return { async getCompilationInfo() { return { messages: [] }; } }; },
  async createComputePipelineAsync() { calls.push("pipeline"); return { getBindGroupLayout() { return {}; } }; },
  createBindGroup() { calls.push("bind-group"); return {}; },
  createCommandEncoder() {
    return {
      beginComputePass() {
        return { setPipeline() {}, setBindGroup() {}, dispatchWorkgroups(x) { calls.push(`dispatch:${x}`); }, dispatchWorkgroupsIndirect() { calls.push("dispatch-indirect"); }, end() {} };
      },
      finish() { return {}; }
    };
  }
};
const webgpu = createWebGPUComputeProvider({ device: mockDevice });
const webgpuRequest = {
  graph: { id: "webgpu-smoke", nodes: [{ id: "fill", kernelId: "fill", reads: [], writes: ["out"], bindings: ["out"], dispatch: { x: 4, y: 1, z: 1 }, indirect: null }] },
  executionOrder: ["fill"],
  buffers: { out: { id: "out", byteLength: 64, usage: ["storage"] } },
  kernels: { fill: { id: "fill", entryPoint: "main", source: "@group(0) @binding(0) var<storage,read_write> out: array<u32>; @compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3<u32>) { out[id.x] = id.x; }" } },
  input: {}, context: {}
};
const webgpuResult = await webgpu.executeGraph(webgpuRequest);
assert.equal(webgpuResult.metadata.backend, "webgpu");
assert.equal(webgpuResult.metadata.resourceReceipts[0].resourceId, "out");
assert.doesNotThrow(() => structuredClone(webgpuResult));
assert.ok(resolveComputeProviderResource(webgpu, webgpuResult.metadata.resourceReceipts[0]));
assert.ok(calls.includes("dispatch:4"));
assert.ok(calls.includes("submit"));
assert.equal(createVulkanComputeContract().backend, "vulkan");
assert.equal(createOpenGLComputeContract().backend, "opengl");
assert.equal(createNativeComputeContract().backend, "native");

console.log("core compute provider-neutral domain smoke ok");
