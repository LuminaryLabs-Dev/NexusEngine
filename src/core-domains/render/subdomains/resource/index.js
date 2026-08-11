export { createRenderResourceContractKit } from "./kits/render-resource-contract-kit/index.js";
export { createResourceIdentityKit } from "./kits/resource-identity-kit/index.js";
export { createResourceStateKit } from "./kits/resource-state-kit/index.js";
export { createResourceReferenceKit } from "./kits/resource-reference-kit/index.js";
export { createResourceIntegrityKit } from "./kits/resource-integrity-kit/index.js";
export { createResourceCacheKit } from "./kits/resource-cache-kit/index.js";
export { createResourceBudgetKit } from "./kits/resource-budget-kit/index.js";
export { createResourceUploadKit } from "./kits/resource-upload-kit/index.js";
export { createResourceReleaseKit } from "./kits/resource-release-kit/index.js";
export { createResourceLifecycleKit } from "./kits/resource-lifecycle-kit/index.js";
export { RENDER_RESOURCE_KIT_MANIFESTS } from "./resource-manifests.js";
export { default as renderResourceSubdomainManifest } from "./subdomain.manifest.js";

import { createRenderResourceContractKit } from "./kits/render-resource-contract-kit/index.js";
import { createResourceIdentityKit } from "./kits/resource-identity-kit/index.js";
import { createResourceStateKit } from "./kits/resource-state-kit/index.js";
import { createResourceReferenceKit } from "./kits/resource-reference-kit/index.js";
import { createResourceIntegrityKit } from "./kits/resource-integrity-kit/index.js";
import { createResourceCacheKit } from "./kits/resource-cache-kit/index.js";
import { createResourceBudgetKit } from "./kits/resource-budget-kit/index.js";
import { createResourceUploadKit } from "./kits/resource-upload-kit/index.js";
import { createResourceReleaseKit } from "./kits/resource-release-kit/index.js";
import { createResourceLifecycleKit } from "./kits/resource-lifecycle-kit/index.js";

export function createRenderResourceDomain(config = {}) {
  return [
    createRenderResourceContractKit(config.contract ?? {}),
    createResourceIdentityKit(config.identity ?? {}),
    createResourceStateKit(config.state ?? {}),
    createResourceReferenceKit(config.reference ?? {}),
    createResourceIntegrityKit(config.integrity ?? {}),
    createResourceCacheKit(config.cache ?? {}),
    createResourceBudgetKit(config.budget ?? {}),
    createResourceUploadKit(config.upload ?? {}),
    createResourceReleaseKit(config.release ?? {}),
    createResourceLifecycleKit(config.lifecycle ?? {})
  ];
}

export default createRenderResourceDomain;
