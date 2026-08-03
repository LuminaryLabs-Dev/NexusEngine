import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function normalizeLandmarkGuidance(config = {}) {
  const source = config.landmarkGuidanceDataset ?? config;
  const ids = new Set();
  const landmarks = (source.landmarks ?? []).map((landmark, index) => {
    const id = String(landmark.id ?? `landmark-${index + 1}`);
    if (ids.has(id)) throw new TypeError(`Landmarks contain duplicate id ${id}.`);
    ids.add(id);
    const completed = landmark.completed === true;
    const reached = completed || landmark.reached === true;
    const discovered = reached || landmark.discovered === true;
    const radius = finite(landmark.radius, `landmarks[${index}].radius`, 28);
    if (radius < 0) throw new RangeError(`Landmark ${id} radius cannot be negative.`);
    return {
      id,
      kind: String(landmark.kind ?? "landmark"),
      x: finite(landmark.x, `landmarks[${index}].x`, 0),
      y: finite(landmark.y, `landmarks[${index}].y`, 0),
      radius,
      priority: finite(landmark.priority, `landmarks[${index}].priority`, index),
      active: landmark.active !== false,
      discovered,
      reached,
      completed,
      metadata: cloneSerializableState(landmark.metadata ?? {})
    };
  });
  return countLandmarks({ id: String(source.id ?? "landmark-guidance"), landmarks, activeLandmarkId: source.activeLandmarkId == null ? null : String(source.activeLandmarkId) });
}

export function countLandmarks(state) {
  return {
    ...state,
    discoveredCount: state.landmarks.filter((landmark) => landmark.discovered).length,
    reachedCount: state.landmarks.filter((landmark) => landmark.reached).length,
    completedCount: state.landmarks.filter((landmark) => landmark.completed).length
  };
}

export function queryNearestLandmark(state = {}, point = {}) {
  const x = finite(point.x, "point.x", 0);
  const y = finite(point.y, "point.y", 0);
  const result = (state.landmarks ?? []).filter((landmark) => landmark.active && !landmark.completed)
    .map((landmark) => ({ landmark, distance: Math.hypot(landmark.x - x, landmark.y - y) }))
    .sort((left, right) => left.distance - right.distance || left.landmark.priority - right.landmark.priority || left.landmark.id.localeCompare(right.landmark.id))[0] ?? null;
  return result ? cloneSerializableState(result) : null;
}
