import { createTextureRegistryKit } from "../../texture-registry-kit.js";
import { assertTextureSubresourceRange } from "../../texture-contracts.js";
import { normalizeRenderTargetTexture, normalizeRenderTargetTextureRegistrationCommand, normalizeRenderTargetTextureSnapshot, renderTargetTextureContract } from "./contracts.js";

export function createRenderTargetTextureKit(config = {}) {
  return createTextureRegistryKit({
    kitConfig: config,
    manifestId: "render-target-texture-kit",
    id: "render-target-texture-kit",
    domain: "render-target-texture",
    apiName: "renderTargetTextures",
    requires: ["n:render:texture", "render:texture-resource", "render:texture-format"],
    provides: ["render:target-texture"],
    purpose: "Render Target Texture",
    owns: ["logical color attachment Texture views", "attachment format and subresource qualification"],
    doesNotOwn: ["render passes", "load or store operations", "clear values", "provider attachments"],
    collection: "renderTargetTextures",
    order: "renderTargetTextureOrder",
    revision: "renderTargetTextureRevision",
    recordField: "renderTargetTexture",
    idField: "renderTargetTextureId",
    normalizeRecord: normalizeRenderTargetTexture,
    normalizeCommand: normalizeRenderTargetTextureRegistrationCommand,
    normalizeSnapshot: normalizeRenderTargetTextureSnapshot,
    contract: renderTargetTextureContract,
    validateRecord(record, { textures, formats }) {
      const texture = textures().get(record.identityId);
      if (!texture) throw new TypeError(`Render Target Texture ${record.renderTargetTextureId} targets unknown Texture identity.`);
      if (!texture.descriptor.usage.includes("color-attachment")) throw new TypeError(`Render Target Texture ${record.renderTargetTextureId} requires color-attachment usage.`);
      const format = formats().get(texture.descriptor.formatId);
      if (!format?.aspects.includes("color") || !format.renderable) throw new TypeError(`Render Target Texture ${record.renderTargetTextureId} requires a renderable color format.`);
      assertTextureSubresourceRange(texture, { baseMipLevel: record.mipLevel, mipLevelCount: 1, baseArrayLayer: record.arrayLayer, arrayLayerCount: 1, label: `Render Target Texture ${record.renderTargetTextureId}` });
      return record;
    }
  });
}

export default createRenderTargetTextureKit;
