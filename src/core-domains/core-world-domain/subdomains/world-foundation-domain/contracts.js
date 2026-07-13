import { clonePortableValue, inspectPortableValue } from "../../portable.js";

export const FOUNDATION_BLEND_MODES = Object.freeze(["add", "subtract", "replace", "max", "min", "overlay"]);

function requiredId(value, label) {
  const id = String(value ?? "").trim();
  if (!id) throw new TypeError(`${label} requires a stable id.`);
  return id;
}

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function portable(value, label) {
  const cloned = clonePortableValue(value ?? {}, label);
  const result = inspectPortableValue(cloned, { path: label });
  if (!result.portable) throw new TypeError(`${label} must be portable: ${result.issues.join(", ")}`);
  return cloned;
}

export function createFoundationContribution(input = {}) {
  const blendMode = String(input.blendMode ?? "add");
  if (!FOUNDATION_BLEND_MODES.includes(blendMode)) {
    throw new TypeError(`Unsupported foundation blend mode: ${blendMode}.`);
  }
  const channels = portable(input.channels ?? {}, "foundation-contribution.channels");
  if (Object.keys(channels).length === 0) throw new TypeError("Foundation contribution requires at least one channel.");
  return Object.freeze({
    id: requiredId(input.id, "Foundation contribution"),
    featureId: requiredId(input.featureId ?? input.id, "Foundation feature"),
    cellId: requiredId(input.cellId, "Foundation cell"),
    priority: finite(input.priority, 0),
    dependsOn: Object.freeze([...(input.dependsOn ?? [])].map(String).sort()),
    bounds: Object.freeze(portable(input.bounds ?? {}, "foundation-contribution.bounds")),
    channels: Object.freeze(channels),
    blendMode,
    version: Math.max(1, Math.floor(finite(input.version, 1))),
    metadata: Object.freeze(portable(input.metadata ?? {}, "foundation-contribution.metadata"))
  });
}

export function createResolvedFoundation(input = {}) {
  const channels = portable(input.channels ?? {}, "resolved-foundation.channels");
  return Object.freeze({
    schema: "nexusengine.world-foundation/1",
    cellId: requiredId(input.cellId, "Resolved foundation"),
    revision: Math.max(1, Math.floor(finite(input.revision, 1))),
    contributionIds: Object.freeze([...(input.contributionIds ?? [])].map(String)),
    channels: Object.freeze(channels),
    metadata: Object.freeze(portable(input.metadata ?? {}, "resolved-foundation.metadata"))
  });
}
