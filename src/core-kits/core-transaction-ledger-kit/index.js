import { createCoreCapabilityKit } from "../core-capability-kit.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function normalizeId(value, label) {
  const next = String(value ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty id.`);
  return next;
}

function createInitialState(config = {}) {
  return {
    ledgers: clone(config.ledgers ?? {}),
    operationCount: 0,
    duplicateCount: 0
  };
}

export function createCoreTransactionLedgerKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-core-transaction-ledger-kit",
    domain: "core-transaction-ledger",
    apiName: config.apiName ?? "coreTransactionLedger",
    version: config.version ?? "0.0.3",
    stability: config.stability ?? "stable-candidate",
    purpose: "Portable idempotency ledgers for repeat-safe commands, transactions, claims, harvests, and other durable operations.",
    owns: [
      "stable ledger identity",
      "durable operation identity",
      "repeat detection",
      "portable operation results",
      "operation and duplicate diagnostics"
    ],
    doesNotOwn: [
      "game-specific validation",
      "inventory balances",
      "crop lifecycle rules",
      "network transport",
      "renderer state"
    ],
    services: ["ledger", "idempotency", "snapshot", "reset"],
    initialState: createInitialState(config),
    createApi({ baseApi }) {
      const state = () => baseApi.getState();
      const ledgers = () => state()?.ledgers ?? {};

      function ensureLedger(ledgerId) {
        const id = normalizeId(ledgerId, "ledger");
        if (ledgers()[id]) return id;
        baseApi.update({
          ledgers: {
            ...ledgers(),
            [id]: { id, operations: {}, sequence: 0 }
          }
        }, "descriptorChanged");
        return id;
      }

      function getRecord(ledgerId, operationId) {
        const ledger = ledgers()[normalizeId(ledgerId, "ledger")];
        return clone(ledger?.operations?.[normalizeId(operationId, "operation")] ?? null);
      }

      function record(ledgerId, operationId, result = null, metadata = {}) {
        const ledgerKey = ensureLedger(ledgerId);
        const operationKey = normalizeId(operationId, "operation");
        const currentState = state();
        const currentLedger = currentState.ledgers[ledgerKey];
        const existing = currentLedger.operations[operationKey];
        if (existing) {
          baseApi.update({ duplicateCount: Number(currentState.duplicateCount ?? 0) + 1 }, "updated");
          return { applied: false, duplicate: true, record: clone(existing) };
        }

        const entry = {
          id: operationKey,
          sequence: Number(currentLedger.sequence ?? 0) + 1,
          result: clone(result),
          metadata: clone(metadata ?? {})
        };
        baseApi.update({
          ledgers: {
            ...currentState.ledgers,
            [ledgerKey]: {
              ...currentLedger,
              sequence: entry.sequence,
              operations: {
                ...currentLedger.operations,
                [operationKey]: entry
              }
            }
          },
          operationCount: Number(currentState.operationCount ?? 0) + 1
        }, "updated");
        return { applied: true, duplicate: false, record: clone(entry) };
      }

      function applyOnce(ledgerId, operationId, operation, metadata = {}) {
        if (typeof operation !== "function") throw new TypeError("applyOnce requires an operation function.");
        const existing = getRecord(ledgerId, operationId);
        if (existing) {
          const currentState = state();
          baseApi.update({ duplicateCount: Number(currentState.duplicateCount ?? 0) + 1 }, "updated");
          return { applied: false, duplicate: true, result: clone(existing.result), record: existing };
        }
        const result = operation();
        const recorded = record(ledgerId, operationId, result, metadata);
        return { ...recorded, result: clone(result) };
      }

      return {
        ensureLedger,
        has(ledgerId, operationId) {
          return Boolean(getRecord(ledgerId, operationId));
        },
        get: getRecord,
        record,
        applyOnce,
        list(ledgerId) {
          const ledger = ledgers()[normalizeId(ledgerId, "ledger")];
          return Object.values(ledger?.operations ?? {})
            .sort((left, right) => left.sequence - right.sequence)
            .map(clone);
        },
        clear(ledgerId) {
          const id = normalizeId(ledgerId, "ledger");
          if (!ledgers()[id]) return false;
          const next = { ...ledgers() };
          delete next[id];
          baseApi.update({ ledgers: next }, "updated");
          return true;
        }
      };
    },
    metadata: {
      ...(config.metadata ?? {}),
      rendererAgnostic: true,
      deterministic: true,
      portable: true,
      contractSchema: "nexus-transaction-ledger/1"
    }
  });
}

export default createCoreTransactionLedgerKit;
