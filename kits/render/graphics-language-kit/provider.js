import { createFrameStore, registerFrameSource } from "./frame-ownership.js";
import { normalizeRenderPass } from "nexusengine/domains/render/pass-schema";
import { normalizeRenderFrame } from "nexusengine/domains/render/frame-schema";
import { CAPABILITIES, normalizeResource, normalizeResourceUpdate, normalizeFrame, normalizeDraw, integer, record } from "./contracts.js";
import { loadNexusGLRuntime } from "./runtime/loader.js";

const materialFields = { roughness:5, metallic:6, opacity:7, alphaCutoff:8, normalStrength:9, bands:10, outlinePixels:11, softness:12, highlight:13, rim:14 };
function materialValues(runtime, d) {
  const v = runtime.defaults(0);
  if (d.shading !== undefined) v[0] = CAPABILITIES.shading.indexOf(d.shading);
  if (d.alphaMode !== undefined) v[1] = CAPABILITIES.alphaModes.indexOf(d.alphaMode);
  for (const [key, at] of Object.entries(materialFields)) if (d[key] !== undefined) v[at] = d[key];
  v[5] = Math.max(.045, v[5]);
  for (const [key, at] of [["tint",2],["shadowColor",15],["outlineColor",18]]) if (d[key]) v.set(d[key], at);
  return v;
}
function viewValues(runtime, d) {
  const v = runtime.defaults(1);
  for (const [key, at] of [["projection",0],["shadowProjection",19]]) if (d[key]) v.set(Array.from({length:16},(_,i)=>d[key][(i%4)*4+Math.floor(i/4)]), at);
  for (const [key, at] of [["camera",16],["lightDirection",35]]) if (d[key]) v.set(d[key], at);
  for (const [key, at] of [["shadowResolution",38],["closedBackFaces",39],["exposure",40],["sampleScale",41],["shadowBias",42],["receiverPlaneClamp",43],["shadowFilterRadius",44]]) if (d[key] !== undefined) v[at] = Number(d[key]);
  return v;
}
function lightValues(runtime, d) {
  const v = runtime.defaults(2); if (d.color) v.set(d.color);
  ["intensity","fill","sky","skyGradient","specular","specularPower"].forEach((k,i) => { if (d[k] !== undefined) v[i+3] = d[k]; });return v;
}
// Pack local-space attributes only when immutable mesh content changes. Missing
// normals retain the legacy per-face fallback by expanding once at upload time.
function geometryValues(d) {
  const ids=d.normals ? Array.from({length:d.positions.length/3},(_,i)=>i) : d.indices;
  const values=new Float64Array(ids.length*12);
  ids.forEach((index,i)=>{
    let normal=d.normals?.slice(index*3,index*3+3);
    if(!normal) {
      const at=Math.floor(i/3)*3,[a,b,c]=d.indices.slice(at,at+3);
      const u=[0,1,2].map(k=>d.positions[b*3+k]-d.positions[a*3+k]);
      const v=[0,1,2].map(k=>d.positions[c*3+k]-d.positions[a*3+k]);
      const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n);
      normal=length?n.map(x=>x/length):[0,0,1];
    }
    const tangent=d.tangents?.slice(index*3,index*3+3)??(Math.abs(normal[0])<.9?[1,0,0]:[0,1,0]);
    values.set([...d.positions.slice(index*3,index*3+3),...normal,...(d.uvs?.slice(index*2,index*2+2)??[0,0]),...tangent,d.handedness?.[index]??1],i*12);
  });
  return {values,indices:new Uint32Array(d.normals?d.indices:ids.map((_,i)=>i))};
}
const byteCounts=new WeakMap();
function resourceBytes(r) {
  if(byteCounts.has(r))return byteCounts.get(r);
  const count=x=>Array.isArray(x)?x.reduce((s,v)=>s+count(v),0):x&&typeof x==='object'?Object.values(x).reduce((s,v)=>s+count(v),0):typeof x==='number'?8:typeof x==='string'?x.length*2:1;
  const bytes=count(r);byteCounts.set(r,bytes);return bytes;
}
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);

export function createNexusGLProvider(options = {}) {
  const budget = integer(options.memoryBudgetBytes ?? 128*1024*1024, "memory budget", 1024*1024);
  const fragments = integer(options.maxFragments ?? 262144, "fragment budget", 1, 8388608);
  const resourceBudget = integer(options.maxResourceBytes ?? 32*1024*1024, "resource byte budget", 1);
  const shadowCacheBytes=integer(options.shadowCacheBytes??Math.min(16*1024**2,Math.floor(budget/4)), 'shadow cache budget',0,budget);
  const frames=createFrameStore();
  let runtime,backend=null,device,scene,initialization,resources=new Map(),bytes=0,revision=0;
  let resident=new Map(),instances=new Map(),order=[],viewKey=null,lightKey=null,backgroundKey=null;
  let active=null,disposed=false,serial=0,resourceRebuilds=0,submittedRevision=-1,submittedDraws=[];
  const timings={updateMs:0,renderMs:0};
  const now=()=>globalThis.performance?.now()??Date.now();
  const ready=()=>{if(disposed)throw Error('Graphics provider is disposed');if(!device)throw Error('Graphics provider is not initialized');};
  const idle=()=>{ready();if(active)throw Error('Resource mutation requires an idle frame');};
  const lookup=(id,kind)=>{const r=resources.get(id);if(!r||r.kind!==kind)throw TypeError(`Unknown ${kind}: ${id}`);return r;};
  const refs=(map=resources)=>{for(const r of map.values())if(r.kind==='material')for(const key of ['colorTexture','normalTexture'])if(r.data[key]){const t=map.get(r.data[key]);if(t?.kind!=='texture')throw Error(`Missing texture: ${r.data[key]}`);if(t.data.normalMap!==(key==='normalTexture'))throw Error(`Texture color space does not match ${key}`);}};
  const commit=next=>{const amount=[...next.values()].reduce((sum,r)=>sum+resourceBytes(r),0);if(amount>resourceBudget)throw RangeError('Graphics resource byte budget exceeded');refs(next);resources=next;bytes=amount;revision++;};
  const resetResident=()=>{resident=new Map();instances=new Map();order=[];viewKey=lightKey=backgroundKey=null;submittedRevision=-1;submittedDraws=[];};
  const stage=(frame,draws)=>{
    const next=new Map(resident),nextInstances=new Map(),nextOrder=[];
    const vk=JSON.stringify(frame.view),lk=JSON.stringify(frame.light),bk=JSON.stringify(frame.clear);
    const unchanged=submittedRevision===revision&&draws.length===submittedDraws.length&&draws.every((d,i)=>{const old=submittedDraws[i];return d.instanceId===old.instanceId&&d.geometryId===old.geometryId&&d.materialId===old.materialId&&equal(d.transform,old.transform);});
    if(unchanged&&vk===viewKey&&lk===lightKey&&bk===backgroundKey)return;
    runtime.beginUpdate(device,scene,runtime.sceneRevision(device,scene));
    try {
      // Native handles remain private until the entire scene transaction succeeds.
      for(const kind of ['texture','material','geometry'])for(const r of resources.values())if(r.kind===kind){
        const prior=resident.get(r.id),old=prior?.record.kind===kind?prior:undefined;if(old?.record===r)continue;
        const d=r.data;let handle=old?.handle;
        if(kind==='texture')handle=runtime.textureResource(device,scene,handle??0n,d.width,d.height,new Uint8Array(d.rgba),['nearest','bilinear','trilinear'].indexOf(d.filter),Number(d.normalMap));
        else if(kind==='material')handle=runtime.materialResource(device,scene,handle??0n,materialValues(runtime,d),next.get(d.colorTexture)?.handle??0n,next.get(d.normalTexture)?.handle??0n);
        else {
          const same=old&&['positions','normals','uvs','tangents','handedness','indices'].every(k=>d[k]===undefined?old.record.data[k]===undefined:old.record.data[k]!==undefined&&equal(d[k],old.record.data[k]));
          if(!same){const mesh=geometryValues(d);handle=runtime.mesh(device,scene,handle??0n,mesh.values,mesh.indices);}
        }
        next.set(r.id,{handle,record:r});
      }
      draws.forEach((draw,slot)=>{
        const key=draw.instanceId===undefined?`slot:${slot}`:`id:${draw.instanceId}`;
        const old=instances.get(key),geometry=lookup(draw.geometryId,'geometry').data;
        const mesh=next.get(draw.geometryId).handle,material=next.get(draw.materialId)?.handle??0n;
        const fields=[mesh,material,...draw.transform,...geometry.color,Number(geometry.castsShadow),Number(geometry.twoSidedShadow)];
        const handle=old&&equal(old.fields,fields)?old.handle:runtime.instance(device,scene,old?.handle??0n,mesh,material,new Float64Array(draw.transform),geometry.color.reduce((v,c,i)=>v+c*2**(8*i),0),Number(geometry.castsShadow),Number(geometry.twoSidedShadow));
        nextInstances.set(key,{handle,fields});nextOrder.push(handle);
      });
      for(const [key,item] of instances)if(!nextInstances.has(key))runtime.releaseInstance(device,scene,item.handle);
      if(!equal(order,nextOrder))runtime.instanceOrder(device,scene,nextOrder);
      for(const kind of ['geometry','material','texture'])for(const [id,item] of resident)if((!resources.has(id)||resources.get(id).kind!==item.record.kind)&&item.record.kind===kind){runtime.releaseResource(device,scene,kind,item.handle);next.delete(id);}
      if(vk!==viewKey)runtime.view(device,scene,viewValues(runtime,frame.view));
      if(lk!==lightKey)runtime.light(device,scene,lightValues(runtime,frame.light));
      if(bk!==backgroundKey)runtime.background(device,scene,...frame.clear);
      runtime.commitUpdate(device,scene);
      if([...resources].some(([id,r])=>r.kind!=='geometry'&&resident.get(id)?.record!==r))resourceRebuilds++;
      resident=next;instances=nextInstances;order=nextOrder;viewKey=vk;lightKey=lk;backgroundKey=bk;submittedRevision=revision;submittedDraws=draws;
    }catch(error){try{runtime.abortUpdate(device,scene);}catch{}throw error;}
  };
  const provider={
    id:"nexusgl", version:"2", replayStable:true, capabilities:CAPABILITIES,
    initialize() {
      if(disposed)return Promise.reject(Error("Graphics provider is disposed"));
      if(initialization)return initialization;
      initialization=(async()=>{runtime=await loadNexusGLRuntime(options.backend??'auto',{maximumMemoryBytes:budget+16*1024**2});backend=runtime.backend;if(disposed){runtime=null;throw Error("Graphics provider disposed during initialization");}device=runtime.deviceCreate();try{runtime.limits(device,budget,fragments);runtime.shadowCacheLimit(device,shadowCacheBytes);scene=runtime.sceneCreate(device);}catch(e){runtime.deviceDestroy(device);device=null;runtime=null;throw e;}return {providerId:'nexusgl',backend,ready:true};})();
      initialization.catch(()=>{initialization=null;});return initialization;
    },
    createResource(input) {idle();const r=normalizeResource(input);if(resources.has(r.id))throw Error(`Duplicate resource: ${r.id}`);commit(new Map([...resources,[r.id,r]]),r.kind);return {resourceId:r.id,revision};},
    updateResource(input) {idle();const id=normalizeResource(input).id,r=normalizeResourceUpdate(input,resources.get(id));if(JSON.stringify(r)!==JSON.stringify(resources.get(r.id))){const next=new Map(resources);next.set(r.id,r);commit(next,r.kind);}return {resourceId:r.id,revision};},
    releaseResource(id) {idle();if(!resources.has(id))throw Error(`Unknown resource: ${id}`);for(const r of resources.values())if(r.kind==='material'&&(r.data.colorTexture===id||r.data.normalTexture===id))throw Error(`Resource ${id} is still referenced by ${r.id}`);const kind=resources.get(id).kind;const next=new Map(resources);next.delete(id);commit(next,kind,true);return {resourceId:id,released:true};},
    beginFrame(input) {ready();if(active)throw Error("A frame is already active");const frame=normalizeFrame(input),contract=input?.schema==='nexusengine.render-frame/1'?normalizeRenderFrame(input):null;if(contract?.surfaceId&&contract.surfaceId!==(options.surfaceId??'graphics-language:surface'))throw Error('Frame targets an incompatible surface');for(const id of contract?.resourceIds??[])if(!resources.has(id))throw Error(`Unknown frame resource: ${id}`);active={frame,contract,draws:[],sequence:-1,passes:new Set()};return {frameId:frame.frameId,status:'begun'};},
    executePass(input, draws) {
      ready();if(!active)throw Error("No active frame");const pass=normalizeRenderPass(input);
      if(pass.frameId!==active.frame.frameId||pass.kind!=='render'||pass.sequence<=active.sequence||active.passes.has(pass.passId))throw Error("Unsupported pass or invalid frame ordering");
      if(active.contract?.passIds.length && active.contract.passIds[active.passes.size]!==pass.passId)throw Error('Pass does not match the declared frame order');
      // Attachment/shader/compute execution cannot be silently treated as scene rendering.
      for(const field of ['pipelineId','attachmentIds','readResourceIds','writeResourceIds','commandIds','viewport','scissor'])if(pass[field]&&(Array.isArray(pass[field])?pass[field].length:true))throw Error(`Unsupported pass field: ${field}`);
      draws ??= pass.metadata.graphicsLanguage?.draws ?? [];
      if(!Array.isArray(draws))throw TypeError("draws must be an array");
      const normalized=draws.map(normalizeDraw);const ids=new Set(active.draws.filter(d=>d.instanceId!==undefined).map(d=>d.instanceId));for(const draw of normalized)if(draw.instanceId!==undefined){if(ids.has(draw.instanceId))throw Error(`Duplicate instanceId: ${draw.instanceId}`);ids.add(draw.instanceId);}normalized.forEach(d=>{lookup(d.geometryId,'geometry');if(d.materialId)lookup(d.materialId,'material');});
      active.draws.push(...normalized);active.sequence=pass.sequence;active.passes.add(pass.passId);return {frameId:pass.frameId,passId:pass.passId,status:'accepted',drawCount:normalized.length};
    },
    submitFrame(input) {
      ready();if(!active)throw Error("No active frame");const id=typeof input==='string'?input:input?.frameId;if(id!==active.frame.frameId)throw Error("Frame identity mismatch");
      const pending=active;active=null;
      try {
        if(pending.contract?.passIds.length && pending.contract.passIds.length!==pending.passes.size)throw Error('Frame has unfinished declared passes');
        const {frame,draws}=pending,start=now();
        const destination=frames.acquireDestination({frameId:id,width:frame.width,height:frame.height,serial:serial+1});
        try {
          stage(frame,draws);const updated=now();timings.updateMs=updated-start;
          runtime.renderInto(device,scene,frame.width,frame.height,CAPABILITIES.qualityModes.indexOf(frame.quality),destination.pixels);
          timings.renderMs=now()-updated;frames.publishOwned(destination);serial++;
        }catch(error){frames.discardDestination(destination);throw error;}
        return {frameId:id,status:'completed',serial,providerId:'nexusgl'};
      }catch(error){throw error;}
    },
    getCompletedFrame() {return frames.capture();},
    cancelFrame() {ready();active=null;},
    getSnapshot() {idle();return {schema:'nexusengine.nexusgl-resources/1',resources:structuredClone([...resources.values()])};},
    replaceResources(declarations) {idle();if(!Array.isArray(declarations))throw TypeError('Resource declarations must be an array');const list=declarations.map(normalizeResource);if(new Set(list.map(r=>r.id)).size!==list.length)throw Error('Duplicate snapshot resources');const next=new Map(list.map(r=>[r.id,r]));for(const r of list)if(r.kind==='material')for(const key of ['colorTexture','normalTexture'])if(r.data[key]&&next.get(r.data[key])?.kind!=='texture')throw Error('Snapshot has missing texture');commit(next);return {restored:true,resources:resources.size};},
    loadSnapshot(snapshot) {idle();record(snapshot,['schema','resources'],'snapshot');if(snapshot.schema!=='nexusengine.nexusgl-resources/1')throw TypeError('Unsupported graphics snapshot');return provider.replaceResources(snapshot.resources);},
    reset() {ready();active=null;const next=runtime.sceneCreate(device);if(scene)runtime.sceneDestroy(device,scene);scene=next;resources=new Map();bytes=0;resetResident();frames.clear();revision++;return {reset:true};},
    dispose() {if(disposed)return {disposed:true};disposed=true;active=null;if(device){runtime.deviceDestroy(device);device=null;}scene=null;resources.clear();bytes=0;resetResident();frames.clear();runtime=null;initialization=null;return {disposed:true};},
    getDiagnostics() {return {backend,status:disposed?'disposed':device?'ready':'uninitialized',resources:resources.size,resourceBytes:bytes,runtimeHeapBytes:runtime?.memoryBytes?.()??0,resourceRebuilds,serial,frameActive:Boolean(active),memoryBudgetBytes:budget,maxFragments:fragments,maxResourceBytes:resourceBudget,shadowCacheLimitBytes:shadowCacheBytes,revision,...(device&&scene?runtime.statistics(device,scene):{}),framePool:frames.getDiagnostics(),timings:{...timings}};},
    capture() {ready();return provider.getCompletedFrame();},
    waitIdle() {ready();if(active)throw Error('Frame is not submitted');return {idle:true};}
  };
  registerFrameSource(provider,frames);
  return provider;
}
