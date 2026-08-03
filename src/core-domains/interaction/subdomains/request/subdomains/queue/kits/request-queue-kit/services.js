import { advanceRequestQueue, normalizeQueuedRequest } from "./contracts.js";

export function createRequestQueueServices(baseApi) {
  return {
    add(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const queued = normalizeQueuedRequest({ ...request.request, id: request.request?.id ?? request.requestId ?? request.operationId }, state.requests.length, state);
        if (state.requests.some((entry) => entry.id === queued.id)) throw new TypeError(`Request ${queued.id} already exists.`);
        return { patch: { requests: [...state.requests, queued] }, result: { request: queued }, events: [{ name: "added", payload: { request: queued } }] };
      });
    },
    fulfill(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const requestId = request.requestId == null ? null : String(request.requestId);
        const subjectId = request.subjectId == null ? null : String(request.subjectId);
        const queued = state.requests.find((entry) => requestId ? entry.id === requestId : subjectId ? entry.subjectId === subjectId : false);
        if (!queued) throw new TypeError("Request Queue fulfillment could not resolve a request.");
        if (queued.status !== "open") throw new TypeError(`Request ${queued.id} is already ${queued.status}.`);
        const fulfilled = { ...queued, status: "fulfilled" };
        const outcome = { type: "fulfilled", request: fulfilled, effect: fulfilled.reward };
        return { patch: { requests: state.requests.map((entry) => entry.id === queued.id ? fulfilled : entry), fulfilledCount: state.fulfilledCount + 1, lastOutcome: outcome }, result: outcome, events: [{ name: "fulfilled", payload: outcome }] };
      });
    },
    advance(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const advanced = advanceRequestQueue(state, request);
        const outcomes = advanced.expired.map((entry) => ({ type: "expired", request: entry, effect: entry.penalty }));
        return { patch: { requests: advanced.requests, expiredCount: state.expiredCount + advanced.expired.length, lastOutcome: outcomes.at(-1) ?? state.lastOutcome }, result: { outcomes }, events: outcomes.map((outcome) => ({ name: "expired", payload: outcome })) };
      });
    },
    listOpen: () => baseApi.getState().requests.filter((request) => request.status === "open")
  };
}
