export function createModelAdapterBoundary(config = {}) {
  return Object.freeze({
    id: config.id ?? "model-adapter",
    kind: config.kind ?? "mock",
    capabilities: Object.freeze([...(config.capabilities ?? [])]),
    infer: typeof config.infer === "function" ? config.infer : () => ({ output: { label: "mock", score: 1 } }),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
