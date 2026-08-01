export function createLightingDescriptor(config = {}) {
  return Object.freeze({
    id: config.id ?? "lighting",
    kind: config.kind ?? "directional",
    intensity: Number(config.intensity ?? 1),
    color: config.color ?? "#ffffff",
    position: config.position ?? null,
    direction: config.direction ?? null,
    castsShadow: config.castsShadow === true,
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
