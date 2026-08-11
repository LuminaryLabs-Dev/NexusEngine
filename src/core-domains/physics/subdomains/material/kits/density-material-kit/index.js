import { createDomainKit } from "../../../../../domain-kit.js";
import {
  DENSITY_MATERIAL_SCHEMA,
  inspectMaterialValue,
  normalizeAtomicMaterialSnapshot
} from "../../material-contracts.js";
import { densityMaterialContract, normalizeDensityMaterial } from "./contracts.js";

export function createDensityMaterialKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "density-material-kit",
    id: config.id ?? "density-material-kit",
    domain: "physics-density-material",
    domainPath: "n:physics:material",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsDensityMaterial",
    requires: ["n:physics"],
    provides: ["n:physics:material", "physics:density-material"],
    purpose: "Normalize positive SI mass-density descriptors without calculating body mass.",
    owns: ["mass density descriptor validation", "SI density units"],
    doesNotOwn: ["body mass", "shape volume", "inertia", "buoyancy", "visual density"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: densityMaterialContract,
        normalize: normalizeDensityMaterial,
        inspect(input) {
          return inspectMaterialValue(normalizeDensityMaterial, input, DENSITY_MATERIAL_SCHEMA);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicMaterialSnapshot(snapshot, "physics-density-material"));
        }
      };
    }
  });
}

export default createDensityMaterialKit;
