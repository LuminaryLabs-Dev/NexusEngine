import { BODY_WAKE_REQUEST_SCHEMA, normalizeBodyWakeRequest } from "../../body-contracts.js";

export { normalizeBodyWakeRequest };

export function bodyWakeContract() {
  return Object.freeze({
    schema: BODY_WAKE_REQUEST_SCHEMA,
    explicitOperationIdRequired: true,
    stateTransitionOwnedByRegistry: true,
    providerActivationOwnedExternally: true
  });
}

