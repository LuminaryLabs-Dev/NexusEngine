import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const CargoManifestState = defineResource("cargo.manifestState");
export const CargoPickedUp = defineEvent("cargo.pickedUp");
export const CargoDeposited = defineEvent("cargo.deposited");
export const CargoQuotaCompleted = defineEvent("cargo.quotaCompleted");
export const CargoConditionChanged = defineEvent("cargo.conditionChanged");
export const CargoConditionDepleted = defineEvent("cargo.conditionDepleted");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeItem(item = {}, index = 0) {
  return {
    id: item.id ?? `cargo-${index + 1}`,
    kind: item.kind ?? "cargo",
    x: number(item.x, 0),
    y: number(item.y, 0),
    radius: Math.max(1, number(item.radius, 12)),
    value: Math.max(0, number(item.value, 1)),
    weight: Math.max(0, number(item.weight, 1)),
    condition: number(item.condition, number(item.conditionMax, 100)),
    conditionMax: Math.max(1, number(item.conditionMax, 100)),
    conditionDecayPerSecond: Math.max(0, number(item.conditionDecayPerSecond ?? item.decayPerSecond, 0)),
    conditionValueMultiplier: Math.max(0, number(item.conditionValueMultiplier, 1)),
    status: item.status ?? "available",
    carrierId: item.carrierId ?? null,
    metadata: item.metadata ?? {}
  };
}

function cargoConditionSystem(world) {
  const state = world.getResource(CargoManifestState);
  if (!state) return;
  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  if (delta <= 0) return;
  let lastEvent = state.lastEvent;
  const items = state.items.map((item) => {
    if (item.status !== "carried" || item.conditionDecayPerSecond <= 0) return item;
    const before = number(item.condition, item.conditionMax);
    const condition = Math.max(0, before - item.conditionDecayPerSecond * delta);
    if (condition !== before) {
      const event = { itemId: item.id, before, after: condition, amount: condition - before };
      lastEvent = { type: "condition-changed", ...event };
      world.emit(CargoConditionChanged, event);
      if (condition <= 0 && before > 0) world.emit(CargoConditionDepleted, { itemId: item.id, item: { ...item, condition } });
    }
    return { ...item, condition };
  });
  world.setResource(CargoManifestState, { ...state, items, lastEvent });
}

function initialState(config = {}) {
  const dataset = config.cargoManifestDataset ?? config;
  return {
    id: dataset.id ?? "cargo-manifest",
    capacity: Math.max(1, number(dataset.capacity, 4)),
    quota: Math.max(0, number(dataset.quota, 60)),
    carriedWeight: 0,
    deliveredValue: 0,
    deliveredCount: 0,
    quotaComplete: false,
    items: (dataset.items ?? []).map(normalizeItem),
    carried: [],
    deposited: [],
    lastEvent: null
  };
}

function distance(a = {}, b = {}) {
  return Math.hypot(number(a.x, 0) - number(b.x, 0), number(a.y, 0) - number(b.y, 0));
}

function availableItems(state) {
  return (state?.items ?? []).filter((item) => item.status === "available");
}

function nearestAvailable(state, point = {}, radius = Infinity) {
  return availableItems(state)
    .map((item) => ({ item, distance: distance(item, point) }))
    .filter((entry) => entry.distance <= radius)
    .sort((left, right) => left.distance - right.distance)[0] ?? null;
}

export function createCargoManifestKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "cargo-manifest-kit",
    resources: { CargoManifestState },
    events: { CargoPickedUp, CargoDeposited, CargoQuotaCompleted, CargoConditionChanged, CargoConditionDepleted },
    systems: [{ phase: "resolve", system: cargoConditionSystem, name: "cargoConditionSystem" }],
    provides: ["cargo-manifest"],
    initWorld({ world }) {
      world.setResource(CargoManifestState, initialState(config));
    },
    install({ engine }) {
      engine.cargoManifest = {
        getState() {
          return engine.world.getResource(CargoManifestState);
        },
        availableItems(point, radius) {
          const state = engine.world.getResource(CargoManifestState);
          if (!point) return availableItems(state);
          return availableItems(state).filter((item) => distance(item, point) <= number(radius, item.radius));
        },
        nearestAvailable(point = {}, radius = Infinity) {
          return nearestAvailable(engine.world.getResource(CargoManifestState), point, radius);
        },
        pickUp(itemId, payload = {}) {
          const state = engine.world.getResource(CargoManifestState);
          const item = state.items.find((entry) => entry.id === itemId);
          if (!item || item.status !== "available") return { state, picked: null, reason: "unavailable" };
          if (state.carriedWeight + item.weight > state.capacity) return { state, picked: null, reason: "capacity" };
          const picked = { ...item, status: "carried", carrierId: payload.carrierId ?? "carrier" };
          const items = state.items.map((entry) => entry.id === itemId ? picked : entry);
          const carried = [...state.carried, picked.id];
          const next = {
            ...state,
            items,
            carried,
            carriedWeight: state.carriedWeight + picked.weight,
            lastEvent: { type: "picked-up", item: picked, payload }
          };
          engine.world.setResource(CargoManifestState, next);
          engine.world.emit(CargoPickedUp, { item: picked, payload });
          return { state: next, picked };
        },
        deposit(zoneId = "transfer-zone", payload = {}) {
          const state = engine.world.getResource(CargoManifestState);
          const carriedItems = state.items.filter((item) => item.status === "carried");
          if (!carriedItems.length) return { state, deposited: [], value: 0 };
          const value = carriedItems.reduce((sum, item) => {
            const quality = Math.max(0, Math.min(1, number(item.condition, item.conditionMax) / Math.max(1, number(item.conditionMax, 100))));
            return sum + item.value * (1 + (quality - 1) * number(item.conditionValueMultiplier, 1));
          }, 0);
          const deposited = carriedItems.map((item) => ({ ...item, status: "deposited", zoneId }));
          const items = state.items.map((item) => deposited.find((entry) => entry.id === item.id) ?? item);
          const deliveredValue = state.deliveredValue + value;
          const quotaComplete = deliveredValue >= state.quota;
          const event = {
            zoneId,
            items: deposited,
            value,
            deliveredValue,
            quota: state.quota,
            payload
          };
          const next = {
            ...state,
            items,
            carried: [],
            carriedWeight: 0,
            deliveredValue,
            deliveredCount: state.deliveredCount + deposited.length,
            quotaComplete,
            deposited: [...state.deposited, event],
            lastEvent: { type: "deposited", ...event }
          };
          engine.world.setResource(CargoManifestState, next);
          engine.world.emit(CargoDeposited, event);
          if (quotaComplete && !state.quotaComplete) engine.world.emit(CargoQuotaCompleted, event);
          return { state: next, deposited, value };
        },
        reset() {
          engine.world.setResource(CargoManifestState, initialState(config));
          return engine.world.getResource(CargoManifestState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(CargoManifestState));
        }
      };
    },
    metadata: { purpose: "Generic cargo, item, pickup, carried capacity, deposit, and quota progress state." }
  });
}

export function queryNearestCargo(state, point = {}, radius = Infinity) {
  const result = nearestAvailable(state, point, radius);
  return result ? { item: { ...result.item }, distance: result.distance } : null;
}
