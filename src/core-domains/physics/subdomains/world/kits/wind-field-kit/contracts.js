import {
  WIND_FIELD_SCHEMA,
  normalizeDefinitionCommand,
  normalizeRemovalCommand,
  normalizeWindField,
  sampleWindField
} from "../../world-contracts.js";

export { normalizeWindField, sampleWindField };

export function normalizeWindDefinitionCommand(input) {
  return normalizeDefinitionCommand(input, "field", normalizeWindField, "wind field definition");
}

export function normalizeWindRemovalCommand(input) {
  return normalizeRemovalCommand(input, "fieldId", "wind field");
}

export function windFieldContract() {
  return Object.freeze({
    schema: WIND_FIELD_SCHEMA,
    kinds: Object.freeze(["uniform", "gust", "corridor"]),
    output: "physical-flow-velocity",
    velocityUnits: "meters-per-second",
    authoredWeatherOwnedExternally: true,
    visualWindOwnedExternally: true,
    aerodynamicResponseOwnedExternally: true
  });
}
