import { createDomainKit } from "../../../../../domain-kit.js";
import {
  SURFACE_MATERIAL_SCHEMA,
  inspectMaterialValue,
  normalizeAtomicMaterialSnapshot
} from "../../material-contracts.js";
import { normalizeSurfaceMaterial, surfaceMaterialContract } from "./contracts.js";

export function createSurfaceMaterialKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "surface-material-kit",
    id: config.id ?? "surface-material-kit",
    domain: "physics-surface-material",
    domainPath: "n:physics:material",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsSurfaceMaterial",
    requires: ["n:physics"],
    provides: ["n:physics:material", "physics:surface-material"],
    purpose: "Normalize portable physical surface type and classification tags.",
    owns: ["physical surface classification", "portable surface tags"],
    doesNotOwn: ["textures", "shaders", "audio cues", "particles", "gameplay effects"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: surfaceMaterialContract,
        normalize: normalizeSurfaceMaterial,
        inspect(input) {
          return inspectMaterialValue(normalizeSurfaceMaterial, input, SURFACE_MATERIAL_SCHEMA);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicMaterialSnapshot(snapshot, "physics-surface-material"));
        }
      };
    }
  });
}

export default createSurfaceMaterialKit;
