import {
  RENDER_TEXTURE_2D_SCHEMA,
  normalizeTexture2D,
  normalizeTextureRegistrationCommand,
  normalizeTextureRegistrySnapshot
} from "../../texture-contracts.js";

export { normalizeTexture2D };

export function normalizeTexture2DRegistrationCommand(input) {
  return normalizeTextureRegistrationCommand(input, "texture2d", normalizeTexture2D, "Render Texture 2D registration command");
}

export function normalizeTexture2DSnapshot(snapshot) {
  return normalizeTextureRegistrySnapshot(snapshot, {
    domain: "render-texture-2d",
    collection: "texture2dViews",
    order: "texture2dOrder",
    revision: "texture2dRevision",
    normalizeRecord: normalizeTexture2D,
    idField: "texture2dId",
    label: "Render Texture 2D snapshot"
  });
}

export function texture2DContract() {
  return Object.freeze({ schema: RENDER_TEXTURE_2D_SCHEMA, dimension: "2d", exactResourceIdentityRequired: true, providerViewOwnedExternally: true });
}
