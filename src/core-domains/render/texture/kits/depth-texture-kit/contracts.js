import {
  RENDER_DEPTH_TEXTURE_SCHEMA,
  normalizeDepthTexture,
  normalizeTextureRegistrationCommand,
  normalizeTextureRegistrySnapshot
} from "../../texture-contracts.js";

export { normalizeDepthTexture };

export function normalizeDepthTextureRegistrationCommand(input) {
  return normalizeTextureRegistrationCommand(input, "depthTexture", normalizeDepthTexture, "Render Depth Texture registration command");
}

export function normalizeDepthTextureSnapshot(snapshot) {
  return normalizeTextureRegistrySnapshot(snapshot, {
    domain: "render-depth-texture",
    collection: "depthTextures",
    order: "depthTextureOrder",
    revision: "depthTextureRevision",
    normalizeRecord: normalizeDepthTexture,
    idField: "depthTextureId",
    label: "Render Depth Texture snapshot"
  });
}

export function depthTextureContract() {
  return Object.freeze({ schema: RENDER_DEPTH_TEXTURE_SCHEMA, depthStencilAttachmentUsageRequired: true, exactAspectRequired: true, passExecutionOwnedExternally: true });
}
