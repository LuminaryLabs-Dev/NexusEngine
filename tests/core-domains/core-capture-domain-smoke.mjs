import assert from "node:assert/strict";
import { createCoreCaptureDomain, createRealtimeGame } from "../../src/index.js";

const engine = createRealtimeGame({ kits: createCoreCaptureDomain() });
const capture = engine.n.coreCapture;
assert.equal(engine.n.ownerOf("n:capture"), "core-capture-domain");
assert.equal(typeof capture.request, "function");

const request = {
  id: "oak:views",
  subject: { objectId: "oak", formId: "oak:reduced" },
  viewSet: { pattern: "around-subject", azimuthCount: 4, elevations: [0, 20] },
  observations: ["color", "opacity"],
  output: { kind: "atlas", frameSize: 128 }
};

const waiting = await capture.request(request);
assert.equal(waiting.state, "waiting-for-provider");
structuredClone(capture.getSnapshot());

let executions = 0;
capture.registerProvider({
  id: "headless-capture",
  async capture(next, { updateProgress }) {
    executions += 1;
    updateProgress(1, 2);
    updateProgress(2, 2);
    return {
      observations: Object.fromEntries(next.observations.map((name) => [name, {
        assetId: `${next.id}:${name}`,
        kind: "headless-fixture"
      }]))
    };
  }
});

const [ready] = await capture.resumeWaiting();
assert.equal(ready.state, "ready");
assert.equal(capture.getResult(ready.id).objectId, "oak");
assert.equal(executions, 1);

const duplicate = await capture.request(request);
assert.equal(duplicate.id, ready.id);
assert.equal(executions, 1, "duplicate request does not recapture");
await assert.rejects(capture.request({ ...request, observations: ["depth"] }), /different content/);

const cancelled = await capture.request({
  ...request,
  id: "rock:views",
  providerId: "missing-provider",
  subject: { objectId: "rock" }
});
assert.equal(cancelled.state, "waiting-for-provider");
assert.equal(capture.cancel(cancelled.id), true);
assert.equal(capture.cancel(cancelled.id), true, "capture cancellation is repeat-safe");
assert.equal(capture.getJob(cancelled.id).state, "cancelled");

const snapshot = capture.getSnapshot();
capture.reset();
assert.equal(capture.listJobs().length, 0);
capture.loadSnapshot(snapshot);
assert.equal(capture.getJob(ready.id).state, "ready");
structuredClone(capture.getSnapshot());

console.log("core capture domain smoke ok");
