import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";
import { EconomyTransactionRequest } from "./economy-kit.js";
import { OccupantNeedCreated, OccupantServed } from "./occupant-flow-kit.js";
import { TransportRouteArrived } from "./transport-route-kit.js";

export const RequestQueueState = defineResource("request.queueState");
export const RequestQueueAdd = defineEvent("request.queueAdd");
export const RequestQueueFulfill = defineEvent("request.queueFulfill");
export const RequestQueueExpired = defineEvent("request.queueExpired");
export const RequestQueueFulfilled = defineEvent("request.queueFulfilled");

function normalizeRequest(request = {}, index = 0) {
  return {
    id: request.id ?? `request-${index + 1}`,
    subjectId: request.subjectId ?? request.occupantId ?? null,
    kind: request.kind ?? request.need ?? "generic",
    destination: request.destination ?? null,
    status: request.status ?? "open",
    patience: Number(request.patience ?? request.timeoutSeconds ?? 60),
    reward: request.reward ?? null,
    penalty: request.penalty ?? null,
    metadata: request.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.requestDataset ?? config;
  return {
    id: dataset.id ?? "request-queue",
    requests: (dataset.requests ?? []).map(normalizeRequest),
    defaultReward: dataset.defaultReward ?? { account: "cash", amount: 15 },
    defaultPenalty: dataset.defaultPenalty ?? null,
    fulfilledCount: 0,
    expiredCount: 0,
    lastOutcome: null
  };
}

function applyReward(world, outcome, rule) {
  if (!rule?.account || Number(rule.amount ?? 0) === 0) return;
  world.emit(EconomyTransactionRequest, {
    account: rule.account,
    amount: Number(rule.amount),
    source: outcome,
    metadata: rule.metadata ?? {}
  });
}

function fulfillRequest(world, state, requestId, payload = {}) {
  const requests = state.requests.map((request) => ({ ...request }));
  const request = requests.find((entry) => entry.id === requestId || entry.subjectId === payload.subjectId);
  if (!request || request.status !== "open") return state;
  request.status = "fulfilled";
  const outcome = { request, payload };
  world.emit(RequestQueueFulfilled, outcome);
  if (request.subjectId) world.emit(OccupantServed, { occupantId: request.subjectId, requestId: request.id });
  applyReward(world, "request-fulfilled", outcome.request.reward);
  return {
    ...state,
    requests,
    fulfilledCount: Number(state.fulfilledCount ?? 0) + 1,
    lastOutcome: { type: "fulfilled", requestId: request.id, subjectId: request.subjectId }
  };
}

function requestQueueSystem(world) {
  let state = world.getResource(RequestQueueState);
  if (!state) return;

  let requests = state.requests.map((request) => ({ ...request }));
  let fulfilledCount = Number(state.fulfilledCount ?? 0);
  let expiredCount = Number(state.expiredCount ?? 0);
  let lastOutcome = state.lastOutcome;

  for (const request of world.readEvents(RequestQueueAdd)) {
    requests.push(normalizeRequest(request, requests.length));
  }

  for (const need of world.readEvents(OccupantNeedCreated)) {
    requests.push(normalizeRequest({
      id: `need-${need.occupantId}`,
      subjectId: need.occupantId,
      kind: need.need,
      destination: need.destination,
      patience: need.patience,
      reward: state.defaultReward,
      penalty: state.defaultPenalty
    }, requests.length));
  }

  state = { ...state, requests, fulfilledCount, expiredCount, lastOutcome };

  for (const arrival of world.readEvents(TransportRouteArrived)) {
    state = fulfillRequest(world, state, `need-${arrival.riderId}`, { subjectId: arrival.riderId, arrival });
  }

  for (const request of world.readEvents(RequestQueueFulfill)) {
    state = fulfillRequest(world, state, request.id, request);
  }

  requests = state.requests.map((request) => ({ ...request }));
  fulfilledCount = Number(state.fulfilledCount ?? 0);
  expiredCount = Number(state.expiredCount ?? 0);
  lastOutcome = state.lastOutcome;

  const delta = Math.max(0, Number(world.__nexusClock?.delta ?? 0));
  for (const request of requests) {
    if (request.status !== "open") continue;
    request.patience -= delta;
    if (request.patience <= 0) {
      request.patience = 0;
      request.status = "expired";
      expiredCount += 1;
      lastOutcome = { type: "expired", requestId: request.id, subjectId: request.subjectId };
      world.emit(RequestQueueExpired, { request });
      applyReward(world, "request-expired", request.penalty);
    }
  }

  world.setResource(RequestQueueState, { ...state, requests, fulfilledCount, expiredCount, lastOutcome });
}

export function createRequestQueueKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "request-queue-kit",
    resources: { RequestQueueState },
    events: { RequestQueueAdd, RequestQueueFulfill, RequestQueueExpired, RequestQueueFulfilled },
    systems: [{ phase: "resolve", system: requestQueueSystem, name: "requestQueueSystem" }],
    provides: ["request-queue"],
    initWorld({ world }) {
      world.setResource(RequestQueueState, initialState(config));
    },
    install({ engine }) {
      engine.requestQueue = {
        getState() {
          return engine.world.getResource(RequestQueueState);
        },
        add(request = {}) {
          engine.world.emit(RequestQueueAdd, request);
          engine.tick(0);
          return engine.world.getResource(RequestQueueState);
        },
        fulfill(id, payload = {}) {
          engine.world.emit(RequestQueueFulfill, { id, ...payload });
          engine.tick(0);
          return engine.world.getResource(RequestQueueState);
        },
        reset() {
          engine.world.setResource(RequestQueueState, initialState(config));
          return engine.world.getResource(RequestQueueState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(RequestQueueState));
        }
      };
    },
    metadata: { purpose: "Generic request queues, fulfillment, expiry, and outcome events." }
  });
}
