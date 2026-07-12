# Core Transaction Ledger Kit

`core-transaction-ledger-kit` provides renderer-agnostic, portable idempotency ledgers for durable operations.

## Purpose

Use the kit when a semantic operation must apply at most once even if the same command is replayed, restored from a snapshot, retried by a host, or delivered more than once.

Typical identities include:

```txt
inventory transactionId
reward claimId
crop planting operationId
harvest operationId
forage collection operationId
save migration operationId
```

## Boundary

The kit owns:

```txt
ledger identity
operation identity
repeat detection
portable operation result records
operation and duplicate diagnostics
snapshot and reset behavior
```

It does not own game-specific validation, balances, crop rules, quest meaning, transport, or rendering.

## API

```js
const ledger = engine.n.coreTransactionLedger;

ledger.ensureLedger("farming");
ledger.has("farming", "plant:plot-1:17");
ledger.record("farming", "plant:plot-1:17", { plotId: "plot-1" });
ledger.applyOnce("inventory", "pickup:coconut-4", () => addCoconut());
ledger.list("farming");
```

`applyOnce()` executes its callback only for a previously unseen operation ID. Duplicate calls return the original portable result.

## Determinism and persistence

Ledger state is a normal NexusEngine resource. `getSnapshot()` and `loadSnapshot()` preserve applied operation identities and results, so a command remains deduplicated after save/restore.
