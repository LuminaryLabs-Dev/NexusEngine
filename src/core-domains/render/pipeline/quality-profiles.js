function finite(value, name, positive = false) {
  const number = Number(value);
  if (!Number.isFinite(number) || (positive && number <= 0)) {
    throw new RangeError(`${name} must be ${positive ? "positive and " : ""}finite.`);
  }
  return number;
}

export function createQualityProfile(config = {}) {
  return Object.freeze({
    id: config.id ?? "quality-profile",
    renderScale: finite(config.renderScale ?? 1, "renderScale", true),
    shadows: config.shadows ?? "auto",
    effects: config.effects ?? "auto",
    lodBias: finite(config.lodBias ?? 0, "lodBias"),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
