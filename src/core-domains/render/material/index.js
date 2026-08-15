export { createMaterialContractKit } from "./kits/material-contract-kit/index.js";
export { createMaterialBindingKit } from "./kits/material-binding-kit/index.js";
export { createMaterialParameterKit } from "./kits/material-parameter-kit/index.js";
export { createTextureBindingKit } from "./kits/texture-binding-kit/index.js";
export { createSamplerBindingKit } from "./kits/sampler-binding-kit/index.js";
export { createMaterialInstanceKit } from "./kits/material-instance-kit/index.js";
export { createMaterialVariantKit } from "./kits/material-variant-kit/index.js";
export { createMaterialValidationKit } from "./kits/material-validation-kit/index.js";
export { createMaterialCacheKit } from "./kits/material-cache-kit/index.js";
export { RENDER_MATERIAL_KIT_MANIFESTS } from "./material-manifests.js";
export { default as renderMaterialSubdomainManifest } from "./subdomain.manifest.js";

import { createMaterialContractKit } from "./kits/material-contract-kit/index.js";
import { createMaterialBindingKit } from "./kits/material-binding-kit/index.js";
import { createMaterialParameterKit } from "./kits/material-parameter-kit/index.js";
import { createTextureBindingKit } from "./kits/texture-binding-kit/index.js";
import { createSamplerBindingKit } from "./kits/sampler-binding-kit/index.js";
import { createMaterialInstanceKit } from "./kits/material-instance-kit/index.js";
import { createMaterialVariantKit } from "./kits/material-variant-kit/index.js";
import { createMaterialValidationKit } from "./kits/material-validation-kit/index.js";
import { createMaterialCacheKit } from "./kits/material-cache-kit/index.js";

export function createRenderMaterialDomain(config = {}) {
  return [
    createMaterialContractKit(config.contract ?? {}),
    createMaterialBindingKit(config.binding ?? {}),
    createMaterialParameterKit(config.parameter ?? {}),
    createTextureBindingKit(config.textureBinding ?? {}),
    createSamplerBindingKit(config.samplerBinding ?? {}),
    createMaterialInstanceKit(config.instance ?? {}),
    createMaterialVariantKit(config.variant ?? {}),
    createMaterialValidationKit(config.validation ?? {}),
    createMaterialCacheKit(config.cache ?? {})
  ];
}

export default createRenderMaterialDomain;
