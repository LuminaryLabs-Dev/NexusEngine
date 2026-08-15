export { createPhysicsDomainContractKit } from "./kits/physics-domain-contract-kit/index.js";
export { createPhysicsProviderContractKit } from "./kits/physics-provider-contract-kit/index.js";
export { createPhysicsStateSchemaKit } from "./kits/physics-state-schema-kit/index.js";
export { createPhysicsCommandSchemaKit } from "./kits/physics-command-schema-kit/index.js";
export { createPhysicsEventSchemaKit } from "./kits/physics-event-schema-kit/index.js";
export { createPhysicsQuerySchemaKit } from "./kits/physics-query-schema-kit/index.js";
export { PHYSICS_CONTRACT_KIT_MANIFESTS } from "./contract-manifests.js";
export { default as physicsContractsSubdomainManifest } from "./subdomain.manifest.js";

import { createPhysicsDomainContractKit } from "./kits/physics-domain-contract-kit/index.js";
import { createPhysicsProviderContractKit } from "./kits/physics-provider-contract-kit/index.js";
import { createPhysicsStateSchemaKit } from "./kits/physics-state-schema-kit/index.js";
import { createPhysicsCommandSchemaKit } from "./kits/physics-command-schema-kit/index.js";
import { createPhysicsEventSchemaKit } from "./kits/physics-event-schema-kit/index.js";
import { createPhysicsQuerySchemaKit } from "./kits/physics-query-schema-kit/index.js";

export function createPhysicsContractsDomain(config = {}) {
  return [
    createPhysicsDomainContractKit(config.domain ?? {}),
    createPhysicsProviderContractKit(config.provider ?? {}),
    createPhysicsStateSchemaKit(config.state ?? {}),
    createPhysicsCommandSchemaKit(config.command ?? {}),
    createPhysicsEventSchemaKit(config.event ?? {}),
    createPhysicsQuerySchemaKit(config.query ?? {})
  ];
}

export default createPhysicsContractsDomain;
