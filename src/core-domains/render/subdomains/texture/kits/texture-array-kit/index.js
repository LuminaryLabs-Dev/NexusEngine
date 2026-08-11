import { createTextureRegistryKit } from "../../texture-registry-kit.js";
import { assertTextureSubresourceRange } from "../../texture-contracts.js";
import { normalizeTextureArray, normalizeTextureArrayRegistrationCommand, normalizeTextureArraySnapshot, textureArrayContract } from "./contracts.js";

export function createTextureArrayKit(config = {}) {
  return createTextureRegistryKit({
    kitConfig: config,
    manifestId: "texture-array-kit",
    id: "texture-array-kit",
    domain: "render-texture-array",
    apiName: "renderTextureArrayViews",
    requires: ["n:render:texture", "render:texture-resource"],
    provides: ["render:texture-array"],
    purpose: "Render Texture Array",
    owns: ["logical Texture Array views", "array-layer and mip-range validation"],
    doesNotOwn: ["array source content", "animation frames", "material selection", "provider views"],
    collection: "textureArrayViews",
    order: "textureArrayOrder",
    revision: "textureArrayRevision",
    recordField: "textureArray",
    idField: "textureArrayId",
    normalizeRecord: normalizeTextureArray,
    normalizeCommand: normalizeTextureArrayRegistrationCommand,
    normalizeSnapshot: normalizeTextureArraySnapshot,
    contract: textureArrayContract,
    validateRecord(record, { textures }) {
      const texture = textures().get(record.identityId);
      if (!texture) throw new TypeError(`Render Texture Array ${record.textureArrayId} targets unknown Texture identity.`);
      if (texture.descriptor.dimension !== "2d-array") throw new TypeError(`Render Texture Array ${record.textureArrayId} requires a 2D Array Texture.`);
      assertTextureSubresourceRange(texture, { ...record, label: `Render Texture Array ${record.textureArrayId}` });
      return record;
    }
  });
}

export default createTextureArrayKit;
