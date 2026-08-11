import { RENDER_SHADER_MODULE_SCHEMA, normalizeShaderModule, normalizeShaderRegistrationCommand, normalizeShaderRegistrySnapshot, shaderRegistryContract } from "../../shader-contracts.js";

export { normalizeShaderModule };
export const shaderModuleContract = () => shaderRegistryContract({ schema: RENDER_SHADER_MODULE_SCHEMA, record: "single-stage shader module" });
export const normalizeShaderModuleCommand = (input) => normalizeShaderRegistrationCommand(input, "module", normalizeShaderModule, "Render Shader module registration command");
export const normalizeShaderModuleSnapshot = (snapshot) => normalizeShaderRegistrySnapshot(snapshot, { domain: "render-shader-module", collection: "modules", order: "moduleOrder", revision: "moduleRevision", normalizeRecord: normalizeShaderModule, idField: "moduleId", label: "Render Shader module snapshot" });
