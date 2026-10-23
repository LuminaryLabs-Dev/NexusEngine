import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const RequestFulfillmentState = defineResource("request.fulfillmentState");
export const RequestFulfillmentCreated = defineEvent("request.fulfillmentCreated");
export const RequestFulfillmentCompleted = defineEvent("request.fulfillmentCompleted");
export const RequestFulfillmentExpired = defineEvent("request.fulfillmentExpired");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeRequest(request = {}, index = 0) {
  return {
    id: request.id ?? `request-${index + 1}`,
    kind: request.kind ?? "request",
    x: number(request.x ?? request.destination?.x, 0),
    y: number(request.y ?? request.destination?.y, 0),
    radius: Math.max(1, number(request.radius, 24)),
    reward: Math.max(0, number(request.reward, 1)),
    deadlineSeconds: Math.max(0, number(request.deadlineSeconds ?? request.deadline, 0)),
    elapsedSeconds: Math.max(0, number(request.elapsedSeconds, 0)),
    status: request.status ?? "open",
    metadata: request.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.requestFulfillmentDataset ?? config;
  return {
    id: dataset.id ?? "request-fulfillment",
    elapsedSeconds: 0,
    completedCount: 0,
    expiredCount: 0,
    rewardTotal: 0,
    requests: (dataset.requests ?? []).map(normalizeRequest),
    lastEvent: null
  };
}

function requestFulfillmentSystem(world) {
  const state = world.getResource(RequestFulfillmentState);
  if (!state) return;
  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  if (delta <= 0) return;
  let expiredCount = state.expiredCount;
  let lastEvent = state.lastEvent;
  const requests = state.requests.map((request) => {
    if (request.status !== "open") return request;
    const elapsedSeconds = request.elapsedSeconds + delta;
    if (request.deadlineSeconds > 0 && elapsedSeconds >= request.deadlineSeconds) {
      const expired = { ...request, elapsedSeconds, status: "expired" };
      expiredCount += 1;
      lastEvent = { type: "expired", request: expired };
      world.emit(RequestFulfillmentExpired, { request: expired });
      return expired;
    }
    return { ...request, elapsedSeconds };
  });
  world.setResource(RequestFulfillmentState, {
    ...state,
    elapsedSeconds: state.elapsedSeconds + delta,
    expiredCount,
    requests,
    lastEvent
  });
}

function openRequests(state) {
  return (state?.requests ?? []).filter((request) => request.status === "open");
}

function nearestOpen(state, point = {}, radius = Infinity) {
  const x = number(point.x, 0);
  const y = number(point.y, 0);
  return openRequests(state)
    .map((request) => ({ request, distance: Math.hypot(request.x - x, request.y - y) }))
    .filter((entry) => entry.distance <= radius)
    .sort((left, right) => left.distance - right.distance)[0] ?? null;
}

export function createRequestFulfillmentKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "request-fulfillment-kit",
    resources: { RequestFulfillmentState },
    events: { RequestFulfillmentCreated, RequestFulfillmentCompleted, RequestFulfillmentExpired },
    systems: [{ phase: "resolve", system: requestFulfillmentSystem, name: "requestFulfillmentSystem" }],
    provides: ["request-fulfillment"],
    initWorld({ world }) {
      world.setResource(RequestFulfillmentState, initialState(config));
    },
    install({ engine }) {
      engine.requestFulfillment = {
        getState() {
          return engine.world.getResource(RequestFulfillmentState);
        },
        create(request = {}) {
          const state = engine.world.getResource(RequestFulfillmentState);
          const created = normalizeRequest(request, state.requests.length);
          const next = {
            ...state,
            requests: [...state.requests, created],
            lastEvent: { type: "created", request: created }
          };
          engine.world.setResource(RequestFulfillmentState, next);
          engine.world.emit(RequestFulfillmentCreated, { request: created });
          return { state: next, request: created };
        },
        nearestOpen(point = {}, radius = Infinity) {
          return nearestOpen(engine.world.getResource(RequestFulfillmentState), point, radius);
        },
        complete(requestId, payload = {}) {
          const state = engine.world.getResource(RequestFulfillmentState);
          const request = state.requests.find((entry) => entry.id === requestId);
          if (!request || request.status !== "open") return { state, request: null, reason: "unavailable" };
          const completed = { ...request, status: "completed", completedAtSeconds: state.elapsedSeconds };
          const requests = state.requests.map((entry) => entry.id === requestId ? completed : entry);
          const reward = Math.max(0, number(payload.reward, completed.reward));
          const next = {
            ...state,
            completedCount: state.completedCount + 1,
            rewardTotal: state.rewardTotal + reward,
            requests,
            lastEvent: { type: "completed", request: completed, reward, payload }
          };
          engine.world.setResource(RequestFulfillmentState, next);
          engine.world.emit(RequestFulfillmentCompleted, { request: completed, reward, payload });
          return { state: next, request: completed, reward };
        },
        reset() {
          engine.world.setResource(RequestFulfillmentState, initialState(config));
          return engine.world.getResource(RequestFulfillmentState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(RequestFulfillmentState));
        }
      };
    },
    metadata: { purpose: "Generic request destination, deadline, completion, expiry, and reward state." }
  });
}

export function queryNearestOpenRequest(state, point = {}, radius = Infinity) {
  const result = nearestOpen(state, point, radius);
  return result ? { request: { ...result.request }, distance: result.distance } : null;
}
