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
      for(const [p,data] of Object.entries(bundle.files)){
        abort(signal);safePath(p);await rejectLinks(fs,path,root,p);
        const full=path.join(root,...p.split('/'));await fs.mkdir(path.dirname(full),{recursive:true});await rejectLinks(fs,path,root,p);
        let out;try{out=await fs.open(full,'wx',0o600);}catch(e){if(e.code!=='EEXIST')throw e;
          if(digest(new Uint8Array(await fs.readFile(full)))!==digest(data))throw fail('AUTHORING_STORAGE_CORRUPT','Existing immutable object differs.');continue;}
        try{await out.writeFile(asBytes(data));await out.sync();}finally{await out.close();}
        await syncDir(fs,path.dirname(full));
      }
      const generation=expectedGeneration+1,manifest=packageManifest(bundle,generation);
      const output=await fs.open(path.join(root,tmp),'wx',0o600);
      try{await output.writeFile(jsonBytes(manifest));await output.sync();}finally{await output.close();}
      abort(signal);await fs.rename(path.join(root,tmp),path.join(root,'authoring-project.json'));await syncDir(fs,root);return {generation};
    }finally{await fs.rm(path.join(root,tmp),{force:true}).catch(()=>{});await handle.close();await fs.unlink(lock);}
  }
};}
async function syncDir(fs,path){const h=await fs.open(path,'r');try{await h.sync();}finally{await h.close();}}
async function rejectLinks(fs,path,root,relative){let p=root;for(const part of safePath(relative).split('/')){p=path.join(p,part);try{if((await fs.lstat(p)).isSymbolicLink())throw fail('AUTHORING_UNSAFE_PATH','Project package objects cannot use symlinks.');}catch(e){if(e.code!=='ENOENT')throw e;}}}
