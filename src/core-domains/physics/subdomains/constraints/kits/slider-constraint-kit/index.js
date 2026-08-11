import { createTypedConstraintKit } from "../../atomic-constraint-kit.js";
import { CONSTRAINT_PARAMETER_SCHEMAS } from "../../constraints-contracts.js";
import { normalizeSliderConstraint, sliderConstraintContract } from "./contracts.js";

export function createSliderConstraintKit(config = {}) {
  return createTypedConstraintKit(config, {
    type: "slider",
    apiName: "physicsSliderConstraint",
    capability: "physics:slider-constraint",
    schema: CONSTRAINT_PARAMETER_SCHEMAS.slider,
    contract: sliderConstraintContract,
    normalize: normalizeSliderConstraint
  });
}

export default createSliderConstraintKit;
