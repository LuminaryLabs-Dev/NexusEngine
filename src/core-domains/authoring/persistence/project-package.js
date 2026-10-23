import { jsonBytes, digest, text, unhex, hex, fail, record, asBytes } from '../contracts/io.js';
/** All current and historical documents reference content-addressed image tile blobs. */
export function encodeProjectPackage(snapshot) {
  const files=Object.create(null),seen=new WeakMap();
  const add=(prefix,bytes,extension='')=>{const hash=digest(bytes),path=`${prefix}/${hash.slice(7)}${extension}`;files[path]=bytes;return {hash,path};};
  function document(doc){
    if(doc===null)return null;if(seen.has(doc))return seen.get(doc);
    let content=doc.content;
    if(doc.kind==='image') content={...content,layers:content.layers.map(layer=>({...layer,tiles:Object.fromEntries(
      Object.entries(layer.tiles).map(([key,value])=>[key,add('blobs',unhex(value))])
    )}))};
    const ref=add('documents',jsonBytes({...doc,content}),'.json');seen.set(doc,ref);return ref;
  }
  const history=stack=>stack.map(entry=>({...entry,deltas:entry.deltas.map(d=>({...d,before:document(d.before),after:document(d.after)}))}));
  const checkpoint={...snapshot,documents:Object.fromEntries(Object.entries(snapshot.documents).map(([id,doc])=>[id,document(doc)])),undo:history(snapshot.undo),redo:history(snapshot.redo)};
  const root=add('checkpoints',jsonBytes(checkpoint),'.json');
  return {schema:'nexusengine.authoring-package/1',projectId:snapshot.projectId,root,files};
}
export function decodeProjectPackage(bundle) {
  if(bundle?.schema!=='nexusengine.authoring-package/1'||!bundle.files)throw fail('AUTHORING_PACKAGE','Invalid project package.');
  let budget=0;const cache=new Map();
  function read(ref){
    if(!ref||typeof ref.path!=='string'||!/^sha256:[0-9a-f]{64}$/.test(ref.hash))throw fail('AUTHORING_PACKAGE','Malformed object reference.');
    const bytes=bundle.files[ref.path];if(!bytes||digest(asBytes(bytes))!==ref.hash)throw fail('AUTHORING_STORAGE_CORRUPT',`Missing/corrupt ${ref.path}.`);
    if((budget+=bytes.length)>512*1024*1024)throw fail('AUTHORING_BYTE_BUDGET','Decoded package exceeds budget.');return bytes;
  }
  function document(ref){
    if(ref===null)return null;if(cache.has(ref.hash))return cache.get(ref.hash);
    const doc=JSON.parse(text(read(ref)));
    if(doc.kind==='image')doc.content.layers=doc.content.layers.map(layer=>({...layer,tiles:Object.fromEntries(Object.entries(layer.tiles).map(([k,r])=>[k,hex(read(r))]))}));
    cache.set(ref.hash,doc);return doc;
  }
  const checkpoint=JSON.parse(text(read(bundle.root)));
  if(checkpoint.projectId!==bundle.projectId)throw fail('AUTHORING_PACKAGE','Project identity differs.');
  const history=stack=>stack.map(entry=>({...entry,deltas:entry.deltas.map(d=>({...d,before:document(d.before),after:document(d.after)}))}));
  return {...checkpoint,documents:Object.fromEntries(Object.entries(checkpoint.documents).map(([id,ref])=>[id,document(ref)])),undo:history(checkpoint.undo),redo:history(checkpoint.redo)};
}
export function packageManifest(bundle,generation){return record({schema:bundle.schema,projectId:bundle.projectId,root:bundle.root,generation,files:Object.fromEntries(Object.entries(bundle.files).map(([p,b])=>[p,digest(b)]))});}

/** Pull-based v1 encoder. Retains references, never the encoded project or full history.
 * The writer hashes the final checkpoint chunks and assigns bundle.root before commit.
 */
export function streamProjectPackage(source) {
  const references = new Map();
  const key = doc => JSON.stringify([doc.id, doc.kind, doc.revision, doc.hash]);
  const ref = doc => doc === null ? null : references.get(key(doc));
  const bundle = {schema:'nexusengine.authoring-package/1', projectId:source.projectId, root:null};
  function* document(doc) {
    if (doc === null || references.has(key(doc))) return;
    let content = doc.content;
    if (doc.kind === 'image') {
      const layers = [];
      for (const layer of content.layers) {
        const tiles = {};
        for (const [name, value] of Object.entries(layer.tiles)) {
          const bytes = unhex(value), hash = digest(bytes), path = `blobs/${hash.slice(7)}`;
          yield {path, bytes}; tiles[name] = {path, hash};
        }
        layers.push({...layer, tiles});
      }
      content = {...content, layers};
    }
    const bytes = jsonBytes({...doc, content}), hash = digest(bytes), path = `documents/${hash.slice(7)}.json`;
    references.set(key(doc), {path, hash});
    yield {path, bytes};
  }
  const historyEntry = entry => ({...entry, deltas:entry.deltas.map(delta => ({...delta, before:ref(delta.before), after:ref(delta.after)}))});
  function* object(entries) {
    yield '{'; let comma = '';
    for (const [name, value] of entries) { yield comma; yield JSON.stringify(name); yield ':'; yield jsonBytes(value); comma = ','; }
    yield '}';
  }
  function* history(entries) {
    yield '['; let comma = '';
    for (const entry of entries) { yield comma; yield jsonBytes(historyEntry(entry)); comma = ','; }
    yield ']';
  }
  function* checkpoint() {
    yield '{'; let comma = '';
    for (const name of ['clock','documents','epoch','projectId','receipts','redo','schema','undo']) {
      yield comma; yield JSON.stringify(name); yield ':';
      if (name === 'documents') yield* object((function*(){for(const [id,doc] of source.documents()) yield [id,ref(doc)];})());
      else if (name === 'receipts') yield* object(source.receipts());
      else if (name === 'redo' || name === 'undo') yield* history(source[name]());
      else yield jsonBytes(source[name]);
      comma = ',';
    }
    yield '}';
  }
  bundle.entries = function* () {
    for (const [,doc] of source.documents()) yield* document(doc);
    for (const stack of ['undo','redo']) for (const entry of source[stack]())
      for (const delta of entry.deltas) { yield* document(delta.before); yield* document(delta.after); }
    yield {checkpoint:true, chunks:checkpoint()};
  };
  return bundle;
}
