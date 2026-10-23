import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { cp, readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const host = process.platform + '-' + process.arch;
const record = (id, languages, command, driver, extra = {}) => ({ id, languages, command, driver, roles: ['compiler'], hosts: [host], targets: ['host-native'], ...extra });
function diagnostic(result) { const lines = (result.stderr || result.stdout || '').trim().split('\n').filter(Boolean); return lines.map(line => { try {
    const d = JSON.parse(line);
    if (d.message && d.level)
        return { severity: d.level === 'error' ? 'error' : d.level === 'warning' ? 'warning' : 'info', message: d.message, path: d.spans?.[0]?.file_name ?? null, line: d.spans?.[0]?.line_start ?? null };
}
catch { } return { severity: result.ok ? 'info' : 'error', message: line }; }); }
const invoke = (toolchain, args, run) => run(toolchain.command, [...toolchain.arguments, ...args]);
async function copyInputs(inputs, outputs) { await cp(inputs, outputs, { recursive: true }); }
export const languageToolchainsManifest = Object.freeze({ id: 'language-toolchains-kit', kind: 'optional-build-provider', domainOwners: ['n:build:toolchain', 'n:build:compile'], coreDefaultImport: false });
export function createLanguageToolchains() {
    const metadataPath = require.resolve('@typescript/typescript6/package.json'), metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
    const tsc = path.resolve(path.dirname(metadataPath), metadata.bin.tsc6 ?? metadata.bin.tsc);
    const entries = [
        record('rust', ['rust'], 'rustc', 'rust'),
        record('clang', ['c'], 'clang', 'clang'), record('clang-cpp', ['cpp'], 'clang++', 'clang'),
        record('javascript', ['javascript'], process.execPath, 'javascript', { runtimeDependencies: ['node.runtime'] }),
        record('typescript', ['typescript'], process.execPath, 'typescript', { arguments: [tsc], runtimeDependencies: ['node.runtime'] }),
        record('node.runtime', ['javascript', 'typescript'], process.execPath, null, { roles: ['runtime', 'interpreter'] }),
        record('python', ['python'], 'python3', 'python', { runtimeDependencies: ['python.runtime'] }),
        record('python.runtime', ['python'], 'python3', null, { roles: ['runtime', 'interpreter'] }),
        record('dotnet', ['csharp'], 'dotnet', 'dotnet', { capabilities: ['driver-not-yet-validated'] }),
        record('quickjs.runtime', ['javascript'], null, null, { roles: ['runtime'], sourceId: 'git:quickjs-ng@v0.15.0', targets: ['host-native', 'android-xr'] }),
        record('web.runtime', ['html', 'javascript'], null, null, { roles: ['runtime'], targets: ['host-native', 'android-xr'], capabilities: ['host-provider-required'] })
    ];
    const nativeCompile = async ({ plan, toolchain, inputs, outputs, run }) => { const artifact = path.join(outputs, process.platform === 'win32' ? 'program.exe' : 'program'); const args = toolchain.driver === 'rust' ? [path.join(inputs, plan.entry), '--edition=2021', '--error-format=json', '-o', artifact] : [path.join(inputs, plan.entry), '-o', artifact]; const result = await invoke(toolchain, args, run); return { ok: result.ok, process: result, diagnostics: diagnostic(result), artifacts: result.ok ? [{ path: artifact, kind: 'executable' }] : [], launch: result.ok ? { command: artifact, arguments: [] } : null }; };
    const scriptCompile = async ({ plan, toolchain, inputs, outputs, run }) => {
        let args;
        if (toolchain.driver === 'typescript')
            args = [path.join(inputs, plan.entry), '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--outDir', outputs, '--noEmitOnError', '--pretty', 'false'];
        else if (toolchain.driver === 'python')
            args = ['-c', 'import pathlib,sys; compile(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"),sys.argv[1],"exec")', path.join(inputs, plan.entry)];
        else
            args = ['--check', path.join(inputs, plan.entry)];
        const result = await invoke(toolchain, args, run);
        if (result.ok && toolchain.driver !== 'typescript')
            await copyInputs(inputs, outputs);
        if (result.ok && toolchain.driver === 'typescript') {
            try {
                await cp(path.join(inputs, 'package.json'), path.join(outputs, 'package.json'));
            }
            catch (e) {
                if (e.code !== 'ENOENT')
                    throw e;
            }
        }
        const entry = path.join(outputs, toolchain.driver === 'typescript' ? plan.entry.replace(/\.[cm]?ts$/, '.js') : plan.entry);
        // Record the complete emitted output closure, not just its entry file.
        const artifacts = [];
        async function walk(dir) { for (const e of await readdir(dir, { withFileTypes: true })) {
            const p = path.join(dir, e.name);
            if (e.isDirectory())
                await walk(p);
            else if (e.isFile())
                artifacts.push({ path: p, kind: 'module' });
        } }
        if (result.ok)
            await walk(outputs);
        const runtime = plan.selection.selected.find(r => r.toolchain.roles.includes('runtime'))?.toolchain;
        return { ok: result.ok, process: result, diagnostics: diagnostic(result), artifacts, launch: result.ok ? { command: runtime.command, arguments: [...runtime.arguments, entry] } : null };
    };
    return { toolchainDiscovery: {timeoutMs:15000}, toolchainRegistry: { entries }, compilerDrivers: { rust: { version: '1', compile: nativeCompile }, clang: { version: '1', compile: nativeCompile }, javascript: { version: '1', compile: scriptCompile }, typescript: { version: '1', compile: scriptCompile }, python: { version: '1', compile: scriptCompile } } };
}
