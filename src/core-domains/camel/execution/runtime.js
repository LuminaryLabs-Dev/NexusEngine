import {createNexusBinding} from '../nexus-api/binding.js';
import {validateWire} from '../runtime/wire.js';
const fail = (code, message) => Object.assign(new Error(message), {code});
const clone = value => structuredClone(value);
function bounded(value, fallback, max, name) {
  const number = value ?? fallback;
  if (!Number.isSafeInteger(number) || number < 1 || number > max) throw new TypeError(`Invalid Camel ${name}`);
  return number;
}
export function createCamelRuntime(engine, configuration = {}) {
  let sequence = 0, disposed = false;
  const active = new Map(), receipts = new Map();
  const maxActive = bounded(configuration.maxActive, 8, 64, 'maxActive');
  const maxReceipts = bounded(configuration.maxReceipts, 128, 1024, 'maxReceipts');
  const maxInputs = bounded(configuration.maxInputs, 64, 1024, 'maxInputs');
  const target = configuration.runtime && configuration.runtime !== 'auto' ? configuration.runtime : (typeof process !== 'undefined' && process.versions?.node ? 'native' : 'browser');
  if (!['native', 'browser'].includes(target)) throw new TypeError('Unknown Camel runtime target');
  const limits = {
    steps: bounded(configuration.steps, 100000, 1000000000, 'steps'),
    tasks: bounded(configuration.tasks, 64, 1024, 'tasks'),
    callDepth: bounded(configuration.callDepth, 128, 256, 'callDepth')
  };
  function save(receipt) {
    receipts.set(receipt.id, receipt);
    while (receipts.size > maxReceipts) receipts.delete(receipts.keys().next().value);
  }
  function assertLive(work) {
    if (disposed || work.cancelled || active.get(work.id) !== work) throw fail('CAMEL_CANCELLED', 'Camel execution no longer active');
  }
  function channel(work, kind) {
    assertLive(work);
    if (!work.interactive) throw new Error('Camel input/update requires an interactive session');
    const queue = work[kind];
    if (queue.length) return Promise.resolve(queue.shift());
    if (work.waiter) throw new Error('Concurrent Camel session request');
    return new Promise((resolve, reject) => {work.waiter = {kind, resolve, reject};});
  }
  function enqueue(work, kind, value) {
    assertLive(work);
    if (!work.interactive) throw new Error('Camel execution is not an interactive session');
    validateWire(value);
    const data = clone(value);
    if (work.waiter?.kind === kind) {
      const waiter = work.waiter;
      work.waiter = null;
      waiter.resolve(data);
    } else if (kind === 'updates') {
      // A paused session consumes the latest committed frame; it never accumulates frame backlog.
      work.updates.splice(0, work.updates.length, data);
    } else {
      if (work.inputs.length >= maxInputs) throw fail('CAMEL_INPUT_OVERFLOW', 'Camel session input queue exceeded capacity');
      work.inputs.push(data);
    }
    return true;
  }
  function cleanup(work) {
    if (work.cleaned) return;
    work.cleaned = true;
    work.controller.abort();
    work.waiter?.reject(fail('CAMEL_CANCELLED', 'Camel session stopped'));
    work.waiter = null;
    work.inputs.length = 0;
    work.updates.length = 0;
    const errors = [];
    try {work.unsubscribe?.();} catch (error) {errors.push(error);}
    try {if (work.surface) engine.unregisterSurface(work.surface);} catch (error) {errors.push(error);}
    try {work.binding.dispose();} catch (error) {errors.push(error);}
    if (errors.length) work.cleanupErrors = errors.map(error => String(error?.message ?? error));
  }
  function waitForRuntime(work, promise) {
    return new Promise((resolve, reject) => {
      const signal = work.controller.signal;
      const remove = () => signal.removeEventListener('abort', aborted);
      const aborted = () => {remove(); reject(fail('CAMEL_CANCELLED', 'Camel execution cancelled during runtime loading'));};
      signal.addEventListener('abort', aborted, {once: true});
      Promise.resolve(promise).then(value => {remove(); resolve(value);}, error => {remove(); reject(error);});
      if (signal.aborted) aborted();
    });
  }
  async function run(work, source, options) {
    const entry = {id: work.id, status: 'running', source, entry: options.entry ?? 'Main', interactive: work.interactive};
    try {
      const runtime = await waitForRuntime(work, target === 'browser'
        ? import('../runtime/browser.js').then(module => module.loadBrowserRuntime())
        : import('../runtime/native.js').then(module => module.loadNativeRuntime()));
      assertLive(work);
      work.runtime = runtime;
      const request = {id: work.id, source, filename: configuration.filename ?? 'main.camel', resolveImports: Boolean(configuration.filename), entry: entry.entry, args: options.args ?? [], action: options.action ?? 'run', hostCapabilities: configuration.hostCapabilities ?? [], ...limits,
        timeoutMs: bounded(options.timeoutMs ?? configuration.timeoutMs, work.interactive ? 1800000 : 30000, 86400000, 'timeoutMs')};
      if (work.interactive) request.steps = bounded(configuration.sessionSteps, limits.steps, 1000000000, 'sessionSteps');
      const result = JSON.parse(await runtime.execute(JSON.stringify(request), (error, message) => {
        if (error || work.cancelled || disposed) return;
        const packet = JSON.parse(message);
        if (packet.kind === 'log') {try {configuration.onLog?.(packet.payload);} catch {} return;}
        Promise.resolve().then(() => {
          assertLive(work);
          if (packet.kind === 'discover') return work.binding.discover();
          if (packet.kind === 'poll') return work.binding.poll();
          if (packet.kind === 'nexus') return work.binding.call(packet.payload);
          if (packet.kind === 'input') return channel(work, 'inputs');
          if (packet.kind === 'update') return channel(work, 'updates');
          if (packet.kind === 'model') {
            if (typeof configuration.modelProvider !== 'function') throw new Error('No Camel model provider configured');
            return configuration.modelProvider(packet.payload, {signal: work.controller.signal, executionId: work.id});
          }
          throw new Error('Unknown Camel host request');
        }).then(value => {
          assertLive(work);
          validateWire(value);
          runtime.reply(packet.id, JSON.stringify({ok: true, value}));
        }).catch(error => {
          if (!work.cancelled && !disposed && active.get(work.id) === work) {
            try {runtime.reply(packet.id, JSON.stringify({ok: false, error: String(error?.message ?? error)}));} catch {}
          }
        });
      }));
      assertLive(work);
      cleanup(work);
      const receipt = {...entry, status: 'completed', result, ...(work.cleanupErrors ? {cleanupErrors: work.cleanupErrors} : {})};
      save(receipt);
      return clone(receipt);
    } catch (error) {
      cleanup(work);
      save({...entry, status: work.cancelled || error.code === 'CAMEL_CANCELLED' ? 'cancelled' : 'failed', error: String(error?.message ?? error), code: error.code ?? 'CAMEL_EXECUTION', ...(work.cleanupErrors ? {cleanupErrors: work.cleanupErrors} : {})});
      throw error;
    } finally {active.delete(work.id);}
  }
  function begin(source, options = {}, interactive = false) {
    if (disposed) throw new Error('Camel domain disposed');
    if (typeof source !== 'string') throw new TypeError('Camel source must be a string');
    if (active.size >= maxActive) throw fail('CAMEL_JOB_LIMIT', 'Camel active execution limit exceeded');
    if (interactive && target !== 'browser') throw fail('CAMEL_TARGET_UNAVAILABLE', 'Interactive Camel sessions currently require the browser WASM target');
    validateWire(options.args ?? []);
    const id = `camel:${++sequence}:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}:${Math.random().toString(36).slice(2)}`}`;
    const work = {id, interactive, cancelled: false, binding: createNexusBinding(engine, {allowCalls: configuration.allowCalls ?? [], maxEvents: configuration.maxEvents ?? 1024, maxReferences: configuration.maxReferences ?? 1024}), controller: new AbortController(), inputs: [], updates: []};
    active.set(id, work);
    try {
    if (interactive && configuration.schedule !== false && typeof engine.lifecycleSurface === 'function') {
      work.surface = engine.lifecycleSurface({topics: ['tick'], label: id});
      work.unsubscribe = work.surface.subscribe(batch => {
        const tick = batch.find(record => record.topic === 'tick' && record.stage === 'end');
        if (tick && !work.cancelled && !disposed) enqueue(work, 'updates', {tickId: tick.tickId, frame: tick.frame, delta: tick.delta, elapsed: tick.elapsed, revision: tick.revision});
      });
    }
    } catch (error) {cleanup(work); active.delete(id); throw error;}
    work.completion = run(work, source, options);
    // Sessions are explicitly observed with wait(); starting one must not create an unhandled rejection.
    if (interactive) work.completion.catch(() => {});
    return work;
  }
  function cancel(id) {
    const work = active.get(id);
    if (!work || work.cancelled) return false;
    work.cancelled = true;
    cleanup(work);
    work.runtime?.cancel(id);
    return true;
  }
  const api = {
    execute: (source, options = {}) => begin(source, options).completion,
    check: (source, options = {}) => begin(source, {...options, action: 'check'}).completion,
    discover: () => {const binding = createNexusBinding(engine); try {return binding.discover();} finally {binding.dispose();}},
    start: (source, options = {}) => ({id: begin(source, options, true).id}),
    input(id, value) {const work = active.get(id); if (!work) throw new Error('Unknown Camel session'); return enqueue(work, 'inputs', value);},
    update(id, value) {const work = active.get(id); if (!work) throw new Error('Unknown Camel session'); return enqueue(work, 'updates', value);},
    wait(id) {
      const work = active.get(id);
      if (work) return work.completion;
      const receipt = receipts.get(id);
      if (!receipt) return Promise.reject(new Error('Unknown or evicted Camel execution'));
      return receipt.status === 'completed' ? Promise.resolve(clone(receipt)) : Promise.reject(fail(receipt.code ?? 'CAMEL_EXECUTION', receipt.error));
    },
    stop: cancel,
    cancel,
    status() {return {active: [...active.keys()], sessions: [...active.values()].filter(work => work.interactive).map(work => ({id: work.id, waiting: work.waiter?.kind ?? null, inputs: work.inputs.length, updates: work.updates.length, cancelled: work.cancelled})), disposed, receipts: clone([...receipts.values()])};},
    getSnapshot() {if (active.size) throw new Error('Cannot snapshot live Camel execution'); return {schema: 'nexusengine.camel-state/1', sequence, receipts: clone([...receipts.entries()])};},
    loadSnapshot(snapshot) {
      if (active.size || disposed) throw new Error('Cannot restore active/disposed Camel runtime');
      if (snapshot?.schema !== 'nexusengine.camel-state/1' || !Number.isSafeInteger(snapshot.sequence) || snapshot.sequence < 0 || !Array.isArray(snapshot.receipts) || snapshot.receipts.length > maxReceipts) throw new TypeError('Invalid Camel snapshot');
      const data = clone(snapshot.receipts), next = new Map(data);
      if (next.size !== data.length) throw new TypeError('Duplicate Camel receipt');
      for (const pair of data) {
        if (!Array.isArray(pair) || pair.length !== 2) throw new TypeError('Invalid Camel receipt');
        const [id, receipt] = pair;
        if (typeof id !== 'string' || id !== receipt?.id || !['completed','failed','cancelled'].includes(receipt.status)) throw new TypeError('Invalid Camel receipt');
      }
      sequence = snapshot.sequence;
      receipts.clear();
      for (const [id, receipt] of next) receipts.set(id, receipt);
      return api.getSnapshot();
    },
    reset() {if (active.size) throw new Error('Cancel and drain execution before reset'); receipts.clear(); sequence = 0;},
    dispose() {if (disposed) return; for (const id of active.keys()) cancel(id); disposed = true;},
    capabilities() {return {native: 'darwin-arm64', browser: 'wasm-asyncify-worker', selected: target, checkpoint: 'completed-invocations', subscriptions: 'queued-callbacks', interactive: target === 'browser', threadedSpawn: target !== 'browser', maxActive, maxReceipts, maxInputs};}
  };
  return api;
}
