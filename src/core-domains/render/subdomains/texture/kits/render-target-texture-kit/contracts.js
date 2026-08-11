import {
  RENDER_TARGET_TEXTURE_SCHEMA,
  normalizeRenderTargetTexture,
  normalizeTextureRegistrationCommand,
  normalizeTextureRegistrySnapshot
} from "../../texture-contracts.js";

export { normalizeRenderTargetTexture };

export function normalizeRenderTargetTextureRegistrationCommand(input) {
  return normalizeTextureRegistrationCommand(input, "renderTargetTexture", normalizeRenderTargetTexture, "Render Target Texture registration command");
}

export function normalizeRenderTargetTextureSnapshot(snapshot) {
  return normalizeTextureRegistrySnapshot(snapshot, {
    domain: "render-target-texture",
    collection: "renderTargetTextures",
    order: "renderTargetTextureOrder",
    revision: "renderTargetTextureRevision",
    normalizeRecord: normalizeRenderTargetTexture,
    idField: "renderTargetTextureId",
    label: "Render Target Texture snapshot"
  });
}

export function renderTargetTextureContract() {
  return Object.freeze({ schema: RENDER_TARGET_TEXTURE_SCHEMA, colorAttachmentUsageRequired: true, renderableColorFormatRequired: true, passExecutionOwnedExternally: true });
}
