export { renderDomainManifest } from "./domain.manifest.js";
export * from "./subdomains/contracts/index.js";
export * from "./subdomains/lifecycle/index.js";
export * from "./subdomains/device/index.js";
export * from "./subdomains/surface/index.js";
export * from "./subdomains/resource/index.js";
export * from "./subdomains/buffer/index.js";
export * from "./subdomains/texture/index.js";
export * from "./subdomains/shader/index.js";
export * from "./subdomains/material/index.js";
export * from "./subdomains/camera/index.js";

import { createRenderDomainContractKit } from "./subdomains/contracts/kits/render-domain-contract-kit/index.js";

export function createRenderDomain(config = {}) {
  return [createRenderDomainContractKit(config)];
}

export default createRenderDomain;
