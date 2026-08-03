import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function normalizeEffect(effect, label) {
  if (effect == null) return null;
  return { account: String(effect.account ?? "cash"), amount: finite(effect.amount, `${label}.amount`, 0), metadata: cloneSerializableState(effect.metadata ?? {}) };
}

export function normalizeQueuedRequest(request = {}, index = 0, defaults = {}) {
  const id = String(request.id ?? `request-${index + 1}`);
  const patience = finite(request.patience ?? request.timeoutSeconds, `${id}.patience`, 60);
  if (patience < 0) throw new RangeError(`Request ${id} patience cannot be negative.`);
  return { id, subjectId: request.subjectId == null && request.occupantId == null ? null : String(request.subjectId ?? request.occupantId), kind: String(request.kind ?? request.need ?? "generic"), destination: request.destination == null ? null : cloneSerializableState(request.destination), status: String(request.status ?? "open"), patience, reward: normalizeEffect(request.reward === undefined ? defaults.defaultReward : request.reward, `${id}.reward`), penalty: normalizeEffect(request.penalty === undefined ? defaults.defaultPenalty : request.penalty, `${id}.penalty`), metadata: cloneSerializableState(request.metadata ?? {}) };
}

export function normalizeRequestQueueConfig(config = {}) {
  const source = config.requestDataset ?? config;
  const defaultReward = normalizeEffect(source.defaultReward ?? { account: "cash", amount: 15 }, "defaultReward");
  const defaultPenalty = normalizeEffect(source.defaultPenalty, "defaultPenalty");
  const requests = (source.requests ?? []).map((request, index) => normalizeQueuedRequest(request, index, { defaultReward, defaultPenalty }));
  if (new Set(requests.map((request) => request.id)).size !== requests.length) throw new TypeError("Request Queue contains duplicate IDs.");
  return { id: String(source.id ?? "request-queue"), requests, defaultReward, defaultPenalty };
}

export function createRequestQueueState(config = {}) {
  const normalized = normalizeRequestQueueConfig(config);
  return { queueId: normalized.id, requests: normalized.requests, defaultReward: normalized.defaultReward, defaultPenalty: normalized.defaultPenalty, fulfilledCount: normalized.requests.filter((request) => request.status === "fulfilled").length, expiredCount: normalized.requests.filter((request) => request.status === "expired").length, lastOutcome: null };
}

export function advanceRequestQueue(state = {}, command = {}) {
  const delta = finite(command.delta, "delta", 0);
  if (delta < 0) throw new RangeError("Request Queue delta cannot be negative.");
  const expired = [];
  const requests = state.requests.map((request) => {
    if (request.status !== "open") return request;
    const patience = Math.max(0, request.patience - delta);
    if (patience > 0) return { ...request, patience };
    const next = { ...request, patience: 0, status: "expired" };
    expired.push(next);
    return next;
  });
  return { requests, expired };
}
