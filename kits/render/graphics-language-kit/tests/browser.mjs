import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from '../../../../examples/graphics-language/server.mjs';
const {server,url}=await startServer();
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1024,height:850}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await mkdir('build/graphics-evidence',{recursive:true});
  await page.goto(url);await page.waitForFunction(()=>window.graphicsProof?.graphics.getState().status==='ready');
  await page.getByRole('button',{name:'Replace renderer'}).waitFor({state:'visible'});
  await page.waitForFunction(()=>!document.querySelector('#swap').disabled);
  const pixels=()=>page.evaluate(()=>Array.from(window.graphicsProof.graphics.capture().pixels));
  const before=await pixels();
  await page.screenshot({path:'build/graphics-evidence/browser-initial.png'});
  await page.getByRole('button',{name:'Move camera'}).click();
  await page.waitForFunction(()=>!document.querySelector('#move').disabled);
  const moved=await pixels();assert.notDeepEqual(moved,before);
  await page.screenshot({path:'build/graphics-evidence/browser-moved.png'});
  await page.getByRole('button',{name:'Change material'}).click();
  await page.waitForFunction(()=>!document.querySelector('#change').disabled);
  const changed=await pixels();assert.notDeepEqual(changed,moved);
  await page.getByRole('button',{name:'Replace renderer'}).click();
  await page.waitForFunction(()=>window.graphicsProof.graphics.getState().generation===1&&!document.querySelector('#swap').disabled);
  assert.deepEqual(await pixels(),changed);
  await page.screenshot({path:'build/graphics-evidence/browser-swapped.png'});
  await page.getByRole('button',{name:'Try failed candidate'}).click();
  await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('injected startup failure'));
  assert.deepEqual(await pixels(),changed);
  await page.screenshot({path:'build/graphics-evidence/browser-failed-candidate.png'});
  for(const value of ['guided-half','gaussian-half','native']) {
    await page.getByRole('combobox',{name:'Quality',exact:true}).selectOption(value);await page.waitForFunction(()=>!document.querySelector('#swap').disabled);
    assert.equal(await page.evaluate(()=>window.graphicsProof.graphics.capture().width),480);
  }
  await page.evaluate(()=>window.graphicsProof.resize(360,240));
  assert.equal(await page.evaluate(()=>window.graphicsProof.graphics.capture().width),360);
  await page.locator('canvas').focus();await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>!document.querySelector('#move').disabled);
  for(let i=0;i<5;i++){await page.getByRole('button',{name:'Replace renderer'}).click();await page.waitForFunction(()=>!document.querySelector('#swap').disabled);}
  const outcome=await page.evaluate(()=>({generation:window.graphicsProof.graphics.getState().generation,revision:window.graphicsProof.graphics.getState().resourceRevision,status:document.querySelector('#status').textContent}));
  assert.equal(outcome.generation,6);
  // The host opts into cadence; it neither queues frames nor ticks simulation.
  await page.evaluate(()=>{
    const p=window.graphicsProof, render=p.graphics.render.bind(p.graphics),tick=p.engine.tick.bind(p.engine);
    window.pacingProof={running:0,maximum:0,calls:0,ticks:0};
    p.graphics.render=async(...args)=>{const s=window.pacingProof;s.calls++;s.maximum=Math.max(s.maximum,++s.running);try{return await render(...args);}finally{s.running--;}};
    p.engine.tick=(...args)=>{window.pacingProof.ticks++;return tick(...args);};
  });
  assert.equal(await page.getByRole('checkbox',{name:'Animate (optional)'}).isChecked(),false);
  await page.getByRole('combobox',{name:'Target FPS',exact:true}).selectOption('15');
  await page.getByRole('checkbox',{name:'Animate (optional)'}).check();
  await page.waitForFunction(()=>window.graphicsProof.pacer.getDiagnostics().completed>=4);
  await page.getByRole('combobox',{name:'Target FPS',exact:true}).selectOption('30');
  await page.waitForFunction(()=>window.graphicsProof.pacer.getDiagnostics().completed>=6);
  // Synthetic visibility exercises the browser listener deterministically; the
  // report does not call this an operating-system background-tab qualification.
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>!window.graphicsProof.pacer.getDiagnostics().inFlight);
  const hiddenCalls=await page.evaluate(()=>window.pacingProof.calls);
  await page.waitForTimeout(180);
  assert.equal(await page.evaluate(()=>window.pacingProof.calls),hiddenCalls);
  assert.equal(await page.evaluate(()=>window.graphicsProof.pacer.getDiagnostics().paused),true);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(count=>window.pacingProof.calls>count,hiddenCalls);
  await page.getByRole('checkbox',{name:'Animate (optional)'}).uncheck();
  await page.waitForFunction(()=>!window.graphicsProof.pacer.getDiagnostics().inFlight);
  const pacing=await page.evaluate(()=>({...window.pacingProof,...window.graphicsProof.pacer.getDiagnostics(),runtime:window.graphicsProof.graphics.getState().diagnostics,visibilityProof:'synthetic visibilitychange'}));
  assert.equal(pacing.maximum,1);assert.equal(pacing.queuedFrames,0);assert.equal(pacing.ticks,0);
  assert(pacing.runtime.framePool.slots<=3);assert.equal(pacing.runtime.host.stagedFrames,0);
  await page.screenshot({path:'build/graphics-evidence/browser-paced.png'});

  // Real incompatible-context handling: reject safely, then explicitly replace
  // the canvas while rebinding input and retaining dimensions/attributes.
  const surface=await page.evaluate(async()=>{
    const {createCanvasHost}=await import('nexusengine/domains/render/graphics-language');
    const old=document.createElement('canvas');old.width=16;old.height=12;old.id='replacement-test';old.tabIndex=0;document.body.append(old);
    const gl=old.getContext('webgl');if(!gl)return {unavailable:true};
    let rejected=false;try{createCanvasHost(old);}catch{rejected=true;}
    let inputs=0,unbound=false;
    const host=createCanvasHost(old,{allowReplacement:true,bindSurface(next){const listener=()=>inputs++;next.addEventListener('click',listener);return()=>{next.removeEventListener('click',listener);unbound=true;};}});
    const frame={width:16,height:12,stride:64,pixels:new Uint8ClampedArray(16*12*4)};
    host.commit(host.prepare(frame,{generation:1,operationId:'replace'}));
    const current=document.querySelector('#replacement-test');current.click();const replaced=current!==old;host.dispose();current.remove();return {rejected,replaced,inputs,unbound};
  });
  assert.deepEqual(surface,{rejected:true,replaced:true,inputs:1,unbound:true});
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'build/graphics-evidence/browser-final.png'});
  if(process.argv.includes('--soak')) {
    const started=Date.now(), samples=[];let frames=0;const timings=[];
    const cdp=await page.context().newCDPSession(page);
    while(Date.now()-started<60000) {
      const frameStarted=performance.now();await page.evaluate(async()=>{const p=window.graphicsProof;p.engine.tick(1/60);await p.graphics.render(p.spec());});timings.push(performance.now()-frameStarted);frames++;
      if(frames%40===0) {
        await page.getByRole('button',{name:'Replace renderer'}).click();await page.waitForFunction(()=>!document.querySelector('#swap').disabled);
        await cdp.send('HeapProfiler.collectGarbage');
        samples.push({elapsedMs:Date.now()-started,frames,heap:await cdp.send('Runtime.getHeapUsage'),runtime:await page.evaluate(()=>window.graphicsProof.graphics.getState().diagnostics)});
      }
      await new Promise(r=>setTimeout(r,40));
    }
    assert(frames>=100);assert.deepEqual(errors,[]);
    await writeFile('build/graphics-evidence/browser-soak.json',JSON.stringify({durationMs:Date.now()-started,frames,samples,errors,frameMs:timings,workload:{width:360,height:240,quality:'native',scene:'graphics-language-three-panels',cadence:'explicit one frame then 40ms delay'}},null,2)+'\n');
    console.log(`Browser soak: ${frames} responsive frames over 60 seconds`);
  }
  await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
  await page.waitForFunction(()=>window.graphicsProof.graphics.getState().phase==='installed');
  assert.equal(await page.evaluate(()=>window.graphicsProof.pacer.getDiagnostics().disposed),true);
  const afterDispose=await page.evaluate(()=>window.pacingProof.calls);await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>window.pacingProof.calls),afterDispose);
  await page.reload();await page.waitForFunction(()=>window.graphicsProof?.graphics.getState().status==='ready'&&!document.querySelector('#swap').disabled);
  assert.equal(await page.getByRole('checkbox',{name:'Animate (optional)'}).isChecked(),false);
  await page.evaluate(()=>window.graphicsProof.graphics.dispose());
  await writeFile('build/graphics-evidence/browser-result.json',JSON.stringify({url,viewport:{width:1024,height:850},outcome,surface,pacing,errors},null,2)+'\n');
  console.log('Browser visible handover, movement, material update, rejection, resize, keyboard and canvas replacement: passed');
}finally{await browser.close();await new Promise(r=>server.close(r));}
