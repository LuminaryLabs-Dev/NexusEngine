import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { fixedConstraintContract, normalizeFixedConstraint } from "./contracts.js";

export function createFixedConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "fixed",
    apiName: "physicsFixedConstraint",
    capability: "physics:fixed-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS.fixed,
    contract: fixedConstraintContract,
    normalize: normalizeFixedConstraint
  });
}

export default createFixedConstraintKit;
