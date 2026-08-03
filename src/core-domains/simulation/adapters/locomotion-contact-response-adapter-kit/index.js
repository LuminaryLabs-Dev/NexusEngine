import { createDomainKit } from "../../../domain-kit.js";
import { createLocomotionContactResponse } from "./contracts.js";
import { createLocomotionContactResponseServices } from "./services.js";
import { createLocomotionContactResponseState } from "./state.js";

export { createLocomotionContactResponse } from "./contracts.js";

export function createLocomotionContactResponseAdapterKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "locomotion-contact-response-adapter-kit",
    id: config.id ?? "locomotion-contact-response-adapter-kit",
    domain: "locomotion-contact-response",
    domainPath: "n:simulation:motion:locomotion",
    parentDomainPath: "n:simulation:motion",
    apiName: "locomotionContactResponse",
    requires: ["motion:locomotion-intent", "physics:world-contact"],
    provides: ["motion:contact-response"],
    initialState: createLocomotionContactResponseState(),
    createApi: createLocomotionContactResponseServices,
    metadata: { adapter: true, ownsSourceState: false, rendererAgnostic: true }
  });
}

export default createLocomotionContactResponseAdapterKit;
