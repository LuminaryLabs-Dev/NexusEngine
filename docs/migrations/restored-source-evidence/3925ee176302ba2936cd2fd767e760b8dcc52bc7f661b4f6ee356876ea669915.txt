import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const PursuitPressureState = defineResource("pursuit.pressureState");
export const PursuitPressureChanged = defineEvent("pursuit.pressureChanged");
export const PursuitPressureCaught = defineEvent("pursuit.pressureCaught");
export const PursuitPressureRecovered = defineEvent("pursuit.pressureRecovered");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function bandFor(distance, config) {
  const caught = number(config.catchDistance, 8);
  const danger = number(config.dangerDistance, 28);
  const warning = number(config.warningDistance, 56);
  if (distance <= caught) return "caught";
  if (distance <= danger) return "danger";
  if (distance <= warning) return "warning";
  return "clear";
}

function initialState(config = {}) {
  const distance = number(config.startDistance, 80);
  return {
    id: config.id ?? "pursuit-pressure",
    distance,
    catchDistance: number(config.catchDistance, 8),
    warningDistance: number(config.warningDistance, 56),
    dangerDistance: number(config.dangerDistance, 28),
    closeRatePerSecond: number(config.closeRatePerSecond, 1),
    recoverRatePerSecond: number(config.recoverRatePerSecond, 0),
    maxDistance: number(config.maxDistance, Math.max(100, distance)),
    caught: false,
    band: bandFor(distance, config),
    lastChange: null
  };
}

function pursuitPressureSystem(world) {
  const state = world.getResource(PursuitPressureState);
  if (!state || state.caught) return;
  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  if (delta <= 0) return;
  const beforeBand = state.band;
  const distance = clamp(
    state.distance - state.closeRatePerSecond * delta + state.recoverRatePerSecond * delta,
    0,
    state.maxDistance
  );
  const band = bandFor(distance, state);
  const caught = distance <= state.catchDistance;
  const next = {
    ...state,
    distance,
    band,
    caught,
    lastChange: { beforeBand, band, distance, source: "pursuit-drift" }
  };
  world.setResource(PursuitPressureState, next);
  if (band !== beforeBand) world.emit(PursuitPressureChanged, next.lastChange);
  if (caught) world.emit(PursuitPressureCaught, { distance, band });
}

export function createPursuitPressureKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "pursuit-pressure-kit",
    resources: { PursuitPressureState },
    events: { PursuitPressureChanged, PursuitPressureCaught, PursuitPressureRecovered },
    systems: [{ phase: "resolve", system: pursuitPressureSystem, name: "pursuitPressureSystem" }],
    provides: ["pursuit-pressure"],
    initWorld({ world }) {
      world.setResource(PursuitPressureState, initialState(config));
    },
    install({ engine }) {
      engine.pursuitPressure = {
        getState() {
          return engine.world.getResource(PursuitPressureState);
        },
        adjust(amount, payload = {}) {
          const state = engine.world.getResource(PursuitPressureState);
          const beforeBand = state.band;
          const distance = clamp(state.distance + number(amount, 0), 0, state.maxDistance);
          const band = bandFor(distance, state);
          const caught = distance <= state.catchDistance;
          const next = {
            ...state,
            distance,
            band,
            caught,
            lastChange: { beforeBand, band, distance, source: payload.source ?? "pursuit-adjust", metadata: payload.metadata ?? {} }
          };
          engine.world.setResource(PursuitPressureState, next);
          if (band !== beforeBand) engine.world.emit(PursuitPressureChanged, next.lastChange);
          if (caught && !state.caught) engine.world.emit(PursuitPressureCaught, { distance, band, payload });
          if (!caught && state.caught) engine.world.emit(PursuitPressureRecovered, { distance, band, payload });
          return next;
        },
        setDistance(distance, payload = {}) {
          return this.adjust(number(distance, 0) - engine.world.getResource(PursuitPressureState).distance, payload);
        },
        reset() {
          engine.world.setResource(PursuitPressureState, initialState(config));
          return engine.world.getResource(PursuitPressureState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(PursuitPressureState));
        }
      };
    },
    metadata: { purpose: "Generic spatial pursuit pressure, warning bands, recovery, and caught state." }
  });
}

export function pursuitBand(state) {
  return state?.band ?? "clear";
}
