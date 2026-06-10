import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const InputIntentState = defineResource("input.intentState");
export const InputIntentChanged = defineEvent("input.intentChanged");
export const InputActionPressed = defineEvent("input.actionPressed");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeIntent(intent = {}) {
  const actions = { ...(intent.actions ?? {}) };
  for (const key of ["primary", "secondary", "boost", "restart", "confirm"]) {
    if (intent[key] !== undefined) actions[key] = intent[key] === true;
  }
  return {
    x: Math.max(-1, Math.min(1, number(intent.x, 0))),
    y: Math.max(-1, Math.min(1, number(intent.y, 0))),
    actions,
    metadata: intent.metadata ?? {}
  };
}

function initialState(config = {}) {
  return {
    id: config.id ?? "input-intent",
    intent: normalizeIntent(config.intent),
    inputSeen: false,
    lastAction: null,
    sequence: 0
  };
}

export function createInputIntentKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "input-intent-kit",
    resources: { InputIntentState },
    events: { InputIntentChanged, InputActionPressed },
    provides: ["input-intent"],
    initWorld({ world }) {
      world.setResource(InputIntentState, initialState(config));
    },
    install({ engine }) {
      engine.inputIntent = {
        getState() {
          return engine.world.getResource(InputIntentState);
        },
        set(intent = {}, payload = {}) {
          const state = engine.world.getResource(InputIntentState);
          const normalized = normalizeIntent(intent);
          const activeActions = Object.entries(normalized.actions).filter(([, active]) => active).map(([action]) => action);
          const next = {
            ...state,
            intent: normalized,
            inputSeen: state.inputSeen || Math.abs(normalized.x) > 0 || Math.abs(normalized.y) > 0 || activeActions.length > 0,
            lastAction: activeActions[activeActions.length - 1] ?? state.lastAction,
            sequence: state.sequence + 1
          };
          engine.world.setResource(InputIntentState, next);
          engine.world.emit(InputIntentChanged, { intent: normalized, payload });
          for (const action of activeActions) engine.world.emit(InputActionPressed, { action, intent: normalized, payload });
          return next;
        },
        reset() {
          engine.world.setResource(InputIntentState, initialState(config));
          return engine.world.getResource(InputIntentState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(InputIntentState));
        }
      };
    },
    metadata: { purpose: "Generic normalized input intent, action state, and validation telemetry." }
  });
}
