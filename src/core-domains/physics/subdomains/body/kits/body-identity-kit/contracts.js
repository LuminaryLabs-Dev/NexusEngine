import { BODY_IDENTITY_SCHEMA, normalizeBodyIdentity } from "../../body-contracts.js";

export { normalizeBodyIdentity };

export function bodyIdentityContract() {
  return Object.freeze({
    schema: BODY_IDENTITY_SCHEMA,
    stableIdRequired: true,
    tagsSortedAndUnique: true,
    metadataMustBePortable: true,
    providerHandlesForbidden: true
  });
}

