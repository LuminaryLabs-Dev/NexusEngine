import { applyFoundationBlend } from "../foundation-composition-kit/index.js";

export function sampleFoundationElevation(resolved, point = {}, samplers = {}) {
  const elevation = resolved?.channels?.elevation;
  if (typeof elevation === "number") return elevation;
  const operations = elevation?.operations ?? [];
  if (operations.length > 0) {
    let value = Number(elevation?.baseValue) || 0;
    for (const entry of operations) {
      if (entry.scalar !== undefined) {
        value = applyFoundationBlend(value, entry.scalar, entry.blendMode);
        continue;
      }
      const field = entry.field ?? {};
      const sampler = samplers[field.featureType] ?? samplers[field.kind];
      if (typeof sampler === "function") value = applyFoundationBlend(value, sampler(field.definition ?? field, point), entry.blendMode);
    }
    return value;
  }
  let value = Number(elevation?.value) || 0;
  for (const entry of elevation?.fields ?? []) {
    const field = entry.field ?? {};
    const sampler = samplers[field.featureType] ?? samplers[field.kind];
    if (typeof sampler !== "function") continue;
    value = applyFoundationBlend(value, sampler(field.definition ?? field, point), entry.blendMode);
  }
  return value;
}

export function sampleFoundationChannel(resolved, channel, point = {}, samplers = {}) {
  if (channel === "elevation") return sampleFoundationElevation(resolved, point, samplers);
  return resolved?.channels?.[channel] ?? null;
}
