import { clone, unique } from "./utils.js";

export function ledgerWith(ledger = {}, key, value, limit = 512) {
  const entries = Object.entries(ledger ?? {}).filter(([entryKey]) => entryKey !== key);
  entries.push([key, value]);
  const max = Number(limit);
  return Object.fromEntries(Number.isFinite(max) && max > 0 ? entries.slice(-max) : entries);
}

export function ledgerValues(ledger = {}) {
  return Object.values(ledger).map(clone);
}

export function addVisitedScene(visited = [], sceneId) {
  return unique([...visited, sceneId]);
}
