import { createDomainKit } from "../../../../domain-kit.js";
import { createPhysicsDomainContract, listPhysicsContractCapabilities } from "./contracts.js";

export { PHYSICS_DOMAIN_CONTRACT_SCHEMA, createPhysicsDomainContract, listPhysicsContractCapabilities } from "./contracts.js";

export function createPhysicsDomainContractKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-domain-contract-kit",
    id: config.id ?? "physics-domain-contract-kit",
    domain: "physics-contract",
    domainPath: "n:physics",
    parentDomainPath: null,
    apiName: config.apiName ?? "physics",
    requires: ["n:runtime"],
    provides: ["n:physics", "n:physics:contracts", "physics:domain-contract"],
    purpose: "Expose the canonical backend-neutral Physics ownership and contract boundary.",
    owns: ["Physics domain identity", "Physics capability contract", "provider execution boundary"],
    doesNotOwn: ["physics body state", "collision detection", "constraint solving", "concrete backend execution"],
    initialState: { contractRevision: 1 },
    services: ["domain-contract"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: createPhysicsDomainContract,
        listCapabilities: listPhysicsContractCapabilities,
        supportsCapability(token) {
          return listPhysicsContractCapabilities().includes(String(token));
        }
      };
    },
    metadata: { rendererAgnostic: true, providerNeutral: true }
  });
}

export default createPhysicsDomainContractKit;
