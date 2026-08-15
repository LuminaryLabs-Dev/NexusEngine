import { createTextureRegistryKit } from "../../texture-registry-kit.js";
import { assertTextureSubresourceRange } from "../../texture-contracts.js";
import { normalizeTexture2D, normalizeTexture2DRegistrationCommand, normalizeTexture2DSnapshot, texture2DContract } from "./contracts.js";

export function createTexture2DKit(config = {}) {
  return createTextureRegistryKit({
    kitConfig: config,
    manifestId: "texture-2d-kit",
    id: "texture-2d-kit",
    domain: "render-texture-2d",
    apiName: "renderTexture2DViews",
    requires: ["n:render:texture", "render:texture-resource"],
    provides: ["render:texture-2d"],
    purpose: "Render Texture 2D",
    owns: ["logical 2D Texture views", "2D mip-range validation"],
    doesNotOwn: ["Texture resources", "samplers", "material slots", "provider views"],
    collection: "texture2dViews",
    order: "texture2dOrder",
    revision: "texture2dRevision",
    recordField: "texture2d",
    idField: "texture2dId",
    normalizeRecord: normalizeTexture2D,
    normalizeCommand: normalizeTexture2DRegistrationCommand,
    normalizeSnapshot: normalizeTexture2DSnapshot,
    contract: texture2DContract,
    validateRecord(record, { textures }) {
      const texture = textures().get(record.identityId);
      if (!texture) throw new TypeError(`Render Texture 2D ${record.texture2dId} targets unknown Texture identity.`);
      if (texture.descriptor.dimension !== "2d") throw new TypeError(`Render Texture 2D ${record.texture2dId} requires a 2D Texture.`);
      assertTextureSubresourceRange(texture, { ...record, baseArrayLayer: 0, arrayLayerCount: 1, label: `Render Texture 2D ${record.texture2dId}` });
      return record;
    }
  });
}

export default createTexture2DKit;
