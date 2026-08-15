import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { hingeConstraintContract, normalizeHingeConstraint } from "./contracts.js";

export function createHingeConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "hinge",
    apiName: "physicsHingeConstraint",
    capability: "physics:hinge-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS.hinge,
    contract: hingeConstraintContract,
    normalize: normalizeHingeConstraint
  });
}

export default createHingeConstraintKit;
