import { BODY_STATE_SCHEMA, normalizeBodyState } from "../../body-contracts.js";

export { normalizeBodyState };

export function bodyStateContract() {
  return Object.freeze({
    schema: BODY_STATE_SCHEMA,
    composition: Object.freeze([
      "identity", "type", "pose", "velocity", "force", "mass", "inertia", "damping", "sleep", "lifecycle"
    ]),
    providerHandlesForbidden: true,
    colliderStateOwnedSeparately: true,
    solverIntegrationOwnedExternally: true
  });
}

