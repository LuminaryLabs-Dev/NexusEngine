import {createNexusBinding} from '../nexus-api/binding.js';
import {loadNativeRuntime} from '../runtime/native.js';
export function createCamelRuntime(engine,configuration={}){
  let sequence=0,disposed=false;const active=new Map(),receipts=new Map();
  const clone=v=>structuredClone(v);
  async function execute(source,options={}){
    if(disposed)throw new Error('Camel domain disposed');
    if(typeof source!=='string')throw new TypeError('Camel source must be a string');
    const native=await loadNativeRuntime();if(disposed)throw new Error('Camel domain disposed');
    const {randomUUID}=await import("node:crypto");
    const id=`camel:${++sequence}:${randomUUID()}`;
    const binding=createNexusBinding(engine,{allowCalls:configuration.allowCalls??[]});
    const entry={id,status:'running',source,entry:options.entry??'Main'};active.set(id,{native,binding});
    const request={id,source,filename:configuration.filename??"main.camel",resolveImports:Boolean(configuration.filename),entry:entry.entry,args:options.args??[],action:options.action??'run',hostCapabilities:configuration.hostCapabilities??[],...Object.fromEntries(['steps','tasks','callDepth'].filter(k=>configuration[k]!==undefined).map(k=>[k,configuration[k]]))};
    try{
      const result=JSON.parse(await native.execute(JSON.stringify(request),(error,message)=>{
        if(error)return;
        const packet=JSON.parse(message);
        if(packet.kind==='log'){try{configuration.onLog?.(packet.payload);}catch{}return;}
        Promise.resolve().then(()=>{
          if(disposed||!active.has(id))throw new Error('Camel execution no longer active');
          if(packet.kind==='discover')return binding.discover();
          if(packet.kind==='poll')return binding.poll();
          if(packet.kind==='nexus')return binding.call(packet.payload);
          if(packet.kind==='model'){
            if(typeof configuration.modelProvider!=='function')throw new Error('No Camel model provider configured');
            return configuration.modelProvider(packet.payload);
          }
          throw new Error('Unknown Camel host request');
        }).then(value=>native.reply(packet.id,JSON.stringify({ok:true,value}))).catch(e=>native.reply(packet.id,JSON.stringify({ok:false,error:String(e?.message??e)})));
      }));
      const receipt={...entry,status:'completed',result};receipts.set(id,receipt);return clone(receipt);
    }catch(error){receipts.set(id,{...entry,status:'failed',error:error.message});throw error;}
    finally{try{binding.dispose();}finally{active.delete(id);}}
  }
  return {
    execute,
    check:(source,options={})=>execute(source,{...options,action:'check'}),
    discover:()=>createNexusBinding(engine).discover(),
    cancel(id){const work=active.get(id);return work?work.native.cancel(id):false;},
    status(){return {active:[...active.keys()],disposed,receipts:clone([...receipts.values()])};},
    getSnapshot(){if(active.size)throw new Error('Cannot snapshot live Camel execution');return {schema:'nexusengine.camel-state/1',sequence,receipts:clone([...receipts.entries()])};},
    loadSnapshot(snapshot){if(active.size||disposed)throw new Error('Cannot restore active/disposed Camel runtime');if(snapshot?.schema!=='nexusengine.camel-state/1'||!Number.isSafeInteger(snapshot.sequence)||snapshot.sequence<0||!Array.isArray(snapshot.receipts))throw new TypeError('Invalid Camel snapshot');const next=new Map(snapshot.receipts);for(const [id,r] of next){if(id!==r.id||!['completed','failed'].includes(r.status))throw new TypeError('Invalid Camel receipt');}sequence=snapshot.sequence;receipts.clear();for(const [id,r] of next)receipts.set(id,clone(r));return this.getSnapshot();},
    reset(){if(active.size)throw new Error('Cancel and drain execution before reset');receipts.clear();sequence=0;},
    dispose(){if(disposed)return;disposed=true;for(const [id,{native}] of active)native.cancel(id);},
    capabilities(){return {native:'darwin-arm64',browser:'unverified',checkpoint:'completed-invocations',subscriptions:'queued-callbacks'};}
  };
}
