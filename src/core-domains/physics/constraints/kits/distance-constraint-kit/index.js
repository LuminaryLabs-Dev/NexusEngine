import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { distanceConstraintContract, normalizeDistanceConstraint } from "./contracts.js";

export function createDistanceConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "distance",
    apiName: "physicsDistanceConstraint",
    capability: "physics:distance-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS.distance,
    contract: distanceConstraintContract,
    normalize: normalizeDistanceConstraint
  });
}

export default createDistanceConstraintKit;
