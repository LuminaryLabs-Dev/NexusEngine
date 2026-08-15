import { createShaderRegistryKit } from "../../shader-registry-kit.js";
import { expandShaderPermutation, normalizeShaderPermutation, normalizeShaderPermutationCommand, normalizeShaderPermutationSnapshot, shaderPermutationContract } from "./contracts.js";

export function createShaderPermutationKit(config = {}) {
  return createShaderRegistryKit({
    kitConfig: config,
    manifestId: "shader-permutation-kit",
    id: "shader-permutation-kit",
    domain: "render-shader-permutation",
    apiName: "renderShaderPermutations",
    requires: ["n:render:shader", "render:shader-program", "render:shader-variant"],
    provides: ["render:shader-permutation"],
    purpose: "Render Shader Permutation",
    owns: ["bounded permutation axes", "deterministic variant enumeration", "permutation identity"],
    doesNotOwn: ["automatic variant registration", "compilation", "runtime feature guessing", "unbounded expansion"],
    collection: "permutations",
    order: "permutationOrder",
    revision: "permutationRevision",
    recordField: "permutation",
    idField: "permutationId",
    normalizeRecord: normalizeShaderPermutation,
    normalizeCommand: normalizeShaderPermutationCommand,
    normalizeSnapshot: normalizeShaderPermutationSnapshot,
    contract: shaderPermutationContract,
    validateRecord(permutation, { requiredApi }) {
      if (!requiredApi("renderShaderPrograms").has(permutation.programId)) throw new TypeError(`Render Shader permutation ${permutation.permutationId} references unknown program ${permutation.programId}.`);
      return permutation;
    },
    extendApi({ api }) {
      return {
        expand(permutationId) {
          const permutation = api.get(permutationId);
          if (!permutation) throw new TypeError(`Unknown Render Shader permutation ${permutationId}.`);
          return expandShaderPermutation(permutation);
        }
      };
    }
  });
}

export default createShaderPermutationKit;
