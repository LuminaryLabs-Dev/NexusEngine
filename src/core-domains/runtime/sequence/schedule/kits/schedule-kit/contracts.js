import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function normalizeCycle(cycle = {}, index = 0) {
  const id = String(cycle.id ?? `cycle-${index + 1}`);
  const intervalSeconds = finite(cycle.intervalSeconds ?? cycle.interval, `${id}.intervalSeconds`, 60);
  if (intervalSeconds <= 0) throw new RangeError(`Schedule cycle ${id} intervalSeconds must be positive.`);
  return { id, intervalSeconds, repeat: cycle.repeat !== false, nextAt: Math.max(0, finite(cycle.firstAt, `${id}.firstAt`, intervalSeconds)), count: Math.max(0, Math.floor(finite(cycle.count, `${id}.count`, 0))), active: cycle.active !== false, metadata: cloneSerializableState(cycle.metadata ?? {}) };
}

export function normalizeScheduleConfig(config = {}) {
  const scale = finite(config.scale, "scale", 1);
  if (scale < 0) throw new RangeError("Schedule scale cannot be negative.");
  const cycles = (config.cycles ?? []).map(normalizeCycle);
  if (new Set(cycles.map((cycle) => cycle.id)).size !== cycles.length) throw new TypeError("Schedule cycles contain duplicate IDs.");
  return { id: String(config.id ?? "schedule"), paused: config.paused === true, scale, cycles };
}

export function createScheduleState(config = {}) {
  const normalized = normalizeScheduleConfig(config);
  return { scheduleId: normalized.id, elapsedSeconds: 0, paused: normalized.paused, scale: normalized.scale, cycles: normalized.cycles, lastCycles: [] };
}

export function advanceSchedule(state = {}, command = {}) {
  const delta = finite(command.delta, "delta", 0);
  if (delta < 0) throw new RangeError("Schedule delta cannot be negative.");
  if (state.paused) return { elapsedSeconds: state.elapsedSeconds, cycles: cloneSerializableState(state.cycles), occurrences: [] };
  const scaledDelta = delta * finite(state.scale, "state.scale", 1);
  if (!Number.isFinite(scaledDelta)) throw new RangeError("Scaled schedule delta must be finite.");
  const elapsedSeconds = state.elapsedSeconds + scaledDelta;
  const occurrences = [];
  const cycles = state.cycles.map((source) => {
    const cycle = cloneSerializableState(source);
    while (cycle.active && elapsedSeconds >= cycle.nextAt) {
      cycle.count += 1;
      occurrences.push({ schema: "nexusengine.schedule-occurrence/1", id: cycle.id, at: cycle.nextAt, elapsedSeconds, count: cycle.count, metadata: cycle.metadata });
      if (!cycle.repeat) {
        cycle.active = false;
        cycle.nextAt = null;
      } else {
        cycle.nextAt += cycle.intervalSeconds;
      }
    }
    return cycle;
  });
  return { elapsedSeconds, cycles, occurrences };
}
