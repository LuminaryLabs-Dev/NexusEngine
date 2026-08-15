import { BODY_DAMPING_SCHEMA, normalizeBodyDamping } from "../../body-contracts.js";

export { normalizeBodyDamping };

export function bodyDampingContract() {
  return Object.freeze({
    schema: BODY_DAMPING_SCHEMA,
    components: Object.freeze(["linear", "angular"]),
    integrationOwnedByProvider: true,
    finiteNonnegativeValuesRequired: true
  });
}

