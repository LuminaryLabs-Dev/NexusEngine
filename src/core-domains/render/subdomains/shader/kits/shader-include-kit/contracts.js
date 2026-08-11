import { RENDER_SHADER_INCLUDE_SCHEMA, normalizeShaderInclude, normalizeShaderRegistrationCommand, normalizeShaderRegistrySnapshot, shaderRegistryContract } from "../../shader-contracts.js";

export { normalizeShaderInclude };
export const shaderIncludeContract = () => shaderRegistryContract({ schema: RENDER_SHADER_INCLUDE_SCHEMA, record: "immutable shader include dependency" });
export const normalizeShaderIncludeCommand = (input) => normalizeShaderRegistrationCommand(input, "include", normalizeShaderInclude, "Render Shader include registration command");
export const normalizeShaderIncludeSnapshot = (snapshot) => normalizeShaderRegistrySnapshot(snapshot, { domain: "render-shader-include", collection: "includes", order: "includeOrder", revision: "includeRevision", normalizeRecord: normalizeShaderInclude, idField: "includeKey", label: "Render Shader include snapshot" });
