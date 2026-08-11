import { createMaterialRegistryKit } from "../../material-registry-kit.js";
import {
  materialVariantContract,
  normalizeMaterialVariant,
  normalizeMaterialVariantCommand,
  normalizeMaterialVariantSnapshot
} from "./contracts.js";

function resolveVariant(variant, requiredApi) {
  const instances = requiredApi("renderMaterialInstances");
  const base = instances.get(variant.baseInstanceId);
  if (!base) throw new TypeError(`Render Material variant ${variant.materialVariantId} references unknown base instance ${variant.baseInstanceId}.`);
  const shaderVariant = requiredApi("renderShaderVariants").get(variant.shaderVariantId);
  if (!shaderVariant) throw new TypeError(`Render Material variant ${variant.materialVariantId} references unknown Shader variant ${variant.shaderVariantId}.`);
  const binding = requiredApi("renderMaterialBindings").get(base.bindingId);
  if (!binding || shaderVariant.programId !== binding.programId) throw new TypeError(`Render Material variant ${variant.materialVariantId} Shader variant belongs to a different program.`);
  const selection = instances.resolveSelection({
    bindingId: base.bindingId,
    parameterSetId: variant.parameterSetId ?? base.parameterSetId,
    textureBindingIds: variant.textureBindingIds ?? base.textureBindingIds,
    samplerBindingIds: variant.samplerBindingIds ?? base.samplerBindingIds
  });
  return { variant, baseInstance: base, shaderVariant, ...selection };
}

export function createMaterialVariantKit(config = {}) {
  return createMaterialRegistryKit({
    kitConfig: config,
    manifestId: "material-variant-kit",
    id: "material-variant-kit",
    domain: "render-material-variant",
    apiName: "renderMaterialVariants",
    requires: ["n:render:material", "render:material-instance", "render:shader-variant"],
    provides: ["render:material-variant"],
    purpose: "Render Material Variant",
    owns: ["exact Shader-variant association", "complete Material binding overrides"],
    doesNotOwn: ["Shader variant definitions", "automatic permutations", "provider specialization", "pipeline selection"],
    collection: "variants",
    order: "variantOrder",
    revision: "variantRevision",
    recordField: "variant",
    idField: "materialVariantId",
    normalizeRecord: normalizeMaterialVariant,
    normalizeCommand: normalizeMaterialVariantCommand,
    normalizeSnapshot: normalizeMaterialVariantSnapshot,
    contract: materialVariantContract,
    validateRecord(variant, { requiredApi }) {
      resolveVariant(variant, requiredApi);
      return variant;
    },
    extendApi({ api, context }) {
      return {
        resolve(materialVariantId) {
          const variant = api.get(materialVariantId);
          if (!variant) throw new TypeError(`Unknown Render Material variant ${materialVariantId}.`);
          return resolveVariant(variant, context.requiredApi);
        }
      };
    }
  });
}

export default createMaterialVariantKit;
