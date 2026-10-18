import {createEngine} from '../../../engine.js';
import {createDataKit} from '../../runtime/data/kits/data-kit/index.js';
import {createCamelDomain} from '../index.js';
import {createNexusBinding} from '../nexus-api/binding.js';
const callTool = 'tool any Call(string api, string[] path, any[] args, string op = "call") { handler = "nexus.call"; }';
const sessionTools = `${callTool}\ntool object Input() { handler = "nexus.input"; }\ntool object Update() { handler = "nexus.update"; }`;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
function assert(condition, message) {if (!condition) throw new Error(message);}
async function rejects(operation, pattern) {try {await operation();} catch (error) {assert(pattern.test(String(error.message)), `Unexpected error: ${error.message}`); return;} throw new Error(`Expected rejection ${pattern}`);}
async function until(check, message) {const deadline = Date.now() + 10000; while (!check()) {if (Date.now() > deadline) throw new Error(message); await pause(5);}}
export async function runBrowserSuite() {
  const passed = [];
  async function test(name, body) {await body(); passed.push(name); console.log(`PASS ${name}`);}
  let calls = 0, cleanupCount = 0, listener, resolveLate;
  const data = createDataKit({createApi: () => ({
    async delayed(value) {await pause(5); calls++; return value;},
    async never() {return new Promise(() => {});},
    async reject() {await pause(5); throw new Error('deliberate async failure');},
    subscribe(callback) {listener = callback; return () => {listener = null; cleanupCount++;};},
    async subscribeLate(callback) {await new Promise(resolve => {resolveLate = resolve;}); listener = callback; return () => {listener = null; cleanupCount++;};}
  })});
  const engine = createEngine({kits: [data, ...createCamelDomain({runtime: 'browser', maxInputs: 2, maxEvents: 2, allowCalls: [
    'data.completion.createLedger:call', 'data.delayed:call', 'data.never:call', 'data.reject:call', 'data.subscribe:subscribe', 'data.subscribeLate:subscribe'
  ]})]});
  const camel = engine.n.camel;
  await test('cancellation drains during a cold runtime download', async () => {
    const originalFetch = globalThis.fetch;
    let release;
    globalThis.fetch = (url, ...args) => String(url).endsWith('/camel-browser.wasm')
      ? new Promise(resolve => {release = () => resolve(originalFetch(url, ...args));})
      : originalFetch(url, ...args);
    const pending = camel.execute('workflow int Main() { return 1; }');
    try {
      await until(() => typeof release === 'function', 'Runtime download did not begin');
      camel.cancel(camel.status().active[0]);
      await Promise.race([rejects(() => pending, /cancelled during runtime loading/), pause(500).then(() => {throw new Error('Cold-loader cancellation did not drain');})]);
      assert(camel.status().active.length === 0, 'Cancelled loader job remained active');
    } finally {globalThis.fetch = originalFetch; release?.();}
  });
  await test('actual Rust arithmetic and receipt', async () => {const result = await camel.execute('workflow int Main() { return 6 * 7; }'); assert(result.result.value === 42 && result.status === 'completed', 'Arithmetic receipt');});
  await test('failed artifact integrity resets the shared loader for retry', async () => {
    const loader = await import('../runtime/browser.js?cache-retry');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (url, ...args) => String(url).endsWith('/browser-integrity.json')
      ? Promise.resolve(new Response(JSON.stringify({sha256: 'wrong', bytes: 0}), {status: 200}))
      : originalFetch(url, ...args);
    try {await rejects(() => loader.loadBrowserRuntime(), /integrity mismatch/);}
    finally {globalThis.fetch = originalFetch;}
    const runtime = await loader.loadBrowserRuntime();
    const result = JSON.parse(await runtime.execute(JSON.stringify({id: 'loader-retry', source: 'workflow int Main() { return 12; }'}), () => {}));
    assert(result.value === 12, 'Failed loader cache was not reset');
  });
  await test('source checking and source-located errors', async () => {assert((await camel.check('workflow int Main() { return 1; }')).result.declarations[0].name === 'Main', 'Check declarations'); await rejects(() => camel.check('workflow int Main() { return "wrong"; }'), /main.camel:|expected|return/i);});
  await test('pinned upstream edition 0.2 conformance cases', async () => {
    const base = new URL('../runtime/upstream/conformance/0.2/', import.meta.url);
    const manifest = await (await fetch(new URL('manifest.json', base))).json();
    for (const item of manifest.cases) {
      const source = await (await fetch(new URL(item.source, base))).text();
      if (item.expect === 'pass') assert((await camel.check(source)).result.status === 'PASS', item.source);
      else await rejects(() => camel.check(source), /./);
    }
  });
  await test('real installed Nexus mutation with same receiver/state', async () => {await camel.execute(`${callTool} workflow any Main() { return Call("data", ["completion", "createLedger"], ["wasm-ledger"]); }`); assert(engine.n.data.completion.listLedgers().includes('wasm-ledger'), 'Nexus mutation absent');});
  await test('nested async continuations preserve locals and never replay effects', async () => {
    const before = calls;
    const receipt = await camel.execute(`${callTool} int Add(int value) { return value + Call("data", ["delayed"], [2]); } workflow int Main() { int total = 0; for (int i = 0; i < 3; i += 1) { total += Add(i); } return total; }`);
    assert(receipt.result.value === 9 && calls - before === 3, 'Continuation state or side-effect count changed');
  });
  await test('async failures resume through catch/finally', async () => {const result = await camel.execute(`${callTool} workflow int Main() { int value = 1; try { Call("data", ["reject"], []); value = 99; } catch (error) { value += 2; } finally { value += 4; } return value; }`); assert(result.result.value === 7, 'Catch/finally did not resume');});
  await test('ungranted calls fail before mutation', async () => {const before = engine.n.data.completion.listLedgers().length; await rejects(() => camel.execute(`${callTool} workflow any Main() { return Call("data", ["completion", "reset"], []); }`), /Call not granted/); assert(engine.n.data.completion.listLedgers().length === before, 'Denied call changed state');});
  await test('exact i64 wire values', async () => {const value = (await camel.execute('workflow int Main() { return 9223372036854775807; }')).result.value; assert(value.$camel === 'bigint' && value.value === '9223372036854775807', 'i64 precision lost');});
  await test('step limits and explicit unsupported threaded spawn', async () => {await rejects(() => camel.execute('workflow int Main() { while (true) {} return 0; }'), /step budget/); await rejects(() => camel.execute('int F() { return 1; } workflow int Main() { Task<int> work = spawn F(); return await work; }'), /threaded spawn capability unavailable/);});
  await test('native services fail closed in the browser', async () => {await rejects(() => camel.execute('tool string Read(string path) { handler = "files.read"; } workflow string Main() { return Read("private"); }'), /unregistered tool/); await rejects(() => camel.execute('import "secret.camel"; workflow int Main() { return 1; }'), /import|use load|unknown/i);});
  await test('persistent session locals, inputs, and committed engine ticks', async () => {
    const baseline = engine.__nexusSurfaceRegistry.lifecycle.length;
    const {id} = camel.start(`${sessionTools} workflow int Main() { int total = 0; for (int i = 0; i < 3; i += 1) { object input = Input(); object frame = Update(); total += input.amount; Call("data", ["completion", "createLedger"], ["session-" + string(total)]); assert(frame.frame > 0); } return total; }`);
    const done = camel.wait(id);
    for (const amount of [2, 3, 5]) {
      camel.input(id, {amount});
      await until(() => camel.status().sessions.find(session => session.id === id)?.waiting === 'updates', 'Session did not await tick');
      engine.tick(1 / 60);
      await pause(30);
    }
    assert((await done).result.value === 10, 'Session restarted or lost locals');
    assert(engine.n.data.completion.listLedgers().includes('session-10'), 'Session did not mutate Nexus state');
    assert(engine.__nexusSurfaceRegistry.lifecycle.length === baseline, 'Session tick subscription leaked');
  });
  await test('bounded input queue, coalesced updates, cancellation, and restart', async () => {
    const source = `${sessionTools} workflow int Main() { object frame = Update(); object input = Input(); return input.amount; }`;
    const {id} = camel.start(source);
    camel.input(id, {amount: 1}); camel.input(id, {amount: 2});
    await rejects(() => camel.input(id, {amount: 3}), /input queue/);
    for (let frame = 0; frame < 100; frame++) camel.update(id, {frame});
    assert(camel.status().sessions[0].updates <= 1, 'Update backlog accumulated');
    assert(camel.stop(id), 'Stop did not cancel');
    await rejects(() => camel.wait(id), /cancelled|no longer active/);
    assert(!camel.stop(id), 'Repeated stop should be harmless');
    const next = camel.start(source); camel.update(next.id, {frame: 1}); camel.input(next.id, {amount: 17});
    assert((await camel.wait(next.id)).result.value === 17, 'Restart failed');
  });
  await test('queued callbacks and completion cleanup', async () => {
    const source = `${sessionTools} tool any Poll() { handler = "nexus.poll"; } workflow int Main() { Call("data", ["subscribe"], [json.parse(${JSON.stringify(JSON.stringify({$camel: "callback", id: "event"}))})], "subscribe"); object input = Input(); any[] events = Poll(); return events[0].args[0]; }`;
    const before = cleanupCount, {id} = camel.start(source);
    await until(() => typeof listener === 'function', 'Subscription not installed');
    listener(23); camel.input(id, {ready: true});
    assert((await camel.wait(id)).result.value === 23 && cleanupCount === before + 1 && listener === null, 'Subscription callback/cleanup failed');
  });
  await test('late host replies cannot resume a cancelled session; late subscribe cleans up', async () => {
    const source = `${callTool} workflow any Main() { return Call("data", ["subscribeLate"], [json.parse(${JSON.stringify(JSON.stringify({$camel: "callback", id: "event"}))})], "subscribe"); }`;
    const before = cleanupCount, promise = camel.execute(source);
    await until(() => typeof resolveLate === 'function', 'Late subscription not pending');
    const id = camel.status().active[0]; camel.cancel(id); await rejects(() => promise, /cancelled/);
    resolveLate(); await until(() => cleanupCount === before + 1, 'Late subscription leaked');
    assert(listener === null && camel.status().active.length === 0, 'Cancelled state resurrected');
  });
  await test('snapshot/reset/replay and live-session snapshot rejection', async () => {
    const snapshot = camel.getSnapshot(); camel.reset(); assert(camel.status().receipts.length === 0, 'Reset failed'); camel.loadSnapshot(snapshot); assert(JSON.stringify(camel.getSnapshot()) === JSON.stringify(snapshot), 'Receipt replay differs');
    const {id} = camel.start(`${sessionTools} workflow object Main() { return Input(); }`);
    await rejects(() => camel.getSnapshot(), /live Camel/); camel.cancel(id); await rejects(() => camel.wait(id), /cancelled|no longer active/);
  });
  await test('wire guards, scoped references, permissions and callback overflow', async () => {
    const binding = createNexusBinding(engine, {allowCalls: ['data.subscribe:subscribe'], maxEvents: 1, maxReferences: 1});
    await rejects(() => binding.call(['data', ['subscribe'], [], 'subscribe']), /requires a callback/);
    await rejects(() => binding.call(['data', ['__proto__'], []]), /Unsafe|Invalid/);
    await rejects(() => binding.decode({$camel: 'reference', id: 'expired'}), /expired/);
    await rejects(() => binding.decode({$camel: 'undefined', extra: true}), /Malformed/);
    await rejects(() => binding.encode(9007199254740992), /Unsafe/);
    await rejects(() => binding.encode(Symbol('bad')), /symbols/);
    const object = new Date(), ref = binding.encode(object); assert(binding.decode(ref) === object, 'Reference object was copied');
    assert(binding.release(ref.id), 'Reference release failed'); await rejects(() => binding.decode(ref), /expired/);
    const next = binding.encode(object); assert(next.id !== ref.id, 'Released reference identity resurrected'); binding.release(next.id);
    await binding.call(['data', ['subscribe'], [{$camel: 'callback', id: 'q'}], 'subscribe']); listener(1); listener(2); await rejects(() => binding.poll(), /queue exceeded/); binding.dispose();
  });
  await test('wall-clock timeout discards stalled host continuations', async () => {
    await rejects(() => camel.execute(`${callTool} workflow any Main() { return Call("data", ["never"], []); }`, {timeoutMs: 250}), /wall-clock budget exhausted/);
    assert(camel.status().active.length === 0, 'Timed out worker remained active');
    assert((await camel.execute('workflow int Main() { return 8; }')).result.value === 8, 'Timeout corrupted later jobs');
  });
  await test('model-provider promise success and cancellation signal', async () => {
    let observed = false, modelStarted = false;
    const modelEngine = createEngine({kits: createCamelDomain({runtime: 'browser', modelProvider: async (request, {signal}) => {
      if (request.model === 'wait') {modelStarted = true; await new Promise(resolve => signal.addEventListener('abort', () => {observed = true; resolve();}, {once: true})); return {content: 'late'};}
      await pause(5); return {content: 'model-ok'};
    }})});
    const modelCamel = modelEngine.n.camel;
    const success = await modelCamel.execute('agent A { model = "test"; } workflow string Main() { return A.run("hello").text; }');
    assert(success.result.value === 'model-ok', 'Model promise failed');
    const pending = modelCamel.execute('agent A { model = "wait"; } workflow string Main() { return A.run("hello").text; }');
    await until(() => modelStarted, 'Model provider not awaiting cancellation'); const id = modelCamel.status().active[0]; modelCamel.cancel(id); await rejects(() => pending, /cancelled/);
    assert(observed, 'Provider did not receive cancellation'); modelCamel.dispose();
  });
  await test('browser log flood terminates within bounded message budget', async () => {
    await rejects(() => camel.execute('workflow int Main() { for (int i = 0; i < 1000; i += 1) { log("flood"); } return 0; }'), /log budget exceeded/);
    assert(camel.status().active.length === 0, 'Log-flood worker remained active');
  });
  await test('synchronous worker transport failure tears down its job', async () => {
    const OriginalWorker = globalThis.Worker;
    let terminated = 0;
    globalThis.Worker = class extends OriginalWorker {
      postMessage() {throw new Error('deliberate start transport failure');}
      terminate() {terminated++; return super.terminate();}
    };
    try {await rejects(() => camel.execute('workflow int Main() { return 1; }'), /start transport failure/);}
    finally {globalThis.Worker = OriginalWorker;}
    assert(terminated === 1 && camel.status().active.length === 0, 'Transport failure leaked a worker/job');
    assert((await camel.execute('workflow int Main() { return 5; }')).result.value === 5, 'Transport failure poisoned later jobs');
  });
  await test('interpreter rejects reentrant exports while its host call is suspended', async () => {
    const {createAsyncifiedInterpreter} = await import('../runtime/asyncify.js');
    const bytes = await (await fetch(new URL('../runtime/artifacts/camel-browser.wasm', import.meta.url))).arrayBuffer();
    let resume;
    const interpreter = await createAsyncifiedInterpreter(bytes, {request: () => new Promise(resolve => {resume = resolve;})});
    const running = interpreter.execute({source: 'tool int Host() { handler = "nexus.discover"; } workflow int Main() { int before = 4; return before + Host(); }'});
    await until(() => typeof resume === 'function', 'Interpreter did not suspend');
    await rejects(() => interpreter.execute({source: 'workflow int Main() { return 99; }'}), /already running/);
    resume(3); assert((await running).value === 7, 'Reentrant attempt corrupted saved stack');
  });
  await test('teardown cancels sessions and removes tick hooks', async () => {
    const baseline = engine.__nexusSurfaceRegistry.lifecycle.length;
    const {id} = camel.start(`${sessionTools} workflow object Main() { return Input(); }`);
    camel.dispose(); await rejects(() => camel.wait(id), /cancelled|no longer active/);
    assert(engine.__nexusSurfaceRegistry.lifecycle.length === baseline && camel.status().disposed, 'Teardown leaked a hook');
  });
  return {passed, total: passed.length, browser: navigator.userAgent};
}
