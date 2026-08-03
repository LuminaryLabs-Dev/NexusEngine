import { createLocomotionContactResponse } from "./contracts.js";

export function createLocomotionContactResponseServices() {
  return Object.freeze({ correct: createLocomotionContactResponse });
}
