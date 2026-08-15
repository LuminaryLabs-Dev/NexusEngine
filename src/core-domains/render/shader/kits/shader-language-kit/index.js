import { createShaderRegistryKit } from "../../shader-registry-kit.js";
import { normalizeShaderLanguage, normalizeShaderLanguageCommand, normalizeShaderLanguageSnapshot, shaderLanguageContract } from "./contracts.js";

export function createShaderLanguageKit(config = {}) {
  return createShaderRegistryKit({
    kitConfig: config,
    manifestId: "shader-language-kit",
    id: "shader-language-kit",
    domain: "render-shader-language",
    apiName: "renderShaderLanguages",
    requires: ["n:render:shader", "render:shader-contract"],
    provides: ["render:shader-language"],
    purpose: "Render Shader Language",
    owns: ["portable shader language capabilities", "supported source kinds and stages", "language feature requirements"],
    doesNotOwn: ["language parsing", "compiler binaries", "provider feature claims"],
    collection: "languages",
    order: "languageOrder",
    revision: "languageRevision",
    recordField: "language",
    idField: "languageId",
    normalizeRecord: normalizeShaderLanguage,
    normalizeCommand: normalizeShaderLanguageCommand,
    normalizeSnapshot: normalizeShaderLanguageSnapshot,
    contract: shaderLanguageContract
  });
}

export default createShaderLanguageKit;
