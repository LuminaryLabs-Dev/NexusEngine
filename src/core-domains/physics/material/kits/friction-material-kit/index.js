import { createDomainKit } from "../../../../domain-kit.js";
import {
  FRICTION_MATERIAL_SCHEMA,
  inspectMaterialValue,
  normalizeAtomicMaterialSnapshot
} from "../../material-contracts.js";
import { frictionMaterialContract, normalizeFrictionMaterial } from "./contracts.js";

export function createFrictionMaterialKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "friction-material-kit",
    id: config.id ?? "friction-material-kit",
    domain: "physics-friction-material",
    domainPath: "n:physics:material",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsFrictionMaterial",
    requires: ["n:physics"],
    provides: ["n:physics:material", "physics:friction-material"],
    purpose: "Normalize portable static, dynamic, rolling, spinning, and anisotropic friction descriptors.",
    owns: ["friction descriptor validation", "friction coefficient normalization", "anisotropic friction direction"],
    doesNotOwn: ["contact impulses", "solver execution", "visual surface materials", "collider state"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: frictionMaterialContract,
        normalize: normalizeFrictionMaterial,
        inspect(input) {
          return inspectMaterialValue(normalizeFrictionMaterial, input, FRICTION_MATERIAL_SCHEMA);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicMaterialSnapshot(snapshot, "physics-friction-material"));
        }
      };
    }
  });
}

export default createFrictionMaterialKit;
