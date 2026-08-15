import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function normalizeFulfillmentRequest(request = {}, index = 0) {
  const id = String(request.id ?? `request-${index + 1}`);
  const deadlineSeconds = finite(request.deadlineSeconds ?? request.deadline, `${id}.deadlineSeconds`, 0);
  const reward = finite(request.reward, `${id}.reward`, 1);
  if (deadlineSeconds < 0 || reward < 0) throw new RangeError(`Request ${id} deadline and reward cannot be negative.`);
  return { id, kind: String(request.kind ?? "request"), x: finite(request.x ?? request.destination?.x, `${id}.x`, 0), y: finite(request.y ?? request.destination?.y, `${id}.y`, 0), radius: Math.max(0, finite(request.radius, `${id}.radius`, 24)), reward, deadlineSeconds, elapsedSeconds: Math.max(0, finite(request.elapsedSeconds, `${id}.elapsedSeconds`, 0)), status: String(request.status ?? "open"), metadata: cloneSerializableState(request.metadata ?? {}) };
}

export function normalizeRequestFulfillmentConfig(config = {}) {
  const source = config.requestFulfillmentDataset ?? config;
  const requests = (source.requests ?? []).map(normalizeFulfillmentRequest);
  if (new Set(requests.map((request) => request.id)).size !== requests.length) throw new TypeError("Request Fulfillment contains duplicate IDs.");
  return { id: String(source.id ?? "request-fulfillment"), requests };
}

export function createRequestFulfillmentState(config = {}) {
  const normalized = normalizeRequestFulfillmentConfig(config);
  return { fulfillmentId: normalized.id, elapsedSeconds: 0, completedCount: normalized.requests.filter((request) => request.status === "completed").length, expiredCount: normalized.requests.filter((request) => request.status === "expired").length, rewardTotal: 0, requests: normalized.requests, lastEvent: null };
}

export function queryNearestOpenRequest(state = {}, point = {}, radius = Number.MAX_SAFE_INTEGER) {
  const x = finite(point.x, "point.x", 0);
  const y = finite(point.y, "point.y", 0);
  const limit = finite(radius, "radius", Number.MAX_SAFE_INTEGER);
  if (limit < 0) throw new RangeError("Request query radius cannot be negative.");
  const found = state.requests.filter((request) => request.status === "open").map((request) => ({ request, distance: Math.hypot(request.x - x, request.y - y) })).filter((entry) => entry.distance <= limit).sort((left, right) => left.distance - right.distance || left.request.id.localeCompare(right.request.id))[0] ?? null;
  return found ? cloneSerializableState(found) : null;
}
