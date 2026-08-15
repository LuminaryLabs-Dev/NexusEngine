import { createMaterialRegistryKit } from "../../material-registry-kit.js";
import {
  materialTextureBindingContract,
  normalizeMaterialTextureBinding,
  normalizeMaterialTextureBindingCommand,
  normalizeMaterialTextureBindingSnapshot
} from "./contracts.js";

function resolveView(binding, requiredApi) {
  const definitions = {
    "2d": ["renderTexture2DViews", "texture2dId"],
    array: ["renderTextureArrayViews", "textureArrayId"],
    cube: ["renderTextureCubeViews", "textureCubeId"]
  };
  const [apiName, idField] = definitions[binding.viewType];
  const view = requiredApi(apiName).get(binding.viewId);
  if (!view || view[idField] !== binding.viewId) throw new TypeError(`Render Material Texture binding ${binding.textureBindingId} references unknown ${binding.viewType} view ${binding.viewId}.`);
  return view;
}

function subresourceInsideView(binding, view, subresource) {
  const mipInside = subresource.mipLevel >= view.baseMipLevel && subresource.mipLevel < view.baseMipLevel + view.mipLevelCount;
  if (!mipInside) return false;
  if (binding.viewType === "2d") return subresource.arrayLayer === 0;
  if (binding.viewType === "cube") return subresource.arrayLayer >= 0 && subresource.arrayLayer < 6;
  return subresource.arrayLayer >= view.baseArrayLayer && subresource.arrayLayer < view.baseArrayLayer + view.arrayLayerCount;
}

function validateTextureBinding(binding, requiredApi) {
  const materialBinding = requiredApi("renderMaterialBindings").get(binding.bindingId);
  const slot = materialBinding?.slots.find((candidate) => candidate.slotId === binding.slotId);
  if (!slot || slot.kind !== "texture") throw new TypeError(`Render Material Texture binding ${binding.textureBindingId} requires Texture slot ${binding.slotId}.`);
  const view = resolveView(binding, requiredApi);
  if (view.identityId !== binding.identityId) throw new TypeError(`Render Material Texture binding ${binding.textureBindingId} identity does not match view ${binding.viewId}.`);
  if (!requiredApi("renderTextures").get(binding.identityId)) throw new TypeError(`Render Material Texture binding ${binding.textureBindingId} references unknown Texture identity ${binding.identityId}.`);
  if (requiredApi("renderResourceLifecycle").get(binding.identityId)?.phase !== "resident") throw new TypeError(`Render Material Texture binding ${binding.textureBindingId} requires resident Texture resource ${binding.identityId}.`);
  const residency = requiredApi("renderTextureResidency");
  for (const subresource of binding.requiredSubresources) {
    if (!subresourceInsideView(binding, view, subresource)) throw new TypeError(`Render Material Texture binding ${binding.textureBindingId} subresource lies outside view ${binding.viewId}.`);
    if (!residency.isResident(binding.identityId, subresource.mipLevel, subresource.arrayLayer)) {
      throw new TypeError(`Render Material Texture binding ${binding.textureBindingId} requires nonresident subresource ${subresource.mipLevel}:${subresource.arrayLayer}.`);
    }
  }
  return binding;
}

export function createTextureBindingKit(config = {}) {
  return createMaterialRegistryKit({
    kitConfig: config,
    manifestId: "texture-binding-kit",
    id: "texture-binding-kit",
    domain: "render-material-texture-binding",
    apiName: "renderMaterialTextureBindings",
    requires: ["n:render:material", "render:material-binding", "render:texture-resource", "render:texture-2d", "render:texture-cube", "render:texture-array", "render:texture-residency", "render:resource-lifecycle"],
    provides: ["render:material-texture-binding"],
    purpose: "Render Material Texture Binding",
    owns: ["exact Material-to-Texture-view association", "required Texture subresource declaration"],
    doesNotOwn: ["Texture resources", "Texture uploads", "residency state", "provider texture handles"],
    collection: "textureBindings",
    order: "textureBindingOrder",
    revision: "textureBindingRevision",
    recordField: "textureBinding",
    idField: "textureBindingId",
    normalizeRecord: normalizeMaterialTextureBinding,
    normalizeCommand: normalizeMaterialTextureBindingCommand,
    normalizeSnapshot: normalizeMaterialTextureBindingSnapshot,
    contract: materialTextureBindingContract,
    validateRecord(binding, { requiredApi }) {
      return validateTextureBinding(binding, requiredApi);
    },
    extendApi({ api, context }) {
      return {
        resolveCurrent(textureBindingId) {
          const binding = api.get(textureBindingId);
          if (!binding) throw new TypeError(`Unknown Render Material Texture binding ${textureBindingId}.`);
          return validateTextureBinding(binding, context.requiredApi);
        }
      };
    }
  });
}

export default createTextureBindingKit;
