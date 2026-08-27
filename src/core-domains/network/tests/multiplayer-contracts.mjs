import assert from "node:assert/strict";
import { validateTransportProvider, assertPortableMessage } from "../transport/index.js";
import { createSessionRecord, transitionSession } from "../multiplayer/session/index.js";
import { assignAuthority, createAuthorityRecord } from "../multiplayer/authority/index.js";
import { acceptInputEnvelope, acceptSnapshotEnvelope, createInputEnvelope, createReplicationRecord, createSnapshotEnvelope } from "../multiplayer/replication/index.js";

const provider = Object.fromEntries(["initialize", "createSession", "joinSession", "sendControl", "sendRealtime", "getStats", "close", "reset", "dispose"].map((name) => [name, () => {}]));
provider.id = "memory";
provider.capabilities = { control: "reliable", realtime: "latency-first" };
assert.equal(validateTransportProvider(provider).id, "memory");
assert.throws(() => validateTransportProvider({ id: "broken" }), /requires initialize/);
assert.throws(() => assertPortableMessage({ fn() {} }), /JSON-portable/);

let session = createSessionRecord();
session = transitionSession(session, "creating");
session = transitionSession(session, "waiting", { sessionId: "room-a" });
assert.equal(session.phase, "waiting");
assert.throws(() => transitionSession(session, "ready"), /Cannot transition/);

const authority = assignAuthority(createAuthorityRecord(), { peerId: "host", role: "host", stateKeys: ["world"] });
assert.equal(authority.hostPeerId, "host");
assert.throws(() => assignAuthority(authority, { peerId: "guest", role: "host" }), /already host/);
assert.deepEqual(authority.owners, { world: "host" });

let replication = createReplicationRecord();
const input = createInputEnvelope({ peerId: "guest", sequence: 1, tick: 10, input: { move: 1 } });
let result = acceptInputEnvelope(replication, input);
assert.equal(result.accepted, true);
replication = result.record;
assert.equal(acceptInputEnvelope(replication, input).accepted, false);
const snapshot = createSnapshotEnvelope({ sequence: 2, tick: 12, acknowledgements: { guest: 1 }, state: { x: 4 } });
result = acceptSnapshotEnvelope(replication, snapshot);
assert.equal(result.accepted, true);
assert.equal(acceptSnapshotEnvelope(result.record, snapshot).reason, "stale");

console.log("multiplayer-contracts ok");
