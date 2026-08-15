import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { colliderAttachmentContract, normalizeColliderAttachment } from "./contracts.js";

export function createColliderAttachmentKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "collider-attachment-kit",
    domain: "physics-collider-attachment",
    apiName: "physicsColliderAttachment",
    requires: ["n:physics", "physics:body-registry", "physics:shape-registry"],
    provides: ["physics:collider-attachment"],
    purpose: "Normalize a collider attachment to public Body and Shape registry identities.",
    owns: ["collider body reference", "collider shape reference", "optional body revision guard"],
    doesNotOwn: ["body records", "shape records", "provider handles", "collision detection"],
    schema: COLLIDER_SCHEMAS.attachment,
    contract: colliderAttachmentContract,
    normalize: normalizeColliderAttachment
  });
}

export default createColliderAttachmentKit;
