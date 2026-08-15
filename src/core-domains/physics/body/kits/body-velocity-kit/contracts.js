import { BODY_VELOCITY_SCHEMA, normalizeBodyVelocity } from "../../body-contracts.js";

export { normalizeBodyVelocity };

export function bodyVelocityContract() {
  return Object.freeze({
    schema: BODY_VELOCITY_SCHEMA,
    components: Object.freeze(["linear", "angular"]),
    integrationOwnedByProvider: true,
    finiteValuesRequired: true
  });
}

