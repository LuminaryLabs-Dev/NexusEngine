import assert from 'node:assert/strict';
import {createNexusGLProvider, normalizeDraw} from '../index.js';
import {compare} from './helpers.mjs';
import {performanceScene,performanceFrame} from './fixtures/performance-scenes.mjs';
assert.throws(()=>normalizeDraw({geometryId:'g',instanceId:''}),/nonempty/);
const frames=[];
for(const backend of process.platform==='darwin'&&process.arch==='arm64'?['native','wasm']:['wasm']) {
  const p=createNexusGLProvider({backend,shadowCacheBytes:1024*1024});await p.initialize();
  const scene=performanceScene();for(const r of scene.resources)p.createResource(r);
  const draws=scene.draws.map((d,i)=>({...d,instanceId:`tile-${i}`}));
  let serial=0;
  const render=(list=draws,settings={})=>{const frame=performanceFrame('incremental-'+ ++serial,{width:160,height:100,...settings});p.beginFrame(frame);p.executePass({frameId:frame.frameId,passId:'scene',sequence:0,kind:'render'},list);p.submitFrame(frame.frameId);return p.getCompletedFrame();};
  const first=render(),initial=p.getDiagnostics();
  const repeated=render(),warm=p.getDiagnostics();compare(first.pixels,repeated.pixels);
  assert.equal(warm.meshUploads,1,'one indexed mesh shared by all instances');
  assert.equal(warm.meshUploads,initial.meshUploads);assert.equal(warm.validatedVertices,initial.validatedVertices);assert.equal(warm.transformedVertices,initial.transformedVertices);
  render([...draws].reverse());render(draws);
  assert.equal(p.getDiagnostics().meshUploads,warm.meshUploads);assert.equal(p.getDiagnostics().transformedVertices,warm.transformedVertices,'submission order alone never transforms geometry');
  const moving=structuredClone(draws);moving[7].transform[12]+=.12;
  const changed=render(moving),motion=p.getDiagnostics();
  assert.notDeepEqual(changed.pixels,first.pixels);assert.equal(motion.meshUploads,warm.meshUploads);assert.equal(motion.transformedVertices-warm.transformedVertices,4,'only one four-vertex instance transforms');
  render(moving,{camera:.12});const camera=p.getDiagnostics();assert.equal(camera.transformedVertices,motion.transformedVertices);assert.equal(camera.meshUploads,motion.meshUploads);
  render(moving,{light:.3});assert.equal(p.getDiagnostics().meshUploads,motion.meshUploads);
  p.updateResource({...scene.resources.find(r=>r.id==='opaque'),data:{...scene.resources.find(r=>r.id==='opaque').data,tint:[.3,.7,1]}});render(moving);
  assert.equal(p.getDiagnostics().meshUploads,motion.meshUploads,'appearance update preserves mesh residency');
  const appearance=structuredClone(scene.resources.find(r=>r.id==='tile'));appearance.data.color=[200,230,255,255];appearance.data.castsShadow=false;const beforeAppearance=p.getDiagnostics();p.updateResource(appearance);render(moving);assert.equal(p.getDiagnostics().meshUploads,beforeAppearance.meshUploads);assert.equal(p.getDiagnostics().transformedVertices,beforeAppearance.transformedVertices,'appearance updates preserve transformed vertices');
  p.beginFrame(performanceFrame('duplicate',{width:160,height:100}));
  p.executePass({frameId:'duplicate',passId:'a',sequence:0,kind:'render'},[draws[0]]);
  assert.throws(()=>p.executePass({frameId:'duplicate',passId:'b',sequence:1,kind:'render'},[draws[0]]),/Duplicate instanceId/);p.cancelFrame();
  const held=p.getCompletedFrame(),owned=new Uint8ClampedArray(held.pixels);
  for(let i=0;i<8;i++)render(draws,{width:128+i,height:80+i});compare(held.pixels,owned);
  assert(p.getDiagnostics().framePool.slots<=3);
  if(backend==='wasm'){
    const heap=p.getDiagnostics().runtimeHeapBytes;
    render(draws,{width:1024,height:768});
    assert(p.getDiagnostics().runtimeHeapBytes>heap,'larger render forces WASM memory growth');
    compare(held.pixels,owned);
  }
  frames.push(render(draws).pixels);
  // Legacy omitted IDs retain submission-slot compatibility, including reordering.
  render(scene.draws);render([...scene.draws].reverse());
  render([]);for(const r of [...scene.resources].sort((a,b)=>({geometry:0,material:1,texture:2}[a.kind]-{geometry:0,material:1,texture:2}[b.kind])))p.releaseResource(r.id);
  render([]);assert.equal(p.getDiagnostics().resources,0);p.dispose();compare(held.pixels,owned);
}
if(frames.length===2)compare(frames[0],frames[1],1);
console.log('Incremental shared meshes, sparse transforms, frame-wide IDs, resources and captures: passed');
// Both bridge adapters validate upload shapes before pointer arithmetic. Legacy
// chunking performs one commit, and an invalid late vertex retains the scene.
const {loadNexusGLRuntime}=await import('../runtime/loader.js');
for(const backend of process.platform==='darwin'&&process.arch==='arm64'?['native','wasm']:['wasm']){
  const r=await loadNexusGLRuntime(backend),d=r.deviceCreate(),s=r.sceneCreate(d);
  try{
    const view=r.defaults(1);view[38]=16;r.view(d,s,view);
    assert.throws(()=>r.view(d,s,new Float32Array(45)),/bridge array/);
    assert.throws(()=>r.mesh(d,s,0n,new Float32Array(36),new Uint32Array([0,1,2])),/bridge array/);
    const triangle=[-.5,-.5,.5,0,0,1,0,0,1,0,0,1,.5,-.5,.5,0,0,1,1,0,1,0,0,1,0,.5,.5,0,0,1,.5,1,1,0,0,1];
    for(const count of [63,64,65,127,128,129]){
      r.clearGeometry(d,s);const before=r.statistics(d,s).committedTransactions;
      r.draw(d,s,new Float64Array(Array.from({length:count},()=>triangle).flat()),count,0xffffffff,0n,0,0);
      assert.equal(r.statistics(d,s).committedTransactions,before+1);
    }
    const owned=r.render(d,s,32,24,1),previous=r.sceneRevision(d,s);
    const bad=new Float64Array(Array.from({length:65},()=>triangle).flat());bad[64*36]=NaN;
    assert.throws(()=>r.draw(d,s,bad,65,0xffffffff,0n,0,0),/finite|vertex|geometry|coordinate/i);
    assert.equal(r.sceneRevision(d,s),previous);compare(r.render(d,s,32,24,1),owned);
    assert.throws(()=>r.draw(d,s,new Float64Array(36),-1,0xffffffff,0n,0,0),/count|integral/);
  }finally{r.deviceDestroy(d);}
}
console.log('Native/WASM bridge shapes, single chunked commit, invalid late upload rollback: passed');
