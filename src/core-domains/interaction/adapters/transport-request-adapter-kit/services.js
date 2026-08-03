import { collectTransportArrivals } from "./contracts.js";

export function createTransportRequestAdapterServices(baseApi, requestQueue) {
  return {
    apply(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const arrivals = collectTransportArrivals(request.transportReceipt);
        const open = requestQueue.listOpen();
        const receipts = arrivals.map((arrival) => {
          const queued = open.find((entry) => entry.id === arrival.callId) ?? open.find((entry) => entry.subjectId === arrival.riderId);
          if (!queued) throw new TypeError(`Transport arrival ${arrival.callId || arrival.riderId} has no open Request Queue entry.`);
          return requestQueue.fulfill({ operationId: `transport-request:${arrival.callId || queued.id}:arrived`, requestId: queued.id });
        });
        const result = { arrivals, receipts };
        return { patch: { applications: state.applications + 1, lastResult: result }, result };
      });
    }
  };
}
