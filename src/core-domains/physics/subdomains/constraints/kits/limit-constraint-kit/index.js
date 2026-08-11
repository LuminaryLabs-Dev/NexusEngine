import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { limitConstraintContract, normalizeLimitConstraint } from "./contracts.js";

export function createLimitConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "limit",
    apiName: "physicsLimitConstraint",
    capability: "physics:limit-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS.limit,
    contract: limitConstraintContract,
    normalize: normalizeLimitConstraint
  });
}

export default createLimitConstraintKit;
