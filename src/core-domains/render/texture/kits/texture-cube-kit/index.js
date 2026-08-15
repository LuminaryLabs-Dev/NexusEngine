import { createTextureRegistryKit } from "../../texture-registry-kit.js";
import { assertTextureSubresourceRange } from "../../texture-contracts.js";
import { normalizeTextureCube, normalizeTextureCubeRegistrationCommand, normalizeTextureCubeSnapshot, textureCubeContract } from "./contracts.js";

export function createTextureCubeKit(config = {}) {
  return createTextureRegistryKit({
    kitConfig: config,
    manifestId: "texture-cube-kit",
    id: "texture-cube-kit",
    domain: "render-texture-cube",
    apiName: "renderTextureCubeViews",
    requires: ["n:render:texture", "render:texture-resource"],
    provides: ["render:texture-cube"],
    purpose: "Render Texture Cube",
    owns: ["logical Cube Texture views", "Cube face and mip-range validation"],
    doesNotOwn: ["environment lighting meaning", "reflection probes", "samplers", "provider views"],
    collection: "textureCubeViews",
    order: "textureCubeOrder",
    revision: "textureCubeRevision",
    recordField: "textureCube",
    idField: "textureCubeId",
    normalizeRecord: normalizeTextureCube,
    normalizeCommand: normalizeTextureCubeRegistrationCommand,
    normalizeSnapshot: normalizeTextureCubeSnapshot,
    contract: textureCubeContract,
    validateRecord(record, { textures }) {
      const texture = textures().get(record.identityId);
      if (!texture) throw new TypeError(`Render Texture Cube ${record.textureCubeId} targets unknown Texture identity.`);
      if (texture.descriptor.dimension !== "cube") throw new TypeError(`Render Texture Cube ${record.textureCubeId} requires a Cube Texture.`);
      assertTextureSubresourceRange(texture, { ...record, baseArrayLayer: 0, arrayLayerCount: 6, label: `Render Texture Cube ${record.textureCubeId}` });
      return record;
    }
  });
}

export default createTextureCubeKit;
