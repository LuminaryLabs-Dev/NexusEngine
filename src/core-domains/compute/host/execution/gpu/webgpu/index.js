import { portableClone } from "../../../../portable.js";
import { createComputeResourceReceipt } from "../../../../resource/index.js";

const DEFAULT_BUFFER_USAGE = Object.freeze({
  MAP_READ: 0x0001,
  MAP_WRITE: 0x0002,
  COPY_SRC: 0x0004,
  COPY_DST: 0x0008,
  INDEX: 0x0010,
  VERTEX: 0x0020,
  UNIFORM: 0x0040,
  STORAGE: 0x0080,
  INDIRECT: 0x0100,
  QUERY_RESOLVE: 0x0200
});

function usageFlags(descriptor = {}, constants = DEFAULT_BUFFER_USAGE) {
  const source = descriptor.usage ?? ["storage"];
  const names = Array.isArray(source) ? source : [source];
  let flags = 0;
  for (const name of names) {
    const key = String(name).replaceAll("-", "_").toUpperCase();
    if (key === "READBACK") flags |= constants.MAP_READ | constants.COPY_DST;
    else if (key === "UPLOAD") flags |= constants.MAP_WRITE | constants.COPY_SRC;
    else if (constants[key] != null) flags |= constants[key];
  }
  if (flags === 0) flags = constants.STORAGE | constants.COPY_DST | constants.COPY_SRC;
  return flags;
}

function bytesFrom(value) {
  if (value == null) return null;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (Array.isArray(value)) return new Float32Array(value);
  throw new TypeError("WebGPU compute initialData must be an ArrayBuffer, TypedArray, or numeric array.");
}

function alignedSize(value) {
  const size = Math.max(4, Number(value ?? 0));
  return Math.ceil(size / 4) * 4;
}

function kernelSource(kernel = {}) {
  const source = kernel.source ?? kernel.metadata?.source ?? kernel.metadata?.wgsl;
  if (typeof source !== "string" || !source.trim()) {
    throw new Error(`WebGPU compute kernel ${kernel.id ?? "kernel"} requires portable WGSL source.`);
  }
  return source;
}

function nodeBindingIds(node = {}) {
  if (Array.isArray(node.bindings) && node.bindings.length) return node.bindings.map(String);
  const ids = [];
  for (const id of [...(node.reads ?? []), ...(node.writes ?? [])]) {
    const key = String(id);
    if (!ids.includes(key)) ids.push(key);
  }
  return ids;
}

export function createWebGPUComputeProvider(config = {}) {
  let adapter = config.adapter ?? null;
  let device = config.device ?? null;
  let descriptors = { buffers: {}, kernels: {}, graphs: {} };
  const resources = new Map();
  const pipelines = new Map();
  let sequence = 0;
  const bufferUsage = config.GPUBufferUsage ?? globalThis.GPUBufferUsage ?? DEFAULT_BUFFER_USAGE;

  async function ensureDevice() {
    if (device) return device;
    const gpu = config.gpu ?? globalThis.navigator?.gpu;
    if (!gpu) throw new Error("WebGPU is unavailable in this host.");
    adapter = adapter ?? await gpu.requestAdapter(config.adapterOptions ?? {});
    if (!adapter) throw new Error("WebGPU adapter acquisition failed.");
    device = await adapter.requestDevice(config.deviceDescriptor ?? {});
    if (!device) throw new Error("WebGPU device acquisition failed.");
    return device;
  }

  function destroyResources() {
    for (const resource of resources.values()) resource.buffer?.destroy?.();
    resources.clear();
    pipelines.clear();
  }

  async function ensureBuffer(id, descriptor = {}) {
    const gpuDevice = await ensureDevice();
    const existing = resources.get(id);
    const initial = bytesFrom(descriptor.initialData);
    const size = alignedSize(descriptor.byteLength || initial?.byteLength || 4);
    if (existing && existing.size === size) return existing.buffer;
    existing?.buffer?.destroy?.();
    const buffer = gpuDevice.createBuffer({
      label: `nexus-compute:${id}`,
      size,
      usage: usageFlags(descriptor, bufferUsage),
      mappedAtCreation: false
    });
    if (initial?.byteLength) gpuDevice.queue.writeBuffer(buffer, 0, initial.buffer, initial.byteOffset, initial.byteLength);
    resources.set(id, { buffer, size, revision: Number(existing?.revision ?? -1) + 1 });
    return buffer;
  }

  async function ensurePipeline(kernel = {}) {
    const gpuDevice = await ensureDevice();
    const source = kernelSource(kernel);
    const cacheKey = `${kernel.id}:${kernel.entryPoint}:${source}`;
    if (pipelines.has(cacheKey)) return pipelines.get(cacheKey);
    const shaderModule = gpuDevice.createShaderModule({
      label: `nexus-compute:${kernel.id}:wgsl`,
      code: source
    });
    const compilation = await shaderModule.getCompilationInfo?.();
    const errors = compilation?.messages?.filter((message) => message.type === "error") ?? [];
    if (errors.length) throw new Error(`WebGPU kernel ${kernel.id} failed compilation: ${errors.map((entry) => entry.message).join("; ")}`);
    const descriptor = {
      label: `nexus-compute:${kernel.id}:pipeline`,
      layout: "auto",
      compute: {
        module: shaderModule,
        entryPoint: kernel.entryPoint ?? "main",
        constants: kernel.constants ?? kernel.metadata?.constants
      }
    };
    const pipeline = typeof gpuDevice.createComputePipelineAsync === "function"
      ? await gpuDevice.createComputePipelineAsync(descriptor)
      : gpuDevice.createComputePipeline(descriptor);
    pipelines.set(cacheKey, pipeline);
    return pipeline;
  }

  async function syncRequestBuffers(request) {
    for (const [id, descriptor] of Object.entries(request.buffers ?? {})) await ensureBuffer(id, descriptor);
  }

  return {
    id: String(config.id ?? "webgpu-compute"),
    capabilities: {
      family: "gpu",
      backend: "webgpu",
      features: ["portable-graph", "storage-buffer", "compute-pipeline", "direct-dispatch", "gpu-resident-resource"],
      priority: Number(config.priority ?? 100)
    },
    getCapabilities() {
      return {
        ...this.capabilities,
        features: [...this.capabilities.features, ...(adapter?.features ? Array.from(adapter.features, String) : [])],
        limits: portableClone(config.limits ?? {}, "WebGPU adapter limits")
      };
    },
    supports(profile = {}) {
      return !profile.requiredBackend || profile.requiredBackend === "webgpu";
    },
    initialize() {},
    syncDescriptors(next = {}) {
      descriptors = portableClone(next, "WebGPU compute descriptors");
    },
    async executeGraph(request) {
      const gpuDevice = await ensureDevice();
      await syncRequestBuffers(request);
      const encoder = gpuDevice.createCommandEncoder({ label: `nexus-compute:${request.graph?.id ?? "graph"}` });
      const pass = encoder.beginComputePass({ label: `nexus-compute:${request.graph?.id ?? "graph"}:pass` });
      const nodeById = new Map((request.graph?.nodes ?? []).map((node) => [node.id, node]));
      const diagnostics = [];
      for (const nodeId of request.executionOrder ?? []) {
        const node = nodeById.get(nodeId);
        if (!node) throw new Error(`WebGPU compute graph references missing node ${nodeId}.`);
        const kernel = request.kernels?.[node.kernelId] ?? descriptors.kernels?.[node.kernelId];
        if (!kernel) throw new Error(`WebGPU compute node ${node.id} references missing kernel ${node.kernelId}.`);
        const pipeline = await ensurePipeline(kernel);
        pass.setPipeline(pipeline);
        const bindings = nodeBindingIds(node);
        if (bindings.length) {
          const entries = [];
          for (let binding = 0; binding < bindings.length; binding += 1) {
            const resourceId = bindings[binding];
            const descriptor = request.buffers?.[resourceId] ?? descriptors.buffers?.[resourceId];
            const buffer = await ensureBuffer(resourceId, descriptor);
            entries.push({ binding, resource: { buffer } });
          }
          const bindGroup = gpuDevice.createBindGroup({
            label: `nexus-compute:${node.id}:bindings`,
            layout: pipeline.getBindGroupLayout(0),
            entries
          });
          pass.setBindGroup(0, bindGroup);
        }
        if (node.indirect?.bufferId) {
          const indirectBuffer = await ensureBuffer(node.indirect.bufferId, request.buffers?.[node.indirect.bufferId] ?? {});
          pass.dispatchWorkgroupsIndirect(indirectBuffer, Number(node.indirect.offset ?? 0));
        } else {
          pass.dispatchWorkgroups(Number(node.dispatch?.x ?? 1), Number(node.dispatch?.y ?? 1), Number(node.dispatch?.z ?? 1));
        }
        diagnostics.push({ nodeId: node.id, kernelId: kernel.id, status: "encoded" });
      }
      pass.end();
      const commandBuffer = encoder.finish();
      gpuDevice.queue.submit([commandBuffer]);
      if (config.awaitCompletion !== false) await gpuDevice.queue.onSubmittedWorkDone?.();
      sequence += 1;
      const resourceReceipts = Object.keys(request.buffers ?? {}).sort().map((resourceId) => {
        const entry = resources.get(resourceId);
        return createComputeResourceReceipt({
          resourceId,
          providerId: this.id,
          backend: "webgpu",
          revision: entry?.revision ?? 0,
          resident: Boolean(entry),
          byteLength: entry?.size ?? request.buffers?.[resourceId]?.byteLength ?? 0
        });
      });
      return {
        providerId: this.id,
        graphId: request.graph?.id,
        status: "completed",
        outputs: {},
        diagnostics,
        metadata: { family: "gpu", backend: "webgpu", sequence, resourceReceipts }
      };
    },
    resolveResource(resourceId) {
      return resources.get(String(resourceId))?.buffer ?? null;
    },
    getDevice() { return device; },
    getAdapter() { return adapter; },
    reset() { sequence = 0; destroyResources(); },
    dispose() { destroyResources(); device = null; adapter = null; }
  };
}
