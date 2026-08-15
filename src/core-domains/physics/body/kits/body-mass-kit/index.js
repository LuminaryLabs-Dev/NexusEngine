import { createAtomicBodyKit } from "../../atomic-body-kit.js";
import { BODY_MASS_SCHEMA } from "../../body-contracts.js";
import { bodyMassContract, normalizeBodyMass } from "./contracts.js";

export function createBodyMassKit(config = {}) {
  return createAtomicBodyKit(config, {
    manifestId: "body-mass-kit",
    domain: "physics-body-mass",
    apiName: "physicsBodyMass",
    provides: ["physics:body-mass"],
    purpose: "Normalize body mass, inverse mass, and center-of-mass descriptors.",
    owns: ["mass validation", "inverse mass derivation", "center-of-mass descriptor"],
    doesNotOwn: ["shape volume", "density lookup", "solver impulses", "provider bodies"],
    schema: BODY_MASS_SCHEMA,
    contract: bodyMassContract,
    normalize: normalizeBodyMass
  });
}

export default createBodyMassKit;

