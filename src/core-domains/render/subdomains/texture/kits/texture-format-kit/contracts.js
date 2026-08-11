import {
  RENDER_TEXTURE_FORMAT_SCHEMA,
  normalizeTextureFormat,
  normalizeTextureRegistrationCommand,
  normalizeTextureRegistrySnapshot,
  textureFormatLevelByteSize
} from "../../texture-contracts.js";

export { normalizeTextureFormat, textureFormatLevelByteSize };

export function normalizeTextureFormatRegistrationCommand(input) {
  return normalizeTextureRegistrationCommand(input, "format", normalizeTextureFormat, "Render Texture format registration command");
}

export function normalizeTextureFormatSnapshot(snapshot) {
  return normalizeTextureRegistrySnapshot(snapshot, {
    domain: "render-texture-format",
    collection: "formats",
    order: "formatOrder",
    revision: "formatRevision",
    normalizeRecord: normalizeTextureFormat,
    idField: "formatId",
    label: "Render Texture format snapshot"
  });
}

export function textureFormatContract() {
  return Object.freeze({
    schema: RENDER_TEXTURE_FORMAT_SCHEMA,
    providerFormatMappingOwnedExternally: true,
    portableBlockLayoutRequired: true,
    exactCapabilityFlagsRequired: true,
    backendEnumsAllowed: false
  });
}
