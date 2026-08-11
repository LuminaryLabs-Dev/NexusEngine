import { RENDER_SHADER_VARIANT_SCHEMA, normalizeShaderRegistrationCommand, normalizeShaderRegistrySnapshot, normalizeShaderVariant, shaderRegistryContract } from "../../shader-contracts.js";

export { normalizeShaderVariant };
export const shaderVariantContract = () => shaderRegistryContract({ schema: RENDER_SHADER_VARIANT_SCHEMA, record: "deterministic shader variant" });
export const normalizeShaderVariantCommand = (input) => normalizeShaderRegistrationCommand(input, "variant", normalizeShaderVariant, "Render Shader variant registration command");
export const normalizeShaderVariantSnapshot = (snapshot) => normalizeShaderRegistrySnapshot(snapshot, { domain: "render-shader-variant", collection: "variants", order: "variantOrder", revision: "variantRevision", normalizeRecord: normalizeShaderVariant, idField: "variantId", label: "Render Shader variant snapshot" });
