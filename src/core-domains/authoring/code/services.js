import { registerDocumentService, typedDocument } from '../contracts/services.js';
import { canonical, requireFields, requireInteger, authoringError as error } from '../contracts/value.js';
import { normalizeCodeContent, editCode } from './contracts.js';
const installed = new WeakMap();
export function installCodeDocumentServices(project) {
    if (installed.has(project))
        return installed.get(project);
    const register = registerDocumentService(project, { kind: 'code', domain: 'code', normalize: normalizeCodeContent, profile: 'utf8-source-utf16-edits/1' });
    register('edit', ['id', 'expectedRevision', 'edits'], (tx, args) => { requireInteger(args.expectedRevision, 'expectedRevision', 1); const doc = typedDocument(tx, args.id, 'code', args.expectedRevision); tx.put({ id: doc.id, kind: 'code', content: editCode(doc.content, args.edits) }, args.expectedRevision); return { id: doc.id }; });
    register('apply-edits', ['documents'], (tx, args) => {
        if (!Array.isArray(args.documents) || !args.documents.length || args.documents.length > 256)
            throw error('CODE_INVALID_EDITS', 'A bounded document edit list is required');
        const ids = new Set();
        for (const item of args.documents) {
            requireFields(item, ['id', 'expectedRevision', 'edits'], 'Document edits');
            if (ids.has(item.id))
                throw error('CODE_DUPLICATE_DOCUMENT', 'Duplicate edited document');
            ids.add(item.id);
            requireInteger(item.expectedRevision, 'expectedRevision', 1);
            const doc = typedDocument(tx, item.id, 'code', item.expectedRevision);
            tx.put({ id: doc.id, kind: 'code', content: editCode(doc.content, item.edits) }, item.expectedRevision);
        }
        return { ids: [...ids] };
    });
    register('rename', ['id', 'expectedRevision', 'path'], (tx, args) => { requireInteger(args.expectedRevision, 'expectedRevision', 1); const doc = typedDocument(tx, args.id, 'code', args.expectedRevision); tx.put({ id: doc.id, kind: 'code', content: normalizeCodeContent({ ...doc.content, path: args.path }) }, args.expectedRevision); return { id: doc.id }; });
    function list() { return project.listDocuments().filter(d => d.kind === 'code').map(d => project.getDocument(d.id)); }
    function exportFiles() { const files = list().map(d => ({ id: d.id, revision: d.revision, hash: d.hash, ...canonical(d.content) })).sort((a, b) => a.path.localeCompare(b.path)); const paths = new Set(); for (const f of files) {
        const key = f.path.toLowerCase();
        if (paths.has(key))
            throw error('CODE_PATH_COLLISION', 'Source paths collide: ' + f.path);
        paths.add(key);
    } return { schema: 'nexusengine.code-source/1', epoch: project.context().epoch, files }; }
    const api = Object.freeze({ list, get: id => { const d = project.getDocument(id); if (d.kind !== 'code')
            throw error('CODE_DOCUMENT_KIND', 'Expected code'); return d; }, exportFiles });
    installed.set(project, api);
    return api;
}
