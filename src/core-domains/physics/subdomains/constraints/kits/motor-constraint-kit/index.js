import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { motorConstraintContract, normalizeMotorConstraint } from "./contracts.js";

export function createMotorConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "motor",
    apiName: "physicsMotorConstraint",
    capability: "physics:motor-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS.motor,
    contract: motorConstraintContract,
    normalize: normalizeMotorConstraint
  });
}

export default createMotorConstraintKit;
