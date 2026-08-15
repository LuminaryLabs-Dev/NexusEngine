export { renderDomainManifest } from "./domain.manifest.js";
export * from "./contracts/index.js";
export * from "./lifecycle/index.js";
export * from "./device/index.js";
export * from "./surface/index.js";
export * from "./resource/index.js";
export * from "./buffer/index.js";
export * from "./texture/index.js";
export * from "./shader/index.js";
export * from "./material/index.js";
export * from "./camera/index.js";

import { createRenderDomainContractKit } from "./contracts/kits/render-domain-contract-kit/index.js";

export function createRenderDomain(config = {}) {
  return [createRenderDomainContractKit(config)];
}

export default createRenderDomain;
