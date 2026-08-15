import { cloneSerializableState } from "../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function normalizeWaterSurface(config = {}) {
  const source = config.waterSurfaceDataset ?? config;
  const ids = new Set();
  const zones = (source.zones ?? []).map((zone, index) => {
    const id = String(zone.id ?? `water-zone-${index + 1}`);
    if (ids.has(id)) throw new TypeError(`Water zones contain duplicate id ${id}.`);
    ids.add(id);
    const radius = finite(zone.radius, `zones[${index}].radius`, 100);
    const drag = finite(zone.drag, `zones[${index}].drag`, 1);
    if (radius < 0 || drag < 0) throw new RangeError(`Water zone ${id} radius and drag cannot be negative.`);
    return {
      id,
      x: finite(zone.x, `zones[${index}].x`, 0),
      y: finite(zone.y ?? zone.z, `zones[${index}].y`, 0),
      radius,
      depth: finite(zone.depth, `zones[${index}].depth`, 1),
      drag,
      current: { x: finite(zone.current?.x, `zones[${index}].current.x`, 0), y: finite(zone.current?.y ?? zone.current?.z, `zones[${index}].current.y`, 0) },
      hazards: (zone.hazards ?? (zone.hazard == null ? [] : [zone.hazard])).map(String),
      metadata: cloneSerializableState(zone.metadata ?? {})
    };
  });
  const baseDrag = finite(source.baseDrag, "baseDrag", 1);
  const waveAmplitude = finite(source.waveAmplitude, "waveAmplitude", 0);
  const waveFrequency = finite(source.waveFrequency, "waveFrequency", 0.2);
  if (baseDrag < 0 || waveAmplitude < 0 || waveFrequency < 0) throw new RangeError("Water drag, amplitude, and frequency cannot be negative.");
  return { id: String(source.id ?? "water-surface"), elapsedSeconds: finite(source.elapsedSeconds, "elapsedSeconds", 0), baseDrag, waveAmplitude, waveFrequency, zones };
}

export function queryWaterSurface(state = {}, point = {}) {
  const x = finite(point.x, "point.x", 0);
  const y = finite(point.y ?? point.z, "point.y", 0);
  const zones = (state.zones ?? []).filter((zone) => Math.hypot(zone.x - x, zone.y - y) <= zone.radius).sort((left, right) => left.id.localeCompare(right.id));
  return cloneSerializableState({
    x,
    y,
    depth: zones.reduce((value, zone) => Math.max(value, zone.depth), 0),
    drag: zones.reduce((value, zone) => value * zone.drag, state.baseDrag ?? 1),
    current: zones.reduce((value, zone) => ({ x: value.x + zone.current.x, y: value.y + zone.current.y }), { x: 0, y: 0 }),
    wave: Math.sin((state.elapsedSeconds ?? 0) * (state.waveFrequency ?? 0) + x * 0.013 + y * 0.017) * (state.waveAmplitude ?? 0),
    zones: zones.map((zone) => zone.id),
    hazards: [...new Set(zones.flatMap((zone) => zone.hazards))].sort()
  });
}
