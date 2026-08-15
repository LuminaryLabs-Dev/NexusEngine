import { BODY_MASS_SCHEMA, normalizeBodyMass } from "../../body-contracts.js";

export { normalizeBodyMass };

export function bodyMassContract() {
  return Object.freeze({
    schema: BODY_MASS_SCHEMA,
    units: "kilograms",
    inverseMassDerived: true,
    nonDynamicMass: 0,
    densityResolutionOwnedExternally: true
  });
}

