import {
  canonicalPortable,
  normalizeFailure,
  normalizeLifecycleState,
  normalizeOperationCommand,
  requireFiniteNumber,
  requireNonnegativeInteger,
  requirePositiveInteger,
  requireText
} from "../../lifecycle-contracts.js";

export const PHYSICS_STEP_SCHEMA = "nexusengine.physics-step/1";

export function stepContract() {
  return Object.freeze({
    schema: PHYSICS_STEP_SCHEMA,
    operations: Object.freeze(["request", "complete", "fail"]),
    sequencing: "strict-monotonic-step-id",
    providerExecutionOwnedExternally: true
  });
}

export function normalizeStepRequest(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["stepId", "deltaSeconds", "substeps", "timeScale", "metadata"],
    "physics step request"
  );
  normalized.stepId = requireNonnegativeInteger(normalized.stepId, "physics step request.stepId");
  normalized.deltaSeconds = requireFiniteNumber(
    normalized.deltaSeconds,
    "physics step request.deltaSeconds",
    { minimum: 0, exclusiveMinimum: true }
  );
  normalized.substeps = requirePositiveInteger(normalized.substeps ?? 1, "physics step request.substeps");
  normalized.timeScale = requireFiniteNumber(normalized.timeScale ?? 1, "physics step request.timeScale", { minimum: 0 });
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics step request.metadata");
  return normalized;
}

export function normalizeStepCompletion(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["stepId", "providerId", "frame", "physicsState", "metadata"],
    "physics step completion"
  );
  normalized.stepId = requireNonnegativeInteger(normalized.stepId, "physics step completion.stepId");
  normalized.providerId = requireText(normalized.providerId, "physics step completion.providerId");
  normalized.frame = canonicalPortable(normalized.frame ?? {}, "physics step completion.frame");
  if (normalized.physicsState !== undefined) {
    normalized.physicsState = canonicalPortable(normalized.physicsState, "physics step completion.physicsState");
  }
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics step completion.metadata");
  return normalized;
}

export function normalizeStepFailure(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["stepId", "failure", "metadata"],
    "physics step failure"
  );
  normalized.stepId = requireNonnegativeInteger(normalized.stepId, "physics step failure.stepId");
  normalized.failure = normalizeFailure(normalized.failure);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics step failure.metadata");
  return normalized;
}

export function normalizeStepSnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "physics-step",
    fields: ["nextStepId", "pending", "lastCompleted", "failure"],
    label: "physics step snapshot",
    validate(value) {
      requireNonnegativeInteger(value.nextStepId, "physics step snapshot.nextStepId");
      if (value.pending !== null && typeof value.pending !== "object") {
        throw new TypeError("physics step snapshot.pending must be null or an object.");
      }
    }
  });
}
