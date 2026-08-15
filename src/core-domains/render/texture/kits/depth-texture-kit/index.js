import { createTextureRegistryKit } from "../../texture-registry-kit.js";
import { assertTextureSubresourceRange } from "../../texture-contracts.js";
import { depthTextureContract, normalizeDepthTexture, normalizeDepthTextureRegistrationCommand, normalizeDepthTextureSnapshot } from "./contracts.js";

export function createDepthTextureKit(config = {}) {
  return createTextureRegistryKit({
    kitConfig: config,
    manifestId: "depth-texture-kit",
    id: "depth-texture-kit",
    domain: "render-depth-texture",
    apiName: "renderDepthTextures",
    requires: ["n:render:texture", "render:texture-resource", "render:texture-format"],
    provides: ["render:depth-texture"],
    purpose: "Render Depth Texture",
    owns: ["logical depth-stencil Texture views", "depth-stencil aspect and subresource qualification"],
    doesNotOwn: ["depth testing policy", "shadow policy", "render passes", "provider attachments"],
    collection: "depthTextures",
    order: "depthTextureOrder",
    revision: "depthTextureRevision",
    recordField: "depthTexture",
    idField: "depthTextureId",
    normalizeRecord: normalizeDepthTexture,
    normalizeCommand: normalizeDepthTextureRegistrationCommand,
    normalizeSnapshot: normalizeDepthTextureSnapshot,
    contract: depthTextureContract,
    validateRecord(record, { textures, formats }) {
      const texture = textures().get(record.identityId);
      if (!texture) throw new TypeError(`Render Depth Texture ${record.depthTextureId} targets unknown Texture identity.`);
      if (!texture.descriptor.usage.includes("depth-stencil-attachment")) throw new TypeError(`Render Depth Texture ${record.depthTextureId} requires depth-stencil-attachment usage.`);
      const format = formats().get(texture.descriptor.formatId);
      if (!format?.renderable) throw new TypeError(`Render Depth Texture ${record.depthTextureId} requires a renderable format.`);
      const requiredAspects = record.aspect === "depth-stencil" ? ["depth", "stencil"] : [record.aspect];
      if (requiredAspects.some((aspect) => !format.aspects.includes(aspect))) throw new TypeError(`Render Depth Texture ${record.depthTextureId} aspect is incompatible with format ${format.formatId}.`);
      assertTextureSubresourceRange(texture, { baseMipLevel: record.mipLevel, mipLevelCount: 1, baseArrayLayer: record.baseArrayLayer, arrayLayerCount: record.arrayLayerCount, label: `Render Depth Texture ${record.depthTextureId}` });
      return record;
    }
  });
}

export default createDepthTextureKit;
