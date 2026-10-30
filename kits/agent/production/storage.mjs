import { mkdirSync, readFileSync, writeFileSync, renameSync, openSync, closeSync, fsyncSync, existsSync, lstatSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { freeze } from '../../../src/core-domains/authoring/contracts/value.js';
const hash = value => createHash('sha256').update(value).digest('hex');
/** Optional filesystem provider. Core stores opaque version keys, never filesystem paths. */
export function createProductionStorage(root, { maxCacheBytes = 2 * 1024 * 1024, maxCacheEntries = 64 } = {}) {
  if(!Number.isSafeInteger(maxCacheBytes)||maxCacheBytes<0||!Number.isSafeInteger(maxCacheEntries)||maxCacheEntries<0)throw Error("Invalid receipt-cache budget.");
  function safe(file) {
    const rel = path.relative(root,file); if(rel.startsWith('..') || path.isAbsolute(rel)) throw Error('Storage path escapes root.');
    let current=root;
    for(const part of ['' , ...rel.split(path.sep)]) { if(part)current=path.join(current,part); try{if(lstatSync(current).isSymbolicLink())throw Error('Storage symlink rejected.');}catch(error){if(error.code!=='ENOENT')throw error;} }
    return file;
  }
  function directory(dir) { safe(dir); mkdirSync(dir,{recursive:true,mode:0o700}); }
  directory(root); const objects=path.join(root,'objects'), index=path.join(root,'receipts');directory(objects);directory(index);
  function atomic(file, bytes) {
    safe(file); const temporary=safe(file+'.tmp'); const fd=openSync(temporary,'w',0o600);
    try { writeFileSync(fd,bytes); fsyncSync(fd); } finally {closeSync(fd);}
    renameSync(temporary,file);const dir=openSync(path.dirname(file),'r');try{fsyncSync(dir);}finally{closeSync(dir);}
  }
  const objectFile = key => {if(!/^[a-f0-9]{64}$/.test(key))throw Error('Invalid content key.');return safe(path.join(objects,key+'.json'));};
  // History often references the same immutable mesh as the live Project.
  // Reuse that object while it remains live, without retaining its geometry or
  // skipping the on-disk integrity check. Mutable values are never shared.
  const contentRefs=new Map(),verifiedFrozen=new WeakSet();
  function deeplyFrozen(value){
    if(!value||typeof value!=='object')return true;
    if(verifiedFrozen.has(value))return true;
    if(!Object.isFrozen(value))return false;
    for(const key of Object.keys(value)){const d=Object.getOwnPropertyDescriptor(value,key);if(!Object.hasOwn(d,'value')||!deeplyFrozen(d.value))return false;}
    verifiedFrozen.add(value);return true;
  }
  function putRaw(value) { const bytes=JSON.stringify(value), key=hash(bytes),file=objectFile(key); if(!existsSync(file))atomic(file,bytes);else if(hash(readFileSync(file))!==key)throw Error('Stored object integrity mismatch.'); return key; }
  function putContent(value){const key=putRaw(value);if(deeplyFrozen(value)){contentRefs.delete(key);contentRefs.set(key,new WeakRef(value));while(contentRefs.size>1024)contentRefs.delete(contentRefs.keys().next().value);}return key;}
  function getRaw(key,memo) {
    const bytes=readFileSync(objectFile(key));if(hash(bytes)!==key)throw Error('Stored object integrity mismatch.');
    if(!memo)return JSON.parse(bytes);
    const live=memo.get(key)??contentRefs.get(key)?.deref();if(live){memo.set(key,live);return live;}
    const value=freeze(JSON.parse(bytes));memo.set(key,value);contentRefs.set(key,new WeakRef(value));
    while(contentRefs.size>1024)contentRefs.delete(contentRefs.keys().next().value);
    return value;
  }
  function encode(value) {
    if(!value||typeof value!=='object')return value;
    if(value.kind&&value.id&&value.hash&&value.content&&value.dependencies) return {$nexusDocument:putRaw({...value,content:{$nexusContent:putContent(value.content)}})};
    if(Array.isArray(value))return value.map(encode);
    return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,encode(v)]));
  }
  function decode(value,memo=new Map()) {
    if(!value||typeof value!=='object')return value;
    if(Object.keys(value).length===1&&value.$nexusDocument){const doc=getRaw(value.$nexusDocument);if(doc.content&&Object.keys(doc.content).length===1&&doc.content.$nexusContent)doc.content=getRaw(doc.content.$nexusContent,memo);return doc;}
    if(Array.isArray(value))return value.map(v=>decode(v,memo));
    return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,decode(v,memo)]));
  }
  const put=value=>putRaw(encode(value)),get=key=>decode(getRaw(key));
  const cache=new Map();let cacheBytes=0,count=readdirSync(index).filter(n=>/^[a-f0-9]{64}\.json$/.test(n)).length;
  const receiptFile=id=>safe(path.join(index,hash(id)+'.json'));
  function remember(id,value) {
    if(cache.has(id)){cacheBytes-=cache.get(id).bytes;cache.delete(id);}
    const bytes=JSON.stringify(value).length*2;
    if(bytes<=maxCacheBytes){cache.set(id,{value,bytes});cacheBytes+=bytes;}
    while(cache.size>maxCacheEntries||cacheBytes>maxCacheBytes){const id=cache.keys().next().value;cacheBytes-=cache.get(id).bytes;cache.delete(id);}
  }
  const receipts={
    get size(){return count;},
    set(id,value) {const file=receiptFile(id),isNew=!existsSync(file),key=put(value);atomic(file,JSON.stringify({id,key}));if(isNew)count++;remember(id,value);return this;},
    get(id) {if(cache.has(id))return structuredClone(cache.get(id).value);const file=receiptFile(id);if(!existsSync(file))return undefined;const record=JSON.parse(readFileSync(file));if(record.id!==id)throw Error('Receipt index identity mismatch.');const value=get(record.key);if(value.requestId!==id)throw Error('Receipt content identity mismatch.');remember(id,value);return value;},
    diagnostics:()=>({count,hotEntries:cache.size,hotBytes:cacheBytes,maxCacheBytes,maxCacheEntries})
  };
  return {put,get,encode,decode,atomic,receipts,
    read: file => JSON.parse(readFileSync(safe(path.join(root,file)))),
    write: (file,value) => atomic(path.join(root,file),JSON.stringify(value)),
    historyArchive:{put,get}};
}
