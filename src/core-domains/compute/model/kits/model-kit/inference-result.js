export function createInferenceResult(config = {}) {
  return Object.freeze({
    id: config.id ?? "inference-result",
    modelId: config.modelId ?? "model",
    kind: config.kind ?? "inference",
    input: structuredClone(config.input ?? null),
    output: structuredClone(config.output ?? null),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
