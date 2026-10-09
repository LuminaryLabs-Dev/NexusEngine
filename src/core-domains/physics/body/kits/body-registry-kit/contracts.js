import {
  BODY_RECORD_SCHEMA,
  BODY_STATE_SCHEMA,
  normalizeBodyDefinitionCommand,
  normalizeBodyRecord,
  normalizeBodyRegistrySnapshot,
  normalizeBodyRemovalCommand,
  normalizeBodyReplacementCommand
} from "../../body-contracts.js";

export {
  normalizeBodyDefinitionCommand,
  normalizeBodyRecord,
  normalizeBodyRegistrySnapshot,
  normalizeBodyRemovalCommand,
  normalizeBodyReplacementCommand
};

export function bodyRegistryContract() {
  return Object.freeze({
    bodySchema: BODY_STATE_SCHEMA,
    recordSchema: BODY_RECORD_SCHEMA,
    operations: Object.freeze(["defineBody", "replaceBody", "removeBody", "sleepBody", "wakeBody", "transitionBody", "commitStep"]),
    queries: Object.freeze(["hasBody", "getBody", "getRecord", "listBodies", "listRecords"]),
    oneStateOwner: true,
    streamingReceiptRetention: "latest-step-only",
    exactOnceCommands: true,
    providerObjectsOwnedExternally: true
  });
}

