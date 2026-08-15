import {
  constraintTypeContract,
  normalizeConstraintDescriptor,
  normalizeMotorConstraintParameters
} from "../../constraints-contracts.js";

export const MOTOR_CONSTRAINT_TYPE = "motor";
export const motorConstraintContract = () => constraintTypeContract(MOTOR_CONSTRAINT_TYPE);
export const normalizeMotorConstraint = (input) => normalizeConstraintDescriptor(
  input,
  MOTOR_CONSTRAINT_TYPE,
  normalizeMotorConstraintParameters
);
