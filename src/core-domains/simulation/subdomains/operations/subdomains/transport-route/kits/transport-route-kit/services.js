import { advanceTransportRoutes } from "./contracts.js";

export function createTransportRouteServices(baseApi) {
  return {
    call(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const call = { id: String(request.callId ?? request.operationId), riderId: String(request.riderId ?? request.callId ?? request.operationId), from: String(request.from ?? ""), to: String(request.to ?? ""), metadata: structuredClone(request.metadata ?? {}) };
        if (!call.from || !call.to) throw new TypeError("Transport call requires from and to stops.");
        if (!state.stops.some((stop) => stop.id === call.from) || !state.stops.some((stop) => stop.id === call.to)) throw new TypeError("Transport call references an unknown stop.");
        if (state.waiting.some((entry) => entry.id === call.id) || state.carriers.some((carrier) => carrier.riders.some((entry) => entry.id === call.id))) throw new TypeError(`Transport call ${call.id} already exists.`);
        return { patch: { waiting: [...state.waiting, call] }, result: { call } };
      });
    },
    advance(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const advanced = advanceTransportRoutes(state, request);
        return { patch: { carriers: advanced.carriers, waiting: advanced.waiting, arrivalReceipts: [...state.arrivalReceipts, ...advanced.arrivals].slice(-512), lastArrival: advanced.arrivals.at(-1) ?? state.lastArrival }, result: { arrivals: advanced.arrivals, carriers: advanced.carriers }, events: advanced.arrivals.map((arrival) => ({ name: "arrived", payload: { arrival } })) };
      });
    }
  };
}
