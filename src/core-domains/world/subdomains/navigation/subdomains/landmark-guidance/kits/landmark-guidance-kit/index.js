import { defineEvent } from "../../../../../../../../ecs.js";
import { createDomainKit } from "../../../../../../../domain-kit.js";
import { createLandmarkGuidanceServices } from "./services.js";
import { createLandmarkGuidanceState } from "./state.js";

export { normalizeLandmarkGuidance, queryNearestLandmark } from "./contracts.js";

export const LandmarkDiscovered = defineEvent("landmark.discovered");
export const LandmarkReached = defineEvent("landmark.reached");
export const LandmarkActivated = defineEvent("landmark.activated");

export function createLandmarkGuidanceKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "landmark-guidance-kit",
    id: config.id ?? "landmark-guidance-kit",
    domain: "landmark-guidance",
    domainPath: "n:world:navigation:landmark-guidance",
    parentDomainPath: "n:world:navigation",
    apiName: "landmarkGuidance",
    requires: ["n:world"],
    provides: ["n:world:navigation:landmark-guidance", "navigation:landmark-guidance"],
    config,
    initialState: createLandmarkGuidanceState(config),
    eventNames: ["configured", "updated", "reset", "snapshotLoaded", "landmarkDiscovered", "landmarkReached", "landmarkActivated"],
    events: { LandmarkDiscovered, LandmarkReached, LandmarkActivated },
    createApi({ baseApi }) {
      return createLandmarkGuidanceServices(baseApi);
    },
    metadata: { rendererAgnostic: true, historicalSource: "src/landmark-guidance-kit.js@a9adca5" }
  });
}

export default createLandmarkGuidanceKit;
