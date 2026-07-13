import { clonePortableValue } from "../../portable.js";

export function createWorldFeatureSnapshot(state = {}) {
  return Object.freeze({
    schema: "nexusengine.world-feature-snapshot/1",
    state: clonePortableValue(state, "world-feature-snapshot")
  });
}
