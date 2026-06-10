import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const ResourcePressureState = defineResource("resource.pressureState");
export const ResourcePressureAdjust = defineEvent("resource.pressureAdjust");
export const ResourcePressureDepleted = defineEvent("resource.pressureDepleted");
export const ResourcePressureChanged = defineEvent("resource.pressureChanged");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeResource(resource = {}, index = 0) {
  const start = number(resource.start ?? resource.value, 100);
  return {
    id: resource.id ?? `pressure-${index + 1}`,
    label: resource.label ?? resource.id ?? `Pressure ${index + 1}`,
    value: start,
    start,
    min: number(resource.min, 0),
    max: number(resource.max, Math.max(100, start)),
    drainPerSecond: number(resource.drainPerSecond ?? resource.drain, 0),
    recoverPerSecond: number(resource.recoverPerSecond ?? resource.recover, 0),
    depleted: false,
    metadata: resource.metadata ?? {}
  };
}

function initialState(config = {}) {
  const resources = config.resources ?? [config];
  return {
    id: config.id ?? "resource-pressure",
    elapsedSeconds: 0,
    resources: Object.fromEntries(resources.map((resource, index) => {
      const normalized = normalizeResource(resource, index);
      return [normalized.id, normalized];
    })),
    lastChange: null,
    depleted: []
  };
}

function applyAdjustment(resource, amount) {
  const before = resource.value;
  const value = clamp(before + amount, resource.min, resource.max);
  return {
    resource: { ...resource, value, depleted: value <= resource.min },
    change: { id: resource.id, before, after: value, amount: value - before }
  };
}

function resourcePressureSystem(world) {
  const state = world.getResource(ResourcePressureState);
  if (!state) return;

  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  const resources = Object.fromEntries(Object.entries(state.resources).map(([id, resource]) => [id, { ...resource }]));
  let lastChange = state.lastChange;
  const depleted = new Set(state.depleted ?? []);

  for (const resource of Object.values(resources)) {
    const drift = (resource.recoverPerSecond - resource.drainPerSecond) * delta;
    if (drift !== 0) {
      const result = applyAdjustment(resource, drift);
      resources[resource.id] = result.resource;
      if (result.change.amount !== 0) {
        lastChange = { ...result.change, source: "pressure-drift" };
        world.emit(ResourcePressureChanged, lastChange);
      }
    }
  }

  for (const adjustment of world.readEvents(ResourcePressureAdjust)) {
    const id = adjustment.resourceId ?? adjustment.id ?? Object.keys(resources)[0];
    const resource = resources[id];
    if (!resource) continue;
    const result = applyAdjustment(resource, number(adjustment.amount, 0));
    resources[id] = result.resource;
    lastChange = {
      ...result.change,
      source: adjustment.source ?? "pressure-adjust",
      metadata: adjustment.metadata ?? {}
    };
    world.emit(ResourcePressureChanged, lastChange);
  }

  for (const resource of Object.values(resources)) {
    if (resource.value <= resource.min && !depleted.has(resource.id)) {
      depleted.add(resource.id);
      world.emit(ResourcePressureDepleted, { id: resource.id, resource });
    }
    if (resource.value > resource.min) depleted.delete(resource.id);
  }

  world.setResource(ResourcePressureState, {
    ...state,
    elapsedSeconds: number(state.elapsedSeconds, 0) + delta,
    resources,
    lastChange,
    depleted: Array.from(depleted)
  });
}

export function createResourcePressureKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "resource-pressure-kit",
    resources: { ResourcePressureState },
    events: { ResourcePressureAdjust, ResourcePressureChanged, ResourcePressureDepleted },
    systems: [{ phase: "resolve", system: resourcePressureSystem, name: "resourcePressureSystem" }],
    provides: ["resource-pressure"],
    initWorld({ world }) {
      world.setResource(ResourcePressureState, initialState(config));
    },
    install({ engine }) {
      engine.resourcePressure = {
        getState() {
          return engine.world.getResource(ResourcePressureState);
        },
        get(id) {
          const state = engine.world.getResource(ResourcePressureState);
          return state?.resources?.[id ?? Object.keys(state.resources)[0]] ?? null;
        },
        adjust(resourceId, amount, payload = {}) {
          engine.world.emit(ResourcePressureAdjust, { resourceId, amount, ...payload });
          engine.tick(0);
          return engine.world.getResource(ResourcePressureState);
        },
        reset() {
          engine.world.setResource(ResourcePressureState, initialState(config));
          return engine.world.getResource(ResourcePressureState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(ResourcePressureState));
        }
      };
    },
    metadata: { purpose: "Generic draining, recovering, adjustable resource pressure meters." }
  });
}

export function pressureValue(state, id) {
  const fallbackId = Object.keys(state?.resources ?? {})[0];
  const resource = state?.resources?.[id ?? fallbackId];
  return Number(resource?.value ?? 0);
}
