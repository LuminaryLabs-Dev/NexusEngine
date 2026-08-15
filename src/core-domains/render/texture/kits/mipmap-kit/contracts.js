import {
  RENDER_TEXTURE_MIPMAP_SCHEMA,
  normalizeTextureMipmap,
  normalizeTextureRegistrationCommand,
  normalizeTextureRegistrySnapshot
} from "../../texture-contracts.js";

export { normalizeTextureMipmap };

export function normalizeTextureMipmapRegistrationCommand(input) {
  return normalizeTextureRegistrationCommand(input, "mipmap", normalizeTextureMipmap, "Render Texture mipmap registration command");
}

export function normalizeTextureMipmapSnapshot(snapshot) {
  return normalizeTextureRegistrySnapshot(snapshot, {
    domain: "render-texture-mipmap",
    collection: "mipmaps",
    order: "mipmapOrder",
    revision: "mipmapRevision",
    normalizeRecord: normalizeTextureMipmap,
    idField: "mipmapId",
    label: "Render Texture mipmap snapshot"
  });
}

export function textureMipmapContract() {
  return Object.freeze({
    schema: RENDER_TEXTURE_MIPMAP_SCHEMA,
    explicitContiguousLevelsRequired: true,
    sourceProvidedContentIdentityRequired: true,
    mipGenerationOwnedExternally: true
  });
}
