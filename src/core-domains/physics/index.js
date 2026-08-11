export { physicsDomainManifest } from "./domain.manifest.js";
export * from "./subdomains/contracts/index.js";
export * from "./subdomains/lifecycle/index.js";
export * from "./subdomains/body/index.js";
export * from "./subdomains/shape/index.js";
export * from "./subdomains/material/index.js";
export * from "./subdomains/collider/index.js";
export * from "./subdomains/detection/index.js";
export * from "./subdomains/constraints/index.js";
export * from "./subdomains/world/index.js";

import { createPhysicsDomainContractKit } from "./subdomains/contracts/kits/physics-domain-contract-kit/index.js";

export function createPhysicsDomain(config = {}) {
  return [createPhysicsDomainContractKit(config)];
}

export default createPhysicsDomain;
