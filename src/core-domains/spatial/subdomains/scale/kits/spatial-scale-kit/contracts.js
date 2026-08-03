import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function normalizeSpatialScale(config = {}) {
  const source = config.spatialScaleDataset ?? config;
  const ids = new Set();
  const anchors = (source.anchors ?? []).map((anchor, index) => {
    const id = String(anchor.id ?? `scale-anchor-${index + 1}`);
    if (ids.has(id)) throw new TypeError(`Scale anchors contain duplicate id ${id}.`);
    ids.add(id);
    const radius = finite(anchor.radius, `anchors[${index}].radius`, 24);
    const scale = finite(anchor.scale, `anchors[${index}].scale`, 1);
    if (radius < 0 || scale <= 0) throw new RangeError(`Scale anchor ${id} radius must be nonnegative and scale positive.`);
    const bands = (anchor.bands ?? [{ id: "near", distance: 32 }, { id: "mid", distance: 96 }, { id: "far", distance: 240 }]).map((band, bandIndex) => ({ id: String(band.id ?? `band-${bandIndex + 1}`), distance: finite(band.distance, `anchors[${index}].bands[${bandIndex}].distance`) })).sort((left, right) => left.distance - right.distance || left.id.localeCompare(right.id));
    if (bands.some((band) => band.distance < 0)) throw new RangeError(`Scale anchor ${id} bands cannot be negative.`);
    return { id, x: finite(anchor.x, `anchors[${index}].x`, 0), y: finite(anchor.y ?? anchor.z, `anchors[${index}].y`, 0), radius, scale, bands, metadata: cloneSerializableState(anchor.metadata ?? {}) };
  });
  const subjectScale = finite(source.subject?.scale, "subject.scale", 1);
  if (subjectScale <= 0) throw new RangeError("Subject scale must be positive.");
  return {
    id: String(source.id ?? "spatial-scale"),
    subject: { id: String(source.subject?.id ?? "subject"), x: finite(source.subject?.x, "subject.x", 0), y: finite(source.subject?.y ?? source.subject?.z, "subject.y", 0), scale: subjectScale },
    anchors,
    activeAnchorId: null,
    activeBand: null
  };
}

function bandFor(anchor, distance) {
  return anchor.bands.find((band) => distance <= band.distance)?.id ?? "beyond";
}

export function queryNearestScaleAnchor(state = {}, point = state.subject ?? {}) {
  const x = finite(point.x, "point.x", 0);
  const y = finite(point.y ?? point.z, "point.y", 0);
  const result = (state.anchors ?? []).map((anchor) => {
    const distance = Math.hypot(anchor.x - x, anchor.y - y);
    return { anchor, distance, band: bandFor(anchor, distance), inside: distance <= anchor.radius };
  }).sort((left, right) => left.distance - right.distance || left.anchor.id.localeCompare(right.anchor.id))[0] ?? null;
  return result ? cloneSerializableState(result) : null;
}

export function queryEnteredScaleAnchor(state = {}, point = state.subject ?? {}) {
  const x = finite(point.x, "point.x", 0);
  const y = finite(point.y ?? point.z, "point.y", 0);
  const inside = (state.anchors ?? []).map((anchor) => ({ anchor, distance: Math.hypot(anchor.x - x, anchor.y - y) }))
    .filter((entry) => entry.distance <= entry.anchor.radius)
    .sort((left, right) => left.distance - right.distance || left.anchor.id.localeCompare(right.anchor.id))[0] ?? null;
  if (!inside) return null;
  return cloneSerializableState({ ...inside, band: bandFor(inside.anchor, inside.distance), inside: true });
}
