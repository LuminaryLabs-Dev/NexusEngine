import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const directory = fileURLToPath(new URL('.', import.meta.url));
const artifact = resolve(directory, '../artifacts/camel-browser.wasm');
const cargo = process.env.CARGO ?? 'cargo';
const rustc = process.env.RUSTC ?? 'rustc';
const wasmOpt = process.env.WASM_OPT ?? resolve(directory, 'node_modules/.bin/wasm-opt');
function run(binary, args, options = {}) {return execFileSync(binary, args, {cwd: directory, ...options});}
if (!run(rustc, ['--version'], {encoding: 'utf8'}).startsWith('rustc 1.90.0 ')) throw new Error('This artifact is pinned to Rust 1.90.0');
if (!/version 123\b/.test(run(wasmOpt, ['--version'], {encoding: 'utf8'}))) throw new Error('This artifact is pinned to Binaryen 123.0.0');
const flags = '-C link-arg=--max-memory=134217728 -C link-arg=-zstack-size=2097152';
// Normalize source/registry paths so local filesystem paths are not shipped in panic strings.
const registry = resolve(process.env.CARGO_HOME ?? resolve(process.env.HOME, '.cargo'), 'registry/src');
const sourceRoot = resolve(directory, '../../../../..');
const buildFlags = `${flags} --remap-path-prefix=${registry}=cargo-registry --remap-path-prefix=${sourceRoot}=nexusengine`;
if (process.env.RUSTFLAGS && process.env.RUSTFLAGS !== flags) throw new Error('Unexpected RUSTFLAGS would change the pinned artifact');
run(cargo, ['build', '--locked', '--release', '--target', 'wasm32-unknown-unknown', '--manifest-path', 'Cargo.toml'], {stdio: 'inherit', env: {...process.env, RUSTFLAGS: buildFlags}});
mkdirSync(resolve(directory, '../artifacts'), {recursive: true});
run(wasmOpt, ['target/wasm32-unknown-unknown/release/nexus_camel_wasm.wasm', '--asyncify', '--pass-arg=asyncify-imports@camel.host_request', '--enable-bulk-memory', '--strip-debug', '-o', artifact], {stdio: 'inherit'});
const bytes = readFileSync(artifact);
const manifest = {schema: 'nexusengine.camel-wasm-artifact/1', sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, upstreamCommit: 'e7b770737516558652d38642583c6db184fd3fd4', rust: '1.90.0', binaryen: '123.0.0', target: 'wasm32-unknown-unknown'};
writeFileSync(resolve(directory, '../artifacts/browser-integrity.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Camel WASM ${manifest.bytes} bytes sha256:${manifest.sha256}`);
