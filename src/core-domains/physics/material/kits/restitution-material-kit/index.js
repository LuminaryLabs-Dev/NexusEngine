import { createDomainKit } from "../../../../domain-kit.js";
import {
  RESTITUTION_MATERIAL_SCHEMA,
  inspectMaterialValue,
  normalizeAtomicMaterialSnapshot
} from "../../material-contracts.js";
import { normalizeRestitutionMaterial, restitutionMaterialContract } from "./contracts.js";

export function createRestitutionMaterialKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "restitution-material-kit",
    id: config.id ?? "restitution-material-kit",
    domain: "physics-restitution-material",
    domainPath: "n:physics:material",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsRestitutionMaterial",
    requires: ["n:physics"],
    provides: ["n:physics:material", "physics:restitution-material"],
    purpose: "Normalize bounded coefficient-of-restitution and activation-threshold descriptors.",
    owns: ["restitution coefficient validation", "restitution threshold normalization"],
    doesNotOwn: ["bounce impulses", "contact solving", "visual effects", "body velocity"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: restitutionMaterialContract,
        normalize: normalizeRestitutionMaterial,
        inspect(input) {
          return inspectMaterialValue(normalizeRestitutionMaterial, input, RESTITUTION_MATERIAL_SCHEMA);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicMaterialSnapshot(snapshot, "physics-restitution-material"));
        }
      };
    }
  });
}

export default createRestitutionMaterialKit;
