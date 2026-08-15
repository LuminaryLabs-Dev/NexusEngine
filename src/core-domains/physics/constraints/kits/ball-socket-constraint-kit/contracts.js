import {
  constraintTypeContract,
  normalizeBallSocketConstraintParameters,
  normalizeConstraintDescriptor
} from "../../constraints-contracts.js";

export const BALL_SOCKET_CONSTRAINT_TYPE = "ball-socket";
export const ballSocketConstraintContract = () => constraintTypeContract(BALL_SOCKET_CONSTRAINT_TYPE);
export const normalizeBallSocketConstraint = (input) => normalizeConstraintDescriptor(
  input,
  BALL_SOCKET_CONSTRAINT_TYPE,
  normalizeBallSocketConstraintParameters
);
