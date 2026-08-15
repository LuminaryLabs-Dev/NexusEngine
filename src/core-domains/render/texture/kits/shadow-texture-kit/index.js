import { createTextureRegistryKit } from "../../texture-registry-kit.js";
import { normalizeShadowTexture, normalizeShadowTextureRegistrationCommand, normalizeShadowTextureSnapshot, shadowTextureContract } from "./contracts.js";

export function createShadowTextureKit(config = {}) {
  return createTextureRegistryKit({
    kitConfig: config,
    manifestId: "shadow-texture-kit",
    id: "shadow-texture-kit",
    domain: "render-shadow-texture",
    apiName: "renderShadowTextures",
    requires: ["n:render:texture", "render:texture-resource", "render:depth-texture"],
    provides: ["render:shadow-texture"],
    purpose: "Render Shadow Texture",
    owns: ["provider-neutral shadow-readable depth views", "2D Cube and Array view qualification"],
    doesNotOwn: ["lights", "cascades", "shadow quality policy", "comparison samplers", "shadow rendering"],
    collection: "shadowTextures",
    order: "shadowTextureOrder",
    revision: "shadowTextureRevision",
    recordField: "shadowTexture",
    idField: "shadowTextureId",
    normalizeRecord: normalizeShadowTexture,
    normalizeCommand: normalizeShadowTextureRegistrationCommand,
    normalizeSnapshot: normalizeShadowTextureSnapshot,
    contract: shadowTextureContract,
    validateRecord(record, { textures, depthTextures }) {
      const depth = depthTextures().get(record.depthTextureId);
      if (!depth) throw new TypeError(`Render Shadow Texture ${record.shadowTextureId} targets unknown Depth Texture view.`);
      const texture = textures().get(depth.identityId);
      if (!texture?.descriptor.usage.includes("sampled")) throw new TypeError(`Render Shadow Texture ${record.shadowTextureId} requires sampled usage.`);
      if (record.viewType === "2d" && depth.arrayLayerCount !== 1) throw new TypeError(`Render Shadow Texture ${record.shadowTextureId} 2D view requires one layer.`);
      if (record.viewType === "cube" && (depth.arrayLayerCount !== 6 || !["cube", "2d-array"].includes(texture.descriptor.dimension))) {
        throw new TypeError(`Render Shadow Texture ${record.shadowTextureId} Cube view requires six compatible layers.`);
      }
      if (record.viewType === "array" && depth.arrayLayerCount < 1) throw new TypeError(`Render Shadow Texture ${record.shadowTextureId} Array view requires at least one layer.`);
      return record;
    }
  });
}

export default createShadowTextureKit;
