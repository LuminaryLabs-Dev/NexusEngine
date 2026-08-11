import { RENDER_SHADER_LANGUAGE_SCHEMA, normalizeShaderLanguage, normalizeShaderRegistrationCommand, normalizeShaderRegistrySnapshot, shaderRegistryContract } from "../../shader-contracts.js";

export { normalizeShaderLanguage };
export const shaderLanguageContract = () => shaderRegistryContract({ schema: RENDER_SHADER_LANGUAGE_SCHEMA, record: "portable shader language capability" });
export const normalizeShaderLanguageCommand = (input) => normalizeShaderRegistrationCommand(input, "language", normalizeShaderLanguage, "Render Shader language registration command");
export const normalizeShaderLanguageSnapshot = (snapshot) => normalizeShaderRegistrySnapshot(snapshot, { domain: "render-shader-language", collection: "languages", order: "languageOrder", revision: "languageRevision", normalizeRecord: normalizeShaderLanguage, idField: "languageId", label: "Render Shader language snapshot" });
