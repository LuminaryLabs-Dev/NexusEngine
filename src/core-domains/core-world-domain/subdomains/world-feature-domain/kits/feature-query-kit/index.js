import { boundsIntersect } from "../../contracts.js";

export function queryWorldFeatures(features = [], query = {}) {
  const type = query.type == null ? null : String(query.type);
  const bounds = query.bounds ?? null;
  return features
    .filter((feature) => feature.lifecycle !== "released")
    .filter((feature) => !type || feature.type === type)
    .filter((feature) => !bounds || boundsIntersect(feature.bounds, bounds))
    .sort((left, right) => Number(left.priority) - Number(right.priority) || left.id.localeCompare(right.id));
}
