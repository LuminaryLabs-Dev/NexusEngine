import { performance } from 'node:perf_hooks';
import { cpus, totalmem, platform, release, arch } from 'node:os';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { performanceScene, performanceFrame } from '../kits/render/graphics-language-kit/tests/fixtures/performance-scenes.mjs';
import { distribution } from '../kits/render/graphics-language-kit/tests/helpers.mjs';

const args = process.argv.slice(2), option = (name, fallback) => { const index = args.indexOf(name); if (index < 0) return fallback; if (!args[index + 1] || args[index + 1].startsWith('--')) throw Error(`Missing ${name} value`); return args[index + 1]; };
for (let i = 0; i < args.length; i += 2) if (!['--backend','--samples','--warmup','--width','--height','--output','--provider','--duration','--workload','--instances'].includes(args[i])) throw Error(`Unknown benchmark option: ${args[i]}`);
const bounded = (name, fallback, min, max) => { const value = Number(option(name, fallback)); if (!Number.isSafeInteger(value) || value < min || value > max) throw RangeError(`${name} must be ${min}..${max}`); return value; };
const samples = bounded('--samples', 3, 1, 120), warmup = bounded('--warmup', 3, 0, 30), width = bounded('--width', 320, 16, 1920), height = bounded('--height', 180, 16, 1080);
const duration = bounded('--duration', 0, 0, 600), instances = bounded('--instances', 24, 1, 4096);
const workloadNames = ['static','moving-object','camera','light','resize','quality'];
const selectedWorkload = option('--workload', 'all') === 'moving' ? 'moving-object' : option('--workload', 'all');
if (selectedWorkload !== 'all' && !workloadNames.includes(selectedWorkload)) throw Error('Workload must be all, static, moving, camera, light, resize or quality');
const workloads = selectedWorkload === 'all' ? workloadNames : [selectedWorkload];
const requested = option('--backend', 'auto');
if (!['auto','native','wasm','all'].includes(requested)) throw Error('Backend must be auto, native, wasm or all');
const backends = requested === 'all' ? (platform() === 'darwin' && arch() === 'arm64' ? ['native','wasm'] : ['wasm']) : [requested];
const providerModule = option('--provider', null) ? pathToFileURL(resolve(option('--provider'))) : new URL('../kits/render/graphics-language-kit/provider.js', import.meta.url);
const { createNexusGLProvider } = await import(providerModule.href);
const manifest = JSON.parse(await readFile(new URL('./runtime/artifacts/manifest.json', providerModule)));
const scene = performanceScene(instances);
const memory = () => ({ ...process.memoryUsage(), processPeakRSSBytes: process.resourceUsage().maxRSS * 1024 });
const results = [];
for (const backend of backends) {
  const creationStart = performance.now(), provider = createNexusGLProvider({ backend });
  await provider.initialize();
  const initializationMs = performance.now() - creationStart;
  const uploadStart = performance.now();
  for (const resource of scene.resources) provider.createResource(resource);
  const resourceDeclarationMs = performance.now() - uploadStart;
  const render = (id, change = 'static', sample = 0) => {
    const frameOptions = { width, height };
    const draws = structuredClone(scene.draws);
    if (change === 'moving-object') draws[0].transform[12] += .015 * ((sample % 7) + 1);
    if (change === 'camera') frameOptions.camera = .01 * ((sample % 7) + 1);
    if (change === 'light') frameOptions.light = .01 * ((sample % 7) + 1);
    if (change === 'resize') { frameOptions.width += sample % 2 ? 8 : 0; frameOptions.height += sample % 2 ? 8 : 0; }
    if (change === 'quality') frameOptions.quality = ['native','gaussian-half','guided-half'][sample % 3];
    const started = performance.now();
    const frame = performanceFrame(id, frameOptions);
    provider.beginFrame(frame);
    provider.executePass({ frameId: id, passId: 'main', sequence: 0, kind: 'render' }, draws);
    const prepared = performance.now();
    provider.submitFrame(id);
    const submitted = performance.now();
    const completed = provider.getCompletedFrame();
    const copied = performance.now();
    if (completed?.pixels.length !== frame.width * frame.height * 4) throw Error(`Incomplete benchmark frame: ${id}`);
    return { frameId: id, totalMs: copied - started, commandPreparationMs: prepared - started, executionMs: submitted - prepared, completedFrameCopyMs: copied - submitted, memory: memory(), diagnostics: provider.getDiagnostics() };
  };
  const first = render('cold-first-frame');
  const cases = [];
  for (const workload of workloads) {
    for (let i = 0; i < warmup; i++) render(`${workload}-warmup-${i}`, workload, i);
    const before = { memory: memory(), diagnostics: provider.getDiagnostics() }, observations = [];
    const peak = { ...before.memory }, measuredStart = performance.now();
    let totalFrames = 0;
    do {
      const result = render(`${workload}-${totalFrames}`, workload, totalFrames + warmup);
      // Keep a fixed final-frame ring; long runs never retain an unbounded history.
      observations[totalFrames % 120] = result;
      for (const key of Object.keys(peak)) peak[key] = Math.max(peak[key], result.memory[key]);
      totalFrames++;
    } while (totalFrames < samples || performance.now() - measuredStart < duration * 1000);
    const actualDurationMs = performance.now() - measuredStart;
    const metrics = {};
    for (const metric of ['totalMs','commandPreparationMs','executionMs','completedFrameCopyMs']) metrics[metric] = distribution(observations.map(result => result[metric]));
    cases.push({ workload, samples, warmup, requestedDurationSeconds: duration, totalFrames, actualDurationMs, retainedFrames: observations.length, distributionScope: totalFrames > 120 ? 'last-120-frames' : 'all-measured-frames', metrics, before, after: { memory: memory(), diagnostics: provider.getDiagnostics() }, observedPeakMemory: peak, observations });
  }
  const final = provider.getDiagnostics();
  provider.dispose();
  results.push({ requestedBackend: backend, backend: final.backend, initializationMs, resourceDeclarationMs, firstFrame: first, cases, disposedDiagnostics: provider.getDiagnostics() });
}
const report = { schema: 'nexusengine.nexusgl-render-benchmark/1', providerModule: fileURLToPath(providerModule), measuredAt: new Date().toISOString(), environment: { platform: platform(), release: release(), arch: arch(), node: process.version, cpu: cpus()[0]?.model, logicalCPUs: cpus().length, totalMemoryBytes: totalmem() }, workload: { width, height, instances, durationSeconds: duration, selected: selectedWorkload, resources: scene.resources.length, draws: scene.draws.length, triangles: scene.triangles, shadowResolution: 64 }, artifacts: manifest.files.map(({ path, sha256, sourceDigest, build }) => ({ path, sha256, sourceDigest, toolchain: build?.toolchain })), notes: ['Cold measures initialization and first submission in this process; module loading may already be cached by earlier backends.', 'Timing distributions cover all measured frames up to 120, then only the final 120; memory maxima cover every measured frame.', 'Memory is sampled at frame boundaries; processPeakRSSBytes is the process lifetime high-water mark, not isolated renderer allocation.', 'Execution includes provider preparation, native/WASM transfer and rendering. It does not include platform presentation.', 'No performance pass/fail threshold or speedup is inferred from these measurements.'], results };
const json = JSON.stringify(report, null, 2) + '\n';
const output = option('--output', null);
if (output) { const path = resolve(output); await mkdir(dirname(path), { recursive: true }); await writeFile(path, json); }
process.stdout.write(json);
