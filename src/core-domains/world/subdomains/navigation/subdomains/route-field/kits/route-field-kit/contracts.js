import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function unique(records, label) {
  const ids = new Set();
  for (const record of records) {
    if (ids.has(record.id)) throw new TypeError(`${label} contains duplicate id ${record.id}.`);
    ids.add(record.id);
  }
  return records;
}

export function normalizeRouteField(config = {}) {
  const source = config.routeFieldDataset ?? config;
  const markers = unique((source.markers ?? []).map((marker, index) => ({
    id: String(marker.id ?? `marker-${index + 1}`),
    kind: String(marker.kind ?? "route-marker"),
    x: finite(marker.x, `markers[${index}].x`, 0),
    y: finite(marker.y, `markers[${index}].y`, 0),
    radius: finite(marker.radius, `markers[${index}].radius`, 24),
    active: marker.active !== false,
    metadata: cloneSerializableState(marker.metadata ?? {})
  })), "Route markers");
  if (markers.some((marker) => marker.radius < 0)) throw new RangeError("Route marker radius cannot be negative.");
  const corridors = unique((source.corridors ?? []).map((corridor, index) => ({
    id: String(corridor.id ?? `corridor-${index + 1}`),
    from: corridor.from == null ? null : String(corridor.from),
    to: corridor.to == null ? null : String(corridor.to),
    width: finite(corridor.width, `corridors[${index}].width`, 28),
    active: corridor.active !== false,
    metadata: cloneSerializableState(corridor.metadata ?? {})
  })), "Route corridors");
  if (corridors.some((corridor) => corridor.width < 0)) throw new RangeError("Route corridor width cannot be negative.");
  return { id: String(source.id ?? "route-field"), markers, corridors };
}

export function queryNearestRouteMarker(state = {}, point = {}, options = {}) {
  const x = finite(point.x, "point.x", 0);
  const y = finite(point.y, "point.y", 0);
  const kinds = options.kinds ? new Set(options.kinds.map(String)) : null;
  const result = (state.markers ?? []).filter((marker) => marker.active && (!kinds || kinds.has(marker.kind)))
    .map((marker) => ({ marker, distance: Math.hypot(marker.x - x, marker.y - y) }))
    .sort((left, right) => left.distance - right.distance || left.marker.id.localeCompare(right.marker.id))[0] ?? null;
  return result ? cloneSerializableState(result) : null;
}
