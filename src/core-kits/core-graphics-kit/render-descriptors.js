export function createRenderDescriptor(config = {}) {
  return Object.freeze({
    id: config.id ?? "render-descriptor",
    kind: config.kind ?? "object",
    layer: config.layer ?? "default",
    materialId: config.materialId ?? null,
    transformId: config.transformId ?? null,
    assetId: config.assetId ?? null,
    visible: config.visible !== false,
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}

export function createInstanceDescriptor(config = {}) {
  return Object.freeze({
    id: config.id ?? "instance-descriptor",
    sourceId: config.sourceId ?? null,
    count: Math.max(0, Number(config.count ?? 0)),
    transforms: Object.freeze([...(config.transforms ?? [])]),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
