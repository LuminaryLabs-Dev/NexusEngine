import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const EconomyState = defineResource("economy.state");
export const EconomyTransactionRequest = defineEvent("economy.transactionRequest");
export const EconomyTransactionCompleted = defineEvent("economy.transactionCompleted");
export const EconomyTransactionRejected = defineEvent("economy.transactionRejected");

function normalizeAccounts(accounts = {}) {
  return Object.fromEntries(Object.entries(accounts).map(([id, value]) => [id, Number(value ?? 0)]));
}

function initialState(config = {}) {
  const dataset = config.economyDataset ?? config;
  return {
    id: dataset.id ?? "economy",
    accounts: normalizeAccounts(dataset.accounts ?? { cash: 0 }),
    ledger: [],
    sequence: 0
  };
}

function applyTransaction(state, request = {}) {
  const account = request.account ?? "cash";
  const amount = Number(request.amount ?? 0);
  const accounts = { ...state.accounts };
  const before = Number(accounts[account] ?? 0);
  const after = before + amount;
  const allowNegative = request.allowNegative === true;

  if (!allowNegative && after < 0) {
    return {
      state,
      rejected: {
        id: request.id ?? `transaction-${state.sequence + 1}`,
        account,
        amount,
        before,
        after,
        reason: "insufficient-funds",
        metadata: request.metadata ?? {}
      }
    };
  }

  accounts[account] = after;
  const transaction = {
    id: request.id ?? `transaction-${state.sequence + 1}`,
    account,
    amount,
    before,
    after,
    source: request.source ?? "system",
    metadata: request.metadata ?? {}
  };
  const ledger = [...state.ledger, transaction].slice(-Number(request.ledgerLimit ?? 120));
  return {
    state: { ...state, accounts, ledger, sequence: state.sequence + 1 },
    completed: transaction
  };
}

function economySystem(world) {
  let state = world.getResource(EconomyState);
  if (!state) return;

  for (const request of world.readEvents(EconomyTransactionRequest)) {
    const result = applyTransaction(state, request);
    state = result.state;
    if (result.completed) world.emit(EconomyTransactionCompleted, result.completed);
    if (result.rejected) world.emit(EconomyTransactionRejected, result.rejected);
  }

  world.setResource(EconomyState, state);
}

export function createEconomyKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "economy-kit",
    resources: { EconomyState },
    events: { EconomyTransactionRequest, EconomyTransactionCompleted, EconomyTransactionRejected },
    systems: [{ phase: "resolve", system: economySystem, name: "economySystem" }],
    provides: ["economy"],
    initWorld({ world }) {
      world.setResource(EconomyState, initialState(config));
    },
    install({ engine }) {
      engine.economy = {
        getState() {
          return engine.world.getResource(EconomyState);
        },
        canAfford(account = "cash", amount = 0) {
          const state = engine.world.getResource(EconomyState);
          return Number(state.accounts?.[account] ?? 0) >= Math.max(0, Number(amount ?? 0));
        },
        transact(request = {}) {
          engine.world.emit(EconomyTransactionRequest, request);
          engine.tick(0);
          return engine.world.getResource(EconomyState);
        },
        reset() {
          engine.world.setResource(EconomyState, initialState(config));
          return engine.world.getResource(EconomyState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(EconomyState));
        }
      };
    },
    metadata: { purpose: "Generic accounts, transactions, affordability, and ledgers." }
  });
}
