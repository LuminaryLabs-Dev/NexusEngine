import { createDomainKit } from "../../../../../../../domain-kit.js";
import { createVehicleDynamicsServices } from "./services.js";
import { createVehicleDynamicsState, normalizeVehicleDynamicsConfig } from "./contracts.js";

export { advanceVehicleDynamics, createVehicleDynamicsState, normalizeVehicleDynamicsConfig } from "./contracts.js";

export function createVehicleDynamicsKit(config = {}) {
  const normalized = normalizeVehicleDynamicsConfig(config);
  return createDomainKit({
    ...config,
    manifestId: "vehicle-dynamics-kit",
    id: config.id ?? "vehicle-dynamics-kit",
    domain: "vehicle-dynamics",
    domainPath: "n:simulation:motion:vehicle",
    parentDomainPath: "n:simulation:motion",
    apiName: "vehicleDynamics",
    requires: ["n:simulation:motion"],
    provides: ["n:simulation:motion:vehicle", "motion:vehicle-dynamics"],
    config: normalized,
    initialState: createVehicleDynamicsState(normalized),
    eventNames: ["configured", "updated", "reset", "snapshotLoaded", "impact"],
    createApi({ baseApi }) { return createVehicleDynamicsServices(baseApi); },
    metadata: { rendererAgnostic: true, surfaceIndependent: true, historicalSource: "src/vehicle-dynamics-kit.js@a9adca5" }
  });
}

export default createVehicleDynamicsKit;
