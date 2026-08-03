import { normalizeRouteField } from "./contracts.js";

export function createRouteFieldState(config = {}) {
  return normalizeRouteField(config);
}
