import {
  MATERIAL_COMBINE_MODES,
  MATERIAL_COMBINE_POLICY_SCHEMA,
  MATERIAL_PAIR_SCHEMA,
  combineMaterialCoefficient,
  normalizeMaterialCombinePolicy,
  resolveMaterialPair
} from "../../material-contracts.js";

export {
  combineMaterialCoefficient,
  normalizeMaterialCombinePolicy,
  resolveMaterialPair
};

export function materialCombinePolicyContract() {
  return Object.freeze({
    schema: MATERIAL_COMBINE_POLICY_SCHEMA,
    resultSchema: MATERIAL_PAIR_SCHEMA,
    modes: MATERIAL_COMBINE_MODES,
    ordering: "priority-then-canonical-mode-rank",
    symmetric: true,
    queryOnly: true
  });
}
