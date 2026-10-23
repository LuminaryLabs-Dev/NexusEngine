import { mkdir, readFile, writeFile, rename, realpath, lstat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createEngine } from 'nexusengine';
import { createAuthoringDomain } from 'nexusengine/domains/authoring';
import { createBuildDomain } from 'nexusengine/domains/build';
import { contentIntegrity, assertInside, assertOutside } from '../../../src/core-domains/build/contracts.js';
import { createLanguageToolchains } from '../../build/language-toolchains-kit/index.js';
import { createTypeScriptProvider } from './language.js';
export { createStdioProtocol } from './protocol.js';
export { serveIde } from './server.mjs';
export const ideManifest = Object.freeze({ id: 'ide-kit', kind: 'optional-host-provider', domainOwners: ['n:authoring:code', 'n:build', 'n:presentation', 'n:runtime'], coreDefaultImport: false });
export async function createIdeHost({ projectRoot, stateRoot, authorize, languageProvider = createTypeScriptProvider(), debugProvider = null }) {
    projectRoot = await realpath(projectRoot);
    stateRoot = path.resolve(stateRoot);
    assertOutside(projectRoot, stateRoot, 'IDE state');
    await mkdir(stateRoot, { recursive: true });
    stateRoot = await realpath(stateRoot);
    assertOutside(projectRoot, stateRoot, 'Physical IDE state');
    const engine = createEngine({ kits: createAuthoringDomain() }), project = engine.n.authoringProject, code = engine.n.authoringCode, intelligence = engine.n.codeIntelligence;
    const build = createBuildDomain({ ...createLanguageToolchains(), stateRoot: path.join(stateRoot, 'build') });
    let latest = null;
    const disk = new Map();
    const authorized = async (kind, details = {}) => { if (await authorize?.({ kind, ...details }) !== true)
        throw new Error(kind + ' not authorized'); };
    const execute = operations => project.execute({ requestId: randomUUID(), epoch: project.context().epoch, operations });
    async function safeFile(relative) { const filename = assertInside(projectRoot, path.join(projectRoot, relative), 'Source file'); assertInside(projectRoot, await realpath(path.dirname(filename)), 'Source parent'); try {
        if ((await lstat(filename)).isSymbolicLink())
            throw new Error('Source symlinks are unsupported');
    }
    catch (e) {
        if (e.code !== 'ENOENT')
            throw e;
    } return filename; }
    async function open(paths) { await authorized('source-open', { paths }); for (const logical of paths) {
        if (code.list().some(d => d.content.path === logical))
            continue;
        const filename = await safeFile(logical), bytes = await readFile(filename), text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
        disk.set(logical, contentIntegrity(bytes));
        const language = ({ ts: 'typescript', js: 'javascript', mjs: 'javascript', rs: 'rust', c: 'c', cpp: 'cpp', py: 'python', cs: 'csharp' })[logical.split('.').at(-1)] ?? 'text';
        execute([{ id: 'code.set', args: { id: logical, content: { path: logical, language, text } } }]);
    } return view(); }
    async function create({ path: logical, language, text = '' }) { await authorized('source-create'); if (code.list().some(d => d.content.path.toLowerCase() === logical.toLowerCase()))
        throw new Error('Source path already open'); const filename = await safeFile(logical); try {
        await lstat(filename);
        throw new Error('Source already exists; open it instead');
    }
    catch (e) {
        if (e.code !== 'ENOENT')
            throw e;
    } execute([{ id: 'code.set', args: { id: logical, content: { path: logical, language, text } } }]); disk.set(logical, null); return view(); }
    function edit({ id, text, revision }) { const doc = code.get(id); return execute([{ id: 'code.edit', args: { id, expectedRevision: revision, edits: [{ start: 0, end: doc.content.text.length, text }] } }]); }
    async function save() { await authorized('source-save'); const snapshot = code.exportFiles(); for (const file of snapshot.files) {
        const filename = await safeFile(file.path);
        let before;
        try {
            before = contentIntegrity(await readFile(filename));
        }
        catch (e) {
            if (e.code !== 'ENOENT')
                throw e;
            before = null;
        }
        if (before !== (disk.get(file.path) ?? null))
            throw new Error('Source changed outside the editor: ' + file.path);
        const temporary = filename + '.nexus-' + randomUUID();
        await writeFile(temporary, file.text, { flag: 'wx' });
        try {
            let current;
            try {
                current = contentIntegrity(await readFile(filename));
            }
            catch (e) {
                if (e.code !== 'ENOENT')
                    throw e;
                current = null;
            }
            if (current !== before)
                throw new Error('Source changed during save');
            await rename(temporary, filename);
        }
        catch (error) {
            await unlink(temporary).catch(() => { });
            throw error;
        }
        disk.set(file.path, contentIntegrity(Buffer.from(file.text)));
    } await writeFile(path.join(stateRoot, 'session.json'), JSON.stringify(project.getSnapshot())); return view(); }
    async function reopen() { await authorized('source-open'); const snapshot = JSON.parse(await readFile(path.join(stateRoot, 'session.json'), 'utf8')); for (const d of Object.values(snapshot.documents ?? {}).filter(d => d.kind === 'code')) {
        const bytes = await readFile(await safeFile(d.content.path));
        if (contentIntegrity(bytes) !== contentIntegrity(Buffer.from(d.content.text)))
            throw new Error('Saved session differs from disk: ' + d.content.path);
    } project.loadSnapshot(snapshot); disk.clear(); for (const f of code.exportFiles().files)
        disk.set(f.path, contentIntegrity(await readFile(await safeFile(f.path)))); return view(); }
    async function language({ id, kind = 'diagnostics', position }) { const doc = code.get(id), request = intelligence.request({ requestId: randomUUID(), id, revision: doc.revision, kind, ...(position === undefined ? {} : { position }) }); const result = await languageProvider(request, code.exportFiles().files); return intelligence.accept({ requestId: request.requestId, result }); }
    async function compile({ id, toolchainId }) { await authorized('build'); const file = code.get(id).content, source = code.exportFiles(); const plan = build.planProgram({ projectRoot, entry: file.path, files: source.files.map(f => ({ path: f.path, content: f.text })), toolchain: { language: file.language, host: process.platform + '-' + process.arch, target: 'host-native', ...(toolchainId ? { toolchainId } : {}) } }); if (plan.status !== 'ready')
        return { status: 'blocked', requirements: plan.requirements }; latest = await build.compileProgram(plan.id, { approvePlan: plan.id }); return latest; }
    async function run() { await authorized('run'); if (!latest)
        throw new Error('Build a program first'); return build.runProgram(latest.id, { approveReceipt: latest.id }); }
    async function git(action = 'status') { await authorized('git-read'); if (!['status', 'diff'].includes(action))
        throw new Error('Unsupported Git operation'); return build.services.processExecution.run('git', ['-C', projectRoot, action, ...(action === 'status' ? ['--short'] : ['--no-ext-diff'])], { cwd: stateRoot }); }
    async function terminal(command, args = []) { await authorized('terminal', { command, args }); return build.services.processExecution.run(command, args, { cwd: stateRoot }); }
    async function debug(command, args = {}) { await authorized('debug'); if (!debugProvider)
        throw new Error('Debug provider unavailable'); return debugProvider.request(command, args); }
    function view() { return { documents: code.exportFiles().files, capabilities: { language: intelligence.capabilities(), debug: !!debugProvider, terminal: true }, build: latest ? { id: latest.id, status: latest.status, diagnostics: latest.diagnostics } : null }; }
    return Object.freeze({ engine, build, open, create, edit, save, reopen, language, compile, run, git, terminal, debug, view, undo: () => project.undo({ requestId: randomUUID(), epoch: project.context().epoch }), redo: () => project.redo({ requestId: randomUUID(), epoch: project.context().epoch }), applyLanguage: input => intelligence.apply(input), close: async () => { debugProvider?.stop(); await build.shutdown(); } });
}
