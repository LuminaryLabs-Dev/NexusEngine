import { RENDER_SHADER_ERROR_SCHEMA, normalizeShaderError, normalizeShaderRegistrationCommand, normalizeShaderRegistrySnapshot, shaderRegistryContract } from "../../shader-contracts.js";

export { normalizeShaderError };
export const shaderErrorContract = () => shaderRegistryContract({ schema: RENDER_SHADER_ERROR_SCHEMA, record: "portable shader diagnostic" });
export const normalizeShaderErrorCommand = (input) => normalizeShaderRegistrationCommand(input, "error", normalizeShaderError, "Render Shader error registration command");
export const normalizeShaderErrorSnapshot = (snapshot) => normalizeShaderRegistrySnapshot(snapshot, { domain: "render-shader-error", collection: "errors", order: "errorOrder", revision: "errorRevision", normalizeRecord: normalizeShaderError, idField: "errorId", label: "Render Shader error snapshot" });
