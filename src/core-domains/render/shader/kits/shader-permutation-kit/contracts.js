import { RENDER_SHADER_PERMUTATION_SCHEMA, expandShaderPermutation, normalizeShaderPermutation, normalizeShaderRegistrationCommand, normalizeShaderRegistrySnapshot, shaderRegistryContract } from "../../shader-contracts.js";

export { expandShaderPermutation, normalizeShaderPermutation };
export const shaderPermutationContract = () => shaderRegistryContract({ schema: RENDER_SHADER_PERMUTATION_SCHEMA, record: "bounded deterministic shader permutation" });
export const normalizeShaderPermutationCommand = (input) => normalizeShaderRegistrationCommand(input, "permutation", normalizeShaderPermutation, "Render Shader permutation registration command");
export const normalizeShaderPermutationSnapshot = (snapshot) => normalizeShaderRegistrySnapshot(snapshot, { domain: "render-shader-permutation", collection: "permutations", order: "permutationOrder", revision: "permutationRevision", normalizeRecord: normalizeShaderPermutation, idField: "permutationId", label: "Render Shader permutation snapshot" });
