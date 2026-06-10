import { defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const WaterSurfaceState = defineResource("water.surfaceState");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeZone(zone = {}, index = 0) {
  return {
    id: zone.id ?? `water-zone-${index + 1}`,
    x: number(zone.x, 0),
    y: number(zone.y, 0),
    radius: Math.max(0, number(zone.radius, 100)),
    depth: number(zone.depth, 1),
    drag: Math.max(0, number(zone.drag, 1)),
    current: {
      x: number(zone.current?.x, 0),
      y: number(zone.current?.y, 0)
    },
    hazard: zone.hazard ?? null,
    metadata: zone.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.waterSurfaceDataset ?? config;
  return {
    id: dataset.id ?? "water-surface",
    elapsedSeconds: 0,
    baseDrag: Math.max(0, number(dataset.baseDrag, 1)),
    waveAmplitude: Math.max(0, number(dataset.waveAmplitude, 0)),
    waveFrequency: Math.max(0, number(dataset.waveFrequency, 0.2)),
    zones: (dataset.zones ?? []).map(normalizeZone),
    lastQuery: null
  };
}

function querySurface(state, point = {}) {
  const x = number(point.x, 0);
  const y = number(point.y, 0);
  const matches = (state?.zones ?? []).filter((zone) => {
    const dx = zone.x - x;
    const dy = zone.y - y;
    return dx * dx + dy * dy <= zone.radius * zone.radius;
  });
  const drag = matches.reduce((value, zone) => value * zone.drag, number(state?.baseDrag, 1));
  const current = matches.reduce((sum, zone) => ({
    x: sum.x + zone.current.x,
    y: sum.y + zone.current.y
  }), { x: 0, y: 0 });
  const depth = matches.length ? matches.reduce((value, zone) => Math.max(value, zone.depth), 0) : 1;
  return {
    x,
    y,
    depth,
    drag,
    current,
    wave: Math.sin(number(state?.elapsedSeconds, 0) * number(state?.waveFrequency, 0) + x * 0.013 + y * 0.017) * number(state?.waveAmplitude, 0),
    zones: matches.map((zone) => zone.id),
    hazards: matches.map((zone) => zone.hazard).filter(Boolean)
  };
}

function waterSurfaceSystem(world) {
  const state = world.getResource(WaterSurfaceState);
  if (!state) return;
  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  world.setResource(WaterSurfaceState, {
    ...state,
    elapsedSeconds: number(state.elapsedSeconds, 0) + delta
  });
}

export function createWaterSurfaceKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "water-surface-kit",
    resources: { WaterSurfaceState },
    systems: [{ phase: "simulate", system: waterSurfaceSystem, name: "waterSurfaceSystem" }],
    provides: ["water-surface"],
    initWorld({ world }) {
      world.setResource(WaterSurfaceState, initialState(config));
    },
    install({ engine }) {
      engine.waterSurface = {
        getState() {
          return engine.world.getResource(WaterSurfaceState);
        },
        query(point = {}) {
          const state = engine.world.getResource(WaterSurfaceState);
          const result = querySurface(state, point);
          engine.world.setResource(WaterSurfaceState, { ...state, lastQuery: result });
          return result;
        },
        reset() {
          engine.world.setResource(WaterSurfaceState, initialState(config));
          return engine.world.getResource(WaterSurfaceState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(WaterSurfaceState));
        }
      };
    },
    metadata: { purpose: "Generic dynamic water surface zones, currents, drag, waves, and water queries." }
  });
}

export function queryWaterSurface(state, point = {}) {
  return querySurface(state, point);
}
