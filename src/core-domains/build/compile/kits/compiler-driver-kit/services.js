import { mkdir, mkdtemp, writeFile, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { realpathSync } from 'node:fs';
import { contentIntegrity, stableJson, assertInside, assertOutside } from '../../../contracts.js';
const identity = v => contentIntegrity(stableJson(v));
export function createCompilerDriverService({ resolution, drivers = {}, processExecution, isolatedStage, approval } = {}) {
    const plans = new Map(), receipts = new Map(), active = new Set();
    function plan({ projectRoot, files, entry, toolchain }) {
        if (!path.isAbsolute(projectRoot ?? '') || !Array.isArray(files) || !files.length || files.length > 1024)
            throw new TypeError('An absolute project root and bounded source snapshot are required');
        let bytes = 0;
        const names = new Set();
        projectRoot = realpathSync(projectRoot);
        const source = files.map(file => { if (typeof file.path !== 'string' || file.path.includes('\\') || file.path.split('/').some(s => !s || s === '.' || s === '..') || path.isAbsolute(file.path) || /[:\x00-\x1f]/.test(file.path) || typeof file.content !== 'string')
            throw new TypeError('Invalid source file'); const key = file.path.toLowerCase(); if (names.has(key))
            throw new TypeError('Duplicate or case-conflicting source path'); names.add(key); bytes += Buffer.byteLength(file.content); return { path: file.path, content: file.content }; }).sort((a, b) => a.path.localeCompare(b.path));
        if (bytes > 8 * 1024 * 1024 || !source.some(f => f.path === entry))
            throw new TypeError('Invalid source size or entry');
        const selection = resolution.resolve(toolchain), selected = selection.selected[0]?.toolchain, driver = drivers[selected?.driver];
        const requirements = [...selection.requirements];
        if (!driver || typeof driver.compile !== 'function' || typeof driver.version !== 'string')
            requirements.push({ code: 'compiler-driver-unavailable', id: selected?.driver ?? null });
        const payload = { schema: 'nexusengine.compiler-plan/1', projectRoot: path.resolve(projectRoot), files: source, entry, selection, driver: driver ? { id: selected.driver, version: driver.version } : null, sourceHash: identity(source), requirements, status: requirements.length ? 'blocked' : 'ready' };
        const value = { ...payload, id: identity(payload) };
        plans.set(value.id, structuredClone(value));
        return structuredClone(value);
    }
    async function executeInternal(id, { approvePlan, signal } = {}) {
        if (!plans.has(id))
            throw new Error('Retained compiler-plan approval required');
        if (!approval)
            throw new Error('Build approval service unavailable');
        approval.requireApproval(id, approvePlan);
        const p = plans.get(id);
        if (p.status !== 'ready')
            throw new Error('Compiler plan is blocked');
        const fresh = resolution.resolve(p.selection.request);
        if (fresh.id !== p.selection.id)
            throw new Error('Toolchain changed after planning');
        const base = await isolatedStage.create(p.projectRoot, id, 'compiler'), stage = await mkdtemp(path.join(base, 'attempt-'));
        assertOutside(p.projectRoot, await realpath(stage), 'Physical build stage');
        const inputs = path.join(stage, 'inputs'), outputs = path.join(stage, 'outputs');
        await mkdir(inputs);
        await mkdir(outputs);
        for (const file of p.files) {
            const filename = assertInside(inputs, path.join(inputs, file.path), 'Source snapshot');
            await mkdir(path.dirname(filename), { recursive: true });
            await writeFile(filename, file.content, { flag: 'wx' });
        }
        const selected = p.selection.selected[0].toolchain, driver = drivers[selected.driver];
        let result;
        try {
            result = await driver.compile({ plan: structuredClone(p), toolchain: selected, stage, inputs, outputs, signal, run: (command, args, options = {}) => processExecution.run(command, args, { ...options, cwd: stage, signal }) });
        }
        catch (error) {
            result = { ok: false, diagnostics: [{ severity: 'error', message: error.message }], artifacts: [] };
        }
        const artifacts = [];
        for (const artifact of result.artifacts ?? []) {
            const filename = await realpath(assertInside(stage, artifact.path, 'Compiler artifact'));
            assertInside(await realpath(stage), filename, 'Compiler artifact');
            artifacts.push({ ...artifact, path: filename, integrity: contentIntegrity(await readFile(filename)) });
        }
        // Compiler subprocesses must not alter the input snapshot, even inside isolation.
        for (const file of p.files)
            if ((await readFile(path.join(inputs, file.path), 'utf8')) !== file.content)
                throw new Error('Compiler mutated its source snapshot');
        const payload = { schema: 'nexusengine.compiler-receipt/1', planId: id, sourceHash: p.sourceHash, selection: p.selection, driver: p.driver, status: result.ok === true && artifacts.length ? 'succeeded' : 'failed', stage, artifacts, diagnostics: result.diagnostics ?? [], process: result.process ?? null, launch: result.launch ?? null };
        const receipt = { ...payload, id: identity(payload) };
        receipts.set(receipt.id, structuredClone(receipt));
        return receipt;
    }
    async function runInternal(id, { approveReceipt, signal } = {}) {
        const r = receipts.get(id);
        if (approveReceipt !== id || r?.status !== 'succeeded' || !r.launch)
            throw new Error('Exact successful receipt approval required');
        for (const a of r.artifacts)
            if (contentIntegrity(await readFile(a.path)) !== a.integrity)
                throw new Error('Artifact changed after compilation');
        const fresh = resolution.resolve(r.selection.request);
        if (fresh.id !== r.selection.id)
            throw new Error('Runtime toolchain changed');
        return processExecution.run(r.launch.command, r.launch.arguments, { cwd: r.stage, signal });
    }
    function track(operation, id, options = {}) { const controller = new AbortController(), abort = () => controller.abort(); options.signal?.addEventListener('abort', abort, { once: true }); if (options.signal?.aborted)
        abort(); const job = { controller, promise: null }; job.promise = operation(id, { ...options, signal: controller.signal }).finally(() => { active.delete(job); options.signal?.removeEventListener('abort', abort); }); active.add(job); return job.promise; }
    return Object.freeze({ plan, execute: (id, options) => track(executeInternal, id, options), run: (id, options) => track(runInternal, id, options), reset() { if (active.size)
            throw new Error('Compiler jobs are active'); plans.clear(); receipts.clear(); }, async shutdown() { const jobs = [...active]; for (const j of jobs)
            j.controller.abort(); await Promise.allSettled(jobs.map(j => j.promise)); } });
}
export default createCompilerDriverService;
