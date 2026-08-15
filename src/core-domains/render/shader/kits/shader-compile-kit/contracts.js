import {
  RENDER_SHADER_COMPILE_RECORD_SCHEMA,
  RENDER_SHADER_COMPILE_REQUEST_SCHEMA,
  RENDER_SHADER_COMPILE_RECEIPT_SCHEMA,
  normalizeShaderCompileReceipt,
  normalizeShaderCompileRecord,
  normalizeShaderCompileRequest,
  normalizeShaderOperation,
  normalizeShaderRegistrySnapshot,
  normalizeShaderTextList,
  requireShaderText,
  shaderRegistryContract
} from "../../shader-contracts.js";

export { normalizeShaderCompileReceipt, normalizeShaderCompileRecord, normalizeShaderCompileRequest };

export const shaderCompileContract = () => shaderRegistryContract({
  schema: RENDER_SHADER_COMPILE_RECORD_SCHEMA,
  record: "exact-once logical Shader compile",
  providerOwned: ["compiler execution", "binary artifact", "backend program"]
});

export function normalizeShaderCompileRequestCommand(input) {
  const value = normalizeShaderOperation(input, ["request"], "Render Shader compile request command");
  return { operationId: value.operationId, request: normalizeShaderCompileRequest(value.request) };
}

export function normalizeShaderCompileCompletionCommand(input) {
  const value = normalizeShaderOperation(input, ["compileId", "providerReceipt"], "Render Shader compile completion command");
  return {
    operationId: value.operationId,
    compileId: requireShaderText(value.compileId, "Render Shader compile completion command.compileId"),
    providerReceipt: normalizeShaderCompileReceipt(value.providerReceipt)
  };
}

export function normalizeShaderCompileFailureCommand(input) {
  const value = normalizeShaderOperation(input, ["compileId", "errorIds"], "Render Shader compile failure command");
  return {
    operationId: value.operationId,
    compileId: requireShaderText(value.compileId, "Render Shader compile failure command.compileId"),
    errorIds: normalizeShaderTextList(value.errorIds, "Render Shader compile failure command.errorIds", { minimum: 1 })
  };
}

export function normalizeShaderCompileSnapshot(snapshot) {
  return normalizeShaderRegistrySnapshot(snapshot, {
    domain: "render-shader-compile",
    collection: "compiles",
    order: "compileOrder",
    revision: "compileRevision",
    normalizeRecord: normalizeShaderCompileRecord,
    idField: "request.compileId",
    label: "Render Shader compile snapshot"
  });
}

export const renderShaderCompileSchemas = Object.freeze({
  request: RENDER_SHADER_COMPILE_REQUEST_SCHEMA,
  receipt: RENDER_SHADER_COMPILE_RECEIPT_SCHEMA,
  record: RENDER_SHADER_COMPILE_RECORD_SCHEMA
});
