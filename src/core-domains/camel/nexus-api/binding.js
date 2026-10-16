const unsafe = new Set(['__proto__','prototype','constructor']);
const fail = (code,message) => Object.assign(new Error(message),{code});
export function createNexusBinding(engine,{allowCalls=[],maxEvents=1024}={}) {
  if(typeof engine?.n?.apis!=='function') throw fail('CAMEL_REGISTRY','An installed Nexus API registry is required');
  const resources=new Map(),identities=new WeakMap(),subscriptions=new Map(),events=[];let sequence=0,disposed=false,overflow=false;
  function retain(value){if(identities.has(value))return {$camel:'reference',id:identities.get(value)};const id=`resource:${++sequence}`;resources.set(id,value);identities.set(value,id);return {$camel:'reference',id};}
  function encode(value,seen=new WeakSet()) {
    if(value===undefined)return {$camel:'undefined'};
    if(typeof value==='bigint')return {$camel:'bigint',value:String(value)};
    if(typeof value==='number'&&(!Number.isFinite(value)||(Number.isInteger(value)&&!Number.isSafeInteger(value))))throw fail('CAMEL_VALUE','Unsafe/non-finite JavaScript number');
    if(value===null||typeof value==='string'||typeof value==='number'||typeof value==='boolean')return value;
    if(typeof value==='function'||(typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)!==Object.prototype))return retain(value);
    if(seen.has(value))throw fail('CAMEL_VALUE','Cyclic values require an explicit Nexus resource');seen.add(value);
    const result=Array.isArray(value)?value.map(v=>encode(v,seen)):Object.fromEntries(Object.entries(value).map(([k,v])=>{if(k==='$camel'||unsafe.has(k))throw fail('CAMEL_VALUE',`Reserved key: ${k}`);return [k,encode(v,seen)];}));seen.delete(value);return result;
  }
  function decode(value){
    if(value&&typeof value==='object'){
      if(value.$camel==='callback'){if(typeof value.id!=='string')throw fail('CAMEL_CALLBACK','Callback identity required');return (...args)=>{if(!disposed){if(events.length>=maxEvents){overflow=true;return;}events.push({callbackId:value.id,args:args.map(a=>encode(a))});}};}
      if(value.$camel==='reference'){if(!resources.has(value.id))throw fail('CAMEL_REFERENCE','Unknown or expired resource');return resources.get(value.id);}
      if(value.$camel==='undefined')return undefined;
      if(value.$camel==='bigint')return BigInt(value.value);
      if(value.$camel)throw fail('CAMEL_VALUE','Unknown value tag');
      if(Array.isArray(value))return value.map(decode);
      return Object.fromEntries(Object.entries(value).map(([k,v])=>{if(unsafe.has(k))throw fail('CAMEL_VALUE',`Unsafe key ${k}`);return [k,decode(v)];}));
    } return value;
  }
  function publicRecord(name){const r=engine.n.api(name);if(!r)throw fail('CAMEL_UNKNOWN_API',`Unknown API ${name}`);if(r.visibility!=='public')throw fail('CAMEL_VISIBILITY',`API ${name} is not public`);if(!r.available)throw fail('CAMEL_UNAVAILABLE',`API ${name} unavailable`);return r;}
  function target(name,path){publicRecord(name);let owner=engine.n[name],value=owner;for(const key of path){if(typeof key!=='string'||unsafe.has(key)||!Object.prototype.hasOwnProperty.call(value,key))throw fail('CAMEL_UNKNOWN_MEMBER',`Unknown public member ${name}.${path.join('.')}`);owner=value;value=value[key];}return {owner,value};}
  function authorize(name,path,op){const key=`${name}.${path.join('.')}:${op}`;if(!allowCalls.includes(key))throw fail('CAMEL_PERMISSION',`Call not granted: ${key}`);}
  return {
    discover(){if(disposed)throw fail('CAMEL_DISPOSED','Binding disposed');return engine.n.apis().filter(r=>r.visibility==='public').map(r=>({...r}));},
    async call([name,path=[],args=[],op='call']){
      if(disposed)throw fail('CAMEL_DISPOSED','Binding disposed');if(typeof name!=='string'||!Array.isArray(path)||!Array.isArray(args))throw fail('CAMEL_CALL','Expected API name, member path and argument array');
      if(name==='camel'&&['execute','check'].includes(path[0]))throw fail('CAMEL_REENTRANCY','Nested Camel execution through its own API is not supported');
      authorize(name,path,op);const {owner,value}=target(name,path);
      if(op==='get')return encode(value);
      if(!['call','subscribe'].includes(op)||typeof value!=='function')throw fail('CAMEL_CALL','Member is not callable');
      const result=await Reflect.apply(value,owner,args.map(decode));
      if(op==='subscribe'){
        if(!args.some(a=>a?.$camel==='callback'))throw fail('CAMEL_SUBSCRIPTION','Subscription requires a callback reference');
        const cleanup=typeof result==='function'?result:typeof result?.unsubscribe==='function'?()=>result.unsubscribe():null;
        if(!cleanup)throw fail('CAMEL_SUBSCRIPTION','Subscription returned no disposable resource');
        const ref=retain(result);subscriptions.set(ref.id,cleanup);return ref;
      }
      return encode(result);
    },
    poll(){if(overflow)throw fail('CAMEL_EVENT_OVERFLOW','Callback queue exceeded its capacity');return events.splice(0);},
    release(id){const cleanup=subscriptions.get(id);if(!cleanup)return false;subscriptions.delete(id);resources.delete(id);cleanup();return true;},
    dispose(){if(disposed)return;disposed=true;const errors=[];for(const cleanup of subscriptions.values()){try{cleanup();}catch(e){errors.push(e);}}subscriptions.clear();resources.clear();events.length=0;if(errors.length)throw new AggregateError(errors,'Camel subscription cleanup failed');},
    encode,decode,
    capabilities(){return {sharedInstance:true,lateRegistration:true,resourceReferences:true,pushSubscriptions:true,maxEvents};}
  };
}
