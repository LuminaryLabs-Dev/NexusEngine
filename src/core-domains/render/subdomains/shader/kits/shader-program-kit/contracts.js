import { RENDER_SHADER_PROGRAM_SCHEMA, normalizeShaderProgram, normalizeShaderRegistrationCommand, normalizeShaderRegistrySnapshot, shaderRegistryContract } from "../../shader-contracts.js";

export { normalizeShaderProgram };
export const shaderProgramContract = () => shaderRegistryContract({ schema: RENDER_SHADER_PROGRAM_SCHEMA, record: "linked portable shader program" });
export const normalizeShaderProgramCommand = (input) => normalizeShaderRegistrationCommand(input, "program", normalizeShaderProgram, "Render Shader program registration command");
export const normalizeShaderProgramSnapshot = (snapshot) => normalizeShaderRegistrySnapshot(snapshot, { domain: "render-shader-program", collection: "programs", order: "programOrder", revision: "programRevision", normalizeRecord: normalizeShaderProgram, idField: "programId", label: "Render Shader program snapshot" });
