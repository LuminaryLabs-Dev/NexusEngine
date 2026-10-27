// Private ownership boundary. No leases or writable pool arrays are exported by
// the kit's public entry point. Public captures always own their pixels.
const sources = new WeakMap(), hostProtocols = new WeakMap(), leases = new WeakMap();

export function validateFrame(frame) {
  if (!frame || !Number.isSafeInteger(frame.width) || !Number.isSafeInteger(frame.height) ||
      frame.width < 1 || frame.height < 1 || !(frame.pixels instanceof Uint8ClampedArray) ||
      frame.pixels.length !== frame.width * frame.height * 4 || frame.stride !== frame.width * 4) {
    throw TypeError('Host requires a completed tightly packed straight RGBA8 frame.');
  }
  return frame;
}
export function copyFrame(frame, copied = () => {}) {
  validateFrame(frame);
  const pixels = new Uint8ClampedArray(frame.pixels);
  copied(pixels.byteLength);
  return { ...frame, pixels };
}
export function copyFrameLease(frame, copied) {
  const copy = copyFrame(frame, copied);
  return leaseFor(copy, () => {}, () => {});
}
function leaseFor(frame, retain, release) {
  const lease = Object.freeze({ frame });
  leases.set(lease, { retain, release, released: false });
  return lease;
}
export function retainFrame(lease) {
  const record = leases.get(lease);
  if (!record || record.released) throw Error('Completed frame lease has expired');
  record.retain();
  return leaseFor(lease.frame, record.retain, record.release);
}
export function releaseFrame(lease) {
  const record = leases.get(lease);
  if (record && !record.released) { record.released = true; record.release(); }
}

export function createFrameStore({ maxSlots = 3 } = {}) {
  if (!Number.isSafeInteger(maxSlots) || maxSlots < 2 || maxSlots > 3) throw RangeError('Frame pool requires two or three slots');
  const slots = new Set(), destinations = new WeakMap();
  let completed = null, copiedBytes = 0, allocations = 0;
  const copied = bytes => { copiedBytes += bytes; };
  function makeLease(slot, frame) {
    slot.refs++;
    return leaseFor(frame, () => { slot.refs++; }, () => {
      slot.refs--;
      if (!slot.refs && slot.retired) slots.delete(slot);
    });
  }
  function acquireDestination(metadata) {
    const { width, height } = metadata ?? {};
    const bytes = width * height * 4;
    if (![width, height, bytes].every(Number.isSafeInteger) || width < 1 || height < 1) throw RangeError('Invalid frame destination extent');
    let slot = [...slots].find(s => !s.refs && !s.writing && s.pixels?.byteLength === bytes);
    slot ??= [...slots].find(s => !s.refs && !s.writing);
    if (!slot) {
      if (slots.size >= maxSlots) throw Error('Completed frame pool is exhausted');
      slot = { pixels: null, refs: 0, writing: false, retired: false }; slots.add(slot);
    }
    if (slot.pixels?.byteLength !== bytes) {
      // Allocate first so allocation failure cannot discard the last good frame.
      const pixels = new Uint8ClampedArray(bytes);
      slot.pixels = pixels; allocations++;
    }
    slot.writing = true;
    const frame = { ...metadata, stride: width * 4, pixels: slot.pixels };
    destinations.set(frame, slot);
    return frame;
  }
  function discardDestination(frame) {
    const slot = destinations.get(frame);
    if (!slot) return;
    destinations.delete(frame); slot.writing = false;
    if (slot.retired && !slot.refs) slots.delete(slot);
  }
  function publishOwned(frame) {
    validateFrame(frame);
    const slot = destinations.get(frame);
    if (!slot || !slot.writing || frame.pixels !== slot.pixels || slot.retired) throw Error('Frame destination does not belong to this pool');
    const next = makeLease(slot, { ...frame });
    destinations.delete(frame); slot.writing = false;
    releaseFrame(completed); completed = next;
    return { frameId: frame.frameId, serial: frame.serial };
  }
  return {
    acquireDestination, publishOwned, discardDestination,
    publish(frame) {
      validateFrame(frame);
      const destination = acquireDestination(frame);
      try { destination.pixels.set(frame.pixels); copied(frame.pixels.byteLength); return publishOwned(destination); }
      catch (error) { discardDestination(destination); throw error; }
    },
    acquire: () => completed ? retainFrame(completed) : null,
    capture: () => completed ? copyFrame(completed.frame, copied) : null,
    clear() {
      releaseFrame(completed); completed = null;
      for (const slot of slots) { slot.retired = true; if (!slot.refs && !slot.writing) slots.delete(slot); }
    },
    getDiagnostics() {
      return { copiedBytes, copyBytes: copiedBytes, allocations, slots: slots.size, maxSlots,
        allocatedBytes: [...slots].reduce((n,s) => n + (s.pixels?.byteLength ?? 0), 0),
        activeBytes: [...slots].reduce((n,s) => n + (s.refs || s.writing ? s.pixels?.byteLength ?? 0 : 0), 0),
        retainedFrames: [...slots].filter(s => s.refs).length };
    },
    reservationBytes: (width, height) => Math.max(width * height * 4, ...[...slots].map(s => s.pixels?.byteLength ?? 0)) * maxSlots
  };
}
export function registerFrameSource(provider, store) { sources.set(provider, store); }
export async function acquireCompletedFrame(provider, copied) {
  const source = sources.get(provider);
  if (source) return source.acquire();
  const frame = await provider.getCompletedFrame();
  if (!frame) return null;
  const copy = copyFrame(frame, copied);
  return leaseFor(copy, () => {}, () => {});
}
export function registerFrameHost(host, protocol) { hostProtocols.set(host, protocol); }
export function prepareHostFrame(host, lease, tag, copied) {
  const protocol = hostProtocols.get(host);
  return protocol ? protocol.prepare(lease, tag) : host.prepare(copyFrame(lease.frame, copied), tag);
}
export function discardHostFrame(host, staged) { hostProtocols.get(host)?.discard(staged); }
export function clearHostFrames(host) { hostProtocols.get(host)?.clear(); }
export function captureHostFrame(host, copied) {
  const frame = host.capture();
  return frame && !hostProtocols.has(host) ? copyFrame(frame, copied) : frame;
}
export function captureHostRollback(host, copied) {
  const protocol = hostProtocols.get(host);
  return protocol ? { protocol, value: protocol.capture() } : { value: captureHostFrame(host, copied) };
}
export function restoreHostRollback(host, checkpoint, tag) {
  return checkpoint.protocol ? checkpoint.protocol.restore(checkpoint.value, tag) : host.rollback(checkpoint.value, tag);
}
export function releaseHostRollback(checkpoint) { if (checkpoint?.protocol) releaseFrame(checkpoint.value); }
export function frameReservationBytes(provider, width, height) {
  // A custom provider does not participate in the bounded ownership protocol:
  // reserve its output plus the defensive input, staging and rollback copies.
  return sources.get(provider)?.reservationBytes(width, height) ?? width * height * 16;
}
