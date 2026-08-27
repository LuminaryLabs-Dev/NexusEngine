import assert from "node:assert/strict";
import { addTimingSample, createTickSyncRecord, remoteTickToLocalTick } from "../multiplayer/tick-sync/index.js";
import { createInboundQueue, drainInbound, enqueueInbound } from "../multiplayer/index.js";

const samples = [
  { localSendMs: 100, remoteReceiveMs: 125, remoteSendMs: 127, localReceiveMs: 152, localTick: 6, remoteTick: 5 },
  { localSendMs: 200, remoteReceiveMs: 226, remoteSendMs: 228, localReceiveMs: 254, localTick: 12, remoteTick: 11 }
];
const replay = () => samples.reduce(addTimingSample, createTickSyncRecord({ tickRate: 60, smoothing: 0.25 }));
assert.deepEqual(replay(), replay());
assert.equal(remoteTickToLocalTick(replay(), 20), 21);

let queue = createInboundQueue();
queue = enqueueInbound(queue, { peerId: "b", channel: "realtime", payload: { sequence: 2 } });
queue = enqueueInbound(queue, { peerId: "a", channel: "control", payload: { type: "ready" } });
const drained = drainInbound(queue);
assert.deepEqual(drained.messages.map(({ order }) => order), [0, 1]);
assert.equal(drained.queue.messages.length, 0);
assert.equal(drained.queue.nextOrder, 2);

console.log("multiplayer-replay ok");
