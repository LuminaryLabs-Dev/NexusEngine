import { cloneSerializableState } from "../../../../foundation/serializable-state.js";
import { sha256Integrity } from "../../../../foundation/sha256.js";

export const OBSERVATION_HISTORY_SCHEMA = "nexusengine.observation-history/1";
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
}
export function observationDigest(value) { return sha256Integrity(JSON.stringify(canonical(value))); }
export function observationBytes(value) { return new TextEncoder().encode(JSON.stringify(value)).byteLength; }
export function validateRetention(value) {
  for (const key of ["maxFrames", "maxBytes"]) {
    if (!Number.isSafeInteger(value[key]) || value[key] < 1) throw new TypeError(`Invalid ${key}.`);
  }
  return { maxFrames: value.maxFrames, maxBytes: value.maxBytes };
}
export function validateObservation(value) {
  const record = cloneSerializableState(value);
  if (!record || typeof record !== "object" || Array.isArray(record)) throw new TypeError("Observation must be an object.");
  if (typeof record.sessionId !== "string" || !record.sessionId.trim()) throw new TypeError("Observation requires sessionId.");
  for (const key of ["epoch", "sourceFrame"]) {
    if (!Number.isSafeInteger(record[key]) || record[key] < 0) throw new TypeError(`Invalid observation ${key}.`);
  }
  if (record.committed !== true) throw new TypeError("History accepts committed observations only.");
  return record;
}
