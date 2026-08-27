import assert from "node:assert/strict";
import { createEngine } from "../../../index.js";
import { createNetworkDomain } from "../index.js";

const engine = createEngine({ domainKits: createNetworkDomain() });
assert.equal(engine.n.ownerOf("n:network"), "network-contract-kit");
assert.equal(engine.n.ownerOf("n:network:transport"), "network-transport-contract-kit");
assert.equal(engine.n.ownerOf("n:network:multiplayer"), "multiplayer-contract-kit");
assert.equal(engine.n.ownerOf("n:network:multiplayer:session"), "multiplayer-session-kit");
assert.equal(engine.n.ownerOf("n:network:multiplayer:authority"), "multiplayer-authority-kit");
assert.equal(engine.n.ownerOf("n:network:multiplayer:tick-sync"), "multiplayer-tick-sync-kit");
assert.equal(engine.n.ownerOf("n:network:multiplayer:replication"), "multiplayer-replication-kit");
assert.equal(engine.n.multiplayerContracts.protocolVersion, 1);
assert.equal(typeof engine.n.multiplayerReplication.acceptSnapshotEnvelope, "function");

const snapshot = Object.fromEntries(engine.n.apis().map(({ name }) => [name, engine.n[name].getSnapshot()]));
const restored = createEngine({ domainKits: createNetworkDomain() });
for (const [name, value] of Object.entries(snapshot)) restored.n[name].loadSnapshot(value);
assert.deepEqual(Object.fromEntries(restored.n.apis().map(({ name }) => [name, restored.n[name].getSnapshot()])), snapshot);

console.log("multiplayer-composition ok");
