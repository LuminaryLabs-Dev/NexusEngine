export const PHYSICS_DOMAIN_CONTRACT_SCHEMA = "nexusengine.physics-domain-contract/1";

const CAPABILITIES = Object.freeze([
  "physics:command-schema",
  "physics:event-schema",
  "physics:provider-contract",
  "physics:query-schema",
  "physics:state-schema"
]);

export function createPhysicsDomainContract() {
  return {
    schema: PHYSICS_DOMAIN_CONTRACT_SCHEMA,
    domainPath: "n:physics",
    contractsPath: "n:physics:contracts",
    runtimeDependency: "n:runtime",
    capabilities: [...CAPABILITIES],
    executionOwnership: "provider",
    portableStateRequired: true,
    deterministicReplayRequired: true
  };
}

export function listPhysicsContractCapabilities() {
  return [...CAPABILITIES];
}
