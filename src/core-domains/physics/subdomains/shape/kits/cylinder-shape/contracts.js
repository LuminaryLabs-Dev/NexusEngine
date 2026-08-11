import { normalizeShape, SHAPE_SCHEMA, shapeParameters } from "../../shape-contracts.js";
export { SHAPE_SCHEMA, shapeParameters };
export const normalize = (input) => normalizeShape(input, "cylinder");
