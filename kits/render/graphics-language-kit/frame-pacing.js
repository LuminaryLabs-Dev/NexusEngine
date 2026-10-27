// This admission helper owns no timer and never advances simulation. A host may
// call request once per animation callback with work built from its latest state.
export function createFramePacer({ targetFps = 30, now = () => globalThis.performance?.now() ?? Date.now() } = {}) {
  if (typeof now !== 'function') throw TypeError('Frame pacing requires a clock');
  const validateFps = value => {
    if (!Number.isFinite(value) || value < 1 || value > 240) throw RangeError('Target FPS must be in 1..240');
    return value;
  };
  let fps = validateFps(targetFps), next = null, inFlight = false, paused = false, disposed = false;
  let submitted = 0, completed = 0, failed = 0, skippedBusy = 0, skippedCadence = 0;
  let renderMs = 0, maxRenderMs = 0;
  return {
    async request(work, timestamp = now()) {
      if (typeof work !== 'function' || !Number.isFinite(timestamp)) throw TypeError('Pacing requires frame work and a finite timestamp');
      if (disposed || paused) return { submitted: false, reason: disposed ? 'disposed' : 'paused' };
      if (inFlight) { skippedBusy++; return { submitted: false, reason: 'busy' }; }
      if (next !== null && timestamp < next) { skippedCadence++; return { submitted: false, reason: 'cadence' }; }
      // Schedule from this request, never from an old missed deadline.
      next = timestamp + 1000 / fps; inFlight = true; submitted++;
      const started = now();
      try { const result = await work(); completed++; return { submitted: true, result }; }
      catch (error) { failed++; throw error; }
      finally { renderMs = Math.max(0, now() - started); maxRenderMs = Math.max(maxRenderMs, renderMs); inFlight = false; }
    },
    setTargetFps(value) { fps = validateFps(value); next = null; },
    pause() { paused = true; next = null; },
    resume() { if (!disposed) { paused = false; next = null; } },
    dispose() { disposed = true; paused = true; next = null; },
    getDiagnostics: () => ({ targetFps: fps, inFlight, paused, disposed, submitted, completed, failed, skippedBusy, skippedCadence, renderMs, maxRenderMs, queuedFrames: 0 })
  };
}
