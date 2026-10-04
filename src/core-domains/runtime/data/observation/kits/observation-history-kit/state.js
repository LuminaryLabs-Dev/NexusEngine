import { observationBytes, observationDigest, validateObservation, validateRetention, OBSERVATION_HISTORY_SCHEMA } from "../../contracts.js";

export function createHistoryState(retention = { maxFrames: 600, maxBytes: 64 * 1024 * 1024 }) {
  return { schema: OBSERVATION_HISTORY_SCHEMA, ...validateRetention(retention), records: [], bytes: 0 };
}
export function retain(state) {
  const next = { ...state, records: state.records.slice(), bytes: state.records.reduce((sum, entry) => sum + observationBytes(entry), 0) };
  while (next.records.length > next.maxFrames || next.bytes > next.maxBytes) next.bytes -= observationBytes(next.records.shift());
  return next;
}
export function append(state, value) {
  const record = validateObservation(value);
  const key = entry => `${entry.sessionId}:${entry.epoch}:${entry.sourceFrame}`;
  const existing = state.records.find(entry => key(entry) === key(record));
  if (existing) {
    if (observationDigest(existing) !== observationDigest(record)) throw new Error("Conflicting observation identity.");
    return state;
  }
  const previous = state.records.findLast(entry => entry.sessionId === record.sessionId);
  if (previous && (record.epoch < previous.epoch || (record.epoch === previous.epoch && record.sourceFrame <= previous.sourceFrame))) throw new Error("Stale observation.");
  if (observationBytes(record) > state.maxBytes) throw new RangeError("Observation exceeds history byte budget.");
  return retain({ ...state, records: [...state.records, record] });
}
export function loadHistory(value) {
  if (value?.schema !== OBSERVATION_HISTORY_SCHEMA || !Array.isArray(value.records)) throw new TypeError("Unsupported history snapshot.");
  let state = createHistoryState(value);
  for (const record of value.records) state = append(state, record);
  if (state.records.length !== value.records.length || state.bytes !== value.bytes) throw new Error("Invalid history snapshot retention or byte accounting.");
  return state;
}
