import { createTextureRegistryKit } from "../../texture-registry-kit.js";
import { textureMipExtent } from "../../texture-contracts.js";
import { normalizeTextureMipmap, normalizeTextureMipmapRegistrationCommand, normalizeTextureMipmapSnapshot, textureMipmapContract } from "./contracts.js";

export function createMipmapKit(config = {}) {
  return createTextureRegistryKit({
    kitConfig: config,
    manifestId: "mipmap-kit",
    id: "mipmap-kit",
    domain: "render-texture-mipmap",
    apiName: "renderTextureMipmaps",
    requires: ["n:render:texture", "render:texture-resource"],
    provides: ["render:texture-mipmap"],
    purpose: "Render Texture Mipmap",
    owns: ["portable contiguous mip-chain plans", "exact per-level extents", "per-level source content references"],
    doesNotOwn: ["image resampling", "GPU mip generation", "stream transport", "residency"],
    collection: "mipmaps",
    order: "mipmapOrder",
    revision: "mipmapRevision",
    recordField: "mipmap",
    idField: "mipmapId",
    normalizeRecord: normalizeTextureMipmap,
    normalizeCommand: normalizeTextureMipmapRegistrationCommand,
    normalizeSnapshot: normalizeTextureMipmapSnapshot,
    contract: textureMipmapContract,
    validateRecord(record, { textures }) {
      const texture = textures().get(record.identityId);
      if (!texture) throw new TypeError(`Render Texture mipmap ${record.mipmapId} targets unknown Texture identity.`);
      if (record.baseMipLevel + record.levelCount > texture.descriptor.mipLevelCount) throw new TypeError(`Render Texture mipmap ${record.mipmapId} exceeds Texture mip levels.`);
      for (const level of record.levels) {
        const expected = textureMipExtent(texture.descriptor, level.level);
        if (level.width !== expected.width || level.height !== expected.height || level.depthOrLayers !== expected.depthOrLayers) {
          throw new TypeError(`Render Texture mipmap ${record.mipmapId} level ${level.level} has incorrect extent.`);
        }
      }
      return record;
    }
  });
}

export default createMipmapKit;
