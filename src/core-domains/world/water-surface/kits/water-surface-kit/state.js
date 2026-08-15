import { normalizeWaterSurface } from "./contracts.js";

export function createWaterSurfaceState(config = {}) {
  return normalizeWaterSurface(config);
}
