import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const TransportRouteState = defineResource("transport.routeState");
export const TransportRouteCall = defineEvent("transport.routeCall");
export const TransportRouteArrived = defineEvent("transport.routeArrived");

function normalizeCarrier(carrier = {}, index = 0) {
  return {
    id: carrier.id ?? `carrier-${index + 1}`,
    stop: carrier.stop ?? carrier.location ?? null,
    targetStop: carrier.targetStop ?? null,
    capacity: Math.max(1, Number(carrier.capacity ?? 1)),
    speedStopsPerSecond: Math.max(0.001, Number(carrier.speedStopsPerSecond ?? carrier.speed ?? 1)),
    riders: carrier.riders ?? [],
    progress: Number(carrier.progress ?? 0),
    metadata: carrier.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.transportDataset ?? config;
  return {
    id: dataset.id ?? "transport-routes",
    stops: dataset.stops ?? [],
    carriers: (dataset.carriers ?? [{ id: "carrier-1", stop: dataset.stops?.[0]?.id ?? null }]).map(normalizeCarrier),
    waiting: dataset.waiting ?? [],
    lastArrival: null
  };
}

function stopIndex(stops, id) {
  return Math.max(0, stops.findIndex((stop) => stop.id === id));
}

function transportRouteSystem(world) {
  let state = world.getResource(TransportRouteState);
  if (!state) return;

  let waiting = [...state.waiting];
  const carriers = state.carriers.map((carrier) => ({ ...carrier, riders: [...carrier.riders] }));
  let lastArrival = state.lastArrival;

  for (const call of world.readEvents(TransportRouteCall)) {
    waiting.push({
      id: call.id ?? `call-${waiting.length + 1}`,
      riderId: call.riderId ?? call.id,
      from: call.from,
      to: call.to,
      metadata: call.metadata ?? {}
    });
  }

  for (const carrier of carriers) {
    const boarding = waiting.filter((call) => call.from === carrier.stop).slice(0, Math.max(0, carrier.capacity - carrier.riders.length));
    if (boarding.length) {
      carrier.riders.push(...boarding);
      waiting = waiting.filter((call) => !boarding.includes(call));
      carrier.targetStop = boarding[0].to;
    }
    if (!carrier.targetStop && waiting.length) {
      carrier.targetStop = waiting[0].from;
    }
  }

  const delta = Math.max(0, Number(world.__nexusClock?.delta ?? 0));
  for (const carrier of carriers) {
    if (!carrier.targetStop || carrier.targetStop === carrier.stop) {
      if (carrier.targetStop === carrier.stop) carrier.targetStop = carrier.riders[0]?.to ?? null;
      continue;
    }
    const current = stopIndex(state.stops, carrier.stop);
    const target = stopIndex(state.stops, carrier.targetStop);
    const direction = Math.sign(target - current);
    carrier.progress += delta * carrier.speedStopsPerSecond;
    if (carrier.progress >= 1) {
      carrier.progress = 0;
      const nextIndex = Math.max(0, Math.min(state.stops.length - 1, current + direction));
      carrier.stop = state.stops[nextIndex]?.id ?? carrier.stop;
      if (carrier.stop === carrier.targetStop) {
        const exiting = carrier.riders.filter((call) => call.to === carrier.stop);
        carrier.riders = carrier.riders.filter((call) => call.to !== carrier.stop);
        for (const call of exiting) {
          lastArrival = { carrierId: carrier.id, riderId: call.riderId, stop: carrier.stop, metadata: call.metadata };
          world.emit(TransportRouteArrived, lastArrival);
        }
        carrier.targetStop = carrier.riders[0]?.to ?? null;
      }
    }
  }

  world.setResource(TransportRouteState, { ...state, carriers, waiting, lastArrival });
}

export function createTransportRouteKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "transport-route-kit",
    resources: { TransportRouteState },
    events: { TransportRouteCall, TransportRouteArrived },
    systems: [{ phase: "simulate", system: transportRouteSystem, name: "transportRouteSystem" }],
    provides: ["transport-route"],
    initWorld({ world }) {
      world.setResource(TransportRouteState, initialState(config));
    },
    install({ engine }) {
      engine.transportRoutes = {
        getState() {
          return engine.world.getResource(TransportRouteState);
        },
        call(request = {}) {
          engine.world.emit(TransportRouteCall, request);
          engine.tick(0);
          return engine.world.getResource(TransportRouteState);
        },
        reset() {
          engine.world.setResource(TransportRouteState, initialState(config));
          return engine.world.getResource(TransportRouteState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(TransportRouteState));
        }
      };
    },
    metadata: { purpose: "Generic route transport, stops, carriers, capacity, and arrivals." }
  });
}
