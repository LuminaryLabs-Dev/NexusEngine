import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function nonnegative(value, label, fallback) {
  const next = finite(value, label, fallback);
  if (next < 0) throw new RangeError(`${label} cannot be negative.`);
  return next;
}

export function normalizeCargoManifestConfig(config = {}) {
  const source = config.cargoManifestDataset ?? config;
  const ids = new Set();
  const items = (source.items ?? []).map((item, index) => {
    const id = String(item.id ?? `cargo-${index + 1}`);
    if (ids.has(id)) throw new TypeError(`Cargo contains duplicate id ${id}.`);
    ids.add(id);
    const conditionMax = Math.max(1, finite(item.conditionMax, `items.${id}.conditionMax`, 100));
    return {
      id,
      kind: String(item.kind ?? "cargo"),
      x: finite(item.x, `items.${id}.x`, 0),
      y: finite(item.y, `items.${id}.y`, 0),
      radius: nonnegative(item.radius, `items.${id}.radius`, 12),
      value: nonnegative(item.value, `items.${id}.value`, 1),
      quantity: nonnegative(item.quantity, `items.${id}.quantity`, 1),
      weight: nonnegative(item.weight, `items.${id}.weight`, 1),
      condition: Math.max(0, Math.min(conditionMax, finite(item.condition, `items.${id}.condition`, conditionMax))),
      conditionMax,
      conditionDecayPerSecond: nonnegative(item.conditionDecayPerSecond ?? item.decayPerSecond, `items.${id}.conditionDecayPerSecond`, 0),
      conditionValueMultiplier: nonnegative(item.conditionValueMultiplier, `items.${id}.conditionValueMultiplier`, 1),
      status: String(item.status ?? "available"),
      carrierId: item.carrierId == null ? null : String(item.carrierId),
      metadata: cloneSerializableState(item.metadata ?? {})
    };
  });
  return { id: String(source.id ?? "cargo-manifest"), capacity: nonnegative(source.capacity, "capacity", 4), quota: nonnegative(source.quota, "quota", 60), items };
}

export function createCargoManifestState(config = {}) {
  const normalized = normalizeCargoManifestConfig(config);
  const carried = normalized.items.filter((item) => item.status === "carried").map((item) => item.id);
  return { manifestId: normalized.id, capacity: normalized.capacity, quota: normalized.quota, carriedWeight: normalized.items.filter((item) => item.status === "carried").reduce((sum, item) => sum + item.weight * item.quantity, 0), deliveredValue: 0, deliveredCount: 0, quotaComplete: normalized.quota === 0, items: normalized.items, carried, deposits: [], lastEvent: null };
}

export function queryNearestCargo(state = {}, point = {}, radius = Number.MAX_SAFE_INTEGER) {
  const x = finite(point.x, "point.x", 0);
  const y = finite(point.y, "point.y", 0);
  const limit = nonnegative(radius, "radius", Number.MAX_SAFE_INTEGER);
  const found = (state.items ?? []).filter((item) => item.status === "available")
    .map((item) => ({ item, distance: Math.hypot(item.x - x, item.y - y) }))
    .filter((entry) => entry.distance <= limit)
    .sort((left, right) => left.distance - right.distance || left.item.id.localeCompare(right.item.id))[0] ?? null;
  return found ? cloneSerializableState(found) : null;
}
