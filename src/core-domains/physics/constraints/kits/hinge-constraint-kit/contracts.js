import {
  constraintTypeContract,
  normalizeConstraintDescriptor,
  normalizeHingeConstraintParameters
} from "../../constraints-contracts.js";

export const HINGE_CONSTRAINT_TYPE = "hinge";
export const hingeConstraintContract = () => constraintTypeContract(HINGE_CONSTRAINT_TYPE);
export const normalizeHingeConstraint = (input) => normalizeConstraintDescriptor(
  input,
  HINGE_CONSTRAINT_TYPE,
  normalizeHingeConstraintParameters
);
