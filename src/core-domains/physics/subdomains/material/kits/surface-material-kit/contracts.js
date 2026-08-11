import {
  SURFACE_MATERIAL_SCHEMA,
  normalizeSurfaceMaterial
} from "../../material-contracts.js";

export { normalizeSurfaceMaterial };

export function surfaceMaterialContract() {
  return Object.freeze({
    schema: SURFACE_MATERIAL_SCHEMA,
    classification: "portable-physical-surface-type-and-tags",
    visualMaterialOwnedExternally: true,
    authoredEffectsOwnedExternally: true
  });
}
