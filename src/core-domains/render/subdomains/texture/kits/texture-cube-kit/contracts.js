import {
  RENDER_TEXTURE_CUBE_SCHEMA,
  normalizeTextureCube,
  normalizeTextureRegistrationCommand,
  normalizeTextureRegistrySnapshot
} from "../../texture-contracts.js";

export { normalizeTextureCube };

export function normalizeTextureCubeRegistrationCommand(input) {
  return normalizeTextureRegistrationCommand(input, "textureCube", normalizeTextureCube, "Render Texture Cube registration command");
}

export function normalizeTextureCubeSnapshot(snapshot) {
  return normalizeTextureRegistrySnapshot(snapshot, {
    domain: "render-texture-cube",
    collection: "textureCubeViews",
    order: "textureCubeOrder",
    revision: "textureCubeRevision",
    normalizeRecord: normalizeTextureCube,
    idField: "textureCubeId",
    label: "Render Texture Cube snapshot"
  });
}

export function textureCubeContract() {
  return Object.freeze({ schema: RENDER_TEXTURE_CUBE_SCHEMA, dimension: "cube", faces: 6, exactResourceIdentityRequired: true, providerViewOwnedExternally: true });
}
