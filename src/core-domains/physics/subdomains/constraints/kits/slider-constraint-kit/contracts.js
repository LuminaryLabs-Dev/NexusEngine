import {
  constraintTypeContract,
  normalizeConstraintDescriptor,
  normalizeSliderConstraintParameters
} from "../../constraints-contracts.js";

export const SLIDER_CONSTRAINT_TYPE = "slider";
export const sliderConstraintContract = () => constraintTypeContract(SLIDER_CONSTRAINT_TYPE);
export const normalizeSliderConstraint = (input) => normalizeConstraintDescriptor(
  input,
  SLIDER_CONSTRAINT_TYPE,
  normalizeSliderConstraintParameters
);
