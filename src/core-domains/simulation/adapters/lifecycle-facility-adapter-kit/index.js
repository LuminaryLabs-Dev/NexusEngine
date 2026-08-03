import { createDomainKit } from "../../../domain-kit.js";
import { collectLifecycleFacilityActions } from "./contracts.js";
import { createLifecycleFacilityAdapterServices } from "./services.js";
import { createLifecycleFacilityAdapterState } from "./state.js";

export { collectLifecycleFacilityActions } from "./contracts.js";

export function createLifecycleFacilityAdapterKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "lifecycle-facility-adapter-kit",
    id: config.id ?? "lifecycle-facility-adapter-kit",
    domain: "lifecycle-facility",
    domainPath: "n:simulation:progression:lifecycle",
    parentDomainPath: "n:simulation:progression",
    apiName: "lifecycleFacility",
    requires: ["progression:lifecycle", "operations:facility"],
    provides: ["progression:lifecycle-facility-adapter"],
    initialState: createLifecycleFacilityAdapterState(),
    createApi({ baseApi, engine }) {
      if (!engine.n.facilityOperations?.add || !engine.n.facilityOperations?.setStatus) throw new TypeError("Lifecycle Facility requires the public Facility Operations API.");
      return createLifecycleFacilityAdapterServices(baseApi, engine.n.facilityOperations);
    },
    metadata: { adapter: true, ownsSourceState: false, exactOnceEffects: true }
  });
}

export default createLifecycleFacilityAdapterKit;
