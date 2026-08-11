import { createShaderRegistryKit } from "../../shader-registry-kit.js";
import { normalizeShaderVariant, normalizeShaderVariantCommand, normalizeShaderVariantSnapshot, shaderVariantContract } from "./contracts.js";

export function createShaderVariantKit(config = {}) {
  return createShaderRegistryKit({
    kitConfig: config,
    manifestId: "shader-variant-kit",
    id: "shader-variant-kit",
    domain: "render-shader-variant",
    apiName: "renderShaderVariants",
    requires: ["n:render:shader", "render:shader-program"],
    provides: ["render:shader-variant"],
    purpose: "Render Shader Variant",
    owns: ["exact define and specialization selections", "variant identity", "variant capability requirements"],
    doesNotOwn: ["automatic permutation expansion", "compilation", "material policy", "provider binaries"],
    collection: "variants",
    order: "variantOrder",
    revision: "variantRevision",
    recordField: "variant",
    idField: "variantId",
    normalizeRecord: normalizeShaderVariant,
    normalizeCommand: normalizeShaderVariantCommand,
    normalizeSnapshot: normalizeShaderVariantSnapshot,
    contract: shaderVariantContract,
    validateRecord(variant, { requiredApi }) {
      if (!requiredApi("renderShaderPrograms").has(variant.programId)) throw new TypeError(`Render Shader variant ${variant.variantId} references unknown program ${variant.programId}.`);
      return variant;
    }
  });
}

export default createShaderVariantKit;
