import {
  DENSITY_MATERIAL_SCHEMA,
  normalizeDensityMaterial
} from "../../material-contracts.js";

export { normalizeDensityMaterial };

export function densityMaterialContract() {
  return Object.freeze({
    schema: DENSITY_MATERIAL_SCHEMA,
    units: "kilograms-per-cubic-meter",
    positiveValuesRequired: true,
    massCalculationOwnedExternally: true
  });
}
