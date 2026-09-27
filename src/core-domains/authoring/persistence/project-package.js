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
