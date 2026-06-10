import { defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const ScenarioDriverState = defineResource("scenario.driverState");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function initialState(config = {}) {
  return {
    id: config.id ?? "scenario-driver",
    lastIntent: null,
    steps: 0
  };
}

function steerToward(from = {}, to = {}, options = {}) {
  const dx = number(to.x, 0) - number(from.x, 0);
  const dy = number(to.y, 0) - number(from.y, 0);
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: dx / length,
    y: dy / length,
    boost: length > number(options.boostDistance, 120)
  };
}

export function createScenarioDriverKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "scenario-driver-kit",
    resources: { ScenarioDriverState },
    provides: ["scenario-driver"],
    initWorld({ world }) {
      world.setResource(ScenarioDriverState, initialState(config));
    },
    install({ engine }) {
      engine.scenarioDriver = {
        getState() {
          return engine.world.getResource(ScenarioDriverState);
        },
        steerToward(from = {}, to = {}, options = {}) {
          const intent = steerToward(from, to, options);
          const state = engine.world.getResource(ScenarioDriverState);
          engine.world.setResource(ScenarioDriverState, {
            ...state,
            lastIntent: intent,
            steps: Number(state.steps ?? 0) + 1
          });
          return intent;
        },
        reset() {
          engine.world.setResource(ScenarioDriverState, initialState(config));
          return engine.world.getResource(ScenarioDriverState);
        }
      };
    },
    metadata: { purpose: "Generic scenario-driving helpers for validation: steering intents and deterministic target pursuit." }
  });
}
