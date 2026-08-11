import { createShaderRegistryKit } from "../../shader-registry-kit.js";
import { normalizeShaderModule, normalizeShaderModuleCommand, normalizeShaderModuleSnapshot, shaderModuleContract } from "./contracts.js";

export function createShaderModuleKit(config = {}) {
  return createShaderRegistryKit({
    kitConfig: config,
    manifestId: "shader-module-kit",
    id: "shader-module-kit",
    domain: "render-shader-module",
    apiName: "renderShaderModules",
    requires: ["n:render:shader", "render:shader-language", "render:shader-source", "render:shader-include"],
    provides: ["render:shader-module"],
    purpose: "Render Shader Module",
    owns: ["single-stage module descriptors", "entry-point identity", "source and include closure references"],
    doesNotOwn: ["module compilation", "preprocessing", "provider module handles", "program linking"],
    collection: "modules",
    order: "moduleOrder",
    revision: "moduleRevision",
    recordField: "module",
    idField: "moduleId",
    normalizeRecord: normalizeShaderModule,
    normalizeCommand: normalizeShaderModuleCommand,
    normalizeSnapshot: normalizeShaderModuleSnapshot,
    contract: shaderModuleContract,
    validateRecord(module, { requiredApi }) {
      const language = requiredApi("renderShaderLanguages").get(module.languageId);
      if (!language) throw new TypeError(`Render Shader module ${module.moduleId} references unknown language ${module.languageId}.`);
      if (!language.stages.includes(module.stage)) throw new TypeError(`Render Shader language ${module.languageId} does not support stage ${module.stage}.`);
      const source = requiredApi("renderShaderSources").get(module.sourceKey);
      if (!source) throw new TypeError(`Render Shader module ${module.moduleId} references unknown source ${module.sourceKey}.`);
      if (source.languageId !== module.languageId) throw new TypeError(`Render Shader module ${module.moduleId} language does not match source ${module.sourceKey}.`);
      for (const includeKey of module.includeKeys) {
        const include = requiredApi("renderShaderIncludes").get(includeKey);
        if (!include) throw new TypeError(`Render Shader module ${module.moduleId} references unknown include ${includeKey}.`);
        if (include.languageId !== module.languageId) throw new TypeError(`Render Shader module ${module.moduleId} include ${includeKey} uses a different language.`);
      }
      return module;
    }
  });
}

export default createShaderModuleKit;
