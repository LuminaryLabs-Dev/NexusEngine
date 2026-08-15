import { normalizeSpatialScale } from "./contracts.js";

export function createSpatialScaleState(config = {}) {
  return normalizeSpatialScale(config);
}
