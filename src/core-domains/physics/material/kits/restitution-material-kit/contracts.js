import {
  RESTITUTION_MATERIAL_SCHEMA,
  normalizeRestitutionMaterial
} from "../../material-contracts.js";

export { normalizeRestitutionMaterial };

export function restitutionMaterialContract() {
  return Object.freeze({
    schema: RESTITUTION_MATERIAL_SCHEMA,
    coefficientRange: Object.freeze([0, 1]),
    thresholdUnits: "meters-per-second",
    solverOwnedExternally: true
  });
}
