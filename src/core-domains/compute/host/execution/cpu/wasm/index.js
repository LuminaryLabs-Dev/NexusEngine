import { portableClone } from "../../../../portable.js";

export function createWasmComputeProvider(config = {}) {
  let instance = config.instance ?? null;
  let compiledModule = config.module ?? null;
  let descriptors = { buffers: {}, kernels: {}, graphs: {} };

  async function ensureInstance() {
    if (instance) return instance;
    if (!compiledModule) {
      const source = config.bytes ?? config.source;
      if (!source) throw new Error("WASM compute provider requires instance, module, or bytes.");
      compiledModule = await WebAssembly.compile(source);
    }
    instance = await WebAssembly.instantiate(compiledModule, config.imports ?? {});
    return instance;
  }

  return {
    id: String(config.id ?? "wasm-compute"),
    capabilities: {
      family: "cpu",
      backend: "wasm",
      features: ["portable-graph", "wasm", ...(config.simd ? ["simd"] : []), ...(config.threads ? ["threads"] : [])],
      priority: Number(config.priority ?? 30)
    },
    syncDescriptors(next) { descriptors = portableClone(next, "WASM compute descriptors"); },
    async executeGraph(request) {
      const wasm = await ensureInstance();
      const nodeById = new Map((request.graph?.nodes ?? []).map((node) => [node.id, node]));
      const outputs = {};
      for (const nodeId of request.executionOrder ?? []) {
        const node = nodeById.get(nodeId);
        const kernel = request.kernels?.[node?.kernelId] ?? descriptors.kernels?.[node?.kernelId];
        const fn = wasm.exports?.[kernel?.entryPoint ?? node?.kernelId];
        if (typeof fn !== "function") throw new Error(`WASM compute export is missing: ${kernel?.entryPoint ?? node?.kernelId}.`);
        const args = Array.isArray(request.input?.[node.id]) ? request.input[node.id] : [];
        outputs[node.id] = fn(...args);
      }
      return {
        providerId: this.id,
        graphId: request.graph?.id,
        status: "completed",
        outputs: portableClone(outputs),
        diagnostics: [],
        metadata: { family: "cpu", backend: "wasm" }
      };
    },
    reset() {},
    dispose() { instance = null; }
  };
}
