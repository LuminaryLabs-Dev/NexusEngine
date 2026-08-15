import { createAtomicBodyKit } from "../../atomic-body-kit.js";
import { BODY_WAKE_REQUEST_SCHEMA } from "../../body-contracts.js";
import { bodyWakeContract, normalizeBodyWakeRequest } from "./contracts.js";

export function createBodyWakeKit(config = {}) {
  return createAtomicBodyKit(config, {
    manifestId: "body-wake-kit",
    domain: "physics-body-wake",
    apiName: "physicsBodyWake",
    provides: ["physics:body-wake"],
    purpose: "Normalize explicit exact-once Physics body wake commands.",
    owns: ["wake command schema", "wake reason and tick normalization"],
    doesNotOwn: ["sleep thresholds", "solver activation", "body registry state", "provider handles"],
    schema: BODY_WAKE_REQUEST_SCHEMA,
    contract: bodyWakeContract,
    normalize: normalizeBodyWakeRequest
  });
}

export default createBodyWakeKit;

