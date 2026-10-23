import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createEngine } from 'nexusengine';
import { createAuthoringDomain, createCodeDocumentKit, createCodeIntelligenceKit } from 'nexusengine/domains/authoring';
import { createBuildDomain } from 'nexusengine/domains/build';
import { createToolchainRegistryService } from 'nexusengine/domains/build/toolchain/toolchain-registry';
import { createToolchainResolutionService } from 'nexusengine/domains/build/toolchain/toolchain-resolution';
import { createLanguageToolchains } from 'nexusengine/kits/build/language-toolchains';
import { createIdeHost, serveIde, createStdioProtocol } from 'nexusengine/kits/development/ide';
const record = { id: 'fixture', roles: ['compiler'], languages: ['fixture'], hosts: ['test-host'], targets: ['test-target'], command: 'fixture-compiler', driver: 'fixture' };
const probe = { inspectTool: r => ({ available: true, version: r.version ?? 'fixture-v1', command: r.command }) };
await test('toolchain registry identity, atomic restore, reset and missing capabilities', () => {
    const registry = createToolchainRegistryService({ entries: [record] });
    assert.deepEqual(registry.register(record), registry.get('fixture'));
    assert.throws(() => registry.register({ ...record, command: 'different' }), /collision/);
    const before = registry.getSnapshot();
    assert.throws(() => registry.loadSnapshot({ ...before, entries: [record, record] }), /Duplicate/);
    assert.deepEqual(registry.getSnapshot(), before);
    registry.register({ ...record, id: 'second' });
    registry.reset();
    assert.equal(registry.list().length, 1);
    const resolution = createToolchainResolutionService({ registry, discovery: probe }), request = { language: 'fixture', host: 'test-host', target: 'test-target' };
    assert.equal(resolution.resolve(request).status, 'ready');
    assert.equal(resolution.resolve({ ...request, target: 'other' }).status, 'blocked');
    registry.register({ ...record, id: 'second' });
    assert.equal(resolution.resolve(request).requirements[0].code, 'toolchain-selection-ambiguous');
    registry.register({ ...record, id: 'cycle', roles: ['runtime'], runtimeDependencies: ['cycle'] });
    registry.register({ ...record, id: 'needs-runtime', runtimeDependencies: ['cycle'] });
    assert(resolution.resolve({ ...request, toolchainId: 'needs-runtime' }).requirements.some(r => r.code === 'runtime-dependency-cycle'));
    assert.equal(createToolchainResolutionService({ registry }).resolve({ ...request, toolchainId: 'fixture' }).status, 'blocked');
});
const engine = createEngine({ kits: createAuthoringDomain() }), project = engine.n.authoringProject, code = engine.n.authoringCode, intel = engine.n.codeIntelligence;
let serial = 0;
const execute = operations => project.execute({ requestId: 'code-test-' + (++serial), epoch: project.context().epoch, operations });
await test('installed code operations preserve UTF-8/CRLF and Project history', () => {
    execute([{ id: 'code.set', args: { id: 'a', content: { path: 'main.ts', language: 'typescript', text: 'const x = "🌍";\r\n' } } }, { id: 'code.set', args: { id: 'b', content: { path: 'other.ts', language: 'typescript', text: 'export const y = 2;\n' } } }]);
    const installedSnapshot = project.getSnapshot();
    engine.installKit(createCodeDocumentKit());
    engine.installKit(createCodeIntelligenceKit());
    assert.deepEqual(project.getSnapshot(), installedSnapshot);
    assert.equal(engine.n.ownerOf('n:authoring:code'), 'code-document-kit');
    assert.equal(engine.n.ownerOf('n:authoring:code:intelligence'), 'code-intelligence-kit');
    const original = code.get('a');
    assert.equal(original.content.lineEnding, 'crlf');
    const start = original.content.text.indexOf('🌍');
    assert.throws(() => execute([{ id: 'code.edit', args: { id: 'a', expectedRevision: original.revision, edits: [{ start: start + 1, end: start + 1, text: '!' }] } }]), /boundary/);
    execute([{ id: 'code.edit', args: { id: 'a', expectedRevision: original.revision, edits: [{ start, end: start + 2, text: 'world' }] } }]);
    assert(code.get('a').content.text.includes('world'));
    project.undo({ requestId: 'undo-code', epoch: project.context().epoch });
    assert.equal(code.get('a').content.text, original.content.text);
    project.redo({ requestId: 'redo-code', epoch: project.context().epoch });
    assert(code.get('a').content.text.includes('world'));
    const snapshot = project.getSnapshot();
    assert.throws(() => execute([{ id: 'code.apply-edits', args: { documents: [{ id: 'a', expectedRevision: code.get('a').revision, edits: [{ start: 0, end: 0, text: '// ok\r\n' }] }, { id: 'b', expectedRevision: 999999, edits: [] }] } }]), /Stale/);
    assert.deepEqual(project.getSnapshot(), snapshot);
    assert.throws(() => execute([{ id: 'code.set', args: { id: 'unsafe', content: { path: '../escape.ts', language: 'typescript', text: '' } } }]), /relative/);
    const clone = createEngine({ kits: createAuthoringDomain() });
    clone.n.authoringProject.loadSnapshot(snapshot);
    assert.deepEqual(clone.n.authoringCode.exportFiles().files.map(({ revision, ...rest }) => rest), code.exportFiles().files.map(({ revision, ...rest }) => rest));
    assert(clone.n.authoringProject.context().epoch > snapshot.epoch);
});
await test('late language responses are stale and refactoring stays revision-guarded and atomic', () => {
    const doc = code.get('a');
    const stale = intel.request({ requestId: 'stale', id: 'a', revision: doc.revision, kind: 'diagnostics' });
    execute([{ id: 'code.edit', args: { id: 'a', expectedRevision: doc.revision, edits: [{ start: 0, end: 0, text: '// change\r\n' }] } }]);
    assert.equal(intel.accept({ requestId: stale.requestId, result: { diagnostics: [] } }).status, 'stale');
    const a = code.get('a'), b = code.get('b');
    intel.request({ requestId: 'refactor', id: 'a', revision: a.revision, kind: 'refactor' });
    intel.accept({ requestId: 'refactor', result: { edits: [{ id: 'a', expectedRevision: a.revision, edits: [{ start: 0, end: 0, text: '// both\r\n' }] }, { id: 'b', expectedRevision: b.revision, edits: [{ start: 0, end: 0, text: '// both\n' }] }] } });
    intel.apply({ requestId: 'refactor', transactionId: 'apply-refactor' });
    assert(code.get('a').content.text.startsWith('// both'));
    assert(code.get('b').content.text.startsWith('// both'));
    assert.equal(intel.getResult('refactor'), null);
    const snapshot = project.getSnapshot();
    intel.reset();
    assert.deepEqual(project.getSnapshot(), snapshot);
});
const temp = await mkdtemp(path.join(tmpdir(), 'nexus-toolchain-code-')), root = path.join(temp, 'project');
await mkdir(root);
await writeFile(path.join(root, 'main.js'), 'console.log("original");\n');
const build = createBuildDomain({ ...createLanguageToolchains(), stateRoot: path.join(temp, 'build') });
await test('real Rust and TypeScript builds execute reviewed snapshots and detect artifact mutation', async () => {
    for (const [language, entry, content, expected] of [['rust', 'main.rs', 'fn main(){println!("nexus-native-code");}\n', 'nexus-native-code'], ['typescript', 'main.ts', 'const answer: number = 42; console.log(answer);\n', '42'], ['cpp', 'main.cpp', '#include <iostream>\nint main(){std::cout << 42;}\n', '42'], ['python', 'main.py', 'print(42)\n', '42']]) {
        const p = build.planProgram({ projectRoot: root, files: [{ path: entry, content }], entry, toolchain: { language, host: process.platform + '-' + process.arch, target: 'host-native' } });
        assert.equal(p.status, 'ready', JSON.stringify(p.requirements));
        await assert.rejects(() => build.compileProgram(p.id, { approvePlan: 'wrong' }), /approval|changed after review/i);
        const receipt = await build.compileProgram(p.id, { approvePlan: p.id });
        assert.equal(receipt.status, 'succeeded', JSON.stringify(receipt.diagnostics));
        const run = await build.runProgram(receipt.id, { approveReceipt: receipt.id });
        assert.equal(run.ok, true, JSON.stringify(run));
        assert(run.stdout.includes(expected));
        await writeFile(receipt.artifacts[0].path, 'tampered');
        await assert.rejects(() => build.runProgram(receipt.id, { approveReceipt: receipt.id }), /Artifact changed/);
    }
    assert.equal(await readFile(path.join(root, 'main.js'), 'utf8'), 'console.log("original");\n');
    const unsafe = { projectRoot: root, entry: '../escape.rs', files: [{ path: '../escape.rs', content: '' }], toolchain: { language: 'rust', host: process.platform + '-' + process.arch, target: 'host-native' } };
    assert.throws(() => build.planProgram(unsafe), /source/);
    const bad = build.planProgram({ projectRoot: root, entry: 'main.rs', files: [{ path: 'main.rs', content: 'fn main( broken' }], toolchain: { language: 'rust', host: process.platform + '-' + process.arch, target: 'host-native' } });
    const failed = await build.compileProgram(bad.id, { approvePlan: bad.id });
    assert.equal(failed.status, 'failed');
    assert(failed.diagnostics.some(d => d.severity === 'error'));
    assert.equal(build.planProgram({ projectRoot: root, entry: 'main.js', files: [{ path: 'main.js', content: '' }], toolchain: { language: 'javascript', host: process.platform + '-' + process.arch, target: 'android-xr' } }).status, 'blocked');
});
await test('IDE edit, diagnostics, format, save/reopen, build and run use real shared services', async () => {
    const host = await createIdeHost({ projectRoot: root, stateRoot: path.join(temp, 'ide'), authorize: async () => true });
    try {
        await host.open(['main.js']);
        let doc = host.view().documents[0];
        host.edit({ id: doc.id, revision: doc.revision, text: 'const answer = ;\n' });
        const broken = await host.language({ id: doc.id });
        assert(broken.result.diagnostics.some(d => d.severity === 'error'));
        doc = host.view().documents[0];
        host.edit({ id: doc.id, revision: doc.revision, text: 'const answer = 42; console.log("nexus-ide-edit", answer);\n' });
        const clean = await host.language({ id: doc.id });
        assert.equal(clean.result.diagnostics.filter(d => d.severity === 'error').length, 0);
        await host.save();
        const saved = host.view().documents[0].text;
        host.undo();
        await host.reopen();
        assert.equal(host.view().documents[0].text, saved);
        const receipt = await host.compile({ id: doc.id });
        assert.equal(receipt.status, 'succeeded');
        const run = await host.run();
        assert.equal(run.ok, true);
        assert(run.stdout.includes('nexus-ide-edit 42'));
        await host.create({ path: 'new.py', language: 'python', text: 'print("new")\n' });
        await host.save();
        assert.equal(await readFile(path.join(root, 'new.py'), 'utf8'), 'print("new")\n');
        await writeFile(path.join(root, 'main.js'), '// external change\n');
        await assert.rejects(() => host.save(), /outside/);
        await symlink(path.join(temp, 'ide'), path.join(root, 'escape'));
        await assert.rejects(() => host.open(['escape/session.json']), /escapes/);
        const server = await serveIde(host);
        try {
            const page = await (await fetch(server.url)).text();
            assert(page.includes('Nexus Code Workspace'));
            assert.equal((await fetch(server.url + '/state')).status, 403);
        }
        finally {
            await server.close();
        }
    }
    finally {
        await host.close();
        await build.shutdown();
    }
});
await test('LSP/DAP transport correlation, provider errors, timeouts and disconnects', async () => {
    for (const protocol of ['lsp', 'dap']) {
        const rpc = createStdioProtocol({ command: process.execPath, args: [path.resolve('tests/fixtures/code-protocol.mjs')], cwd: temp, protocol, authorize: async () => true, timeoutMs: 2000 });
        await rpc.start();
        try {
            assert.deepEqual(await rpc.request('echo', { value: 42 }), { echo: { value: 42 } });
            await assert.rejects(() => rpc.request('fail'), /fixture-failure/);
            await assert.rejects(() => rpc.request('timeout'), /timed out/);
            await assert.rejects(() => rpc.request('disconnect'), /disconnected/);
        }
        finally {
            rpc.stop();
        }
    }
});
console.log('Retained isolated validation files: ' + temp);
