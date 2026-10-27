import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collectRuntimeInputs, closureFor, sha256, sourceDigest, targetOptions, runtimeCapabilities, verifyManifest } from '../runtime/build.mjs';

const artifacts = new URL('../runtime/artifacts/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', artifacts)));
await verifyManifest(manifest);
assert.deepEqual(manifest.capabilities, runtimeCapabilities);
const provenance = JSON.parse(await readFile(new URL('../runtime/source/provenance.json', import.meta.url)));
assert.equal(provenance.schema, 'nexusengine.nexusgl-source/2');
assert(provenance.upstreamSnapshot?.revision && provenance.upstreamSnapshot?.files?.length, 'Keep the original upstream attribution');
const inputs = await collectRuntimeInputs();
assert.deepEqual(provenance.files, inputs.filter(input => input.path.startsWith('source/') && input.path !== 'source/provenance.json').map(input => ({ path: input.path.slice(7), sha256: input.sha256 })));
assert(inputs.some(input => input.path === 'source/include/nexusgl/c_api.h'));
assert(inputs.some(input => input.path === 'source/include/nexusgl/domains/scene/resource_store.hpp'));
assert(inputs.some(input => input.path === 'build.mjs'));

const clone = () => structuredClone(manifest);
const rejects = (value, pattern, options) => assert.rejects(() => verifyManifest(value, options), pattern);
let changed = clone(); changed.abi = 1; await rejects(changed, /schema or ABI/);
changed = clone(); changed.schema = 'unknown'; await rejects(changed, /schema or ABI/);
changed = clone(); changed.capabilities.pop(); await rejects(changed, /capabilities/);
changed = clone(); changed.capabilities.push('invented-feature'); await rejects(changed, /capabilities/);
changed = clone(); changed.inputs.pop(); await rejects(changed, /source closure/);
changed = clone(); changed.inputs.push({ path: 'source/include/unrecorded.hpp', sha256: '0'.repeat(64) }); await rejects(changed, /source closure/);
changed = clone(); changed.sourceDigest = '0'.repeat(64); await rejects(changed, /source closure/);
changed = clone(); changed.files.pop(); await rejects(changed, /inventory/);
changed = clone(); changed.files[1] = changed.files[0]; await rejects(changed, /artifact record/);
changed = clone(); changed.files[0].sha256 = '0'.repeat(64); await rejects(changed, /integrity mismatch/);
changed = clone(); changed.files[0].bytes++; await rejects(changed, /integrity mismatch/);
changed = clone(); changed.files[0].sourceDigest = '0'.repeat(64); await rejects(changed, /attestation/);
changed = clone(); changed.files[0].build.options.push('-ffast-math'); await rejects(changed, /attestation/);
changed = clone(); delete changed.files[0].build.toolchain.version; await rejects(changed, /attestation/);
changed = clone(); changed.targets.wasm.inputPaths.pop(); await rejects(changed, /target closure/);
changed = clone(); changed.targets.native.options.push('-ffast-math'); await rejects(changed, /target closure/);
await rejects(manifest, /integrity mismatch/, { read: async name => { const bytes = Buffer.from(await readFile(new URL(name, artifacts))); bytes[bytes.length - 1] ^= 1; return bytes; } });

// A WASM-only rebuild may update the global inventory, but cannot attest old native bytes.
const futureInputs = structuredClone(inputs);
futureInputs.find(input => input.path === 'source/include/nexusgl/c_api.h').sha256 = sha256('new header');
changed = clone(); changed.inputs = futureInputs; changed.sourceDigest = sourceDigest(futureInputs);
for (const target of ['wasm', 'native', 'window']) {
  const closure = closureFor(futureInputs, target);
  changed.targets[target] = { inputPaths: closure.map(input => input.path), sourceDigest: sourceDigest(closure), options: targetOptions[target] };
}
for (const artifact of changed.files.filter(file => file.target === 'wasm')) artifact.sourceDigest = changed.targets.wasm.sourceDigest;
await rejects(changed, /attestation.*nexusgl-darwin-arm64/, { inputs: futureInputs });
assert.equal(changed.targets.window.sourceDigest, manifest.targets.window.sourceDigest, 'Core-only changes leave the independent window closure unchanged');
console.log('Graphics runtime artifacts: source closure, per-target attestations, ABI, tampering and stale partial builds passed');
