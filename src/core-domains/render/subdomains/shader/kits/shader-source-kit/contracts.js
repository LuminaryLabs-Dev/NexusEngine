import { RENDER_SHADER_SOURCE_SCHEMA, normalizeShaderRegistrationCommand, normalizeShaderRegistrySnapshot, normalizeShaderSource, shaderRegistryContract } from "../../shader-contracts.js";

export { normalizeShaderSource };
export const shaderSourceContract = () => shaderRegistryContract({ schema: RENDER_SHADER_SOURCE_SCHEMA, record: "immutable shader source revision", providerOwned: ["binary loading", "source parsing"] });
export const normalizeShaderSourceCommand = (input) => normalizeShaderRegistrationCommand(input, "source", normalizeShaderSource, "Render Shader source registration command");
export const normalizeShaderSourceSnapshot = (snapshot) => normalizeShaderRegistrySnapshot(snapshot, { domain: "render-shader-source", collection: "sources", order: "sourceOrder", revision: "sourceRevision", normalizeRecord: normalizeShaderSource, idField: "sourceKey", label: "Render Shader source snapshot" });
