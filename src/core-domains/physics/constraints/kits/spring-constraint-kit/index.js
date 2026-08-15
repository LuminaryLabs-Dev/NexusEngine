import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { normalizeSpringConstraint, springConstraintContract } from "./contracts.js";

export function createSpringConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "spring",
    apiName: "physicsSpringConstraint",
    capability: "physics:spring-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS.spring,
    contract: springConstraintContract,
    normalize: normalizeSpringConstraint
  });
}

export default createSpringConstraintKit;
