import {
  constraintTypeContract,
  normalizeConstraintDescriptor,
  normalizeFixedConstraintParameters
} from "../../constraints-contracts.js";

export const FIXED_CONSTRAINT_TYPE = "fixed";
export const fixedConstraintContract = () => constraintTypeContract(FIXED_CONSTRAINT_TYPE);
export const normalizeFixedConstraint = (input) => normalizeConstraintDescriptor(
  input,
  FIXED_CONSTRAINT_TYPE,
  normalizeFixedConstraintParameters
);
