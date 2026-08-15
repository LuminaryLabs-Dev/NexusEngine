import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { colliderMaterialContract, normalizeColliderMaterial } from "./contracts.js";

export function createColliderMaterialKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "collider-material-kit",
    domain: "physics-collider-material",
    apiName: "physicsColliderMaterial",
    requires: ["n:physics", "physics:material-registry"],
    provides: ["physics:collider-material"],
    purpose: "Normalize a collider reference to one public Physics material identity.",
    owns: ["collider material reference", "material identity normalization"],
    doesNotOwn: ["material records", "visual materials", "contact response", "provider handles"],
    schema: COLLIDER_SCHEMAS.material,
    contract: colliderMaterialContract,
    normalize: normalizeColliderMaterial
  });
}

export default createColliderMaterialKit;
