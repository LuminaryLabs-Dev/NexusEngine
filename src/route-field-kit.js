import { defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const RouteFieldState = defineResource("route.fieldState");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeMarker(marker = {}, index = 0) {
  return {
    id: marker.id ?? `marker-${index + 1}`,
    kind: marker.kind ?? "route-marker",
    x: number(marker.x, 0),
    y: number(marker.y, 0),
    radius: Math.max(1, number(marker.radius, 24)),
    active: marker.active !== false,
    metadata: marker.metadata ?? {}
  };
}

function normalizeCorridor(corridor = {}, index = 0) {
  return {
    id: corridor.id ?? `corridor-${index + 1}`,
    from: corridor.from ?? null,
    to: corridor.to ?? null,
    width: Math.max(1, number(corridor.width, 28)),
    active: corridor.active !== false,
    metadata: corridor.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.routeFieldDataset ?? config;
  return {
    id: dataset.id ?? "route-field",
    markers: (dataset.markers ?? []).map(normalizeMarker),
    corridors: (dataset.corridors ?? []).map(normalizeCorridor),
    lastQuery: null
  };
}

function nearestMarker(state, point = {}, filter = () => true) {
  const x = number(point.x, 0);
  const y = number(point.y, 0);
  return (state?.markers ?? [])
    .filter((marker) => marker.active && filter(marker))
    .map((marker) => ({ marker, distance: Math.hypot(marker.x - x, marker.y - y) }))
    .sort((left, right) => left.distance - right.distance)[0] ?? null;
}

export function createRouteFieldKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "route-field-kit",
    resources: { RouteFieldState },
    provides: ["route-field"],
    initWorld({ world }) {
      world.setResource(RouteFieldState, initialState(config));
    },
    install({ engine }) {
      engine.routeField = {
        getState() {
          return engine.world.getResource(RouteFieldState);
        },
        nearestMarker(point = {}, filter = () => true) {
          const state = engine.world.getResource(RouteFieldState);
          const result = nearestMarker(state, point, filter);
          engine.world.setResource(RouteFieldState, { ...state, lastQuery: result });
          return result;
        },
        setMarkerActive(markerId, active) {
          const state = engine.world.getResource(RouteFieldState);
          const markers = state.markers.map((marker) => marker.id === markerId ? { ...marker, active: active !== false } : marker);
          engine.world.setResource(RouteFieldState, { ...state, markers });
          return engine.world.getResource(RouteFieldState);
        },
        reset() {
          engine.world.setResource(RouteFieldState, initialState(config));
          return engine.world.getResource(RouteFieldState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(RouteFieldState));
        }
      };
    },
    metadata: { purpose: "Generic route markers, corridors, branch hints, closures, and route queries." }
  });
}

export function queryNearestRouteMarker(state, point = {}, filter = () => true) {
  return nearestMarker(state, point, filter);
}
