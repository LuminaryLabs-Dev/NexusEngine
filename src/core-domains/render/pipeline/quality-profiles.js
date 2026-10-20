export function createQualityProfile(config = {}) {
  return Object.freeze({
    id: config.id ?? "quality-profile",
    renderScale: Number(config.renderScale ?? 1),
    shadows: config.shadows ?? "auto",
    effects: config.effects ?? "auto",
    lodBias: Number(config.lodBias ?? 0),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
