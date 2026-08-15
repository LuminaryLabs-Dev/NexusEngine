import { normalizeLandmarkGuidance } from "./contracts.js";

export function createLandmarkGuidanceState(config = {}) {
  return normalizeLandmarkGuidance(config);
}
