import { createAtomicBodyKit } from "../../atomic-body-kit.js";
import { BODY_TYPE_SCHEMA } from "../../body-contracts.js";
import { bodyTypeContract, normalizeBodyType } from "./contracts.js";

export function createBodyTypeKit(config = {}) {
  return createAtomicBodyKit(config, {
    manifestId: "body-type-kit",
    domain: "physics-body-type",
    apiName: "physicsBodyType",
    provides: ["physics:body-type"],
    purpose: "Normalize static, dynamic, and kinematic Physics body modes.",
    owns: ["body mode vocabulary", "body mode validation"],
    doesNotOwn: ["motion integration", "mass state", "sleep algorithms", "provider objects"],
    schema: BODY_TYPE_SCHEMA,
    contract: bodyTypeContract,
    normalize: normalizeBodyType
  });
}

export default createBodyTypeKit;

