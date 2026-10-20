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
    await page.getByRole('combobox').selectOption(value);await page.waitForFunction(()=>!document.querySelector('#swap').disabled);
    assert.equal(await page.evaluate(()=>window.graphicsProof.graphics.capture().width),480);
  }
  await page.evaluate(()=>window.graphicsProof.resize(360,240));
  assert.equal(await page.evaluate(()=>window.graphicsProof.graphics.capture().width),360);
  await page.locator('canvas').focus();await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>!document.querySelector('#move').disabled);
  for(let i=0;i<5;i++){await page.getByRole('button',{name:'Replace renderer'}).click();await page.waitForFunction(()=>!document.querySelector('#swap').disabled);}
  const outcome=await page.evaluate(()=>({generation:window.graphicsProof.graphics.getState().generation,revision:window.graphicsProof.graphics.getState().resourceRevision,status:document.querySelector('#status').textContent}));
  assert.equal(outcome.generation,6);
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
    const started=Date.now(), samples=[];let frames=0;
    const cdp=await page.context().newCDPSession(page);
    while(Date.now()-started<60000) {
      await page.evaluate(async()=>{const p=window.graphicsProof;p.engine.tick(1/60);await p.graphics.render(p.spec());});frames++;
      if(frames%40===0) {
        await page.getByRole('button',{name:'Replace renderer'}).click();await page.waitForFunction(()=>!document.querySelector('#swap').disabled);
        await cdp.send('HeapProfiler.collectGarbage');
        samples.push({elapsedMs:Date.now()-started,frames,heap:await cdp.send('Runtime.getHeapUsage'),runtime:await page.evaluate(()=>window.graphicsProof.graphics.getState().diagnostics)});
      }
      await new Promise(r=>setTimeout(r,40));
    }
    assert(frames>=100);assert.deepEqual(errors,[]);
    await writeFile('build/graphics-evidence/browser-soak.json',JSON.stringify({durationMs:Date.now()-started,frames,samples,errors},null,2)+'\n');
    console.log(`Browser soak: ${frames} responsive frames over 60 seconds`);
  }
  await page.evaluate(()=>window.graphicsProof.graphics.dispose());
  await writeFile('build/graphics-evidence/browser-result.json',JSON.stringify({url,viewport:{width:1024,height:850},outcome,surface,errors},null,2)+'\n');
  console.log('Browser visible handover, movement, material update, rejection, resize, keyboard and canvas replacement: passed');
}finally{await browser.close();await new Promise(r=>server.close(r));}
