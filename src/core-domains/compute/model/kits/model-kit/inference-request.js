export function createInferenceRequest(config = {}) {
  return Object.freeze({
    id: config.id ?? "inference-request",
    modelId: config.modelId ?? "model",
    adapterId: config.adapterId ?? null,
    kind: config.kind ?? "inference",
    input: structuredClone(config.input ?? null),
    parameters: Object.freeze({ ...(config.parameters ?? {}) }),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
