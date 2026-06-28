export function createGraphicsAdapterBoundary(config = {}) {
  return Object.freeze({
    id: config.id ?? "graphics-adapter",
    kind: config.kind ?? "headless",
    capabilities: Object.freeze({ ...(config.capabilities ?? {}) }),
    render: typeof config.render === "function" ? config.render : () => null,
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
