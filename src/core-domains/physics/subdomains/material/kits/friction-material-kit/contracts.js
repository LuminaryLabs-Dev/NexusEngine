import {
  FRICTION_MATERIAL_SCHEMA,
  MATERIAL_COMBINE_MODES,
  normalizeFrictionMaterial
} from "../../material-contracts.js";

export { normalizeFrictionMaterial };

export function frictionMaterialContract() {
  return Object.freeze({
    schema: FRICTION_MATERIAL_SCHEMA,
    coefficients: Object.freeze(["staticCoefficient", "dynamicCoefficient", "rollingCoefficient", "spinningCoefficient"]),
    anisotropySupported: true,
    combineModes: MATERIAL_COMBINE_MODES,
    units: "dimensionless",
    solverOwnedExternally: true
  });
}
