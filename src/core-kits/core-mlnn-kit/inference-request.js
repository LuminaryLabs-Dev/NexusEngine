export function createInferenceRequest(config = {}) {
  return Object.freeze({
    id: config.id ?? "inference-request",
    modelId: config.modelId ?? "mock-model",
    kind: config.kind ?? "mock",
    input: structuredClone(config.input ?? null),
    parameters: Object.freeze({ ...(config.parameters ?? {}) }),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
