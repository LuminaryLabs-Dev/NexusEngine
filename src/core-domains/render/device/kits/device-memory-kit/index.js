import { createDomainKit } from "../../../../domain-kit.js";
import {
  deviceMemoryContract,
  normalizeBudgetDefinitionCommand,
  normalizeBudgetRemovalCommand,
  normalizeMemoryBudget,
  normalizeMemoryReservation,
  normalizeMemorySnapshot,
  normalizeReservationCommand,
  normalizeReservationReleaseCommand
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render device memory requires public capability ${name}.`);
  return api;
}

function usageFor(state, budgetId) {
  const reservations = Object.values(state.reservations).filter((entry) => entry.budgetId === budgetId);
  const usedBytes = reservations.reduce((sum, entry) => sum + entry.sizeBytes, 0);
  const budget = state.budgets[budgetId];
  return {
    schema: "nexusengine.render-device-memory-usage/1",
    budgetId,
    capacityBytes: budget.capacityBytes,
    warningBytes: budget.warningBytes,
    usedBytes,
    availableBytes: budget.capacityBytes - usedBytes,
    overWarning: usedBytes > budget.warningBytes,
    reservationCount: reservations.length
  };
}

export function createDeviceMemoryKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "device-memory-kit",
    id: config.id ?? "device-memory-kit",
    domain: "render-device-memory",
    domainPath: "n:render:device",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderDeviceMemory",
    requires: ["n:render:device", "render:device-contract", "render:device-limit", "render:device-capability"],
    provides: ["render:device-memory"],
    purpose: "Own portable memory budgets, semantic reservations, and exact-once accounting receipts.",
    owns: ["memory budget records", "semantic memory reservations", "portable usage reports"],
    doesNotOwn: ["GPU allocation", "resource handles", "provider memory queries", "eviction execution"],
    initialState: {
      budgets: {},
      budgetOrder: [],
      reservations: {},
      reservationOrder: [],
      memoryRevision: 0
    },
    createApi({ baseApi, engine }) {
      const capabilities = () => requiredApi(engine, "renderDeviceCapabilities");
      function getBudget(budgetId) {
        return baseApi.getState().budgets[String(budgetId)] ?? null;
      }
      function getReservation(reservationId) {
        return baseApi.getState().reservations[String(reservationId)] ?? null;
      }
      function validateBudget(budget) {
        if (!capabilities().hasCapability(budget.capabilityId)) {
          throw new TypeError(`Render device memory budget ${budget.budgetId} references unknown capability ${budget.capabilityId}.`);
        }
        return budget;
      }
      function validateState(state) {
        Object.values(state.budgets).forEach(validateBudget);
        for (const reservation of Object.values(state.reservations)) {
          if (!state.budgets[reservation.budgetId]) {
            throw new TypeError(`Render device memory reservation ${reservation.reservationId} references unknown budget ${reservation.budgetId}.`);
          }
        }
        for (const budgetId of state.budgetOrder) {
          const usage = usageFor(state, budgetId);
          if (usage.usedBytes > usage.capacityBytes) throw new TypeError(`Render device memory budget ${budgetId} is over capacity.`);
        }
        return state;
      }
      return {
        ...baseApi,
        getContract: deviceMemoryContract,
        normalizeBudget: normalizeMemoryBudget,
        normalizeReservation: normalizeMemoryReservation,
        defineBudget(command = {}) {
          const request = normalizeBudgetDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            validateBudget(request.budget);
            const existing = state.budgets[request.budget.budgetId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.budget)) {
              throw new TypeError(`Render device memory budget ${request.budget.budgetId} already exists with different content.`);
            }
            const created = !existing;
            const budgets = created ? { ...state.budgets, [request.budget.budgetId]: request.budget } : state.budgets;
            const memoryRevision = created ? state.memoryRevision + 1 : state.memoryRevision;
            return {
              patch: { budgets, budgetOrder: Object.keys(budgets).sort(), memoryRevision },
              result: { budget: request.budget, created, memoryRevision }
            };
          });
        },
        removeBudget(command = {}) {
          const request = normalizeBudgetRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (!state.budgets[request.budgetId]) throw new TypeError(`Unknown Render device memory budget ${request.budgetId}.`);
            if (Object.values(state.reservations).some((entry) => entry.budgetId === request.budgetId)) {
              throw new TypeError(`Render device memory budget ${request.budgetId} still has reservations.`);
            }
            const budgets = { ...state.budgets };
            delete budgets[request.budgetId];
            return {
              patch: { budgets, budgetOrder: Object.keys(budgets).sort(), memoryRevision: state.memoryRevision + 1 },
              result: { budgetId: request.budgetId, removed: true, memoryRevision: state.memoryRevision + 1 }
            };
          });
        },
        reserve(command = {}) {
          const request = normalizeReservationCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const budget = state.budgets[request.reservation.budgetId];
            if (!budget) throw new TypeError(`Unknown Render device memory budget ${request.reservation.budgetId}.`);
            const existing = state.reservations[request.reservation.reservationId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.reservation)) {
              throw new TypeError(`Render device memory reservation ${request.reservation.reservationId} already exists with different content.`);
            }
            const currentUsage = usageFor(state, budget.budgetId);
            if (!existing && currentUsage.usedBytes + request.reservation.sizeBytes > budget.capacityBytes) {
              throw new TypeError(`Render device memory budget ${budget.budgetId} capacity would be exceeded.`);
            }
            const created = !existing;
            const reservations = created
              ? { ...state.reservations, [request.reservation.reservationId]: request.reservation }
              : state.reservations;
            const memoryRevision = created ? state.memoryRevision + 1 : state.memoryRevision;
            const nextState = { ...state, reservations, memoryRevision };
            return {
              patch: { reservations, reservationOrder: Object.keys(reservations).sort(), memoryRevision },
              result: { reservation: request.reservation, created, usage: usageFor(nextState, budget.budgetId), memoryRevision }
            };
          });
        },
        release(command = {}) {
          const request = normalizeReservationReleaseCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const reservation = state.reservations[request.reservationId];
            if (!reservation) throw new TypeError(`Unknown Render device memory reservation ${request.reservationId}.`);
            const reservations = { ...state.reservations };
            delete reservations[request.reservationId];
            const memoryRevision = state.memoryRevision + 1;
            const nextState = { ...state, reservations, memoryRevision };
            return {
              patch: { reservations, reservationOrder: Object.keys(reservations).sort(), memoryRevision },
              result: { reservationId: request.reservationId, released: true, usage: usageFor(nextState, reservation.budgetId), memoryRevision }
            };
          });
        },
        hasBudget(budgetId) {
          return Boolean(getBudget(budgetId));
        },
        getBudget,
        listBudgets() {
          const state = baseApi.getState();
          return state.budgetOrder.map((id) => state.budgets[id]);
        },
        getReservation,
        listReservations(budgetId = null) {
          const state = baseApi.getState();
          return state.reservationOrder
            .map((id) => state.reservations[id])
            .filter((entry) => budgetId === null || entry.budgetId === budgetId);
        },
        getUsage(budgetId) {
          const state = baseApi.getState();
          if (!state.budgets[String(budgetId)]) throw new TypeError(`Unknown Render device memory budget ${budgetId}.`);
          return usageFor(state, String(budgetId));
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeMemorySnapshot(snapshot)));
        }
      };
    }
  });
}

export default createDeviceMemoryKit;
