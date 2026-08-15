import { SHAPE_SCHEMA, SHAPE_TYPES, inspectShapeValue, normalizeShape } from "../../shape-contracts.js";

export { SHAPE_SCHEMA, SHAPE_TYPES, inspectShapeValue, normalizeShape };

export function shapeValidationContract() {
  return Object.freeze({
    schema: SHAPE_SCHEMA,
    shapeTypes: SHAPE_TYPES,
    unknownFieldsRejected: true,
    nonFiniteValuesRejected: true,
    providerHandlesForbidden: true
  });
}
