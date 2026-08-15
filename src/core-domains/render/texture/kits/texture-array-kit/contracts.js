import {
  RENDER_TEXTURE_ARRAY_SCHEMA,
  normalizeTextureArray,
  normalizeTextureRegistrationCommand,
  normalizeTextureRegistrySnapshot
} from "../../texture-contracts.js";

export { normalizeTextureArray };

export function normalizeTextureArrayRegistrationCommand(input) {
  return normalizeTextureRegistrationCommand(input, "textureArray", normalizeTextureArray, "Render Texture Array registration command");
}

export function normalizeTextureArraySnapshot(snapshot) {
  return normalizeTextureRegistrySnapshot(snapshot, {
    domain: "render-texture-array",
    collection: "textureArrayViews",
    order: "textureArrayOrder",
    revision: "textureArrayRevision",
    normalizeRecord: normalizeTextureArray,
    idField: "textureArrayId",
    label: "Render Texture Array snapshot"
  });
}

export function textureArrayContract() {
  return Object.freeze({ schema: RENDER_TEXTURE_ARRAY_SCHEMA, dimension: "2d-array", exactResourceIdentityRequired: true, boundedLayerRangeRequired: true, providerViewOwnedExternally: true });
}
