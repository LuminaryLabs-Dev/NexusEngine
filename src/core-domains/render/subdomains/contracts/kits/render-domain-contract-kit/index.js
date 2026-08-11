import { createDomainKit } from "../../../../../domain-kit.js";
import { createRenderDomainContract, listRenderContractCapabilities } from "./contracts.js";

export { RENDER_DOMAIN_CONTRACT_SCHEMA, createRenderDomainContract, listRenderContractCapabilities } from "./contracts.js";

export function createRenderDomainContractKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-domain-contract-kit",
    id: config.id ?? "render-domain-contract-kit",
    domain: "render-contract",
    domainPath: "n:render",
    parentDomainPath: null,
    apiName: config.apiName ?? "render",
    requires: ["n:runtime"],
    provides: ["n:render", "n:render:contracts", "render:domain-contract"],
    purpose: "Expose the canonical backend-neutral Render ownership and execution-contract boundary.",
    owns: ["Render domain identity", "Render execution capability contract", "provider execution boundary"],
    doesNotOwn: ["Presentation descriptors", "host surfaces", "GPU resources", "shader compilation", "concrete frame execution"],
    initialState: { contractRevision: 1 },
    services: ["domain-contract"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: createRenderDomainContract,
        listCapabilities: listRenderContractCapabilities,
        supportsCapability(token) {
          return listRenderContractCapabilities().includes(String(token));
        }
      };
    },
    metadata: { presentationNeutral: true, providerNeutral: true }
  });
}

export default createRenderDomainContractKit;
