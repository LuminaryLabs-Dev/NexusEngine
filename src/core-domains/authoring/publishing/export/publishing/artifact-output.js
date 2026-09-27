import { asBytes, safePath, digest, jsonBytes, abort, fail } from '../../../contracts/io.js';
/** Filesystem publication is opt-in. The default export result is a portable in-memory artifact. */
export async function publishArtifact(artifact,target,{signal}={}){
 if(target.storage!=='filesystem')throw fail('AUTHORING_EXPORT_DESTINATION','Artifact publication currently supports filesystem directories; omit target for bytes.');
 if(typeof target.path!=='string'||!target.path.trim())throw fail('AUTHORING_EXPORT_DESTINATION','Destination directory required.');
 abort(signal);const fs=await import('node:fs/promises'),path=await import('node:path'),{randomUUID}=await import('node:crypto');
 const main=safePath(artifact.fileName),reserved=new Set([main,'provenance.json','validation.json']);
 if(main==='provenance.json'||main==='validation.json')throw fail('AUTHORING_EXPORT_PATH','Reserved artifact filename.');
 for(const name of Object.keys(artifact.resources)){safePath(name);if(reserved.has(name))throw fail('AUTHORING_EXPORT_PATH','Duplicate/reserved artifact path.');reserved.add(name);}
 const files={ [safePath(artifact.fileName)]:asBytes(artifact.bytes),...Object.fromEntries(Object.entries(artifact.resources).map(([p,b])=>[safePath(p),asBytes(b)])),
  'provenance.json':jsonBytes(artifact.receipt),'validation.json':jsonBytes(artifact.validation)};
 const hashes=Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)).map(([p,b])=>[p,digest(b)])),identity=digest(jsonBytes(hashes));
 await fs.mkdir(target.path,{recursive:true});const root=await fs.realpath(target.path),destination=path.join(root,'asset-'+identity.slice(7)),staging=path.join(root,'pending-'+randomUUID());await fs.mkdir(staging);let committed=false;
 try{
  for(const [p,b]of Object.entries(files)){abort(signal);const full=path.join(staging,...p.split('/'));await fs.mkdir(path.dirname(full),{recursive:true});const h=await fs.open(full,'wx',0o600);try{await h.writeFile(b);await h.sync();}finally{await h.close();}}
  const directories=new Set([staging]);for(const name of Object.keys(files)){let d=path.dirname(path.join(staging,name));while(d!==staging&&d.startsWith(staging+path.sep)){directories.add(d);d=path.dirname(d);}}
  for(const d of [...directories].sort((a,b)=>b.length-a.length))await sync(fs,d);abort(signal);
  try{await fs.rename(staging,destination);committed=true;await sync(fs,root);}catch(e){if(!['EEXIST','ENOTEMPTY'].includes(e.code))throw e;const st=await fs.lstat(destination);if(st.isSymbolicLink()||!st.isDirectory())throw fail('AUTHORING_UNSAFE_PATH','Artifact destination is not a directory.');for(const [p,hash]of Object.entries(hashes)){const full=path.join(destination,p);let current=destination;for(const part of p.split('/')){current=path.join(current,part);if((await fs.lstat(current)).isSymbolicLink())throw fail('AUTHORING_UNSAFE_PATH','Artifact paths cannot contain symlinks.');}if((await fs.lstat(full)).isSymbolicLink()||digest(new Uint8Array(await fs.readFile(full)))!==hash)throw fail('AUTHORING_EXPORT_CONFLICT','Existing artifact contents differ.');}}
  return {directory:destination,artifact:path.join(destination,artifact.fileName),files:hashes};
 }finally{if(!committed)await fs.rm(staging,{recursive:true,force:true});}
}
async function sync(fs,path){const h=await fs.open(path,'r');try{await h.sync();}finally{await h.close();}}
