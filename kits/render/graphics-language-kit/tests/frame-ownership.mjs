import assert from 'node:assert/strict';
import { createEngine } from 'nexusengine';
import { installGraphicsLanguage, createFrameHost, createCanvasHost, CAPABILITIES, normalizeFrame } from 'nexusengine/domains/render/graphics-language';
import { createFrameStore, registerFrameSource, acquireCompletedFrame, releaseFrame, prepareHostFrame, discardHostFrame, captureHostRollback, restoreHostRollback, releaseHostRollback } from '../frame-ownership.js';

const metadata = (serial = 1, width = 4, height = 3) => ({ frameId: 'frame-' + serial, serial, width, height });
const allocationStore = createFrameStore();
allocationStore.publish({ ...metadata(), stride: 16, pixels: new Uint8ClampedArray(48).fill(6) });
const Allocator = globalThis.Uint8ClampedArray;
globalThis.Uint8ClampedArray = new Proxy(Allocator, { construct(target, argumentsList) {
  if (argumentsList[0] === 84) throw RangeError('injected output allocation failure');
  return Reflect.construct(target, argumentsList);
} });
try { assert.throws(() => allocationStore.acquireDestination(metadata(2, 7, 3)), /allocation failure/); }
finally { globalThis.Uint8ClampedArray = Allocator; }
assert.equal(allocationStore.capture().pixels[0], 6);
const recoveredDestination = allocationStore.acquireDestination(metadata(2, 7, 3));
recoveredDestination.pixels.fill(7); allocationStore.publishOwned(recoveredDestination);
assert.equal(allocationStore.capture().pixels[0], 7); allocationStore.clear();
const store = createFrameStore();
const provider = { getCompletedFrame: () => store.capture() };
registerFrameSource(provider, store);
function publish(serial, width = 4, height = 3) {
  const destination = store.acquireDestination(metadata(serial, width, height));
  destination.pixels.fill(serial); store.publishOwned(destination);
}
publish(1);
const held = store.capture(); held.pixels[0] = 99;
assert.equal(store.capture().pixels[0], 1);
const first = await acquireCompletedFrame(provider);
publish(2); const second = await acquireCompletedFrame(provider);
publish(3);
assert.throws(() => store.acquireDestination(metadata(4)), /exhausted/);
assert.equal(first.frame.pixels[0], 1); assert.equal(second.frame.pixels[0], 2);
releaseFrame(first); releaseFrame(first); releaseFrame(second);
for (let i = 4; i < 100; i++) publish(i);
assert.equal(store.getDiagnostics().slots, 3);
assert.equal(store.getDiagnostics().allocations, 3);
const stable = store.capture();
const failed = store.acquireDestination(metadata(100, 8, 6)); failed.pixels.fill(0);
store.discardDestination(failed);
assert.deepEqual(store.capture(), stable);
publish(101, 8, 6); assert.equal(stable.width, 4); assert.equal(stable.pixels[1], 99);

// Externally supplied arrays and public callback/capture arrays never become
// the host's authoritative last good pixels.
const callbacks = [];
const host = createFrameHost({ present: frame => { callbacks.push(frame); frame.pixels.fill(240); } });
const source = { ...metadata(), stride: 16, pixels: new Uint8ClampedArray(48).fill(8) };
const token = host.prepare(source, { generation: 0 });
source.pixels.fill(7); host.commit(token);
assert.equal(host.capture().pixels[0], 8);
assert.throws(() => host.commit(token), /consumed/);
const captured = host.capture(); captured.pixels.fill(200);
assert.equal(host.capture().pixels[0], 8);
const checkpoint = captureHostRollback(host);
const lease = await acquireCompletedFrame(provider);
const stage = prepareHostFrame(host, lease, { generation: 1 }); releaseFrame(lease);
host.commit(stage);
restoreHostRollback(host, checkpoint, { generation: 0 }); releaseHostRollback(checkpoint);
assert.equal(host.capture().pixels[0], 8);
callbacks.forEach(frame => frame.pixels.fill(0));
assert.equal(host.capture().pixels[0], 8);
const stale = host.prepare(source, { generation: 0 });
const newer = host.prepare(source, { generation: 2 }); host.commit(newer);
assert.throws(() => host.commit(stale), /Stale/);
assert.equal(host.getDiagnostics().stagedFrames, 0);
host.dispose(); assert.equal(host.getDiagnostics().retainedFrames, 0);

// A completed Canvas presentation consumes a private lease without another host
// clone. Browser ImageData/putImageData consumption is synchronous.
const PreviousImageData = globalThis.ImageData;
globalThis.ImageData = class { constructor(pixels, width, height) { this.data = pixels; this.width = width; this.height = height; } };
try {
  const drawn = [];
  const canvas = { ownerDocument: {}, width: 4, height: 3, getContext: () => ({ putImageData: image => drawn.push(image.data[0]) }) };
  const canvasHost = createCanvasHost(canvas);
  for (let i = 102; i < 130; i++) {
    publish(i, 4, 3);
    const owned = await acquireCompletedFrame(provider);
    const prepared = prepareHostFrame(canvasHost, owned, { generation: 0 });
    releaseFrame(owned); canvasHost.commit(prepared);
  }
  assert.equal(canvasHost.getDiagnostics().copiedBytes, 0);
  assert.equal(canvasHost.getDiagnostics().retainedFrames, 1);
  assert.equal(drawn.at(-1), 129);
  const output = canvasHost.capture();
  store.clear(); assert.equal(output.pixels[0], 129);
  canvasHost.dispose(); assert.equal(store.getDiagnostics().allocatedBytes, 0);
} finally { globalThis.ImageData = PreviousImageData; }

// Exercise installed session failure, rollback and stale async preparation using
// a real ownership store and a minimal provider, without loading a renderer.
function selected(id) {
  const frames = createFrameStore(); let pending, serial = 0, fail = false;
  const p = {
    id, version: 'test', capabilities: CAPABILITIES,
    initialize() {}, createResource() {}, updateResource() {}, releaseResource() {},
    beginFrame(frame) { pending = normalizeFrame(frame); }, executePass() {},
    submitFrame() {
      if (fail) throw Error('injected submission failure');
      const f = frames.acquireDestination({ frameId: pending.frameId, width: pending.width, height: pending.height, serial: ++serial });
      f.pixels.fill(serial); frames.publishOwned(f);
    },
    getCompletedFrame: () => frames.capture(), cancelFrame() {},
    reset: () => frames.clear(), dispose: () => frames.clear(),
    getDiagnostics: () => ({ framePool: frames.getDiagnostics() }),
    setFailure(value) { fail = value; }
  };
  registerFrameSource(p, frames);
  return { provider: p, reservationBytes: 1024 * 1024, frames };
}
const active = selected('active'), memoryHost = createFrameHost();
const engine = createEngine(), graphics = installGraphicsLanguage(engine, { selection: active, host: memoryHost });
await graphics.ready;
const spec = id => ({ frame: { frameId: id, width: 4, height: 3 }, draws: [] });
await graphics.render(spec('first')); const before = graphics.capture();
active.provider.setFailure(true);
await assert.rejects(graphics.render(spec('failed')), /submission failure/);
assert.deepEqual(graphics.capture(), before);
active.provider.setFailure(false);
const originalCommit = engine.n.renderInstallation.commitHandover;
engine.n.renderInstallation.commitHandover = () => { throw Error('injected lifecycle failure'); };
const candidate = selected('candidate');
await assert.rejects(graphics.switchRenderer({ operationId: 'rollback', selection: candidate }), /lifecycle failure/);
engine.n.renderInstallation.commitHandover = originalCommit;
assert.deepEqual(graphics.capture(), before);
assert.equal(candidate.frames.getDiagnostics().allocatedBytes, 0);
assert.equal(memoryHost.getDiagnostics().stagedFrames, 0);
await graphics.render(spec('usable')); assert.equal(before.pixels[0], 1);
await graphics.reset(); assert.equal(memoryHost.getDiagnostics().retainedBytes, 0);
assert.equal(active.frames.getDiagnostics().allocatedBytes, 0);
await graphics.render(spec('after-reset')); const retained = graphics.capture();
await graphics.dispose(); assert.equal(retained.pixels[0], 3);
assert.equal(active.frames.getDiagnostics().allocatedBytes, 0);

// A custom async host deliberately remains outside the private protocol.
let resolvePrepare, enteredPrepare;
const entered = new Promise(resolve => { enteredPrepare = resolve; });
const custom = { kind: 'rgba8', prepare: (frame, tag) => { enteredPrepare(); return new Promise(resolve => { resolvePrepare = () => resolve({ frame, tag }); }); }, commit: () => { throw Error('stale frame must not commit'); }, rollback() {}, capture: () => null, dispose() {} };
const staleSelection = selected('stale');
const staleSession = installGraphicsLanguage(createEngine(), { selection: staleSelection, host: custom });
await staleSession.ready;
const rendering = staleSession.render(spec('stale'));
await entered; const disposing = staleSession.dispose(); resolvePrepare();
await assert.rejects(rendering, /Stale renderer/); await disposing;
assert.equal(staleSelection.frames.getDiagnostics().allocatedBytes, 0);

let externalLast = null;
const externalHost = { kind: 'rgba8', prepare: (frame, tag) => ({ frame, tag }), commit: stage => { externalLast = stage.frame; return { presented: true }; },
  capture: () => externalLast, rollback: previous => { externalLast = previous; }, dispose() { externalLast = null; } };
const externalSelection = selected('external'), external = installGraphicsLanguage(createEngine(), { selection: externalSelection, host: externalHost });
await external.ready; await external.render(spec('external-first'));
const externalCapture = external.capture(); externalCapture.pixels.fill(77);
assert.equal(external.capture().pixels[0], 1);
await external.render(spec('external-second'));
assert.equal(externalCapture.pixels[0], 77);
assert(external.getState().diagnostics.session.copiedBytes > 0);
await external.dispose(); assert.equal(externalSelection.frames.getDiagnostics().allocatedBytes, 0);

const cleanupSelection = selected('cleanup'), cleanupHost = createFrameHost();
let rejectCleanup = true;
const cleanup = cleanupSelection.provider.dispose;
cleanupSelection.provider.dispose = () => { if (rejectCleanup) { rejectCleanup = false; throw Error('injected cleanup failure'); } return cleanup(); };
const cleanupSession = installGraphicsLanguage(createEngine(), { selection: cleanupSelection, host: cleanupHost });
await cleanupSession.ready; await cleanupSession.render(spec('cleanup'));
await assert.rejects(cleanupSession.dispose(), /cleanup failure/);
assert.equal(cleanupHost.getDiagnostics().retainedBytes, 0);
await cleanupSession.dispose(); assert.equal(cleanupSelection.frames.getDiagnostics().allocatedBytes, 0);

let stagedCandidate, completePrepare, lastCustom;
const candidatePrepared = new Promise(resolve => { stagedCandidate = resolve; });
const cancelHost = { kind: 'rgba8', prepare(frame, tag) {
  if (tag.generation === 0) return { frame, tag };
  stagedCandidate(); return new Promise(resolve => { completePrepare = () => resolve({ frame, tag }); });
}, commit(stage) { lastCustom = stage.frame; return { presented: true }; }, rollback(frame) { lastCustom = frame; }, capture: () => lastCustom, dispose() { lastCustom = null; } };
const cancelActive = selected('cancel-active'), cancelCandidate = selected('cancel-candidate');
const cancelSession = installGraphicsLanguage(createEngine(), { selection: cancelActive, host: cancelHost });
await cancelSession.ready; await cancelSession.render(spec('cancel-first'));
const cancelBefore = cancelSession.capture();
const switching = cancelSession.switchRenderer({ operationId: 'cancel-prepare', selection: cancelCandidate });
await candidatePrepared; cancelSession.cancelHandover('cancel-prepare');
await assert.rejects(switching, /cancelled/);
completePrepare(); await new Promise(resolve => setImmediate(resolve));
assert.deepEqual(cancelSession.capture(), cancelBefore);
assert.equal(cancelCandidate.frames.getDiagnostics().allocatedBytes, 0);
await cancelSession.dispose(); assert.equal(cancelActive.frames.getDiagnostics().allocatedBytes, 0);
console.log('Graphics frame ownership: bounded slots, copy isolation, rollback, failure/reset/disposal passed');
