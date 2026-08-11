import { createShaderRegistryKit } from "../../shader-registry-kit.js";
import { normalizeShaderError, normalizeShaderErrorCommand, normalizeShaderErrorSnapshot, shaderErrorContract } from "./contracts.js";

export function createShaderErrorKit(config = {}) {
  return createShaderRegistryKit({
    kitConfig: config,
    manifestId: "shader-error-kit",
    id: "shader-error-kit",
    domain: "render-shader-error",
    apiName: "renderShaderErrors",
    requires: ["n:render:shader"],
    provides: ["render:shader-error"],
    purpose: "Render Shader Error",
    owns: ["portable Shader diagnostics", "source and stage locations", "normalized error severity and phase"],
    doesNotOwn: ["compiler execution", "provider logs", "source repair", "retry policy"],
    collection: "errors",
    order: "errorOrder",
    revision: "errorRevision",
    recordField: "error",
    idField: "errorId",
    normalizeRecord: normalizeShaderError,
    normalizeCommand: normalizeShaderErrorCommand,
    normalizeSnapshot: normalizeShaderErrorSnapshot,
    contract: shaderErrorContract
  });
}

export default createShaderErrorKit;
