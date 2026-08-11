import { createDomainKit } from "../../../../../domain-kit.js";
import {
  assertResourceTransition,
  canResourceTransition,
  normalizeResourceStateContractSnapshot,
  normalizeResourceStateRecord,
  resourceStateContract
} from "./contracts.js";

export function createResourceStateKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "resource-state-kit",
    id: config.id ?? "resource-state-kit",
    domain: "render-resource-state",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceState",
    requires: ["n:render:resource"],
    provides: ["render:resource-state"],
    purpose: "Define portable Render resource phases and legal lifecycle transitions.",
    owns: ["resource phase vocabulary", "resource transition graph", "resource state normalization"],
    doesNotOwn: ["resource state registry", "provider execution", "GPU handles", "resource repair"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: resourceStateContract,
        normalize: normalizeResourceStateRecord,
        canTransition: canResourceTransition,
        assertTransition: assertResourceTransition,
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeResourceStateContractSnapshot(snapshot));
        }
      };
    }
  });
}

export default createResourceStateKit;
