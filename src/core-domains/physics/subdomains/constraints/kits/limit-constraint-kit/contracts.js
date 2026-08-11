import {
  constraintTypeContract,
  normalizeConstraintDescriptor,
  normalizeLimitConstraintParameters
} from "../../constraints-contracts.js";

export const LIMIT_CONSTRAINT_TYPE = "limit";
export const limitConstraintContract = () => constraintTypeContract(LIMIT_CONSTRAINT_TYPE);
export const normalizeLimitConstraint = (input) => normalizeConstraintDescriptor(
  input,
  LIMIT_CONSTRAINT_TYPE,
  normalizeLimitConstraintParameters
);
