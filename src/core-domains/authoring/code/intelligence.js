import { editCode } from './contracts.js';
import { canonical, requireFields, requireInteger, requireText, freeze, authoringError as error } from '../contracts/value.js';
export function createCodeIntelligenceService(project, documents) {
    const requests = new Map(), results = new Map();
    const kinds = ['diagnostics', 'completion', 'hover', 'definition', 'references', 'symbols', 'format', 'refactor'];
    function request(input) {
        requireFields(input, ['requestId', 'id', 'revision', 'kind', 'position'], 'Language request');
        requireText(input.requestId, 'requestId');
        if (!kinds.includes(input.kind))
            throw error('CODE_REQUEST_KIND', 'Unsupported intelligence request');
        const doc = documents.get(input.id);
        if (doc.revision !== input.revision)
            throw error('AUTHORING_STALE_REVISION', 'Stale language request');
        if (input.position !== undefined)
            requireInteger(input.position, 'position', 0, doc.content.text.length);
        const value = freeze(canonical({ ...input, epoch: project.context().epoch, documents: documents.exportFiles().files.map(({ id, revision, hash, path }) => ({ id, revision, hash, path })) }));
        if (requests.has(input.requestId)) {
            if (JSON.stringify(requests.get(input.requestId)) !== JSON.stringify(value))
                throw error('CODE_REQUEST_COLLISION', 'Request identity reused');
            return requests.get(input.requestId);
        }
        if (requests.size >= 128)
            throw error('CODE_REQUEST_LIMIT', 'Reset language requests before adding more');
        requests.set(input.requestId, value);
        return value;
    }
    function current(r) { if (r.epoch !== project.context().epoch)
        return false; return r.documents.every(d => { try {
        const now = documents.get(d.id);
        return now.revision === d.revision && now.hash === d.hash;
    }
    catch {
        return false;
    } }) && documents.list().length === r.documents.length; }
    function accept(input) {
        requireFields(input, ['requestId', 'result'], 'Language result');
        const r = requests.get(input.requestId);
        if (!r)
            throw error('CODE_REQUEST_MISSING', 'Unknown request');
        if (!current(r))
            return { status: 'stale', requestId: r.requestId };
        const value = canonical(input.result);
        requireFields(value, ['diagnostics', 'items', 'text', 'edits', 'unsupported'], 'Language result');
        if (value.unsupported !== undefined) {
            requireText(value.unsupported, 'Unsupported reason');
            return { status: 'unsupported', requestId: r.requestId, kind: r.kind, result: value };
        }
        if (JSON.stringify(value).length > 1048576)
            throw error('CODE_RESULT_LIMIT', 'Language result too large');
        if (value.diagnostics !== undefined) {
            if (r.kind !== 'diagnostics' || !Array.isArray(value.diagnostics) || value.diagnostics.length > 10000)
                throw error('CODE_RESULT_KIND', 'Invalid diagnostics');
            for (const d of value.diagnostics) {
                requireFields(d, ['severity', 'message', 'code', 'start', 'end', 'path'], 'Diagnostic');
                if (!['error', 'warning', 'info'].includes(d.severity) || typeof d.message !== 'string' || d.message.length > 16000)
                    throw error('CODE_RESULT_KIND', 'Invalid diagnostic');
                const target = d.path ? r.documents.find(f => f.path === d.path) : r.documents.find(f => f.id === r.id);
                if (!target)
                    throw error('CODE_RESULT_REVISION', 'Diagnostic is outside the requested source');
                if (d.start !== undefined)
                    requireInteger(d.start, 'Diagnostic start', 0, documents.get(target.id).content.text.length);
                if (d.end !== undefined)
                    requireInteger(d.end, 'Diagnostic end', d.start ?? 0, documents.get(target.id).content.text.length);
            }
        }
        if (value.edits !== undefined) {
            if (!['format', 'refactor'].includes(r.kind) || !Array.isArray(value.edits))
                throw error('CODE_RESULT_KIND', 'Only formatting/refactoring may propose edits');
            for (const e of value.edits) {
                const snapshot = r.documents.find(d => d.id === e.id);
                if (!snapshot || snapshot.revision !== e.expectedRevision)
                    throw error('CODE_RESULT_REVISION', 'Proposed edits differ from requested snapshot');
                editCode(documents.get(e.id).content, e.edits);
            }
        }
        const result = freeze({ status: 'accepted', requestId: r.requestId, kind: r.kind, result: value });
        if (results.has(r.requestId) && JSON.stringify(results.get(r.requestId)) !== JSON.stringify(result))
            throw error('CODE_RESULT_COLLISION', 'Result identity reused');
        results.set(r.requestId, result);
        return result;
    }
    function getResult(id) { const r = requests.get(id); return r && current(r) ? results.get(id) ?? null : null; }
    function apply({ requestId, transactionId }) { const result = getResult(requestId); if (!result || !result.result.edits?.length)
        throw error('CODE_RESULT_STALE', 'No current proposed edits'); return project.execute({ requestId: transactionId, epoch: project.context().epoch, operations: [{ id: 'code.apply-edits', args: { documents: result.result.edits } }] }); }
    return Object.freeze({ request, accept, getResult, apply, clear: () => { requests.clear(); results.clear(); }, capabilities: () => [...kinds] });
}
