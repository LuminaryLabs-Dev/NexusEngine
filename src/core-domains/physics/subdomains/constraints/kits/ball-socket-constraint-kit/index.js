import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { ballSocketConstraintContract, normalizeBallSocketConstraint } from "./contracts.js";

export function createBallSocketConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "ball-socket",
    apiName: "physicsBallSocketConstraint",
    capability: "physics:ball-socket-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS["ball-socket"],
    contract: ballSocketConstraintContract,
    normalize: normalizeBallSocketConstraint
  });
}

export default createBallSocketConstraintKit;
