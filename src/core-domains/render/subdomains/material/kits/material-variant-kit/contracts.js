import { RENDER_MATERIAL_VARIANT_SCHEMA, materialRegistryContract, normalizeMaterialRegistrationCommand, normalizeMaterialRegistrySnapshot, normalizeMaterialVariant } from "../../material-contracts.js";

export { normalizeMaterialVariant };
export const materialVariantContract = () => materialRegistryContract({ schema: RENDER_MATERIAL_VARIANT_SCHEMA, record: "resolved Material execution variant" });
export const normalizeMaterialVariantCommand = (input) => normalizeMaterialRegistrationCommand(input, "variant", normalizeMaterialVariant, "Render Material variant registration command");
export const normalizeMaterialVariantSnapshot = (snapshot) => normalizeMaterialRegistrySnapshot(snapshot, { domain: "render-material-variant", collection: "variants", order: "variantOrder", revision: "variantRevision", normalizeRecord: normalizeMaterialVariant, idField: "materialVariantId", label: "Render Material Variant snapshot" });
