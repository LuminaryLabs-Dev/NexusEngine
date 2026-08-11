import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { coneTwistConstraintContract, normalizeConeTwistConstraint } from "./contracts.js";

export function createConeTwistConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "cone-twist",
    apiName: "physicsConeTwistConstraint",
    capability: "physics:cone-twist-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS["cone-twist"],
    contract: coneTwistConstraintContract,
    normalize: normalizeConeTwistConstraint
  });
}

export default createConeTwistConstraintKit;
