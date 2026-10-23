import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const ScheduleState = defineResource("schedule.state");
export const ScheduleCycle = defineEvent("schedule.cycle");

function normalizeCycle(cycle = {}, index = 0) {
  return {
    id: cycle.id ?? `cycle-${index + 1}`,
    intervalSeconds: Math.max(0.001, Number(cycle.intervalSeconds ?? cycle.interval ?? 60)),
    repeat: cycle.repeat !== false,
    nextAt: Math.max(0.001, Number(cycle.firstAt ?? cycle.intervalSeconds ?? cycle.interval ?? 60)),
    count: 0,
    metadata: cycle.metadata ?? {}
  };
}

function initialState(config = {}) {
  return {
    id: config.id ?? "schedule",
    elapsedSeconds: 0,
    paused: config.paused === true,
    scale: Number(config.scale ?? 1),
    cycles: (config.cycles ?? []).map(normalizeCycle),
    lastCycles: []
  };
}

function scheduleSystem(world) {
  const state = world.getResource(ScheduleState);
  if (!state || state.paused) return;

  const delta = Math.max(0, Number(world.__nexusClock?.delta ?? 0)) * Number(state.scale ?? 1);
  if (delta <= 0) return;

  const elapsedSeconds = Number(state.elapsedSeconds ?? 0) + delta;
  const cycles = state.cycles.map((cycle) => ({ ...cycle }));
  const lastCycles = [];

  for (const cycle of cycles) {
    while (elapsedSeconds >= cycle.nextAt) {
      const occurrence = {
        id: cycle.id,
        at: cycle.nextAt,
        elapsedSeconds,
        count: cycle.count + 1,
        metadata: cycle.metadata
      };
      lastCycles.push(occurrence);
      world.emit(ScheduleCycle, occurrence);
      cycle.count += 1;
      if (!cycle.repeat) {
        cycle.nextAt = Infinity;
        break;
      }
      cycle.nextAt += cycle.intervalSeconds;
    }
  }

  world.setResource(ScheduleState, { ...state, elapsedSeconds, cycles, lastCycles });
}

export function createScheduleKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "schedule-kit",
    resources: { ScheduleState },
    events: { ScheduleCycle },
    systems: [{ phase: "simulate", system: scheduleSystem, name: "scheduleSystem" }],
    provides: ["schedule"],
    initWorld({ world }) {
      world.setResource(ScheduleState, initialState(config));
    },
    install({ engine }) {
      engine.schedule = {
        getState() {
          return engine.world.getResource(ScheduleState);
        },
        setPaused(paused) {
          const state = engine.world.getResource(ScheduleState);
          engine.world.setResource(ScheduleState, { ...state, paused: paused === true });
          return engine.world.getResource(ScheduleState);
        },
        reset() {
          engine.world.setResource(ScheduleState, initialState(config));
          return engine.world.getResource(ScheduleState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(ScheduleState));
        }
      };
    },
    metadata: { purpose: "Generic elapsed-time cycles and scheduled event emission." }
  });
}
