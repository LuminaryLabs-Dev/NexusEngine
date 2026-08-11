export { createRenderDomainContractKit } from "./kits/render-domain-contract-kit/index.js";
export { createRenderProviderContractKit } from "./kits/render-provider-contract-kit/index.js";
export { createRenderResourceSchemaKit } from "./kits/render-resource-schema-kit/index.js";
export { createRenderFrameSchemaKit } from "./kits/render-frame-schema-kit/index.js";
export { createRenderPassSchemaKit } from "./kits/render-pass-schema-kit/index.js";
export { createShaderSchemaKit } from "./kits/shader-schema-kit/index.js";
export { createRenderEventSchemaKit } from "./kits/render-event-schema-kit/index.js";
export { RENDER_CONTRACT_KIT_MANIFESTS } from "./contract-manifests.js";
export { default as renderContractsSubdomainManifest } from "./subdomain.manifest.js";

import { createRenderDomainContractKit } from "./kits/render-domain-contract-kit/index.js";
import { createRenderProviderContractKit } from "./kits/render-provider-contract-kit/index.js";
import { createRenderResourceSchemaKit } from "./kits/render-resource-schema-kit/index.js";
import { createRenderFrameSchemaKit } from "./kits/render-frame-schema-kit/index.js";
import { createRenderPassSchemaKit } from "./kits/render-pass-schema-kit/index.js";
import { createShaderSchemaKit } from "./kits/shader-schema-kit/index.js";
import { createRenderEventSchemaKit } from "./kits/render-event-schema-kit/index.js";

export function createRenderContractsDomain(config = {}) {
  return [
    createRenderDomainContractKit(config.domain ?? {}),
    createRenderProviderContractKit(config.provider ?? {}),
    createRenderResourceSchemaKit(config.resource ?? {}),
    createRenderFrameSchemaKit(config.frame ?? {}),
    createRenderPassSchemaKit(config.pass ?? {}),
    createShaderSchemaKit(config.shader ?? {}),
    createRenderEventSchemaKit(config.event ?? {})
  ];
}

export default createRenderContractsDomain;
