import assert from "node:assert/strict";

import { createEngine } from "../../../engine.js";
import { createTransactionLedgerKit } from "../../runtime/subdomains/transaction/kits/transaction-ledger-kit/index.js";
import { createScheduleKit } from "../../runtime/subdomains/sequence/subdomains/schedule/kits/schedule-kit/index.js";
import { createSimulationKit } from "../kits/simulation-kit/index.js";
import { createEconomyAccountKit } from "../subdomains/economy/subdomains/accounts/kits/economy-account-kit/index.js";
import { createCargoManifestKit } from "../subdomains/economy/subdomains/cargo/kits/cargo-manifest-kit/index.js";
import { createFacilityOperationsKit } from "../subdomains/operations/subdomains/facility/kits/facility-operations-kit/index.js";
import { createOccupantFlowKit } from "../subdomains/operations/subdomains/occupant-flow/kits/occupant-flow-kit/index.js";
import { createTransportRouteKit } from "../subdomains/operations/subdomains/transport-route/kits/transport-route-kit/index.js";

assert.throws(() => createEconomyAccountKit({ accounts: { cash: Number.NaN } }), /finite/);
assert.throws(() => createFacilityOperationsKit({ facilities: [{ id: "bad", output: { account: "cash", amount: Number.POSITIVE_INFINITY } }] }), /finite/);

const cargoMetadata = { nested: { quality: "clean" } };
const engine = createEngine({ kits: [
  createTransactionLedgerKit(),
  createSimulationKit(),
  createEconomyAccountKit({ accounts: { cash: 10 }, ledgerLimit: 0 }),
  createCargoManifestKit({ capacity: 10, quota: 4, items: [{ id: "crate", value: 4, quantity: 1, weight: 2, metadata: cargoMetadata }] }),
  createFacilityOperationsKit({ facilities: [{ id: "mill", intervalSeconds: 10, firstAt: 10, output: { account: "cash", amount: 2 }, metadata: { nested: true } }] }),
  createOccupantFlowKit({ spawnRules: [{ id: "visitor", intervalSeconds: 2, firstAt: 2, limit: 3, need: "service" }] }),
  createTransportRouteKit({ stops: [{ id: "a" }, { id: "b" }, { id: "c" }], carriers: [{ id: "bus", stop: "a", speedStopsPerSecond: 1, capacity: 2 }] }),
  createScheduleKit({ cycles: [{ id: "pulse", intervalSeconds: 2 }, { id: "once", firstAt: 1, intervalSeconds: 1, repeat: false }] })
] });
cargoMetadata.nested.quality = "mutated";
assert.equal(engine.n.cargoManifest.getState().items[0].metadata.nested.quality, "clean");

const transaction = engine.n.economy.transact({ operationId: "economy:1", account: "cash", amount: 5, metadata: { nested: { source: true } } });
const transactionState = engine.n.economy.getSnapshot();
assert.equal(transaction.result.transaction.after, 15);
assert.equal(engine.n.economy.getState().ledger.length, 0);
assert.deepEqual(engine.n.economy.transact({ operationId: "economy:1", account: "cash", amount: 5, metadata: { nested: { source: true } } }), transaction);
assert.deepEqual(engine.n.economy.getSnapshot(), transactionState);
assert.throws(() => engine.n.economy.transact({ operationId: "economy:1", account: "cash", amount: 6 }), /different content/);

engine.n.cargoManifest.pickUp({ operationId: "cargo:pickup", itemId: "crate", carrierId: "pilot" });
const deposit = engine.n.cargoManifest.deposit({ operationId: "cargo:deposit", carrierId: "pilot", zoneId: "dock" });
assert.equal(deposit.result.value, 4);
assert.equal(engine.n.cargoManifest.getState().quotaComplete, true);

const facilities = engine.n.facilityOperations.advance({ operationId: "facility:advance", delta: 35 });
assert.equal(facilities.result.outputs.length, 3);
assert.deepEqual(structuredClone(facilities.result), facilities.result);
assert.equal(engine.n.economy.getState().accounts.cash, 15, "facility output does not mutate Economy without an adapter");

const occupants = engine.n.occupantFlow.advance({ operationId: "occupants:advance", delta: 6 });
assert.equal(occupants.result.spawned.length, 3);
const occupantSnapshot = engine.n.occupantFlow.getSnapshot();
engine.n.occupantFlow.reset();
engine.n.occupantFlow.reset();
assert.equal(engine.n.occupantFlow.getState().spawnRules[0].nextAt, 2);
engine.n.occupantFlow.loadSnapshot(occupantSnapshot);
assert.equal(engine.n.occupantFlow.getState().spawnRules[0].nextAt, 8);

engine.n.transportRoutes.call({ operationId: "transport:call", riderId: "rider", from: "a", to: "c", metadata: { nested: { keep: true } } });
const route = engine.n.transportRoutes.advance({ operationId: "transport:advance", delta: 2.5 });
assert.equal(route.result.arrivals.length, 1);
assert.equal(route.result.carriers[0].stop, "c");
assert.equal(route.result.carriers[0].progress, 0.5);

const schedule = engine.n.schedule.advance({ operationId: "schedule:advance", delta: 5.5 });
assert.equal(schedule.result.occurrences.filter((entry) => entry.id === "pulse").length, 2);
assert.equal(engine.n.schedule.getState().cycles.find((cycle) => cycle.id === "pulse").nextAt, 6);
const oneShot = engine.n.schedule.getState().cycles.find((cycle) => cycle.id === "once");
assert.equal(oneShot.active, false);
assert.equal(oneShot.nextAt, null);
assert.throws(() => engine.n.schedule.setScale({ operationId: "schedule:scale", scale: Number.NaN }), /finite/);

console.log("restored Economy and Operations behaviors: ok");
