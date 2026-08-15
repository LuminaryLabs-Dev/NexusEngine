import { RENDER_SHADER_REFLECTION_SCHEMA, normalizeShaderReflection, normalizeShaderRegistrationCommand, normalizeShaderRegistrySnapshot, shaderRegistryContract } from "../../shader-contracts.js";

export { normalizeShaderReflection };
export const shaderReflectionContract = () => shaderRegistryContract({ schema: RENDER_SHADER_REFLECTION_SCHEMA, record: "normalized provider reflection observation", providerOwned: ["backend reflection execution"] });
export const normalizeShaderReflectionCommand = (input) => normalizeShaderRegistrationCommand(input, "reflection", normalizeShaderReflection, "Render Shader reflection registration command");
export const normalizeShaderReflectionSnapshot = (snapshot) => normalizeShaderRegistrySnapshot(snapshot, { domain: "render-shader-reflection", collection: "reflections", order: "reflectionOrder", revision: "reflectionRevision", normalizeRecord: normalizeShaderReflection, idField: "reflectionId", label: "Render Shader reflection snapshot" });
