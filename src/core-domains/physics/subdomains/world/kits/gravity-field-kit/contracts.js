import {
  GRAVITY_FIELD_SCHEMA,
  normalizeDefinitionCommand,
  normalizeGravityField,
  normalizeRemovalCommand,
  sampleGravityField
} from "../../world-contracts.js";

export { normalizeGravityField, sampleGravityField };

export function normalizeGravityDefinitionCommand(input) {
  return normalizeDefinitionCommand(input, "field", normalizeGravityField, "gravity field definition");
}

export function normalizeGravityRemovalCommand(input) {
  return normalizeRemovalCommand(input, "fieldId", "gravity field");
}

export function gravityFieldContract() {
  return Object.freeze({
    schema: GRAVITY_FIELD_SCHEMA,
    kinds: Object.freeze(["uniform", "point"]),
    falloffs: Object.freeze(["constant", "linear", "inverse", "inverse-square"]),
    output: "acceleration",
    units: "meters-per-second-squared",
    bodyStateOwnedExternally: true
  });
}
