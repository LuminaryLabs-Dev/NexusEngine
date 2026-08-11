import {
  PHYSICS_MATERIAL_SCHEMA,
  normalizeMaterialDefinitionCommand,
  normalizeMaterialId,
  normalizeMaterialRemovalCommand,
  normalizePhysicsMaterial,
  normalizePhysicsMaterialSnapshot
} from "../../material-contracts.js";

export {
  normalizeMaterialDefinitionCommand,
  normalizeMaterialId,
  normalizeMaterialRemovalCommand,
  normalizePhysicsMaterial,
  normalizePhysicsMaterialSnapshot
};

export function physicsMaterialContract() {
  return Object.freeze({
    schema: PHYSICS_MATERIAL_SCHEMA,
    operations: Object.freeze(["defineMaterial", "removeMaterial"]),
    queries: Object.freeze(["getMaterial", "listMaterials", "resolvePair"]),
    recordIdentity: "immutable-id-with-exact-once-command-receipts",
    pairResolution: "public-material-combine-policy-capability",
    providerOwnedExternally: true,
    visualMaterialOwnedExternally: true
  });
}
