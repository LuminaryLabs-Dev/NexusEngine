import { createDomainKit } from "../../../../../domain-kit.js";
import { getPhysicsProviderContract, inspectPhysicsProvider, validatePhysicsProvider } from "./contracts.js";

export {
  PHYSICS_PROVIDER_CONTRACT_SCHEMA,
  PHYSICS_PROVIDER_OPTIONAL_METHODS,
  PHYSICS_PROVIDER_REQUIRED_METHODS,
  getPhysicsProviderContract,
  inspectPhysicsProvider,
  inspectPhysicsProviderContract,
  validatePhysicsProvider
} from "./contracts.js";

export function createPhysicsProviderContractKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-provider-contract-kit",
    id: config.id ?? "physics-provider-contract-kit",
    domain: "physics-provider-contract",
    domainPath: "n:physics:contracts",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsProviderContract",
    requires: ["n:physics"],
    provides: ["physics:provider-contract"],
    purpose: "Describe and validate backend Physics providers without owning a concrete solver.",
    owns: ["provider method contract", "provider capability inspection", "provider validation"],
    doesNotOwn: ["provider installation", "physics solver implementation", "renderer integration"],
    initialState: { contractRevision: 1 },
    services: ["provider-contract"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: getPhysicsProviderContract,
        inspectProvider: inspectPhysicsProvider,
        validateProvider: validatePhysicsProvider
      };
    },
    metadata: { rendererAgnostic: true, providerNeutral: true }
  });
}

export default createPhysicsProviderContractKit;
