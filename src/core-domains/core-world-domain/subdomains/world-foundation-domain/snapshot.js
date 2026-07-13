import { clonePortableValue } from "../../portable.js";

export function createWorldFoundationSnapshot(state = {}) {
  return Object.freeze({
    schema: "nexusengine.world-foundation-snapshot/1",
    state: clonePortableValue(state, "world-foundation-snapshot")
  });
}
