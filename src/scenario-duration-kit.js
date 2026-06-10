import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const ScenarioDurationState = defineResource("scenario.durationState");
export const ScenarioCheckpointReached = defineEvent("scenario.checkpointReached");
export const ScenarioDurationCompleted = defineEvent("scenario.durationCompleted");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeCheckpoint(checkpoint = {}, index = 0) {
  return {
    id: checkpoint.id ?? `checkpoint-${index + 1}`,
    atSeconds: Math.max(0, number(checkpoint.atSeconds ?? checkpoint.seconds, 0)),
    reached: checkpoint.reached === true,
    metadata: checkpoint.metadata ?? {}
  };
}

function initialState(config = {}) {
  const durationSeconds = Math.max(0, number(config.durationSeconds, 3600));
  return {
    id: config.id ?? "scenario-duration",
    elapsedSeconds: 0,
    durationSeconds,
    completed: false,
    checkpoints: (config.checkpoints ?? [
      { id: "one-minute", atSeconds: 60 },
      { id: "five-minute", atSeconds: 300 },
      { id: "fifteen-minute", atSeconds: 900 },
      { id: "duration", atSeconds: durationSeconds }
    ]).map(normalizeCheckpoint),
    lastCheckpoint: null
  };
}

function scenarioDurationSystem(world) {
  const state = world.getResource(ScenarioDurationState);
  if (!state || state.completed) return;
  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  if (delta <= 0) return;
  const elapsedSeconds = state.elapsedSeconds + delta;
  let lastCheckpoint = state.lastCheckpoint;
  const checkpoints = state.checkpoints.map((checkpoint) => {
    if (checkpoint.reached || elapsedSeconds < checkpoint.atSeconds) return checkpoint;
    const reached = { ...checkpoint, reached: true };
    lastCheckpoint = reached;
    world.emit(ScenarioCheckpointReached, { checkpoint: reached, elapsedSeconds });
    return reached;
  });
  const completed = elapsedSeconds >= state.durationSeconds;
  const next = { ...state, elapsedSeconds, checkpoints, completed, lastCheckpoint };
  world.setResource(ScenarioDurationState, next);
  if (completed && !state.completed) world.emit(ScenarioDurationCompleted, { state: next });
}

export function createScenarioDurationKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "scenario-duration-kit",
    resources: { ScenarioDurationState },
    events: { ScenarioCheckpointReached, ScenarioDurationCompleted },
    systems: [{ phase: "resolve", system: scenarioDurationSystem, name: "scenarioDurationSystem" }],
    provides: ["scenario-duration"],
    initWorld({ world }) {
      world.setResource(ScenarioDurationState, initialState(config));
    },
    install({ engine }) {
      engine.scenarioDuration = {
        getState() {
          return engine.world.getResource(ScenarioDurationState);
        },
        reset() {
          engine.world.setResource(ScenarioDurationState, initialState(config));
          return engine.world.getResource(ScenarioDurationState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(ScenarioDurationState));
        }
      };
    },
    metadata: { purpose: "Generic duration and checkpoint state for long-running simulation validation." }
  });
}
