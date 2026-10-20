import assert from 'node:assert/strict';
import { createEngine } from 'nexusengine';
import { installGraphicsLanguage, createNativeWindowHost } from 'nexusengine/domains/render/graphics-language';
import { populate, sceneFrame } from '../../../../examples/graphics-language/scene.js';
import { save } from './helpers.mjs';
import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
if(process.platform!=='darwin'||process.arch!=='arm64') {console.log('Native window: unverified (requires macOS arm64)');process.exit(0);}
const host=createNativeWindowHost({width:640,height:380});
const engine=createEngine(), graphics=installGraphicsLanguage(engine,{host,backend:'native'});
await graphics.ready;await populate(graphics);await graphics.render(sceneFrame('native-window',0,480,280));
assert.deepEqual(graphics.getSurfaceState(),{width:640,height:380,closed:false});
await save(graphics.capture(),'native-window-framebuffer');
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
await graphics.dispose();assert.equal(host.getWindowState().closed,true);
for(let i=0;i<5;i++) {
  const nextHost=createNativeWindowHost({width:320,height:190});
  const next=installGraphicsLanguage(createEngine(),{host:nextHost,backend:'native'});
  await next.ready;await populate(next);await next.render(sceneFrame('cycle-'+i,0,160,96));
  await next.dispose();assert.equal(nextHost.getWindowState().closed,true);
}
await writeFile('build/graphics-evidence/native-window-result.json',JSON.stringify({captures,generations:2,launchCloseCycles:5,closed:true},null,2)+'\n');
assert(captures.every(c=>c.captured),'Native window displayed, but OS screenshot unavailable');
console.log('macOS window: native → WASM → native presentation and disposal passed');
