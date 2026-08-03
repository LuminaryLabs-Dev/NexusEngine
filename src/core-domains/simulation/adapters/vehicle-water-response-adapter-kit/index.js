import { createDomainKit } from "../../../domain-kit.js";
import { createVehicleWaterResponse } from "./contracts.js";
import { createVehicleWaterResponseServices } from "./services.js";
import { createVehicleWaterResponseState } from "./state.js";

export { createVehicleWaterResponse } from "./contracts.js";

export function createVehicleWaterResponseAdapterKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "vehicle-water-response-adapter-kit",
    id: config.id ?? "vehicle-water-response-adapter-kit",
    domain: "vehicle-water-response",
    domainPath: "n:simulation:motion:vehicle",
    parentDomainPath: "n:simulation:motion",
    apiName: "vehicleWaterResponse",
    requires: ["motion:vehicle-dynamics", "world:water-query"],
    provides: ["motion:vehicle-water-response"],
    initialState: createVehicleWaterResponseState(),
    createApi: createVehicleWaterResponseServices,
    metadata: { adapter: true, ownsSourceState: false, rendererAgnostic: true }
  });
}

export default createVehicleWaterResponseAdapterKit;
