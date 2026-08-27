import { createDomainKit } from "../../../../domain-kit.js";
import { assertPortableMessage, validateTransportProvider } from "../../contracts.js";

export function createNetworkTransportContractKit(config = {}) {
  return createDomainKit({ ...config, manifestId: "network-transport-contract-kit", id: config.id ?? "network-transport-contract-kit", domain: "network-transport", domainPath: "n:network:transport", parentDomainPath: "n:network", apiName: "networkTransport", requires: ["n:network"], provides: ["n:network:transport", "network:transport-provider-contract"], purpose: "Provider-neutral transport validation and portable channel messages.", owns: ["transport provider contract", "portable messages"], doesNotOwn: ["provider implementation", "vendor SDK"], createApi() { return { validateProvider: validateTransportProvider, assertPortableMessage }; } });
}
