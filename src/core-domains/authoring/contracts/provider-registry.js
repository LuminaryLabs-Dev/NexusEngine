import { record, fail } from './io.js';
import { requireText } from './value.js';
/** Executable providers are trusted code. Snapshots contain identity, never functions. */
export function createProviderRegistry(kitId, defaults, methods, state=null) {
  const implementations=new Map(); let local=[];
  const ids=()=>new Set(state ? (state.read().providers??[]) : local);
  const setIds=value=>{const next=[...value];if(state)state.write({providers:next});else local=next;};
  const describe=p=>record({id:p.id,version:p.version,format:p.format,profile:p.profile,capabilities:p.capabilities});
  const register=p=>{
    for(const key of ['id','version','format','profile']) requireText(p?.[key],`provider.${key}`);
    for(const method of methods) if(typeof p[method]!=='function') throw fail('AUTHORING_PROVIDER',`${p.id} requires ${method}().`);
    const metadata=describe(p), old=implementations.get(p.id);
    if(old && (old!==p || JSON.stringify(describe(old))!==JSON.stringify(metadata)))
      throw fail('AUTHORING_PROVIDER_COLLISION',`Provider ${p.id} is already registered; use a new versioned ID.`);
    if(!old) implementations.set(p.id,Object.freeze(p));const next=ids();next.add(p.id);setIds(next);return metadata;
  };
  defaults.forEach(register); const baseline=new Set(ids());
  function get(format,id) {
    const candidates=[...ids()].map(id=>implementations.get(id)).filter(p=>p.format===format && (!id||p.id===id));
    if(candidates.length!==1) throw fail(candidates.length?'AUTHORING_PROVIDER_AMBIGUOUS':'AUTHORING_PROVIDER_UNAVAILABLE',
      `Select one installed provider for ${format}.`,{format,providerId:id??null,candidates:candidates.map(p=>p.id)});
    return candidates[0];
  }
  const getSnapshot=()=>record({schema:'nexusengine.authoring-provider-registry/1',kitId,providers:[...ids()].sort().map(id=>describe(implementations.get(id)))});
  return {
    register, get, list:()=>[...ids()].sort().map(id=>describe(implementations.get(id))),
    getSnapshot,
    reset(){setIds(baseline);return getSnapshot();},
    loadSnapshot(s){
      if(s?.schema!=='nexusengine.authoring-provider-registry/1'||s.kitId!==kitId||!Array.isArray(s.providers)) throw fail('AUTHORING_SNAPSHOT','Invalid registry snapshot.');
      const next=new Set();
      for(const d of s.providers){const p=implementations.get(d.id);
        if(!p||JSON.stringify(describe(p))!==JSON.stringify(record(d))||next.has(d.id)) throw fail('AUTHORING_PROVIDER_UNAVAILABLE','Snapshot requires the exact preinstalled trusted provider.');
        next.add(d.id);
      }
      setIds(next);return getSnapshot();
    }
  };
}
