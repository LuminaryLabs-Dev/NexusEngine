import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const EnvironmentalAffordanceState = defineResource("environment.affordanceState");
export const AffordanceEntered = defineEvent("environment.affordanceEntered");
export const AffordanceActivated = defineEvent("environment.affordanceActivated");
export const AffordanceCompleted = defineEvent("environment.affordanceCompleted");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeAffordance(affordance = {}, index = 0) {
  return {
    id: affordance.id ?? `affordance-${index + 1}`,
    kind: affordance.kind ?? "affordance",
    action: affordance.action ?? "activate",
    x: number(affordance.x, 0),
    y: number(affordance.y, 0),
    radius: Math.max(1, number(affordance.radius, 24)),
    progress: Math.max(0, number(affordance.progress, 0)),
    target: Math.max(1, number(affordance.target, 1)),
    active: affordance.active !== false,
    completed: affordance.completed === true,
    metadata: affordance.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.environmentalAffordanceDataset ?? config;
  return {
    id: dataset.id ?? "environmental-affordance",
    affordances: (dataset.affordances ?? []).map(normalizeAffordance),
    completedCount: 0,
    activeAffordanceId: null,
    lastQuery: null,
    lastEvent: null
  };
}

function nearbyAffordances(state, point = {}, radius = Infinity) {
  const x = number(point.x, 0);
  const y = number(point.y, 0);
  return (state?.affordances ?? [])
    .filter((affordance) => affordance.active && !affordance.completed)
    .map((affordance) => ({ affordance, distance: Math.hypot(affordance.x - x, affordance.y - y) }))
    .filter((entry) => entry.distance <= Math.min(radius, entry.affordance.radius))
    .sort((left, right) => left.distance - right.distance);
}

function withCounts(state, affordances) {
  return {
    ...state,
    affordances,
    completedCount: affordances.filter((affordance) => affordance.completed).length
  };
}

export function createEnvironmentalAffordanceKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "environmental-affordance-kit",
    resources: { EnvironmentalAffordanceState },
    events: { AffordanceEntered, AffordanceActivated, AffordanceCompleted },
    provides: ["environmental-affordance"],
    initWorld({ world }) {
      world.setResource(EnvironmentalAffordanceState, initialState(config));
    },
    install({ engine }) {
      engine.environmentalAffordances = {
        getState() {
          return engine.world.getResource(EnvironmentalAffordanceState);
        },
        nearby(point = {}, radius = Infinity) {
          const state = engine.world.getResource(EnvironmentalAffordanceState);
          const results = nearbyAffordances(state, point, radius);
          const first = results[0] ?? null;
          engine.world.setResource(EnvironmentalAffordanceState, { ...state, activeAffordanceId: first?.affordance.id ?? null, lastQuery: first });
          if (first) engine.world.emit(AffordanceEntered, { affordance: first.affordance, distance: first.distance });
          return results;
        },
        activate(affordanceId, amount = 1, payload = {}) {
          const state = engine.world.getResource(EnvironmentalAffordanceState);
          let changed = null;
          const affordances = state.affordances.map((affordance) => {
            if (affordance.id !== affordanceId || affordance.completed) return affordance;
            const progress = Math.min(affordance.target, affordance.progress + Math.max(0, number(amount, 1)));
            changed = { ...affordance, progress, completed: progress >= affordance.target };
            return changed;
          });
          const next = withCounts({ ...state, activeAffordanceId: affordanceId, lastEvent: { type: "activated", affordance: changed, payload } }, affordances);
          engine.world.setResource(EnvironmentalAffordanceState, next);
          if (changed) {
            engine.world.emit(AffordanceActivated, { affordance: changed, payload });
            if (changed.completed) engine.world.emit(AffordanceCompleted, { affordance: changed, payload });
          }
          return next;
        },
        reset() {
          engine.world.setResource(EnvironmentalAffordanceState, initialState(config));
          return engine.world.getResource(EnvironmentalAffordanceState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(EnvironmentalAffordanceState));
        }
      };
    },
    metadata: { purpose: "Generic environmental affordance proximity, activation progress, and completion state." }
  });
}

export function queryNearbyAffordances(state, point = {}, radius = Infinity) {
  return nearbyAffordances(state, point, radius).map((entry) => ({ affordance: { ...entry.affordance }, distance: entry.distance }));
}
