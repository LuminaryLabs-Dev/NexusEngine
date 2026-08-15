import {
  DEVICE_MEMORY_BUDGET_SCHEMA,
  DEVICE_MEMORY_RESERVATION_SCHEMA,
  assertSortedRecordState,
  normalizeDeviceState,
  normalizeMemoryBudget,
  normalizeMemoryReservation,
  normalizeOperationCommand,
  requireDeviceText
} from "../../device-contracts.js";

export { normalizeMemoryBudget, normalizeMemoryReservation };

export function normalizeBudgetDefinitionCommand(input) {
  const value = normalizeOperationCommand(input, ["budget"], "Render device memory budget definition command");
  return { operationId: value.operationId, budget: normalizeMemoryBudget(value.budget) };
}

export function normalizeBudgetRemovalCommand(input) {
  const value = normalizeOperationCommand(input, ["budgetId"], "Render device memory budget removal command");
  return { operationId: value.operationId, budgetId: requireDeviceText(value.budgetId, "Render device memory budget removal command.budgetId") };
}

export function normalizeReservationCommand(input) {
  const value = normalizeOperationCommand(input, ["reservation"], "Render device memory reservation command");
  return { operationId: value.operationId, reservation: normalizeMemoryReservation(value.reservation) };
}

export function normalizeReservationReleaseCommand(input) {
  const value = normalizeOperationCommand(input, ["reservationId"], "Render device memory release command");
  return { operationId: value.operationId, reservationId: requireDeviceText(value.reservationId, "Render device memory release command.reservationId") };
}

export function normalizeMemorySnapshot(snapshot) {
  return normalizeDeviceState(snapshot, {
    domain: "render-device-memory",
    fields: ["budgets", "budgetOrder", "reservations", "reservationOrder", "memoryRevision"],
    label: "Render Device Memory snapshot",
    validate(state) {
      assertSortedRecordState(state, {
        collection: "budgets",
        order: "budgetOrder",
        revision: "memoryRevision",
        normalizeRecord: normalizeMemoryBudget,
        idField: "budgetId",
        label: "Render Device Memory snapshot"
      });
      assertSortedRecordState(state, {
        collection: "reservations",
        order: "reservationOrder",
        revision: "memoryRevision",
        normalizeRecord: normalizeMemoryReservation,
        idField: "reservationId",
        label: "Render Device Memory snapshot"
      });
    }
  });
}

export function deviceMemoryContract() {
  return Object.freeze({
    budgetSchema: DEVICE_MEMORY_BUDGET_SCHEMA,
    reservationSchema: DEVICE_MEMORY_RESERVATION_SCHEMA,
    units: "bytes",
    exactOnceMutations: true,
    gpuAllocationOwnedExternally: true
  });
}
