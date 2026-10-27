import assert from 'node:assert/strict';
import { createFramePacer } from '../frame-pacing.js';

let clock = 0, running = 0, maximum = 0, calls = 0;
const pacer = createFramePacer({ targetFps: 30, now: () => clock });
assert.throws(() => createFramePacer({ targetFps: 0 }), /FPS/);
assert.throws(() => pacer.setTargetFps(NaN), /FPS/);
let finish;
const pending = pacer.request(async () => {
  calls++; maximum = Math.max(maximum, ++running);
  await new Promise(resolve => { finish = resolve; }); running--; return 'complete';
}, 0);
for (let i = 1; i <= 100; i++) assert.equal((await pacer.request(() => { calls++; }, i)).reason, 'busy');
clock = 500; finish(); assert.equal((await pending).result, 'complete');
assert.equal(calls, 1); assert.equal(maximum, 1);
assert.equal(pacer.getDiagnostics().queuedFrames, 0);
// Missing a large deadline runs once, then starts a fresh interval.
await pacer.request(() => { calls++; }, 5000);
assert.equal((await pacer.request(() => { calls++; }, 5001)).reason, 'cadence');
assert.equal(calls, 2);
pacer.pause(); assert.equal((await pacer.request(() => { calls++; }, 6000)).reason, 'paused');
pacer.resume(); await pacer.request(() => { calls++; }, 6000);
pacer.setTargetFps(60); await pacer.request(() => { calls++; }, 6001);
assert.equal((await pacer.request(() => { calls++; }, 6010)).reason, 'cadence');
await assert.rejects(pacer.request(() => { throw Error('injected render'); }, 6100), /injected render/);
assert.equal(pacer.getDiagnostics().inFlight, false);
await pacer.request(() => { calls++; }, 6200);
pacer.dispose(); pacer.resume();
assert.equal((await pacer.request(() => { calls++; }, 6300)).reason, 'disposed');
assert.equal(pacer.getDiagnostics().failed, 1);
assert.equal(pacer.getDiagnostics().completed, 5);
assert.equal(pacer.getDiagnostics().skippedBusy, 100);
console.log('Graphics pacing: one flight, zero queue, no catch-up, pause/FPS/failure/disposal passed');
