import { portableClone } from "../../../../portable.js";

function initialBufferValue(descriptor = {}) {
  const value = descriptor.initialData;
  if (value == null) return new Uint8Array(Number(descriptor.byteLength ?? 0));
  if (ArrayBuffer.isView(value)) return value.slice ? value.slice() : new Uint8Array(value.buffer.slice(0));
  if (value instanceof ArrayBuffer) return value.slice(0);
  if (Array.isArray(value)) return value.slice();
  return portableClone(value, "JavaScript compute buffer initialData");
}

export function createJavaScriptComputeProvider(config = {}) {
  const kernelHandlers = new Map(Object.entries(config.kernels ?? {}));
  const buffers = new Map();
  let descriptors = { buffers: {}, kernels: {}, graphs: {} };
  let sequence = 0;

  function syncDescriptors(next = {}) {
    descriptors = portableClone(next, "JavaScript compute descriptors");
    for (const [id, descriptor] of Object.entries(descriptors.buffers ?? {})) {
      if (!buffers.has(id)) buffers.set(id, initialBufferValue(descriptor));
    }
  }

  return {
    id: String(config.id ?? "javascript-compute"),
    capabilities: {
      family: "cpu",
      backend: "javascript",
      features: ["portable-graph", "deterministic-order", "cpu-fallback"],
      priority: Number(config.priority ?? 10)
    },
    supports() { return true; },
    syncDescriptors,
    registerKernel(id, handler) {
      if (typeof handler !== "function") throw new TypeError("JavaScript compute kernel handler must be a function.");
      kernelHandlers.set(String(id), handler);
      return this;
    },
    getBuffer(id) { return buffers.get(String(id)); },
    setBuffer(id, value) { buffers.set(String(id), value); return value; },
    async executeGraph(request) {
      syncDescriptors({
        buffers: request.buffers ?? descriptors.buffers,
        kernels: request.kernels ?? descriptors.kernels,
        graphs: { ...(descriptors.graphs ?? {}), [request.graph?.id ?? "graph"]: request.graph }
      });
      const nodeById = new Map((request.graph?.nodes ?? []).map((node) => [node.id, node]));
      const diagnostics = [];
      const outputs = {};
      for (const nodeId of request.executionOrder ?? []) {
        const node = nodeById.get(nodeId);
        if (!node) throw new Error(`JavaScript compute graph references missing node ${nodeId}.`);
        const kernel = request.kernels?.[node.kernelId] ?? descriptors.kernels?.[node.kernelId];
        const handler = kernelHandlers.get(node.kernelId) ?? kernelHandlers.get(kernel?.entryPoint);
        if (typeof handler !== "function") throw new Error(`JavaScript compute provider has no handler for kernel ${node.kernelId}.`);
        const result = await handler({
          node: portableClone(node),
          kernel: portableClone(kernel),
          buffers,
          input: portableClone(request.input ?? {}),
          context: portableClone(request.context ?? {})
        });
        if (result !== undefined) outputs[node.id] = portableClone(result, `JavaScript compute output ${node.id}`);
        diagnostics.push({ nodeId: node.id, status: "completed" });
      }
      sequence += 1;
      return {
        providerId: this.id,
        graphId: request.graph?.id,
        status: "completed",
        outputs,
        diagnostics,
        metadata: { sequence, family: "cpu", backend: "javascript" }
      };
    },
    reset() { sequence = 0; buffers.clear(); syncDescriptors(descriptors); },
    dispose() { buffers.clear(); kernelHandlers.clear(); }
  };
}

export function createWorkerComputeProvider(config = {}) {
  let worker = config.worker ?? null;
  let requestSequence = 0;
  const pending = new Map();
  const timeoutMs = Number(config.timeoutMs ?? 30000);

  function ensureWorker() {
    if (worker) return worker;
    if (typeof config.workerFactory === "function") worker = config.workerFactory();
    else if (config.workerUrl && typeof Worker !== "undefined") worker = new Worker(config.workerUrl, { type: "module" });
    if (!worker) throw new Error("Worker compute provider requires worker, workerFactory, or workerUrl.");
    worker.addEventListener?.("message", (event) => {
      const message = event.data ?? {};
      const entry = pending.get(message.requestId);
      if (!entry) return;
      clearTimeout(entry.timeout);
      pending.delete(message.requestId);
      if (message.error) entry.reject(new Error(String(message.error)));
      else entry.resolve(message.result ?? message);
    });
    worker.addEventListener?.("error", (error) => {
      for (const entry of pending.values()) {
        clearTimeout(entry.timeout);
        entry.reject(error instanceof Error ? error : new Error(String(error?.message ?? error)));
      }
      pending.clear();
    });
    return worker;
  }

  return {
    id: String(config.id ?? "worker-compute"),
    capabilities: {
      family: "cpu",
      backend: "javascript-worker",
      features: ["portable-graph", "off-main-thread", "transferable"],
      priority: Number(config.priority ?? 40)
    },
    syncDescriptors(descriptors) {
      ensureWorker().postMessage({ type: "nexus-compute-sync", descriptors: portableClone(descriptors) });
    },
    async executeGraph(request) {
      const requestId = `${this.id}:${++requestSequence}`;
      const target = ensureWorker();
      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error(`Worker compute request ${requestId} timed out.`));
        }, timeoutMs);
        pending.set(requestId, { resolve, reject, timeout });
        target.postMessage({ type: "nexus-compute-execute", requestId, request: portableClone(request) });
      });
    },
    reset() { requestSequence = 0; },
    dispose() {
      for (const entry of pending.values()) clearTimeout(entry.timeout);
      pending.clear();
      worker?.terminate?.();
      worker = null;
    }
  };
}
