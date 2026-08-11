export const RENDER_DOMAIN_CONTRACT_SCHEMA = "nexusengine.render-domain-contract/1";

const CAPABILITIES = Object.freeze([
  "render:event-schema",
  "render:frame-schema",
  "render:pass-schema",
  "render:provider-contract",
  "render:resource-schema",
  "render:shader-schema"
]);

export function createRenderDomainContract() {
  return {
    schema: RENDER_DOMAIN_CONTRACT_SCHEMA,
    domainPath: "n:render",
    contractsPath: "n:render:contracts",
    runtimeDependency: "n:runtime",
    descriptorOwner: "n:presentation",
    hostCapabilityOwner: "n:host",
    capabilities: [...CAPABILITIES],
    executionOwnership: "provider",
    backendHandlesPortable: false,
    portableRecordsRequired: true,
    replayStableReceiptsRequired: true
  };
}

export function listRenderContractCapabilities() {
  return [...CAPABILITIES];
}
