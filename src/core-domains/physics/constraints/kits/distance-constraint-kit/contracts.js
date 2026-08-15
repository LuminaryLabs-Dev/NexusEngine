import {
  constraintTypeContract,
  normalizeConstraintDescriptor,
  normalizeDistanceConstraintParameters
} from "../../constraints-contracts.js";

export const DISTANCE_CONSTRAINT_TYPE = "distance";
export const distanceConstraintContract = () => constraintTypeContract(DISTANCE_CONSTRAINT_TYPE);
export const normalizeDistanceConstraint = (input) => normalizeConstraintDescriptor(
  input,
  DISTANCE_CONSTRAINT_TYPE,
  normalizeDistanceConstraintParameters
);
