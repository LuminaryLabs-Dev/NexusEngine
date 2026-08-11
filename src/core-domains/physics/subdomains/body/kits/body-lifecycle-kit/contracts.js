import {
  BODY_LIFECYCLE_REQUEST_SCHEMA,
  BODY_LIFECYCLE_SCHEMA,
  BODY_LIFECYCLE_STATES,
  normalizeBodyLifecycle,
  normalizeBodyLifecycleRequest
} from "../../body-contracts.js";

export { normalizeBodyLifecycle, normalizeBodyLifecycleRequest };

export function bodyLifecycleContract() {
  return Object.freeze({
    schema: BODY_LIFECYCLE_SCHEMA,
    commandSchema: BODY_LIFECYCLE_REQUEST_SCHEMA,
    states: BODY_LIFECYCLE_STATES,
    removalOwnedByRegistry: true,
    providerSynchronizationOwnedExternally: true
  });
}

