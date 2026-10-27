import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir, realpath } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';

export const runtime = fileURLToPath(new URL('./', import.meta.url));
const root = resolve(runtime, '../../../..'), source = resolve(runtime, 'source');
export const sha256 = data => createHash('sha256').update(data).digest('hex');
const canonical = value => JSON.stringify(value);
export const runtimeCapabilities = ['transactions', 'resident-meshes', 'instances', 'render-into', 'diagnostics'];
const common = ['-std=c++17', '-O2', '-Wall', '-Wextra', '-Wpedantic', '-fexceptions'];
const exports = ['malloc', 'free', 'nx_last_error', 'nx_device_create', 'nx_device_destroy', 'nx_scene_create', 'nx_scene_destroy', 'nx_scene_clear_geometry', 'nx_scene_set_background', 'nx_device_set_limits', 'nx_texture_create', 'nx_get_abi_version', 'nx_scene_begin', 'nx_scene_commit', 'nx_scene_abort', 'nx_scene_revision', 'nx_mesh_create', 'nx_mesh_update', 'nx_mesh_release', 'nx_instance_create', 'nx_instance_update', 'nx_instance_release', 'nx_instance_order', 'nx_texture_update', 'nx_texture_release', 'nx_material_update', 'nx_material_release', 'nx_get_statistics', 'nx_device_set_shadow_cache_limit', 'ng_defaults', 'ng_material', 'ng_view', 'ng_light', 'ng_draw', 'ng_render', 'ng_pixels', 'ng_last_error', 'ng_device_destroy', 'ng_mesh', 'ng_instance', 'ng_material_update', 'ng_render_into', 'ng_statistics'].map(name => '_' + name);
export const targetOptions = {
  wasm: [...common, '--no-entry', '-sMODULARIZE=1', '-sEXPORT_ES6=1', '-sENVIRONMENT=web,worker,node', '-sALLOW_MEMORY_GROWTH=1', '-sIMPORTED_MEMORY=1', '-sMAXIMUM_MEMORY=536870912', '-sDISABLE_EXCEPTION_CATCHING=0', '-sEXPORTED_FUNCTIONS=' + canonical(exports), '-sEXPORTED_RUNTIME_METHODS=["UTF8ToString","HEAPU8"]'],
  native: [...common, '-DNEXUS_NODE', '-DNAPI_VERSION=8', '-bundle', '-undefined', 'dynamic_lookup'],
  window: ['-std=c++17', '-O2', '-Wall', '-Wextra', '-Wpedantic', '-fobjc-arc', '-DNAPI_VERSION=8', '-bundle', '-undefined', 'dynamic_lookup', '-framework', 'AppKit', '-framework', 'CoreGraphics']
};
const artifactTargets = { 'nexusgl.mjs': 'wasm', 'nexusgl.wasm': 'wasm', 'nexusgl-darwin-arm64.node': 'native', 'nexusgl-window-darwin-arm64.node': 'window' };
async function walk(directory) {
  const result = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (entry.isFile()) result.push(path);
    else throw Error(`Unsupported runtime source entry: ${path}`);
  }
  return result;
}
export async function collectRuntimeInputs() {
  const paths = [...await walk(source), resolve(runtime, 'bridge.cpp'), resolve(runtime, 'window.mm'), resolve(runtime, 'build.mjs')];
  return Promise.all(paths.sort().map(async file => ({ path: relative(runtime, file), sha256: sha256(await readFile(file)) })));
}
export function closureFor(inputs, target) {
  return inputs.filter(input => target === 'window' ? ['window.mm', 'build.mjs'].includes(input.path) : input.path !== 'window.mm');
}
export function sourceDigest(inputs) { return sha256(canonical(inputs)); }
export async function verifyManifest(manifest, options = {}) {
  const inputs = options.inputs ?? await collectRuntimeInputs();
  const read = options.read ?? (name => readFile(resolve(runtime, 'artifacts', name)));
  if (manifest?.schema !== 'nexusengine.nexusgl-artifacts/2' || manifest.abi !== 2) throw Error('Unsupported NexusGL artifact manifest schema or ABI');
  if (canonical(manifest.capabilities) !== canonical(runtimeCapabilities)) throw Error('Unsupported NexusGL artifact capabilities');
  if (canonical(manifest.inputs) !== canonical(inputs) || manifest.sourceDigest !== sourceDigest(inputs)) throw Error('Runtime source closure mismatch');
  if (!Array.isArray(manifest.files) || manifest.files.length !== Object.keys(artifactTargets).length) throw Error('Incomplete NexusGL artifact inventory');
  for (const [name, target] of Object.entries(artifactTargets)) {
    const records = manifest.files.filter(file => file.path === name);
    if (records.length !== 1) throw Error(`Invalid NexusGL artifact record: ${name}`);
    const record = records[0], closure = closureFor(inputs, target), digest = sourceDigest(closure), definition = manifest.targets?.[target];
    if (definition?.sourceDigest !== digest || canonical(definition?.inputPaths) !== canonical(closure.map(input => input.path)) || canonical(definition?.options) !== canonical(targetOptions[target])) throw Error(`Runtime target closure or options mismatch: ${target}`);
    if (record.target !== target || record.sourceDigest !== digest || canonical(record.build?.options) !== canonical(targetOptions[target]) || !record.build?.toolchain?.compiler || !record.build.toolchain.version || !record.build.toolchain.externalInputsDigest) throw Error(`Stale or incomplete NexusGL artifact attestation: ${name}`);
    const data = await read(name);
    if (!Number.isSafeInteger(record.bytes) || record.bytes !== data.length || record.sha256 !== sha256(data)) throw Error(`NexusGL artifact integrity mismatch: ${name}`);
  }
  return { verified: true, abi: 2, artifacts: manifest.files.length, sourceDigest: manifest.sourceDigest };
}
function execute(command, args, extra = {}, capture = false) {
  const result = spawnSync(command, args, { stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8', cwd: root, env: { ...process.env, ...extra } });
  if (result.error || result.status !== 0) throw Error(`Build failed: ${command}: ${result.error?.message ?? result.stderr ?? result.status}`);
  return result.stdout?.trim();
}
async function externalDigest(paths) {
  const records = [];
  for (const path of paths) for (const file of (await walk(path)).filter(file => /\.(h|hpp)$/.test(file))) records.push({ path: relative(path, file), sha256: sha256(await readFile(file)) });
  return sourceDigest(records);
}
async function updateProvenance() {
  const path = resolve(source, 'provenance.json'), previous = JSON.parse(await readFile(path));
  const files = [];
  for (const file of await walk(source)) if (file !== path) files.push({ path: relative(source, file), sha256: sha256(await readFile(file)) });
  const provenance = { ...previous, schema: 'nexusengine.nexusgl-source/2', note: 'Vendored NexusGL snapshot with local NexusEngine efficiency and stability patches. The upstream revision identifies ancestry, not an exact upstream checkout; original per-file attribution is retained separately.', upstreamSnapshot: previous.upstreamSnapshot ?? { repository: previous.repository, revision: previous.revision, note: previous.note, files: previous.files }, files };
  await writeFile(path, JSON.stringify(provenance, null, 2) + '\n');
}
export async function main(args = process.argv.slice(2)) {
  if (args.some(arg => !['--native', '--wasm', '--check', '--native-test', '--update-provenance'].includes(arg))) throw Error('Use --native, --wasm, --check, --native-test or --update-provenance');
  if (!args.length) throw Error('Select --native and/or --wasm, or --check');
  if (args.includes('--native-test')) execute(process.execPath, [resolve(runtime, '../tests/native/run.mjs')]);
  if (args.includes('--update-provenance')) await updateProvenance();
  const selected = new Map();
  if (args.includes('--native') || args.includes('--wasm')) await mkdir(resolve(runtime, 'artifacts'), { recursive: true });
  const tmp = resolve(root, 'build/graphics-runtime/tmp');
  const sourceArgs = ['-I' + resolve(source, 'include'), ...(await walk(source)).filter(path => path.endsWith('.cpp')), resolve(runtime, 'bridge.cpp')];
  if (args.includes('--wasm')) {
    await mkdir(tmp, { recursive: true });
    const localSDK = resolve(root, 'build/graphics-runtime/emsdk');
    const compiler = process.env.EMXX ?? (existsSync(localSDK) ? resolve(localSDK, 'upstream/emscripten/em++') : 'em++');
    const extra = { TMPDIR: tmp };
    if (existsSync(localSDK)) {
      extra.EMSDK_PYTHON = process.env.EMSDK_PYTHON ?? resolve(localSDK, 'python/3.13.3_64bit/bin/python3');
      extra.EM_CACHE = process.env.EM_CACHE ?? resolve(localSDK, 'upstream/emscripten/cache');
    }
    const version = execute(compiler, ['--version'], extra, true);
    const driver = await realpath(compiler.includes('/') ? compiler : execute('/usr/bin/which', [compiler], {}, true));
    const toolchain = { compiler: 'Emscripten em++', version, driverSha256: sha256(await readFile(driver)), externalInputsDigest: sha256(version + '\n' + sha256(await readFile(driver))), maximumMemoryBytes: 536870912 };
    execute(compiler, [...targetOptions.wasm, ...sourceArgs, '-o', resolve(runtime, 'artifacts/nexusgl.mjs')], extra);
    selected.set('wasm', toolchain);
  }
  if (args.includes('--native')) {
    if (process.platform !== 'darwin' || process.arch !== 'arm64') throw Error('Bundled native artifacts target macOS arm64');
    const headers = process.env.NODE_INCLUDE ?? '/opt/homebrew/include/node';
    const version = execute('xcrun', ['clang++', '--version'], {}, true), sdk = execute('xcrun', ['--show-sdk-version'], {}, true);
    const clang = execute('xcrun', ['--find', 'clang++'], {}, true);
    const toolchain = { compiler: 'Apple clang++', version, driverSha256: sha256(await readFile(clang)), sdk, nodeABI: 'N-API 8', externalInputsDigest: await externalDigest([headers]) };
    execute('xcrun', ['clang++', ...targetOptions.native, ...sourceArgs, '-I' + headers, '-o', resolve(runtime, 'artifacts/nexusgl-darwin-arm64.node')]);
    selected.set('native', toolchain);
    execute('xcrun', ['clang++', ...targetOptions.window, '-I' + headers, resolve(runtime, 'window.mm'), '-o', resolve(runtime, 'artifacts/nexusgl-window-darwin-arm64.node')]);
    selected.set('window', toolchain);
  }
  if (selected.size) {
    const inputs = await collectRuntimeInputs();
    let previous;
    try { previous = JSON.parse(await readFile(resolve(runtime, 'artifacts/manifest.json'))); } catch { previous = {}; }
    const targets = {}, files = [];
    for (const target of ['wasm', 'native', 'window']) {
      const closure = closureFor(inputs, target);
      targets[target] = { inputPaths: closure.map(input => input.path), sourceDigest: sourceDigest(closure), options: targetOptions[target] };
    }
    for (const [name, target] of Object.entries(artifactTargets)) {
      if (selected.has(target)) {
        const data = await readFile(resolve(runtime, 'artifacts', name));
        files.push({ path: name, bytes: data.length, sha256: sha256(data), target, sourceDigest: targets[target].sourceDigest, build: { toolchain: selected.get(target), options: targetOptions[target] } });
      } else {
        // Retain the old artifact's own attestation. A partial build never claims it was rebuilt.
        files.push(previous.files?.find(file => file.path === name) ?? { path: name, target });
      }
    }
    const manifest = { schema: 'nexusengine.nexusgl-artifacts/2', abi: 2, capabilities: runtimeCapabilities, nativeABI: 'N-API 8', sourceDigest: sourceDigest(inputs), inputs, targets, files };
    await writeFile(resolve(runtime, 'artifacts/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log('Rebuilt runtime targets:', [...selected.keys()].join(', '));
  }
  if (args.includes('--check')) console.log(JSON.stringify(await verifyManifest(JSON.parse(await readFile(resolve(runtime, 'artifacts/manifest.json'))))));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
