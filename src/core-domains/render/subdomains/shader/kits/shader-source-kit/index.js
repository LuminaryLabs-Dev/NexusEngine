import { createShaderRegistryKit } from "../../shader-registry-kit.js";
import { normalizeShaderSource, normalizeShaderSourceCommand, normalizeShaderSourceSnapshot, shaderSourceContract } from "./contracts.js";

export function createShaderSourceKit(config = {}) {
  return createShaderRegistryKit({
    kitConfig: config,
    manifestId: "shader-source-kit",
    id: "shader-source-kit",
    domain: "render-shader-source",
    apiName: "renderShaderSources",
    requires: ["n:render:shader", "render:shader-language"],
    provides: ["render:shader-source"],
    purpose: "Render Shader Source",
    owns: ["immutable source revision records", "source integrity", "text or binary source identity"],
    doesNotOwn: ["file IO", "network retrieval", "source execution", "parsing", "compilation"],
    collection: "sources",
    order: "sourceOrder",
    revision: "sourceRevision",
    recordField: "source",
    idField: "sourceKey",
    normalizeRecord: normalizeShaderSource,
    normalizeCommand: normalizeShaderSourceCommand,
    normalizeSnapshot: normalizeShaderSourceSnapshot,
    contract: shaderSourceContract,
    validateRecord(source, { requiredApi }) {
      const language = requiredApi("renderShaderLanguages").get(source.languageId);
      if (!language) throw new TypeError(`Render Shader source ${source.sourceKey} references unknown language ${source.languageId}.`);
      if (!language.sourceKinds.includes(source.sourceKind)) throw new TypeError(`Render Shader language ${source.languageId} does not support ${source.sourceKind} sources.`);
      return source;
    }
  });
}

export default createShaderSourceKit;
