import { clonePortableValue, inspectPortableValue } from "../../portable.js";

export const WORLD_FEATURE_LIFECYCLE_STATES = Object.freeze(["registered", "active", "inactive", "released"]);

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

export function createFeatureFidelityDescriptor(input = {}) {
  return Object.freeze({
    near: String(input.near ?? "feature-mesh"),
    middle: String(input.middle ?? "foundation-field"),
    far: String(input.far ?? "silhouette"),
    collision: String(input.collision ?? "foundation")
  });
}

export function createWorldFeatureDefinition(input = {}) {
  const lifecycle = String(input.lifecycle ?? "registered");
  if (!WORLD_FEATURE_LIFECYCLE_STATES.includes(lifecycle)) throw new TypeError(`Unsupported world feature lifecycle: ${lifecycle}.`);
  return Object.freeze({
    id: requiredId(input.id, "World feature"),
    type: requiredId(input.type ?? input.kind, "World feature type"),
    bounds: Object.freeze(portable(input.bounds ?? {}, "world-feature.bounds")),
    seed: String(input.seed ?? input.id ?? "world-feature"),
    priority: finite(input.priority, 0),
    dependsOn: Object.freeze([...(input.dependsOn ?? [])].map(String).sort()),
    lifecycle,
    fidelity: createFeatureFidelityDescriptor(input.fidelity),
    definition: Object.freeze(portable(input.definition ?? input.data ?? {}, "world-feature.definition")),
    version: Math.max(1, Math.floor(finite(input.version, 1))),
    metadata: Object.freeze(portable(input.metadata ?? {}, "world-feature.metadata"))
  });
}

export function boundsIntersect(left = {}, right = {}) {
  const a = normalizeBounds(left);
  const b = normalizeBounds(right);
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minZ <= b.maxZ && a.maxZ >= b.minZ;
}

export function normalizeBounds(input = {}) {
  if ([input.minX, input.minZ, input.maxX, input.maxZ].every((value) => Number.isFinite(Number(value)))) {
    return Object.freeze({ minX: Number(input.minX), minZ: Number(input.minZ), maxX: Number(input.maxX), maxZ: Number(input.maxZ) });
  }
  const center = input.center ?? input.position ?? {};
  const radius = Math.max(0, finite(input.radius ?? input.extent, 0));
  const x = finite(center.x, 0);
  const z = finite(center.z, 0);
  return Object.freeze({ minX: x - radius, minZ: z - radius, maxX: x + radius, maxZ: z + radius });
}
