export { createShaderContractKit } from "./kits/shader-contract-kit/index.js";
export { createShaderLanguageKit } from "./kits/shader-language-kit/index.js";
export { createShaderSourceKit } from "./kits/shader-source-kit/index.js";
export { createShaderIncludeKit } from "./kits/shader-include-kit/index.js";
export { createShaderModuleKit } from "./kits/shader-module-kit/index.js";
export { createShaderProgramKit } from "./kits/shader-program-kit/index.js";
export { createShaderVariantKit } from "./kits/shader-variant-kit/index.js";
export { createShaderPermutationKit } from "./kits/shader-permutation-kit/index.js";
export { createShaderErrorKit } from "./kits/shader-error-kit/index.js";
export { createShaderCompileKit } from "./kits/shader-compile-kit/index.js";
export { createShaderReflectionKit } from "./kits/shader-reflection-kit/index.js";
export { createShaderCacheKit } from "./kits/shader-cache-kit/index.js";
export { RENDER_SHADER_KIT_MANIFESTS } from "./shader-manifests.js";
export { default as renderShaderSubdomainManifest } from "./subdomain.manifest.js";

import { createShaderContractKit } from "./kits/shader-contract-kit/index.js";
import { createShaderLanguageKit } from "./kits/shader-language-kit/index.js";
import { createShaderSourceKit } from "./kits/shader-source-kit/index.js";
import { createShaderIncludeKit } from "./kits/shader-include-kit/index.js";
import { createShaderModuleKit } from "./kits/shader-module-kit/index.js";
import { createShaderProgramKit } from "./kits/shader-program-kit/index.js";
import { createShaderVariantKit } from "./kits/shader-variant-kit/index.js";
import { createShaderPermutationKit } from "./kits/shader-permutation-kit/index.js";
import { createShaderErrorKit } from "./kits/shader-error-kit/index.js";
import { createShaderCompileKit } from "./kits/shader-compile-kit/index.js";
import { createShaderReflectionKit } from "./kits/shader-reflection-kit/index.js";
import { createShaderCacheKit } from "./kits/shader-cache-kit/index.js";

export function createRenderShaderDomain(config = {}) {
  return [
    createShaderContractKit(config.contract ?? {}),
    createShaderLanguageKit(config.language ?? {}),
    createShaderSourceKit(config.source ?? {}),
    createShaderIncludeKit(config.include ?? {}),
    createShaderModuleKit(config.module ?? {}),
    createShaderProgramKit(config.program ?? {}),
    createShaderVariantKit(config.variant ?? {}),
    createShaderPermutationKit(config.permutation ?? {}),
    createShaderErrorKit(config.error ?? {}),
    createShaderCompileKit(config.compile ?? {}),
    createShaderReflectionKit(config.reflection ?? {}),
    createShaderCacheKit(config.cache ?? {})
  ];
}

export default createRenderShaderDomain;
