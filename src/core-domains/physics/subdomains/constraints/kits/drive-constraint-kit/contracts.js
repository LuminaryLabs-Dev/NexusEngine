import {
  constraintTypeContract,
  normalizeConstraintDescriptor,
  normalizeDriveConstraintParameters
} from "../../constraints-contracts.js";

export const DRIVE_CONSTRAINT_TYPE = "drive";
export const driveConstraintContract = () => constraintTypeContract(DRIVE_CONSTRAINT_TYPE);
export const normalizeDriveConstraint = (input) => normalizeConstraintDescriptor(
  input,
  DRIVE_CONSTRAINT_TYPE,
  normalizeDriveConstraintParameters
);
