import { createDomainKit } from "../../../../domain-kit.js";
import { RENDER_SHADER_STAGES, normalizeShaderContractSnapshot, shaderContract } from "./contracts.js";

export { RENDER_SHADER_CONTRACT_SCHEMA, RENDER_SHADER_STAGES, shaderContract } from "./contracts.js";

export function createShaderContractKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "shader-contract-kit",
    id: config.id ?? "shader-contract-kit",
    domain: "render-shader-contract",
    domainPath: "n:render:shader",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderShaderContract",
    requires: ["n:render"],
    provides: ["render:shader-contract", "n:render:shader"],
    purpose: "Define the canonical provider-neutral Shader execution boundary and stage topology.",
    owns: ["Shader execution contract", "portable Shader stage vocabulary", "provider ownership boundary"],
    doesNotOwn: ["shader source authoring", "compilation", "GPU programs", "material binding", "pipeline execution"],
    initialState: { contractRevision: 1 },
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: shaderContract,
        listStages() {
          return [...RENDER_SHADER_STAGES];
        },
        supportsStage(stage) {
          return RENDER_SHADER_STAGES.includes(String(stage));
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeShaderContractSnapshot(snapshot));
        }
      };
    }
  });
}

export default createShaderContractKit;
