import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";
import { EconomyTransactionRequest } from "./economy-kit.js";

export const LifecycleProgressionState = defineResource("lifecycle.progressionState");
export const LifecycleProgressionStart = defineEvent("lifecycle.progressionStart");
export const LifecycleProgressionCompleted = defineEvent("lifecycle.progressionCompleted");

function normalizeItem(item = {}, index = 0) {
  return {
    id: item.id ?? `item-${index + 1}`,
    kind: item.kind ?? "generic",
    status: item.status ?? "planned",
    durationSeconds: Math.max(0, Number(item.durationSeconds ?? item.duration ?? 0)),
    elapsedSeconds: Number(item.elapsedSeconds ?? 0),
    cost: item.cost ?? null,
    prerequisites: item.prerequisites ?? [],
    effects: item.effects ?? {},
    metadata: item.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.lifecycleDataset ?? config;
  return {
    id: dataset.id ?? "lifecycle-progression",
    items: (dataset.items ?? []).map(normalizeItem),
    completed: [],
    lastCompleted: null
  };
}

function prerequisitesMet(item, state) {
  const completed = new Set(state.completed ?? []);
  return (item.prerequisites ?? []).every((id) => completed.has(id));
}

function startItem(state, request = {}) {
  const items = state.items.map((item) => ({ ...item }));
  const item = items.find((entry) => entry.id === request.id);
  if (!item || item.status === "active" || item.status === "complete") return state;
  if (!prerequisitesMet(item, state)) return state;
  item.status = item.durationSeconds > 0 ? "active" : "complete";
  item.elapsedSeconds = 0;
  const completed = item.status === "complete" ? Array.from(new Set([...(state.completed ?? []), item.id])) : state.completed;
  return { ...state, items, completed, lastCompleted: item.status === "complete" ? item : state.lastCompleted };
}

function lifecycleProgressionSystem(world) {
  let state = world.getResource(LifecycleProgressionState);
  if (!state) return;

  for (const request of world.readEvents(LifecycleProgressionStart)) {
    const before = state.items.find((item) => item.id === request.id);
    if (before?.cost?.amount) {
      world.emit(EconomyTransactionRequest, {
        account: before.cost.account ?? "cash",
        amount: -Math.abs(Number(before.cost.amount)),
        source: "lifecycle",
        metadata: { itemId: before.id, kind: before.kind }
      });
    }
    state = startItem(state, request);
  }

  const delta = Math.max(0, Number(world.__nexusClock?.delta ?? 0));
  const items = state.items.map((item) => ({ ...item }));
  const completed = new Set(state.completed ?? []);
  let lastCompleted = state.lastCompleted;

  for (const item of items) {
    if (item.status !== "active") continue;
    item.elapsedSeconds += delta;
    if (item.elapsedSeconds >= item.durationSeconds) {
      item.status = "complete";
      item.elapsedSeconds = item.durationSeconds;
      completed.add(item.id);
      lastCompleted = { ...item };
      world.emit(LifecycleProgressionCompleted, { item: { ...item } });
    }
  }

  world.setResource(LifecycleProgressionState, { ...state, items, completed: Array.from(completed), lastCompleted });
}

export function createLifecycleProgressionKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "lifecycle-progression-kit",
    resources: { LifecycleProgressionState },
    events: { LifecycleProgressionStart, LifecycleProgressionCompleted },
    systems: [{ phase: "simulate", system: lifecycleProgressionSystem, name: "lifecycleProgressionSystem" }],
    provides: ["lifecycle-progression"],
    initWorld({ world }) {
      world.setResource(LifecycleProgressionState, initialState(config));
    },
    install({ engine }) {
      engine.lifecycleProgression = {
        getState() {
          return engine.world.getResource(LifecycleProgressionState);
        },
        start(id, payload = {}) {
          engine.world.emit(LifecycleProgressionStart, { id, ...payload });
          engine.tick(0);
          return engine.world.getResource(LifecycleProgressionState);
        },
        add(item = {}) {
          const state = engine.world.getResource(LifecycleProgressionState);
          const next = { ...state, items: [...state.items, normalizeItem(item, state.items.length)] };
          engine.world.setResource(LifecycleProgressionState, next);
          return next;
        },
        reset() {
          engine.world.setResource(LifecycleProgressionState, initialState(config));
          return engine.world.getResource(LifecycleProgressionState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(LifecycleProgressionState));
        }
      };
    },
    metadata: { purpose: "Generic lifecycle progression for timed construction, upgrades, and unlocks." }
  });
}
