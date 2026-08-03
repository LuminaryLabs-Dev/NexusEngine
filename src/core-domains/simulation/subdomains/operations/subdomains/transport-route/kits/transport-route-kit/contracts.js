import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function normalizeCarrier(carrier = {}, index = 0) {
  const capacity = Math.floor(finite(carrier.capacity, `carrier-${index}.capacity`, 1));
  const speed = finite(carrier.speedStopsPerSecond ?? carrier.speed, `carrier-${index}.speed`, 1);
  if (capacity < 1 || speed <= 0) throw new RangeError("Transport carrier capacity and speed must be positive.");
  return { id: String(carrier.id ?? `carrier-${index + 1}`), stop: carrier.stop == null && carrier.location == null ? null : String(carrier.stop ?? carrier.location), targetStop: carrier.targetStop == null ? null : String(carrier.targetStop), capacity, speedStopsPerSecond: speed, riders: cloneSerializableState(carrier.riders ?? []), progress: Math.max(0, finite(carrier.progress, `carrier-${index}.progress`, 0)), metadata: cloneSerializableState(carrier.metadata ?? {}) };
}

export function normalizeTransportRouteConfig(config = {}) {
  const source = config.transportDataset ?? config;
  const stops = (source.stops ?? []).map((stop, index) => ({ id: String(stop.id ?? `stop-${index + 1}`), metadata: cloneSerializableState(stop.metadata ?? {}) }));
  if (new Set(stops.map((stop) => stop.id)).size !== stops.length) throw new TypeError("Transport stops contain duplicate IDs.");
  const carriers = (source.carriers ?? [{ id: "carrier-1", stop: stops[0]?.id ?? null }]).map(normalizeCarrier);
  if (new Set(carriers.map((carrier) => carrier.id)).size !== carriers.length) throw new TypeError("Transport carriers contain duplicate IDs.");
  for (const carrier of carriers) if (carrier.stop !== null && !stops.some((stop) => stop.id === carrier.stop)) throw new TypeError(`Carrier ${carrier.id} references unknown stop ${carrier.stop}.`);
  return { id: String(source.id ?? "transport-routes"), stops, carriers, waiting: cloneSerializableState(source.waiting ?? []) };
}

export function createTransportRouteState(config = {}) {
  const normalized = normalizeTransportRouteConfig(config);
  return { routesId: normalized.id, stops: normalized.stops, carriers: normalized.carriers, waiting: normalized.waiting, arrivalReceipts: [], lastArrival: null };
}

function stopIndex(stops, id) {
  const index = stops.findIndex((stop) => stop.id === id);
  if (index < 0) throw new TypeError(`Unknown transport stop ${id}.`);
  return index;
}

function boardAtCurrentStop(carrier, waiting) {
  const capacity = Math.max(0, carrier.capacity - carrier.riders.length);
  const boarding = waiting.filter((call) => call.from === carrier.stop).slice(0, capacity);
  if (boarding.length) carrier.riders.push(...boarding);
  const ids = new Set(boarding.map((call) => call.id));
  return waiting.filter((call) => !ids.has(call.id));
}

export function advanceTransportRoutes(state = {}, command = {}) {
  const delta = finite(command.delta, "delta", 0);
  if (delta < 0) throw new RangeError("Transport delta cannot be negative.");
  let waiting = cloneSerializableState(state.waiting);
  const arrivals = [];
  const carriers = state.carriers.map((source) => {
    const carrier = cloneSerializableState(source);
    waiting = boardAtCurrentStop(carrier, waiting);
    if (!carrier.targetStop) carrier.targetStop = carrier.riders[0]?.to ?? waiting[0]?.from ?? null;
    carrier.progress += delta * carrier.speedStopsPerSecond;
    let guard = 0;
    while (carrier.progress >= 1 && carrier.targetStop && carrier.targetStop !== carrier.stop) {
      if (++guard > 100000) throw new RangeError("Transport advance exceeded the deterministic leg limit.");
      const current = stopIndex(state.stops, carrier.stop);
      const target = stopIndex(state.stops, carrier.targetStop);
      carrier.stop = state.stops[current + Math.sign(target - current)].id;
      carrier.progress -= 1;
      if (carrier.stop === carrier.targetStop) {
        const exiting = carrier.riders.filter((call) => call.to === carrier.stop);
        carrier.riders = carrier.riders.filter((call) => call.to !== carrier.stop);
        for (const call of exiting) arrivals.push({ schema: "nexusengine.transport-arrival/1", carrierId: carrier.id, callId: call.id, riderId: call.riderId, stop: carrier.stop, metadata: cloneSerializableState(call.metadata) });
        waiting = boardAtCurrentStop(carrier, waiting);
        carrier.targetStop = carrier.riders[0]?.to ?? waiting[0]?.from ?? null;
      }
    }
    if (carrier.targetStop === carrier.stop) carrier.targetStop = carrier.riders[0]?.to ?? null;
    return carrier;
  });
  return { carriers, waiting, arrivals };
}
