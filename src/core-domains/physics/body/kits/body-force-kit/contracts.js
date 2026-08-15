import { BODY_FORCE_SCHEMA, normalizeBodyForce } from "../../body-contracts.js";

export { normalizeBodyForce };

export function bodyForceContract() {
  return Object.freeze({
    schema: BODY_FORCE_SCHEMA,
    accumulators: Object.freeze(["force", "torque", "linearImpulse", "angularImpulse"]),
    applicationOwnedByProvider: true,
    automaticClearingOwnedByProvider: true
  });
}

