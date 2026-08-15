import { BODY_TYPES, BODY_TYPE_SCHEMA, normalizeBodyType } from "../../body-contracts.js";

export { normalizeBodyType };

export function bodyTypeContract() {
  return Object.freeze({
    schema: BODY_TYPE_SCHEMA,
    kinds: BODY_TYPES,
    integrationOwnedByProvider: true,
    typeChangesRequireRegistryReplacement: true
  });
}

