import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { driveConstraintContract, normalizeDriveConstraint } from "./contracts.js";

export function createDriveConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "drive",
    apiName: "physicsDriveConstraint",
    capability: "physics:drive-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS.drive,
    contract: driveConstraintContract,
    normalize: normalizeDriveConstraint
  });
}

export default createDriveConstraintKit;
