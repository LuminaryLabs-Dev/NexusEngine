import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const TransferZoneState = defineResource("transfer.zoneState");
export const TransferZoneCompleted = defineEvent("transfer.zoneCompleted");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeZone(zone = {}, index = 0) {
  return {
    id: zone.id ?? `transfer-zone-${index + 1}`,
    x: number(zone.x, 0),
    y: number(zone.y, 0),
    radius: Math.max(1, number(zone.radius, 32)),
    accepts: zone.accepts ?? ["target"],
    dwellSeconds: Math.max(0, number(zone.dwellSeconds, 0)),
    capacity: Math.max(1, Math.round(number(zone.capacity, 1))),
    metadata: zone.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.transferZoneDataset ?? config;
  return {
    id: dataset.id ?? "transfer-zones",
    zones: (dataset.zones ?? []).map(normalizeZone),
    active: {},
    completed: [],
    completedCount: 0,
    lastCompletion: null
  };
}

function inZone(zone, point = {}) {
  const dx = zone.x - number(point.x, 0);
  const dy = zone.y - number(point.y, 0);
  return dx * dx + dy * dy <= zone.radius * zone.radius;
}

export function createTransferZoneKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "transfer-zone-kit",
    resources: { TransferZoneState },
    events: { TransferZoneCompleted },
    provides: ["transfer-zones"],
    initWorld({ world }) {
      world.setResource(TransferZoneState, initialState(config));
    },
    install({ engine }) {
      engine.transferZones = {
        getState() {
          return engine.world.getResource(TransferZoneState);
        },
        zonesAt(point = {}) {
          return (engine.world.getResource(TransferZoneState)?.zones ?? []).filter((zone) => inZone(zone, point));
        },
        transfer(zoneId, payload = {}) {
          const state = engine.world.getResource(TransferZoneState);
          const zone = state.zones.find((entry) => entry.id === zoneId) ?? state.zones[0];
          if (!zone) return state;
          const completion = { zoneId: zone.id, payload, at: Number(engine.world.__nexusClock?.elapsed ?? 0) };
          const completed = [...state.completed, completion];
          const next = { ...state, completed, completedCount: completed.length, lastCompletion: completion };
          engine.world.setResource(TransferZoneState, next);
          engine.world.emit(TransferZoneCompleted, completion);
          return next;
        },
        reset() {
          engine.world.setResource(TransferZoneState, initialState(config));
          return engine.world.getResource(TransferZoneState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(TransferZoneState));
        }
      };
    },
    metadata: { purpose: "Generic transfer, delivery, extraction, or safe-zone completion domains." }
  });
}
