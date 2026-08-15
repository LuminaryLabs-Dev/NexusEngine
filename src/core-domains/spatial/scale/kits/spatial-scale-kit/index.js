import { defineEvent } from "../../../../../ecs.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { createSpatialScaleServices } from "./services.js";
import { createSpatialScaleState } from "./state.js";

export { normalizeSpatialScale, queryEnteredScaleAnchor, queryNearestScaleAnchor } from "./contracts.js";

export const SpatialScaleBandChanged = defineEvent("spatial.scaleBandChanged");
export const SpatialScaleAnchorEntered = defineEvent("spatial.scaleAnchorEntered");

export function createSpatialScaleKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "spatial-scale-kit",
    id: config.id ?? "spatial-scale-kit",
    domain: "spatial-scale",
    domainPath: "n:spatial:scale",
    parentDomainPath: "n:spatial",
    apiName: "spatialScale",
    requires: ["n:spatial"],
    provides: ["n:spatial:scale", "spatial:scale-anchor", "spatial:scale-band"],
    config,
    initialState: createSpatialScaleState(config),
    eventNames: ["configured", "updated", "reset", "snapshotLoaded", "scaleBandChanged", "scaleAnchorEntered"],
    events: { SpatialScaleBandChanged, SpatialScaleAnchorEntered },
    createApi({ baseApi }) {
      return createSpatialScaleServices(baseApi);
    },
    metadata: { rendererAgnostic: true, deterministic: true, historicalSource: "src/spatial-scale-kit.js@a9adca5" }
  });
}

export default createSpatialScaleKit;
