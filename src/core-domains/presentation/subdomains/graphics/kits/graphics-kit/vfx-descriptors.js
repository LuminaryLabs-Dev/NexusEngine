export function createVFXDescriptor(config = {}) {
  return Object.freeze({
    id: config.id ?? "vfx",
    kind: config.kind ?? "generic",
    trigger: config.trigger ?? "manual",
    durationSeconds: Number(config.durationSeconds ?? 0),
    targetId: config.targetId ?? null,
    payload: Object.freeze({ ...(config.payload ?? {}) }),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
