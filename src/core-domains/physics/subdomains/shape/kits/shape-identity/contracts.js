import { SHAPE_IDENTITY_SCHEMA, normalizeShapeIdentity } from "../../shape-contracts.js";

export { SHAPE_IDENTITY_SCHEMA, normalizeShapeIdentity };

export function shapeIdentityContract() {
  return Object.freeze({
    schema: SHAPE_IDENTITY_SCHEMA,
    stableIdRequired: true,
    canonicalTypeRequired: true,
    metadataMustBePortable: true,
    providerHandlesForbidden: true
  });
}
