import { asBytes, digest, safePath, fail, jsonBytes, text, abort } from '../../../contracts/io.js';
import { packageManifest } from '../../project-package.js';
/** Node-only implementation, loaded on demand; importing Authoring never imports Node modules. */
export function createFilesystemAuthoringStorageProvider(){return {
  id:'authoring-filesystem-storage/1',version:'1',format:'filesystem',profile:'filesystem-atomic-cas/1',capabilities:{persistent:true,atomic:true},
  async read(target){
    const fs=await import('node:fs/promises'),path=await import('node:path'),{randomUUID}=await import('node:crypto');
    const root=await fs.realpath(target.path);await rejectLinks(fs,path,root,'authoring-project.json');const m=JSON.parse(await fs.readFile(path.join(root,'authoring-project.json'),'utf8'));
    if(!Number.isSafeInteger(m.generation)||m.generation<1||m.schema!=='nexusengine.authoring-package/1')throw fail('AUTHORING_STORAGE_CORRUPT','Malformed project manifest.');
    const files=Object.create(null);let total=0;
    for(const [p,hash] of Object.entries(m.files)){
      const full=path.join(root,...safePath(p).split('/'));await rejectLinks(fs,path,root,p);
      const stat=await fs.stat(full);if((total+=stat.size)>256*1024*1024)throw fail('AUTHORING_BYTE_BUDGET','Project package exceeds read budget.');
      const bytes=new Uint8Array(await fs.readFile(full));if(digest(bytes)!==hash)throw fail('AUTHORING_STORAGE_CORRUPT',`Corrupt ${p}.`);files[p]=bytes;
    }
    return {...m,files,manifest:m};
  },
  async writeStream(...args){return this.write(...args);},
  async write(target,bundle,{expectedGeneration=0,signal}={}){
    abort(signal);const fs=await import('node:fs/promises'),path=await import('node:path'),{randomUUID}=await import('node:crypto');
    await fs.mkdir(target.path,{recursive:true});const root=await fs.realpath(target.path);
    const lock=path.join(root,'.authoring-write.lock');let handle;
    try{handle=await fs.open(lock,'wx',0o600);}catch(e){if(e.code==='EEXIST')throw fail('AUTHORING_STORAGE_CONFLICT','Another writer holds the target; no stale lock is deleted automatically.');throw e;}
    const tmp=`authoring-project-${randomUUID()}.json`;
    try{
      await rejectLinks(fs,path,root,'authoring-project.json');let prior=null;try{prior=JSON.parse(await fs.readFile(path.join(root,'authoring-project.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
      if(prior&&(prior.schema!=='nexusengine.authoring-package/1'||!Number.isSafeInteger(prior.generation)||prior.generation<1))throw fail('AUTHORING_STORAGE_CORRUPT','Malformed prior manifest.');
      if(prior&&prior.projectId!==bundle.projectId)throw fail('AUTHORING_STORAGE_CONFLICT','Cannot overwrite a different project.');
      if((prior?.generation??0)!==expectedGeneration)throw fail('AUTHORING_STORAGE_CONFLICT','Saved generation changed.');
      const {createHash}=await import('node:crypto');
      const {createReadStream}=await import('node:fs');
      const hashes=Object.create(null);
      const entries=bundle.entries ? bundle.entries() : (function*(){for(const [path,bytes] of Object.entries(bundle.files))yield {path,bytes};})();
      for(const entry of entries){
        abort(signal);
        const staging=path.join(root,`.authoring-object-${randomUUID()}`);
        let output;
        try {
          output=await fs.open(staging,'wx',0o600);
          const hash=createHash('sha256');
          for(const chunk of entry.chunks??[entry.bytes]) {
            abort(signal);const bytes=typeof chunk==='string'?new TextEncoder().encode(chunk):asBytes(chunk);
            hash.update(bytes);await output.writeFile(bytes);
          }
          await output.sync();await output.close();output=null;
          const integrity=`sha256:${hash.digest('hex')}`;
          const p=entry.checkpoint?`checkpoints/${integrity.slice(7)}.json`:safePath(entry.path);
          await rejectLinks(fs,path,root,p);
          const full=path.join(root,...p.split('/'));await fs.mkdir(path.dirname(full),{recursive:true});await rejectLinks(fs,path,root,p);
          let existing=false;
          try {
            await fs.stat(full);existing=true;
            const priorHash=createHash('sha256');for await(const chunk of createReadStream(full))priorHash.update(chunk);
            if(`sha256:${priorHash.digest('hex')}`!==integrity)throw fail('AUTHORING_STORAGE_CORRUPT','Existing immutable object differs.');
          } catch(e){if(e.code!=='ENOENT')throw e;}
          abort(signal);if(!existing)await fs.rename(staging,full);
          await syncDir(fs,path.dirname(full));hashes[p]=integrity;
          if(entry.checkpoint)bundle.root={path:p,hash:integrity};
        } finally {await output?.close();await fs.rm(staging,{force:true});}
      }
      if(!bundle.root||hashes[bundle.root.path]!==bundle.root.hash)throw fail('AUTHORING_PACKAGE','Checkpoint is missing or corrupt.');
      const generation=expectedGeneration+1,manifest={schema:bundle.schema,projectId:bundle.projectId,root:bundle.root,generation,files:hashes};
      const output=await fs.open(path.join(root,tmp),'wx',0o600);
      try{await output.writeFile(jsonBytes(manifest));await output.sync();}finally{await output.close();}
      abort(signal);await fs.rename(path.join(root,tmp),path.join(root,'authoring-project.json'));await syncDir(fs,root);return {generation};
    }finally{await fs.rm(path.join(root,tmp),{force:true}).catch(()=>{});await handle.close();await fs.unlink(lock);}
  }
};}
async function syncDir(fs,path){const h=await fs.open(path,'r');try{await h.sync();}finally{await h.close();}}
async function rejectLinks(fs,path,root,relative){let p=root;for(const part of safePath(relative).split('/')){p=path.join(p,part);try{if((await fs.lstat(p)).isSymbolicLink())throw fail('AUTHORING_UNSAFE_PATH','Project package objects cannot use symlinks.');}catch(e){if(e.code!=='ENOENT')throw e;}}}
