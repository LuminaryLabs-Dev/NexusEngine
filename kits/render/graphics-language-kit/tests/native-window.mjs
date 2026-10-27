import assert from 'node:assert/strict';
import { createEngine } from 'nexusengine';
import { installGraphicsLanguage, createNativeWindowHost } from 'nexusengine/domains/render/graphics-language';
import { populate, sceneFrame } from '../../../../examples/graphics-language/scene.js';
import { save, compare, distribution } from './helpers.mjs';
import { spawnSync } from 'node:child_process';
import { writeFile, readFile } from 'node:fs/promises';
if(process.platform!=='darwin'||process.arch!=='arm64') {console.log('Native window: unverified (requires macOS arm64)');process.exit(process.argv.includes('--require-native')?1:0);}
const artifacts=JSON.parse(await readFile(new URL('../runtime/artifacts/manifest.json',import.meta.url),'utf8'));
const identity={abi:artifacts.abi,sourceDigest:artifacts.sourceDigest,targets:artifacts.targets,files:artifacts.files};
const host=createNativeWindowHost({width:640,height:380});
const engine=createEngine(), graphics=installGraphicsLanguage(engine,{host,backend:'native'});
await graphics.ready;await populate(graphics);await graphics.render(sceneFrame('native-window',0,480,280));
assert.deepEqual(graphics.getSurfaceState(),{width:640,height:380,closed:false});
const held=graphics.capture();const heldPixels=new Uint8ClampedArray(held.pixels);
await save(held,'native-window-framebuffer');
const captures=[];
function capture(name) {
  const state=host.getWindowState();assert.equal(state.closed,false);
  const result=spawnSync('/usr/sbin/screencapture',['-x','-l',String(state.windowId),`build/graphics-evidence/${name}.png`],{encoding:'utf8'});
  captures.push({name,window:state,captured:result.status===0,error:result.status===0?null:result.stderr});
}
capture('native-window-displayed');
await graphics.render(sceneFrame('native-moving',.2,480,280));
await graphics.switchRenderer({operationId:'visible-wasm',backend:'wasm'});
capture('wasm-window-displayed');await save(graphics.capture(),'wasm-window-framebuffer');
await graphics.switchRenderer({operationId:'visible-native',backend:'native'});
assert.equal(graphics.getState().generation,2);
const timings=[],runs=[];
for(const quality of ['native','guided-half','gaussian-half']) for(const [width,height] of [[160,96],[240,144],[320,192]]) {
  const started=performance.now();await graphics.render(sceneFrame('native-policy-'+runs.length,.03*runs.length,width,height,quality));timings.push(performance.now()-started);
  const diagnostics=graphics.getState().diagnostics;
  assert(diagnostics.framePool.slots<=3);assert.equal(diagnostics.host.stagedFrames,0);
  assert(diagnostics.framePool.allocatedBytes<=320*192*4*3);
  runs.push({width,height,quality,diagnostics});
}
for(let i=0;i<2;i++)await graphics.render(sceneFrame('native-warm-'+i,0,320,192));
const warmed=graphics.getState().diagnostics;
for(let i=0;i<8;i++)await graphics.render(sceneFrame('native-static-'+i,0,320,192));
const reused=graphics.getState().diagnostics;
assert.equal(reused.framePool.allocations,warmed.framePool.allocations);
assert.equal(reused.host.copiedBytes,warmed.host.copiedBytes);
compare(held.pixels,heldPixels);

await graphics.dispose();assert.equal(host.getWindowState().closed,true);
for(let i=0;i<5;i++) {
  const nextHost=createNativeWindowHost({width:320,height:190});
  const next=installGraphicsLanguage(createEngine(),{host:nextHost,backend:'native'});
  await next.ready;await populate(next);await next.render(sceneFrame('cycle-'+i,0,160,96));
  await next.dispose();assert.equal(nextHost.getWindowState().closed,true);
}
await writeFile('build/graphics-evidence/native-window-result.json',JSON.stringify({captures,identity,generations:2,launchCloseCycles:5,closed:true,runs,frameMs:distribution(timings),reused},null,2)+'\n');
assert(captures.every(c=>c.captured),'Native window displayed, but OS screenshot unavailable');
console.log('macOS window: native → WASM → native presentation and disposal passed');
