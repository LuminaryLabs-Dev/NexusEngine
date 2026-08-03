import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

export function collectTransportArrivals(transportReceipt = {}) {
  const result = transportReceipt.result ?? transportReceipt;
  const arrivals = result.arrivals ?? (result.arrival ? [result.arrival] : []);
  return cloneSerializableState(arrivals.map((arrival) => ({
    callId: String(arrival.callId ?? ""),
    riderId: String(arrival.riderId ?? ""),
    stop: String(arrival.stop ?? ""),
    metadata: arrival.metadata ?? {}
  })));
}
