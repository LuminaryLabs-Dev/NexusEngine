import {
  FORCE_FIELD_SCHEMA,
  normalizeDefinitionCommand,
  normalizeForceField,
  normalizeRemovalCommand,
  sampleForceField
} from "../../world-contracts.js";

export { normalizeForceField, sampleForceField };

export function normalizeForceDefinitionCommand(input) {
  return normalizeDefinitionCommand(input, "field", normalizeForceField, "force field definition");
}

export function normalizeForceRemovalCommand(input) {
  return normalizeRemovalCommand(input, "fieldId", "force field");
}

export function forceFieldContract() {
  return Object.freeze({
    schema: FORCE_FIELD_SCHEMA,
    kinds: Object.freeze(["uniform", "radial"]),
    modes: Object.freeze(["force", "acceleration"]),
    falloffs: Object.freeze(["constant", "linear", "inverse", "inverse-square"]),
    gravityOwnedSeparately: true,
    bodyResponseOwnedExternally: true
  });
}
