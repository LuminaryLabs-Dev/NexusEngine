import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const LandmarkGuidanceState = defineResource("landmark.guidanceState");
export const LandmarkDiscovered = defineEvent("landmark.discovered");
export const LandmarkReached = defineEvent("landmark.reached");
export const LandmarkActivated = defineEvent("landmark.activated");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeLandmark(landmark = {}, index = 0) {
  return {
    id: landmark.id ?? `landmark-${index + 1}`,
    kind: landmark.kind ?? "landmark",
    x: number(landmark.x, 0),
    y: number(landmark.y, 0),
    radius: Math.max(1, number(landmark.radius, 28)),
    priority: number(landmark.priority, index),
    active: landmark.active !== false,
    discovered: landmark.discovered === true,
    reached: landmark.reached === true,
    completed: landmark.completed === true,
    metadata: landmark.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.landmarkGuidanceDataset ?? config;
  return {
    id: dataset.id ?? "landmark-guidance",
    landmarks: (dataset.landmarks ?? []).map(normalizeLandmark),
    activeLandmarkId: dataset.activeLandmarkId ?? null,
    discoveredCount: 0,
    reachedCount: 0,
    completedCount: 0,
    lastQuery: null
  };
}

function activeLandmarks(state) {
  return (state?.landmarks ?? []).filter((landmark) => landmark.active && !landmark.completed);
}

function nearestLandmark(state, point = {}) {
  const x = number(point.x, 0);
  const y = number(point.y, 0);
  return activeLandmarks(state)
    .map((landmark) => ({ landmark, distance: Math.hypot(landmark.x - x, landmark.y - y) }))
    .sort((left, right) => left.distance - right.distance || left.landmark.priority - right.landmark.priority)[0] ?? null;
}

function countState(state, landmarks) {
  return {
    ...state,
    landmarks,
    discoveredCount: landmarks.filter((landmark) => landmark.discovered).length,
    reachedCount: landmarks.filter((landmark) => landmark.reached).length,
    completedCount: landmarks.filter((landmark) => landmark.completed).length
  };
}

export function createLandmarkGuidanceKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "landmark-guidance-kit",
    resources: { LandmarkGuidanceState },
    events: { LandmarkDiscovered, LandmarkReached, LandmarkActivated },
    provides: ["landmark-guidance"],
    initWorld({ world }) {
      world.setResource(LandmarkGuidanceState, initialState(config));
    },
    install({ engine }) {
      engine.landmarkGuidance = {
        getState() {
          return engine.world.getResource(LandmarkGuidanceState);
        },
        nearest(point = {}) {
          const state = engine.world.getResource(LandmarkGuidanceState);
          const query = nearestLandmark(state, point);
          engine.world.setResource(LandmarkGuidanceState, { ...state, activeLandmarkId: query?.landmark.id ?? state.activeLandmarkId, lastQuery: query });
          return query;
        },
        discover(landmarkId, payload = {}) {
          const state = engine.world.getResource(LandmarkGuidanceState);
          let changed = null;
          const landmarks = state.landmarks.map((landmark) => {
            if (landmark.id !== landmarkId) return landmark;
            changed = { ...landmark, discovered: true };
            return changed;
          });
          const next = countState({ ...state, lastEvent: { type: "discovered", landmark: changed, payload } }, landmarks);
          engine.world.setResource(LandmarkGuidanceState, next);
          if (changed) engine.world.emit(LandmarkDiscovered, { landmark: changed, payload });
          return next;
        },
        reach(landmarkId, payload = {}) {
          const state = engine.world.getResource(LandmarkGuidanceState);
          let changed = null;
          const landmarks = state.landmarks.map((landmark) => {
            if (landmark.id !== landmarkId) return landmark;
            changed = { ...landmark, discovered: true, reached: true };
            return changed;
          });
          const next = countState({ ...state, activeLandmarkId: landmarkId, lastEvent: { type: "reached", landmark: changed, payload } }, landmarks);
          engine.world.setResource(LandmarkGuidanceState, next);
          if (changed) engine.world.emit(LandmarkReached, { landmark: changed, payload });
          return next;
        },
        complete(landmarkId, payload = {}) {
          const state = engine.world.getResource(LandmarkGuidanceState);
          let changed = null;
          const landmarks = state.landmarks.map((landmark) => {
            if (landmark.id !== landmarkId) return landmark;
            changed = { ...landmark, discovered: true, reached: true, completed: true };
            return changed;
          });
          const next = countState({ ...state, lastEvent: { type: "activated", landmark: changed, payload } }, landmarks);
          engine.world.setResource(LandmarkGuidanceState, next);
          if (changed) engine.world.emit(LandmarkActivated, { landmark: changed, payload });
          return next;
        },
        reset() {
          engine.world.setResource(LandmarkGuidanceState, initialState(config));
          return engine.world.getResource(LandmarkGuidanceState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(LandmarkGuidanceState));
        }
      };
    },
    metadata: { purpose: "Generic landmark target, discovery, reached, activation, and proximity guidance state." }
  });
}

export function queryNearestLandmark(state, point = {}) {
  const query = nearestLandmark(state, point);
  return query ? { landmark: { ...query.landmark }, distance: query.distance } : null;
}
