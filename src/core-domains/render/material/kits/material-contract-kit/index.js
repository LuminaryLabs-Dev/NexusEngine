import { createDomainKit } from "../../../../domain-kit.js";
import {
  MATERIAL_BINDING_KINDS,
  MATERIAL_PARAMETER_TYPES,
  MATERIAL_TEXTURE_VIEW_TYPES,
  materialContract,
  normalizeMaterialContractSnapshot
} from "./contracts.js";

export {
  MATERIAL_BINDING_KINDS,
  MATERIAL_PARAMETER_TYPES,
  MATERIAL_TEXTURE_VIEW_TYPES,
  RENDER_MATERIAL_CONTRACT_SCHEMA,
  materialContract
} from "./contracts.js";

export function createMaterialContractKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "material-contract-kit",
    id: config.id ?? "material-contract-kit",
    domain: "render-material-contract",
    domainPath: "n:render:material",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderMaterialContract",
    requires: ["n:render"],
    provides: ["n:render:material", "render:material-contract"],
    purpose: "Define the canonical backend-neutral Render Material execution boundary.",
    owns: ["portable Material execution contract", "binding and parameter vocabulary", "provider ownership boundary"],
    doesNotOwn: ["authored visual meaning", "physical material meaning", "GPU objects", "Shader compilation", "Pipeline execution"],
    initialState: { contractRevision: 1 },
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: materialContract,
        listBindingKinds() {
          return [...MATERIAL_BINDING_KINDS];
        },
        listParameterTypes() {
          return [...MATERIAL_PARAMETER_TYPES];
        },
        listTextureViewTypes() {
          return [...MATERIAL_TEXTURE_VIEW_TYPES];
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeMaterialContractSnapshot(snapshot));
        }
      };
    }
  });
}

export default createMaterialContractKit;
