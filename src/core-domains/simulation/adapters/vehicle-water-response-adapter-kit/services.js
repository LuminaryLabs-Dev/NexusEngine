import { createVehicleWaterResponse } from "./contracts.js";

export function createVehicleWaterResponseServices() {
  return Object.freeze({ respond: createVehicleWaterResponse });
}
