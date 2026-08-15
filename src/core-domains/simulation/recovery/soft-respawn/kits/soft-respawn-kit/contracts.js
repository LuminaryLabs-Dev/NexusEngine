import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function point(value = {}, label = "point") {
  return { x: finite(value.x, `${label}.x`, 0), y: finite(value.y, `${label}.y`, 0), z: finite(value.z, `${label}.z`, 0) };
}

export function normalizeSoftRespawnConfig(config = {}) {
  const points = {};
  for (const [id, value] of Object.entries(config.points ?? {})) points[String(id)] = point(value, `points.${id}`);
  return { defaultPoint: point(config.defaultPoint ?? config.respawnPoint, "defaultPoint"), points };
}

export function createSoftRespawnState(config = {}) {
  const normalized = normalizeSoftRespawnConfig(config);
  return { points: normalized.points, defaultPoint: normalized.defaultPoint, recoveries: 0, subjects: {}, lastRecovery: null };
}

export function createSoftRespawnResult(state = {}, command = {}) {
  const subjectId = String(command.subjectId ?? "").trim();
  if (!subjectId) throw new TypeError("Soft Respawn subjectId is required.");
  const pointId = command.pointId == null ? null : String(command.pointId);
  const basePoint = command.point ?? (pointId ? state.points?.[pointId] : null) ?? state.defaultPoint;
  if (pointId && !state.points?.[pointId] && !command.point) throw new TypeError(`Unknown Soft Respawn point ${pointId}.`);
  const position = point(basePoint, "respawn point");
  position.y += finite(command.groundHeight, "groundHeight", 0);
  return cloneSerializableState({
    schema: "nexusengine.soft-respawn/1",
    subjectId,
    reason: String(command.reason ?? "recovery"),
    pointId,
    position,
    velocity: { x: 0, y: 0, z: 0 },
    grounded: true,
    recoveryNumber: Number(state.recoveries ?? 0) + 1
  });
}
