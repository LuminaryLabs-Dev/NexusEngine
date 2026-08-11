import { createDomainKit } from "../../../../../domain-kit.js";
import { getRenderProviderContract, inspectRenderProvider, inspectRenderProviderContract, validateRenderProvider } from "./contracts.js";

export {
  RENDER_PROVIDER_CONTRACT_SCHEMA,
  RENDER_PROVIDER_OPTIONAL_METHODS,
  RENDER_PROVIDER_REQUIRED_METHODS,
  getRenderProviderContract,
  inspectRenderProvider,
  inspectRenderProviderContract,
  validateRenderProvider
} from "./contracts.js";

export function createRenderProviderContractKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-provider-contract-kit",
    id: config.id ?? "render-provider-contract-kit",
    domain: "render-provider-contract",
    domainPath: "n:render:contracts",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderProviderContract",
    requires: ["n:render"],
    provides: ["render:provider-contract"],
    purpose: "Validate concrete Render providers without executing or retaining provider code or handles.",
    owns: ["Render provider method contract", "portable provider capability inspection"],
    doesNotOwn: ["provider selection", "provider execution", "GPU handles", "backend caches"],
    initialState: { schemaRevision: 1 },
    services: ["provider-contract"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: getRenderProviderContract,
        inspectContract: inspectRenderProviderContract,
        inspectProvider: inspectRenderProvider,
        validateProvider: validateRenderProvider
      };
    },
    metadata: { executesProvider: false, retainsProvider: false, providerNeutral: true }
  });
}

export default createRenderProviderContractKit;
