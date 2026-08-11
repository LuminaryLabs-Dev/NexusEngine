import {
  constraintTypeContract,
  normalizeConstraintDescriptor,
  normalizeSpringConstraintParameters
} from "../../constraints-contracts.js";

export const SPRING_CONSTRAINT_TYPE = "spring";
export const springConstraintContract = () => constraintTypeContract(SPRING_CONSTRAINT_TYPE);
export const normalizeSpringConstraint = (input) => normalizeConstraintDescriptor(
  input,
  SPRING_CONSTRAINT_TYPE,
  normalizeSpringConstraintParameters
);
