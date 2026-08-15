import {
  RENDER_TEXTURE_RECORD_SCHEMA,
  assertSortedTextureRecords,
  normalizeTextureOperation,
  normalizeTextureRecord,
  normalizeTextureState
} from "../../texture-contracts.js";

export { normalizeTextureRecord };

export function normalizeTextureResourceRegistrationCommand(input) {
  const value = normalizeTextureOperation(input, ["identityId"], "Render Texture resource registration command");
  return { operationId: value.operationId, identityId: String(value.identityId ?? "").trim() };
}

export function normalizeTextureResourceSnapshot(snapshot) {
  return normalizeTextureState(snapshot, {
    domain: "render-texture-resource",
    fields: ["textures", "textureOrder", "textureRevision"],
    label: "Render Texture resource snapshot",
    validate(state) {
      assertSortedTextureRecords(state, {
        collection: "textures",
        order: "textureOrder",
        revision: "textureRevision",
        normalizeRecord: normalizeTextureRecord,
        idField: "identityId",
        label: "Render Texture resource snapshot"
      });
    }
  });
}

export function textureResourceContract() {
  return Object.freeze({
    schema: RENDER_TEXTURE_RECORD_SCHEMA,
    exactResourceIdentityRequired: true,
    explicitFormatRequired: true,
    wholeResourceLifecycleOwnedExternally: true,
    sourceContentOwnedExternally: true,
    providerHandlesAllowed: false
  });
}
