import { WORLD_FEATURE_LIFECYCLE_STATES } from "../../contracts.js";

export function normalizeFeatureLifecycle(value) {
  const state = String(value ?? "registered");
  if (!WORLD_FEATURE_LIFECYCLE_STATES.includes(state)) throw new TypeError(`Unsupported world feature lifecycle: ${state}.`);
  return state;
}
