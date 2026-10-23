const $ = id => document.getElementById(id), token = document.querySelector('meta[name="ide-token"]').content;
let state = { documents: [] }, active = null, busy = false;
const drafts = new Map();
const headers = { 'content-type': 'application/json', 'x-ide-token': token };
function render() { const query = $('search').value.toLowerCase(); $('files').replaceChildren(); $('tabs').replaceChildren(); for (const doc of state.documents) {
    if (!query || doc.path.toLowerCase().includes(query) || doc.text.toLowerCase().includes(query)) {
        const b = document.createElement('button');
        b.textContent = doc.path;
        b.onclick = () => select(doc.id);
        $('files').append(b);
    }
    const tab = document.createElement('button');
    tab.role = 'tab';
    tab.textContent = doc.path;
    tab.setAttribute('aria-selected', String(doc.id === active));
    tab.onclick = () => select(doc.id);
    $('tabs').append(tab);
} const doc = state.documents.find(d => d.id === active); $('source').disabled = !doc; if (doc) {
    $('source').value = drafts.get(doc.id) ?? doc.text;
    $('filename').textContent = doc.path + ' · ' + doc.language + ' · revision ' + doc.revision;
}
else {
    $('source').value = '';
    $('filename').textContent = 'Select a source file';
} }
async function action(action, input = {}) { const res = await fetch('/action', { method: 'POST', headers, body: JSON.stringify({ action, input }) }), body = await res.json(); if (!res.ok)
    throw new Error(body.error); state = body.state; return body.result; }
async function flush() { const doc = state.documents.find(d => d.id === active); if (doc && doc.text !== $('source').value) {
    await action('edit', { id: doc.id, revision: doc.revision, text: $('source').value });
    drafts.delete(doc.id);
} }
async function perform(fn) { if (busy)
    return; busy = true; $('status').textContent = 'Working'; try {
    await flush();
    const result = await fn();
    $('output').textContent = JSON.stringify(result, null, 2);
    $('status').textContent = result?.status ?? 'Ready';
    render();
}
catch (e) {
    $('status').textContent = 'Action failed';
    $('output').textContent = e.message;
}
finally {
    busy = false;
} }
function select(id) { perform(async () => { active = id; return { selected: id }; }); }
$('new').onclick = () => perform(async () => { const path = prompt('Relative source path', 'main.rs'); if (!path)
    return { status: 'cancelled' }; const result = await action('create', { path, text: '', language: ({ rs: 'rust', ts: 'typescript', js: 'javascript', mjs: 'javascript', c: 'c', cpp: 'cpp', py: 'python' })[path.split('.').at(-1)] ?? 'text' }); active = path; return result; });
$('open').onclick = () => perform(async () => { const path = prompt('Relative source path'); if (!path)
    return { status: 'cancelled' }; const result = await action('open', { paths: [path] }); active = state.documents.find(d => d.path === path)?.id; return result; });
for (const id of ['save', 'reopen', 'undo', 'redo', 'run', 'git'])
    $(id).onclick = () => perform(() => action(id));
for (const [id, kind] of [['diagnose', 'diagnostics'], ['complete', 'completion'], ['hover', 'hover'], ['definition', 'definition'], ['references', 'references'], ['symbols', 'symbols']])
    $(id).onclick = () => perform(() => action('language', { id: active, kind, position: $('source').selectionStart }));
$('format').onclick = () => perform(async () => { const r = await action('language', { id: active, kind: 'format' }); if (r.result?.edits?.some(e => e.edits.length))
    await action('apply', { requestId: r.requestId, transactionId: crypto.randomUUID() }); return r; });
$('source').oninput = () => { if (active)
    drafts.set(active, $('source').value); $('status').textContent = 'Unsaved changes'; };
$('build').onclick = () => perform(() => action('build', { id: active }));
$('search').oninput = render;
const res = await fetch('/state', { headers });
state = await res.json();
active = state.documents[0]?.id ?? null;
render();
