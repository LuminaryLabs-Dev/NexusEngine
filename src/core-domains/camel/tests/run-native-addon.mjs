// Builds are separate from checked-in platform support. Set an explicit task-local addon path.
import {createRequire} from 'node:module';
import {createEngine} from '../../../engine.js';
import {createDataKit} from '../../runtime/data/kits/data-kit/index.js';
import {createNexusBinding} from '../nexus-api/binding.js';
import {resolve} from 'node:path';
if (!process.env.CAMEL_NATIVE_ARTIFACT) throw new Error('Set CAMEL_NATIVE_ARTIFACT to the locally built .node file');
const native = createRequire(import.meta.url)(resolve(process.env.CAMEL_NATIVE_ARTIFACT));
const engine = createEngine({kits: [createDataKit({createApi: () => ({async echo(value) {await new Promise(resolve => setTimeout(resolve, 5)); return value;}})})]});
const tools = 'tool any Call(string api, string[] path, any[] args) { handler = "nexus.call"; }';
let sequence = 0, late;
function invoke(source, options = {}) {
  const id = `native-test:${++sequence}`;
  const binding = createNexusBinding(engine, {allowCalls: ['data.completion.createLedger:call', 'data.echo:call']});
  const promise = native.execute(JSON.stringify({id, source, ...options}), (error, json) => {
    if (error) return;
    const packet = JSON.parse(json);
    if (packet.kind === 'log') return;
    Promise.resolve().then(() => {
      if (packet.kind === 'nexus') return binding.call(packet.payload);
      if (packet.kind === 'discover') return binding.discover();
      if (packet.kind === 'model') return new Promise(resolve => {late = () => resolve({content: 'late'});});
      throw new Error('Unknown host request');
    }).then(value => native.reply(packet.id, JSON.stringify({ok: true, value}))).catch(error => native.reply(packet.id, JSON.stringify({ok: false, error: error.message})));
  }).then(JSON.parse).finally(() => binding.dispose());
  return {id, promise};
}
function assert(value, message) {if (!value) throw new Error(message);}
async function rejects(promise, pattern) {try {await promise;} catch (error) {assert(pattern.test(error.message), error.message); return;} throw new Error('Expected rejection');}
assert((await invoke('workflow int Main() { return 42; }').promise).value === 42, 'Native arithmetic');
assert((await invoke('workflow int Main() { return 1; }', {action: 'check'}).promise).declarations[0].name === 'Main', 'Native check');
await invoke(`${tools} workflow any Main() { return Call("data", ["completion", "createLedger"], ["native-ledger"]); }`).promise;
assert(engine.n.data.completion.listLedgers().includes('native-ledger'), 'Native installed state mutation');
assert((await invoke(`${tools} workflow int Main() { return Call("data", ["echo"], [19]); }`).promise).value === 19, 'Native asynchronous call');
assert((await invoke('int F(int value) { return value * 2; } workflow int Main() { Task<int> work = spawn F(7); return await work; }').promise).value === 14, 'Native threaded task');
await rejects(invoke(`${tools} workflow any Main() { return Call("data", ["completion", "reset"], []); }`).promise, /Call not granted/);
await rejects(invoke('workflow int Main() { while (true) {} return 0; }', {steps: 100}).promise, /step budget/);
await rejects(invoke('tool string Read(string path) { handler = "files.read"; } workflow string Main() { return Read("private"); }').promise, /capability denied/);
const job = invoke('agent A { model = "wait"; } workflow string Main() { return A.run("hello").text; }');
while (!late) await new Promise(resolve => setTimeout(resolve, 5));
assert(native.cancel(job.id), 'Native cancellation not accepted');
await rejects(job.promise, /cancelled/);
late();
console.log(JSON.stringify({passed: 9, target: `${process.platform}-${process.arch}`, packagedArtifact: false, semantics: 'arithmetic/check/shared Nexus state/async host call/threaded task/permission/step budget/capability/cancellation'}, null, 2));
