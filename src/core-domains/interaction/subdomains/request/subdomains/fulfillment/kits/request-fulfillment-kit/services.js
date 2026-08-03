import { normalizeFulfillmentRequest, queryNearestOpenRequest } from "./contracts.js";

export function createRequestFulfillmentServices(baseApi) {
  return {
    create(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const created = normalizeFulfillmentRequest({ ...request.request, id: request.request?.id ?? request.requestId ?? request.operationId }, state.requests.length);
        if (state.requests.some((entry) => entry.id === created.id)) throw new TypeError(`Fulfillment request ${created.id} already exists.`);
        return { patch: { requests: [...state.requests, created], lastEvent: { type: "created", request: created } }, result: { request: created }, events: [{ name: "created", payload: { request: created } }] };
      });
    },
    nearestOpen: (point, radius) => queryNearestOpenRequest(baseApi.getState(), point, radius),
    complete(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const requestId = String(request.requestId ?? "");
        const current = state.requests.find((entry) => entry.id === requestId);
        if (!current) throw new TypeError(`Unknown fulfillment request ${requestId}.`);
        if (current.status !== "open") throw new TypeError(`Fulfillment request ${requestId} is already ${current.status}.`);
        const reward = request.reward === undefined ? current.reward : Number(request.reward);
        if (!Number.isFinite(reward) || reward < 0) throw new TypeError("Fulfillment reward must be finite and nonnegative.");
        const completed = { ...current, status: "completed", completedAtSeconds: state.elapsedSeconds };
        return { patch: { requests: state.requests.map((entry) => entry.id === requestId ? completed : entry), completedCount: state.completedCount + 1, rewardTotal: state.rewardTotal + reward, lastEvent: { type: "completed", request: completed, reward } }, result: { request: completed, reward }, events: [{ name: "completed", payload: { request: completed, reward } }] };
      });
    },
    advance(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const delta = Number(request.delta ?? 0);
        if (!Number.isFinite(delta) || delta < 0) throw new TypeError("Fulfillment delta must be finite and nonnegative.");
        const expired = [];
        const requests = state.requests.map((entry) => {
          if (entry.status !== "open") return entry;
          const elapsedSeconds = entry.elapsedSeconds + delta;
          if (entry.deadlineSeconds > 0 && elapsedSeconds >= entry.deadlineSeconds) {
            const next = { ...entry, elapsedSeconds, status: "expired" };
            expired.push(next);
            return next;
          }
          return { ...entry, elapsedSeconds };
        });
        return { patch: { elapsedSeconds: state.elapsedSeconds + delta, requests, expiredCount: state.expiredCount + expired.length, lastEvent: expired.length ? { type: "expired", requests: expired } : state.lastEvent }, result: { expired }, events: expired.map((entry) => ({ name: "expired", payload: { request: entry } })) };
      });
    }
  };
}
