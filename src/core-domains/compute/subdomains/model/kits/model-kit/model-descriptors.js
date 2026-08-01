export function createModelDescriptor(config = {}) {
  return Object.freeze({
    id: config.id ?? "model",
    kind: config.kind ?? "model",
    backend: config.backend ?? null,
    adapterId: config.adapterId ?? null,
    input: config.input ?? "unknown",
    output: config.output ?? "descriptor",
    capabilities: Object.freeze([...(config.capabilities ?? [])]),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
