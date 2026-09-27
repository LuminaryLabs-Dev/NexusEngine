import { copy, fail } from '../../../contracts/io.js';
import { packageManifest } from '../../project-package.js';
const stores=new Map();
export function createMemoryAuthoringStorageProvider({store=stores}={}) {
  return {id:'authoring-memory-storage/1',version:'1',format:'memory',profile:'process-memory-cas/1',capabilities:{persistent:false,atomic:true},
    async read(target){const value=store.get(target.path);if(!value)throw fail('AUTHORING_STORAGE_MISSING','No saved project at this key.');return copy(value);},
    async write(target,bundle,{expectedGeneration=0,signal}={}){
      if(signal?.aborted)throw fail('AUTHORING_CANCELLED','Save cancelled.');
      const prior=store.get(target.path);if((prior?.generation??0)!==expectedGeneration)throw fail('AUTHORING_STORAGE_CONFLICT','Saved generation changed.');
      const generation=expectedGeneration+1;store.set(target.path,copy({...bundle,generation,manifest:packageManifest(bundle,generation)}));return {generation};
    }
  };
}
