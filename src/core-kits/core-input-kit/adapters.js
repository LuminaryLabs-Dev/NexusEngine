export function createInputAdapterBoundary(config = {}) {
  return Object.freeze({
    id: config.id ?? "input-adapter",
    kind: config.kind ?? "generic",
    devices: Object.freeze([...(config.devices ?? [])]),
    normalize: typeof config.normalize === "function" ? config.normalize : (input) => input,
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
