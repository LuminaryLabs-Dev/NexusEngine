import assert from 'node:assert/strict';
import { createEngine } from 'nexusengine';
import { createNexusGLProvider, installGraphicsLanguage, createFrameHost } from 'nexusengine/domains/render/graphics-language';
import { populate, sceneFrame, sceneResources } from '../../../../examples/graphics-language/scene.js';
import { fails, compare, save } from './helpers.mjs';
import { writeFile } from 'node:fs/promises';

const hasNative=process.platform==='darwin'&&process.arch==='arm64';
const primary=hasNative?'native':'wasm';
const memory=[];
function selection(backend=primary, overrides={}) {
  const inner=createNexusGLProvider({backend,memoryBudgetBytes:16*1024**2,maxResourceBytes:1024**2,maxFragments:8192});
  const stats={disposed:0,initialized:0};
  const p={...inner,initialize:async()=>{stats.initialized++;return inner.initialize();},dispose:()=>{stats.disposed++;return inner.dispose();},...overrides};
  return {provider:p,reservationBytes:64*1024**2,inner,stats};
}
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
let fault=null;
const memoryHost=createFrameHost({present:()=>{if(fault==='present'){fault=null;throw Error('injected presentation failure');}}});
const host={...memoryHost,prepare:(frame,tag)=>{if(fault==='prepare'){fault=null;throw Error('injected prepare failure');}return memoryHost.prepare(frame,tag);}};
const first=selection();
const engine=createEngine();
const graphics=installGraphicsLanguage(engine,{selection:first,host,handoverBudgetBytes:160*1024**2,handoverTimeoutMs:2000});
await graphics.ready;await populate(graphics);await graphics.render(sceneFrame('initial',0,160,96));
await save(graphics.capture(),'handover-before');
const baseline=graphics.capture();
let operation=0;
async function rejected(selected,pattern,options={}) {
  const before=graphics.capture(), generation=graphics.getState().generation;
  await fails(()=>graphics.switchRenderer({operationId:'reject-'+(++operation),selection:selected,...options}),pattern);
  compare(before.pixels,graphics.capture().pixels);
  assert.equal(graphics.getState().generation,generation);
  assert.equal(graphics.getState().phase,'ready');
  assert(selected.stats.disposed>0);
  await graphics.render(sceneFrame('after-rejection',0,160,96));
}
await rejected(selection(primary,{capabilities:{...first.provider.capabilities,alphaModes:['opaque']}}),/alphaModes/);
await rejected({...selection(),reservationBytes:200*1024**2},/memory budget/);
await rejected(selection(primary,{initialize:()=>{throw Error('injected initialize failure');}}),/initialize failure/);
await rejected(selection(primary,{createResource:()=>{throw Error('injected upload allocation failure');}}),/allocation failure/);
await rejected(selection(primary,{submitFrame:()=>{throw Error('injected candidate frame failure');}}),/candidate frame failure/);
const wrongExtent=selection();wrongExtent.provider.getCompletedFrame=()=>({frameId:'after-rejection',width:1,height:1,stride:4,pixels:new Uint8ClampedArray(4)});
await rejected(wrongExtent,/incomplete frame extent/);
fault='prepare';await rejected(selection(),/prepare failure/);
fault='present';await rejected(selection(),/presentation failure/);
const realCommit=engine.n.renderInstallation.commitHandover;
engine.n.renderInstallation.commitHandover=()=>{throw Error('injected lifecycle commit failure');};
await rejected(selection(),/lifecycle commit/);
engine.n.renderInstallation.commitHandover=realCommit;
const gate=deferred(), pendingCandidate=selection(primary,{initialize:()=>gate.promise});
const pending=graphics.switchRenderer({operationId:'cancel-initialize',selection:pendingCandidate});
assert.throws(()=>graphics.switchRenderer({operationId:'conflict'}),/candidate/);
assert.throws(()=>engine.n.renderShutdown.begin({operationId:'invalid-shutdown'}),/handover first/);
assert.throws(()=>engine.n.renderInstallation.reset(),/handover first/);
assert.equal(graphics.cancelHandover('wrong'),false);
assert.equal(graphics.cancelHandover('cancel-initialize'),true);
await fails(()=>pending,/cancelled/);gate.resolve();await new Promise(r=>setTimeout(r,5));
assert(pendingCandidate.stats.disposed>=1);
assert.equal(graphics.getState().handover.status,'cancelled');
compare(baseline.pixels,graphics.capture().pixels);
const submitted=deferred(), finishFrame=deferred(), lateFrame=selection();
lateFrame.provider.submitFrame=async id=>{submitted.resolve();await finishFrame.promise;return lateFrame.inner.submitFrame(id);};
const late=graphics.switchRenderer({operationId:'cancel-late-frame',selection:lateFrame});
await submitted.promise;graphics.cancelHandover('cancel-late-frame');await fails(()=>late,/cancelled/);
finishFrame.resolve();await new Promise(r=>setTimeout(r,5));compare(baseline.pixels,graphics.capture().pixels);
const aborted=new AbortController();aborted.abort();
await rejected(selection(),/cancelled/,{signal:aborted.signal});

// Update the application descriptions and camera while a candidate initializes.
const second=selection('wasm'), ready=deferred();
second.provider.initialize=async()=>{await ready.promise;return second.inner.initialize();};
const switching=graphics.switchRenderer({operationId:'with-updates',selection:second});
const glass=sceneResources().find(r=>r.id==='glass');glass.data.tint=[.7,.12,.8];
await graphics.updateResource(glass);
await graphics.render(sceneFrame('moving-camera',.2,160,96));
const latest=graphics.capture(), revision=graphics.getState().resourceRevision;
ready.resolve();const swapped=await switching;
assert.equal(swapped.presented,true);assert.equal(swapped.cleanupError,null);
assert.equal(first.inner.getDiagnostics().status,'disposed');
assert.equal(graphics.getState().handover.capturedRevision,revision);
compare(latest.pixels,graphics.capture().pixels,2);
assert.equal(graphics.getState().generation,1);
assert.throws(()=>graphics.switchRenderer({operationId:'with-updates'}),/already been used/);
await save(graphics.capture(),'handover-after');

// The final upload/commit barrier rejects writes; cancellation is still possible.
const uploading=deferred(), uploadGate=deferred(), blocked=selection();
blocked.provider.createResource=async r=>{uploading.resolve();await uploadGate.promise;return blocked.inner.createResource(r);};
const inUpload=graphics.switchRenderer({operationId:'cancel-upload',selection:blocked});
await uploading.promise;
assert.throws(()=>graphics.createResource({id:'late',kind:'material',data:{}}),/barrier/);
assert.throws(()=>graphics.render(sceneFrame('late-frame')),/barrier/);
assert.equal(graphics.cancelHandover('cancel-upload'),true);
await fails(()=>inUpload,/cancelled/);uploadGate.resolve();await new Promise(r=>setTimeout(r,5));
compare(latest.pixels,graphics.capture().pixels,2);

// Both the lifecycle bundle and portable resources restore, without transporting
// backend snapshots or platform handles between providers.
const bundle=engine.n.renderSnapshot.capture({operationId:'capture-ready',snapshotId:'current'}).result.snapshot;
engine.n.renderSnapshot.restore({operationId:'restore-ready',snapshot:bundle});
const portable=graphics.getSnapshot();
await graphics.reset();await graphics.loadSnapshot(portable);await graphics.render(sceneFrame('restored',.2,160,96));
compare(latest.pixels,graphics.capture().pixels,2);
const bad=structuredClone(portable);bad.resources.push({id:'bad',kind:'material',data:{colorTexture:'absent'}});
await fails(()=>graphics.loadSnapshot(bad),/Missing texture/);
compare(latest.pixels,graphics.capture().pixels,2);

for(let i=0;i<16;i++) {
  const next=selection(i%2===0?primary:'wasm');
  const before=graphics.capture();
  const started=performance.now();
  const result=await graphics.switchRenderer({operationId:'repeat-'+i,selection:next});
  assert.equal(result.cleanupError,null);assert.equal(graphics.getState().retiredProviders,0);
  compare(before.pixels,graphics.capture().pixels,2);
  if(global.gc)global.gc();
  memory.push({iteration:i,handoverMs:performance.now()-started,...process.memoryUsage(),provider:graphics.getState().diagnostics});
}
// Peak after warmup must stay bounded. This is an observed process envelope,
// alongside exact zero-owned-resource/disposed checks; allocator caches may persist.
const warm=memory.slice(4),growth=warm.at(-1).rss-warm[0].rss;
assert(growth<64*1024**2,`Retained RSS grew by ${growth}`);
assert.equal(graphics.getState().resourceRevision,revision+2);
await graphics.dispose();await graphics.dispose();
assert.equal(graphics.getState().retiredProviders,0);
assert.equal(graphics.getState().phase,'installed');
assert.throws(()=>graphics.render(sceneFrame()),/disposed/);

// A hanging candidate has a deadline, and late results are disposed.
const tinyEngine=createEngine(), tiny=installGraphicsLanguage(tinyEngine,{backend:'wasm',handoverTimeoutMs:30});
await tiny.ready;await populate(tiny);await tiny.render(sceneFrame('timeout',0,64,48));
const never=selection('wasm',{initialize:()=>new Promise(()=>{})});
await fails(()=>tiny.switchRenderer({operationId:'timeout',selection:never}),/timed out/);
await tiny.render(sceneFrame('still-usable',.1,64,48));await tiny.dispose();

// Startup errors are visible through both readiness and the Core lifecycle.
const failEngine=createEngine(), broken=installGraphicsLanguage(failEngine,{selection:selection('wasm',{initialize:()=>{throw Error('startup fault');}})});
await fails(()=>broken.ready,/startup fault/);assert.equal(failEngine.n.renderInstallation.getPhase(),'failed');await broken.dispose();
const lowBudget=installGraphicsLanguage(createEngine(),{backend:'wasm',handoverBudgetBytes:1024**2});
await fails(()=>lowBudget.ready,/Initial renderer exceeds memory budget/);
assert.equal(lowBudget.getState().status,'failed');await lowBudget.dispose();
// Post-commit cleanup failure keeps the new renderer, accounts for the old one,
// and blocks another overlap until disposal successfully releases both.
const old=selection();let failDispose=true;
old.provider.dispose=()=>{if(failDispose){failDispose=false;throw Error('injected old disposal failure');}return old.inner.dispose();};
const recovery=installGraphicsLanguage(createEngine(),{selection:old});
await recovery.ready;await populate(recovery);await recovery.render(sceneFrame('cleanup',0,64,48));
const cleanup=await recovery.switchRenderer({operationId:'cleanup-fault',selection:selection('wasm')});
assert.match(cleanup.cleanupError,/disposal failure/);assert.equal(recovery.getState().retiredProviders,1);
assert.throws(()=>recovery.switchRenderer({operationId:'blocked-cleanup'}),/retired provider/);
await recovery.render(sceneFrame('new-renderer-still-works',.1,64,48));
await recovery.dispose();assert.equal(old.inner.getDiagnostics().status,'disposed');assert.equal(recovery.getState().retiredProviders,0);
await writeFile('build/graphics-evidence/handover-memory.json',JSON.stringify({schema:'nexusengine.graphics-handover-measurement/1',platform:process.platform,arch:process.arch,node:process.version,nativeVerified:hasNative,swaps:17,warmupIterations:4,retainedRssGrowthBytes:growth,processHighWaterRssBytes:process.resourceUsage().maxRSS*1024,memory},null,2)+'\n');
console.log(`Graphics handover: passed, ${hasNative?'native/WASM':'WASM only'}, 17 swaps, retained RSS growth ${growth} bytes`);
