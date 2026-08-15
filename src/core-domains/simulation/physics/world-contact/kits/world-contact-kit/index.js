import { createDomainKit } from "../../../../../domain-kit.js";
import { createWorldContactServices } from "./services.js";
import { createWorldContactState, normalizeWorldContactConfig } from "./contracts.js";

export { createWorldContactState, normalizeWorldContactConfig, resolveWorldContact } from "./contracts.js";

export function createWorldContactKit(config = {}) {
  const normalized = normalizeWorldContactConfig(config);
  return createDomainKit({
    ...config,
    manifestId: "world-contact-kit",
    id: config.id ?? "world-contact-kit",
    domain: "world-contact",
    domainPath: "n:simulation:physics:world-contact",
    parentDomainPath: "n:simulation:physics",
    apiName: "worldContact",
    requires: ["n:simulation:physics"],
    provides: ["n:simulation:physics:world-contact", "physics:world-contact"],
    config: normalized,
    initialState: createWorldContactState(normalized),
    eventNames: ["configured", "updated", "reset", "snapshotLoaded", "contactstarted", "contactended", "impact", "recoveryrequired"],
    createApi({ baseApi }) { return createWorldContactServices(baseApi, normalized); },
    metadata: { providerNeutral: true, rendererAgnostic: true, historicalSource: "src/world-physics-kit.js@a9adca5" }
  });
}

export default createWorldContactKit;
