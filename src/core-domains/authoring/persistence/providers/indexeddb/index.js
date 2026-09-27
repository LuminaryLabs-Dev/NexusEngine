import { fail, abort } from '../../../contracts/io.js';
import { packageManifest } from '../../project-package.js';
export function createIndexedDBAuthoringStorageProvider(){
  async function db(){if(!globalThis.indexedDB)throw fail('AUTHORING_STORAGE_UNAVAILABLE','IndexedDB requires a supported browser context.');
    return new Promise((resolve,reject)=>{const r=indexedDB.open('nexusengine-authoring',1);r.onupgradeneeded=()=>r.result.createObjectStore('projects');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  return {id:'authoring-indexeddb-storage/1',version:'1',format:'indexeddb',profile:'indexeddb-cas/1',capabilities:{persistent:true,atomic:true},
    async read(target){const database=await db();try{return await new Promise((resolve,reject)=>{const t=database.transaction('projects','readonly'),r=t.objectStore('projects').get(target.path);r.onsuccess=()=>r.result?resolve(r.result):reject(fail('AUTHORING_STORAGE_MISSING','No saved project at this key.'));r.onerror=()=>reject(r.error);});}finally{database.close();}},
    async write(target,bundle,{expectedGeneration=0,signal}={}){
      abort(signal);const database=await db();try{return await new Promise((resolve,reject)=>{
        const t=database.transaction('projects','readwrite'),store=t.objectStore('projects'),r=store.get(target.path);let error=null;const stop=()=>t.abort();signal?.addEventListener('abort',stop,{once:true});
        const clean=()=>signal?.removeEventListener('abort',stop);
        r.onsuccess=()=>{if((r.result?.generation??0)!==expectedGeneration){error=fail('AUTHORING_STORAGE_CONFLICT','Saved generation changed.');t.abort();return;}
          const generation=expectedGeneration+1;store.put({...bundle,generation,manifest:packageManifest(bundle,generation)},target.path);};
        t.oncomplete=()=>{clean();resolve({generation:expectedGeneration+1});};t.onabort=()=>{clean();reject(error??(signal?.aborted?fail('AUTHORING_CANCELLED','Save cancelled.'):t.error??fail('AUTHORING_STORAGE','IndexedDB transaction aborted.')));};
        t.onerror=()=>{};
      });}finally{database.close();}
    }
  };
}
