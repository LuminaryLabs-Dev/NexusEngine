import { createDomainKit } from "../../../../../domain-kit.js";
import {
  MATERIAL_COMBINE_POLICY_SCHEMA,
  inspectMaterialValue,
  normalizeAtomicMaterialSnapshot
} from "../../material-contracts.js";
import {
  combineMaterialCoefficient,
  materialCombinePolicyContract,
  normalizeMaterialCombinePolicy,
  resolveMaterialPair
} from "./contracts.js";

export function createMaterialCombinePolicyKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "material-combine-policy-kit",
    id: config.id ?? "material-combine-policy-kit",
    domain: "physics-material-combine-policy",
    domainPath: "n:physics:material",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsMaterialCombinePolicy",
    requires: ["n:physics", "physics:friction-material", "physics:restitution-material"],
    provides: ["n:physics:material", "physics:material-combine-policy"],
    purpose: "Resolve material pairs with deterministic symmetric friction and restitution combination rules.",
    owns: ["combine mode validation", "policy precedence", "symmetric pair resolution"],
    doesNotOwn: ["contact solving", "impulse generation", "material registry", "provider execution"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: materialCombinePolicyContract,
        normalizePolicy: normalizeMaterialCombinePolicy,
        inspectPolicy(input) {
          return inspectMaterialValue(normalizeMaterialCombinePolicy, input, MATERIAL_COMBINE_POLICY_SCHEMA);
        },
        combineCoefficient: combineMaterialCoefficient,
        resolve: resolveMaterialPair,
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicMaterialSnapshot(snapshot, "physics-material-combine-policy"));
        }
      };
    }
  });
}

export default createMaterialCombinePolicyKit;
