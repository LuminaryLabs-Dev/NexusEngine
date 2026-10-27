import { copyFrame, copyFrameLease, retainFrame, releaseFrame, registerFrameHost } from './frame-ownership.js';
const now = () => globalThis.performance?.now() ?? Date.now();
function synchronous(result) {
  if (result && typeof result.then === 'function') {
    result.catch?.(() => {});
    throw TypeError('Presentation commit must be synchronous; finish asynchronous work in prepare.');
  }
}

// prepare may be asynchronous in a custom host. The built-in host keeps its
// staging tokens opaque and owns the last good frame until rollback is impossible.
function makeFrameHost({ present = () => {}, restore = present, dispose = () => {} } = {}, trusted = false) {
  if ([present, restore].some(fn => typeof fn !== 'function' || fn.constructor.name === 'AsyncFunction')) throw TypeError('Presentation commit callbacks must be synchronous');
  let last = null, generation = -1, closed = false, copiedBytes = 0;
  let presentations = 0, presentationMs = 0, maxPresentationMs = 0;
  const stages = new Map();
  const copied = bytes => { copiedBytes += bytes; };
  const presentFrame = (callback, lease, tag) => synchronous(callback(trusted ? lease.frame : copyFrame(lease.frame, copied), { ...tag }));
  function stage(lease, tag) {
    if (closed) throw Error('Host disposed');
    if (stages.size >= 2) throw Error('Host staging pool is exhausted');
    if (!Number.isSafeInteger(tag?.generation) || tag.generation < 0) throw TypeError('Host requires a presentation generation');
    const token = Object.freeze({});
    stages.set(token, { lease: retainFrame(lease), tag: { ...tag } });
    return token;
  }
  function discard(token) {
    const staged = stages.get(token);
    if (staged) { stages.delete(token); releaseFrame(staged.lease); }
  }
  function clear() {
    for (const token of stages.keys()) discard(token);
    releaseFrame(last); last = null;
  }
  function restoreLease(previous, tag) {
    if (closed) throw Error('Host disposed');
    const next = previous ? retainFrame(previous) : null;
    try { if (next) presentFrame(restore, next, tag); }
    catch (error) { releaseFrame(next); throw error; }
    releaseFrame(last); last = next; generation = tag.generation;
  }
  const host = {
    kind: 'rgba8', reservationBytes: 0,
    prepare(frame, tag) {
      const lease = copyFrameLease(frame, copied);
      try { return stage(lease, tag); } finally { releaseFrame(lease); }
    },
    commit(token) {
      if (closed) throw Error('Host disposed');
      const staged = stages.get(token);
      if (!staged) throw Error('Unknown or consumed presentation token');
      const started = now();
      try {
        if (staged.tag.generation < generation) throw Error('Stale presentation generation');
        presentFrame(present, staged.lease, staged.tag);
        releaseFrame(last); last = staged.lease;
        stages.delete(token); generation = staged.tag.generation; presentations++;
        return { presented: true, generation };
      } catch (error) {
        discard(token);
        if (last) presentFrame(restore, last, { generation, rollback: true });
        throw error;
      } finally {
        presentationMs = now() - started;
        maxPresentationMs = Math.max(maxPresentationMs, presentationMs);
      }
    },
    rollback(previous, tag) {
      const lease = previous ? copyFrameLease(previous, copied) : null;
      try { restoreLease(lease, tag); } finally { releaseFrame(lease); }
    },
    capture: () => last ? copyFrame(last.frame, copied) : null,
    getDiagnostics() {
      const retained = new Set([...stages.values()].map(s => s.lease.frame.pixels));
      if (last) retained.add(last.frame.pixels);
      return { copiedBytes, presentationMs, maxPresentationMs, presentations, stagedFrames: stages.size,
        retainedFrames: retained.size, retainedBytes: [...retained].reduce((n,pixels) => n + pixels.byteLength, 0), maxRetainedFrames: 3 };
    },
    dispose() { if (!closed) { closed = true; clear(); dispose(); } }
  };
  registerFrameHost(host, { prepare: stage, discard, capture: () => last ? retainFrame(last) : null, restore: restoreLease, clear });
  return host;
}
export function createFrameHost(options = {}) { return makeFrameHost(options, !options.present && !options.restore); }

export function createCanvasHost(canvas, { bindSurface, allowReplacement = false } = {}) {
  if (!canvas?.ownerDocument || typeof canvas.getContext !== 'function') throw TypeError('A canvas surface is required');
  let current = canvas, ctx = current.getContext('2d'), unbind = null;
  if (!ctx) {
    if (!allowReplacement || typeof bindSurface !== 'function') {
      throw Error('Existing canvas context requires allowReplacement and bindSurface');
    }
    current = canvas.cloneNode(false);
    ctx = current.getContext('2d');
    if (!ctx) throw Error('Canvas 2D presentation unavailable');
  }
  let replacement = current !== canvas;
  const paint = frame => {
    if (current.width !== frame.width) current.width = frame.width;
    if (current.height !== frame.height) current.height = frame.height;
    ctx.putImageData(new ImageData(frame.pixels, frame.width, frame.height), 0, 0);
    if (replacement) {
      const focused = canvas.ownerDocument.activeElement === canvas;
      const nextUnbind = bindSurface(current);
      canvas.replaceWith(current);
      if (focused) current.focus();
      unbind = nextUnbind;
      replacement = false;
    }
  };
  const host = makeFrameHost({ present: paint, dispose: () => unbind?.() }, true);
  host.getSurface = () => current;
  return host;
}

export function createNativeWindowHost({ width = 640, height = 360 } = {}) {
  if (![width,height].every(v=>Number.isSafeInteger(v)&&v>0&&v<=4096)) throw TypeError('Native window dimensions must be integers in 1..4096');
  let adapter, handle, closed = false;
  const host = makeFrameHost({
    present(frame) {
      if (!handle || closed) throw Error('Native presentation is not ready');
      adapter.present(handle, frame.pixels, frame.width, frame.height);
    },
    dispose() { closed = true; if (handle) { adapter.close(handle); handle = null; } }
  }, true);
  const ready = (async () => {
    const { loadNativeWindow } = await import('./runtime/loader.js');
    adapter = await loadNativeWindow();
    if (closed) throw Error('Native host disposed during startup');
    handle = adapter.create(width, height);
  })();
  ready.catch(() => {});
  host.ready = ready;
  host.getWindowState = () => handle ? adapter.pump(handle) : { closed: true };
  return host;
}
