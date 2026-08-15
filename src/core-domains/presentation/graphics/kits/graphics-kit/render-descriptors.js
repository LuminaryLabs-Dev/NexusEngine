const freezeStrings = values => Object.freeze([...(values ?? [])].map(String));

export function createRenderDescriptor(config = {}) {
  return Object.freeze({
    id: config.id ?? "render-descriptor",
    kind: config.kind ?? "object",
    layer: config.layer ?? "default",
    passId: config.passId ?? null,
    order: Number(config.order ?? 0),
    materialId: config.materialId ?? null,
    transformId: config.transformId ?? null,
    assetId: config.assetId ?? null,
    visible: config.visible !== false,
    reads: freezeStrings(config.reads),
    writes: freezeStrings(config.writes),
    requires: freezeStrings(config.requires),
    depth: Object.freeze({
      test: config.depth?.test !== false,
      write: config.depth?.write === true,
      source: config.depth?.source ?? null
    }),
    blend: Object.freeze({
      mode: config.blend?.mode ?? "none",
      premultipliedAlpha: config.blend?.premultipliedAlpha === true
    }),
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
