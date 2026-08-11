import {
  DEVICE_QUEUE_SCHEMA,
  DEVICE_SUBMISSION_SCHEMA,
  assertSortedRecordState,
  normalizeDeviceQueue,
  normalizeQueueCompletionReceipt,
  normalizeDeviceState,
  normalizeDeviceSubmission,
  normalizeOperationCommand,
  rejectDeviceFields,
  requireDeviceObject,
  requireDeviceText
} from "../../device-contracts.js";

export { normalizeDeviceQueue, normalizeDeviceSubmission };

export function normalizeQueueDefinitionCommand(input) {
  const value = normalizeOperationCommand(input, ["queue"], "Render device queue definition command");
  return { operationId: value.operationId, queue: normalizeDeviceQueue(value.queue) };
}

export function normalizeQueueRemovalCommand(input) {
  const value = normalizeOperationCommand(input, ["queueId"], "Render device queue removal command");
  return { operationId: value.operationId, queueId: requireDeviceText(value.queueId, "Render device queue removal command.queueId") };
}

export function normalizeSubmissionCommand(input) {
  const value = normalizeOperationCommand(input, ["submission"], "Render device submission command");
  return { operationId: value.operationId, submission: normalizeDeviceSubmission(value.submission) };
}

export function normalizeSubmissionCompletionCommand(input) {
  const value = normalizeOperationCommand(input, ["submissionId", "providerReceipt"], "Render device submission completion command");
  return {
    operationId: value.operationId,
    submissionId: requireDeviceText(value.submissionId, "Render device submission completion command.submissionId"),
    providerReceipt: normalizeQueueCompletionReceipt(value.providerReceipt)
  };
}

export function normalizeStoredSubmission(input) {
  requireDeviceObject(input, "Stored Render device submission");
  rejectDeviceFields(input, ["schema", "submissionId", "queueId", "dependencyIds", "payload", "metadata", "status", "providerReceipt"], "Stored Render device submission");
  const submission = normalizeDeviceSubmission({
    schema: input.schema,
    submissionId: input.submissionId,
    queueId: input.queueId,
    dependencyIds: input.dependencyIds,
    payload: input.payload,
    metadata: input.metadata
  });
  if (!["pending", "completed"].includes(input.status)) throw new TypeError("Stored Render device submission.status must be pending or completed.");
  if (input.status === "pending" && input.providerReceipt !== null) {
    throw new TypeError("Pending Render device submission cannot retain a provider receipt.");
  }
  if (input.status === "completed") requireDeviceObject(input.providerReceipt, "Stored Render device submission.providerReceipt");
  return {
    ...submission,
    status: input.status,
    providerReceipt: input.providerReceipt === null ? null : normalizeQueueCompletionReceipt(input.providerReceipt)
  };
}

export function normalizeQueueSnapshot(snapshot) {
  return normalizeDeviceState(snapshot, {
    domain: "render-device-queue",
    fields: ["queues", "queueOrder", "submissions", "submissionOrder", "queueRevision"],
    label: "Render Device Queue snapshot",
    validate(state) {
      assertSortedRecordState(state, {
        collection: "queues",
        order: "queueOrder",
        revision: "queueRevision",
        normalizeRecord: normalizeDeviceQueue,
        idField: "queueId",
        label: "Render Device Queue snapshot"
      });
      assertSortedRecordState(state, {
        collection: "submissions",
        order: "submissionOrder",
        revision: "queueRevision",
        normalizeRecord: normalizeStoredSubmission,
        idField: "submissionId",
        label: "Render Device Queue snapshot"
      });
    }
  });
}

export function deviceQueueContract() {
  return Object.freeze({
    queueSchema: DEVICE_QUEUE_SCHEMA,
    submissionSchema: DEVICE_SUBMISSION_SCHEMA,
    exactOnceMutations: true,
    logicalDescriptorsOnly: true,
    commandEncodingOwnedExternally: true,
    queueExecutionOwnedExternally: true
  });
}
