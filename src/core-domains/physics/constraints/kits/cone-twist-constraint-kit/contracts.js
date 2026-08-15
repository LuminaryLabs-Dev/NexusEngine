import {
  constraintTypeContract,
  normalizeConeTwistConstraintParameters,
  normalizeConstraintDescriptor
} from "../../constraints-contracts.js";

export const CONE_TWIST_CONSTRAINT_TYPE = "cone-twist";
export const coneTwistConstraintContract = () => constraintTypeContract(CONE_TWIST_CONSTRAINT_TYPE);
export const normalizeConeTwistConstraint = (input) => normalizeConstraintDescriptor(
  input,
  CONE_TWIST_CONSTRAINT_TYPE,
  normalizeConeTwistConstraintParameters
);
