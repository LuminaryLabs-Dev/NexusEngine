import {
  BODY_SLEEP_REQUEST_SCHEMA,
  BODY_SLEEP_SCHEMA,
  normalizeBodySleep,
  normalizeBodySleepRequest
} from "../../body-contracts.js";

export { normalizeBodySleep, normalizeBodySleepRequest };

export function bodySleepContract() {
  return Object.freeze({
    schema: BODY_SLEEP_SCHEMA,
    commandSchema: BODY_SLEEP_REQUEST_SCHEMA,
    thresholdsPortable: true,
    automaticSleepDecisionOwnedByProvider: true,
    stateTransitionOwnedByRegistry: true
  });
}

