export function createModelAdapterBoundary(config = {}) {
  if (typeof config.infer !== "function") {
    throw new TypeError("Model adapter requires infer(request, context).");
  }
  return Object.freeze({
    id: config.id ?? "model-adapter",
    kind: config.kind ?? "provider",
    capabilities: Object.freeze([...(config.capabilities ?? [])]),
    infer: config.infer,
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
