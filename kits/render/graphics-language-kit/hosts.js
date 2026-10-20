function own(frame) {
  if (!frame || !Number.isSafeInteger(frame.width) || !Number.isSafeInteger(frame.height) ||
      frame.width < 1 || frame.height < 1 || !(frame.pixels instanceof Uint8ClampedArray) ||
      frame.pixels.length !== frame.width * frame.height * 4 || frame.stride !== frame.width * 4) {
    throw TypeError('Host requires a completed tightly packed straight RGBA8 frame.');
  }
  return { ...frame, pixels: new Uint8ClampedArray(frame.pixels) };
}
function synchronous(result) {
  if (result && typeof result.then === 'function') {
    result.catch?.(() => {});
    throw TypeError('Presentation commit must be synchronous; finish asynchronous work in prepare.');
  }
}

// prepare may be asynchronous in a custom host. commit and rollback are a short,
// synchronous presentation boundary, so a timed-out operation cannot present later.
export function createFrameHost({ present = () => {}, restore = present, dispose = () => {} } = {}) {
  if ([present,restore].some(fn=>typeof fn!=='function'||fn.constructor.name==='AsyncFunction')) throw TypeError('Presentation commit callbacks must be synchronous');
  let last = null, generation = -1, closed = false;
  return {
    kind: 'rgba8', reservationBytes: 0,
    prepare(frame, tag) {
      if (closed) throw Error('Host disposed');
      return { frame: own(frame), tag: { ...tag } };
    },
    commit(staged) {
      if (closed) throw Error('Host disposed');
      if (staged.tag.generation < generation) throw Error('Stale presentation generation');
      try {
        synchronous(present(own(staged.frame), staged.tag));
        last = own(staged.frame);
        generation = staged.tag.generation;
      } catch (error) {
        if (last) synchronous(restore(own(last), { generation, rollback: true }));
        throw error;
      }
      return { presented: true, generation };
    },
    rollback(previous, tag) {
      if (previous) synchronous(restore(own(previous), tag));
      last = previous ? own(previous) : null;
      generation = tag.generation;
    },
    capture: () => last ? own(last) : null,
    dispose() { if (!closed) { closed = true; last = null; dispose(); } }
  };
}

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
  return { ...createFrameHost({ present: paint, dispose: () => unbind?.() }), getSurface: () => current };
}

export function createNativeWindowHost({ width = 640, height = 360 } = {}) {
  if (![width,height].every(v=>Number.isSafeInteger(v)&&v>0&&v<=4096)) throw TypeError('Native window dimensions must be integers in 1..4096');
  let adapter, handle, closed = false;
  const host = createFrameHost({
    present(frame) {
      if (!handle || closed) throw Error('Native presentation is not ready');
      adapter.present(handle, frame.pixels, frame.width, frame.height);
    },
    dispose() { closed = true; if (handle) { adapter.close(handle); handle = null; } }
  });
  const ready = (async () => {
    const { loadNativeWindow } = await import('./runtime/loader.js');
    adapter = await loadNativeWindow();
    if (closed) throw Error('Native host disposed during startup');
    handle = adapter.create(width, height);
  })();
  ready.catch(() => {});
  return { ...host, ready, getWindowState() { return handle ? adapter.pump(handle) : { closed: true }; } };
}
