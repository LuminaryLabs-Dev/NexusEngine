const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function validateComputeProvider(provider) {
  if (!provider || typeof provider !== "object") throw new TypeError("Core Compute provider must be an object.");
  if (typeof provider.id !== "string" || !provider.id.trim()) throw new TypeError("Core Compute provider requires a stable id.");
  if (typeof provider.executeGraph !== "function") throw new TypeError("Core Compute provider requires executeGraph(request).");
  return provider;
}

export function createComputeExecutionRequest(input = {}) {
  const request = {
    graph: clone(input.graph),
    executionOrder: clone(input.executionOrder ?? input.graph?.executionOrder ?? []),
    buffers: clone(input.buffers ?? {}),
    kernels: clone(input.kernels ?? {}),
    input: clone(input.input ?? {}),
    context: clone(input.context ?? {})
  };
  structuredClone(request);
  return Object.freeze(request);
}

export function normalizeComputeExecutionResult(result = {}, request = {}, providerId = "compute-provider") {
  const normalized = {
    providerId: String(result.providerId ?? providerId),
    graphId: String(result.graphId ?? request.graph?.id ?? "compute-graph"),
    status: String(result.status ?? "completed"),
    outputs: clone(result.outputs ?? {}),
    diagnostics: clone(result.diagnostics ?? []),
    metadata: clone(result.metadata ?? {})
  };
  structuredClone(normalized);
  return Object.freeze(normalized);
}
