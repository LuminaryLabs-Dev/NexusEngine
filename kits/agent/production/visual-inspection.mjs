// Host adapter: render native Authoring exports without adding renderer state to Core.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
import { digest } from './receipt-mapping.mjs';

export async function inspectAuthoringAsset({ engine, assemblyId, destination, times = [0], mode = 'surface', focus = [], view, camera, selection, dependencies }) {
  if (!Array.isArray(times) || !times.length || times.length > 8 || times.some(t => !Number.isFinite(t) || t < 0 || t > 3600)) throw Error('Inspection requires 1–8 finite pose times in [0,3600].');
  if (!['surface','wireframe','normals'].includes(mode)) throw Error('Unknown inspection mode.');
  if(camera && (!Array.isArray(camera.center)||camera.center.length!==3||camera.center.some(n=>!Number.isFinite(n))||!Number.isFinite(camera.span)||camera.span<1e-5||camera.span>1e6||Object.keys(camera).some(k=>!['center','span'].includes(k))))throw Error('Camera requires a finite center[3] and positive span.');
  if(!Array.isArray(focus)||focus.length>20||focus.some(x=>typeof x!=='string'))throw Error('Invalid focus mesh IDs.');
  const names=['front','back','right','left','top','oblique'];if(view && !names.includes(view))throw Error('Unknown inspection view.');
  const project = engine.n.authoringProject, before = project.context();
  const validation = engine.n.authoringValidation.project();
  if (validation.errors) throw Error('Source validation failed before visual inspection.');
  const artifact = await engine.n.authoringExport.export({ assemblyId, format: 'glb', ...(focus.length ? {profile:{focusMeshIds:focus}} : {}) });
  const require = createRequire(dependencies ?? import.meta.url);
  const { chromium } = require('playwright');
  const threeRoot = path.dirname(require.resolve('three').replace(/three\.cjs$/, 'three.module.js'));
  const loader = require.resolve('three/addons/loaders/GLTFLoader.js');
  const utilities = require.resolve('three/addons/utils/BufferGeometryUtils.js');
  const files = new Map([
    ['/viewer.mjs', path.join(import.meta.dirname, 'inspection-viewer.mjs')],
    ['/three/three.module.js', path.join(threeRoot, 'three.module.js')],
    ['/three/three.core.js', path.join(threeRoot, 'three.core.js')],
    ['/three/GLTFLoader.js', loader], ['/utils/BufferGeometryUtils.js', utilities]
  ]);
  const options = { times, mode, focus, view, camera, selection:selection?{meshId:selection.meshId,vertices:selection.vertices}:null };
  const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>Nexus asset inspection</title><style>body{margin:0;background:#19232d;color:#eef3f5;font:15px system-ui}canvas{display:block}#labels{position:absolute;inset:0;display:grid;grid-template-columns:repeat(${view?1:3},1fr);grid-template-rows:repeat(${view?1:2},1fr);pointer-events:none}#labels span{padding:12px;background:linear-gradient(#19232d88,transparent 48px)}#caption{position:absolute;bottom:8px;left:12px;font-size:12px;color:#b7c6ce}</style><script type="importmap">{"imports":{"three":"/three/three.module.js"}}</script></head><body><div id="labels">${(view?[view]:['Front','Back','Right','Left','Top','Oblique (ortho)']).map(x=>`<span>${x}</span>`).join('')}</div><div id="caption"></div><script>window.inspectionOptions=${JSON.stringify(options)}</script><script type="module" src="/viewer.mjs"></script></body></html>`;
  let browser;
  const server = createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      res.setHeader('Cache-Control','no-store');
      if (pathname === '/') { res.setHeader('Content-Type','text/html'); res.end(html); }
      else if (pathname === '/asset.glb') { res.setHeader('Content-Type','model/gltf-binary'); res.end(artifact.bytes); }
      else if (files.has(pathname)) { res.setHeader('Content-Type','text/javascript'); res.end(await readFile(files.get(pathname))); }
      else { res.writeHead(404); res.end('Unknown inspection resource'); }
    } catch { res.writeHead(500); res.end('Inspection resource failed'); }
  });
  const consoleErrors = [], network = [];
  try {
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless:true, args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({viewport:{width:1200,height:800},deviceScaleFactor:1});
    page.on('pageerror',e=>consoleErrors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
    await page.route('**/*',route=>{const url=route.request().url();network.push(url);return url.startsWith(origin+'/')?route.continue():route.abort();});
    await page.goto(origin);await page.waitForFunction(()=>window.inspectionReady===true,null,{timeout:20000});
    await mkdir(destination,{recursive:true});
    const directory = await mkdtemp(path.join(destination,'inspection-'));
    const capturedCamera=await page.evaluate(()=>window.inspectionCamera);
    const frames = [];
    for (const time of times) {
      const metrics = await page.evaluate(t=>window.inspectPose(t),time);
      const image = path.join(directory,`pose-${frames.length}.png`);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      let png,captureAttempts=0;
      for(let attempt=1;attempt<=3;attempt++){captureAttempts=attempt;try{png=await page.evaluate(t=>{window.inspectPose(t);return window.inspectionPng();},time);break;}catch(error){if(!error.message.includes('Blank inspection')||attempt===3)throw error;await page.waitForTimeout(100);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}}
      await writeFile(image,Buffer.from(png,'base64'));frames.push({time,image,captureAttempts,imageHash:digest(await readFile(image)),...metrics});
    }
    if (consoleErrors.length) throw Error('Visual inspection console errors: '+consoleErrors.join('; '));
    if (JSON.stringify(before)!==JSON.stringify(project.context())) throw Error('Source changed during visual inspection.');
    const report = { schema:'nexus-engine-kit.visual-inspection/1', capture:'Software WebGL canvas readback with labels, bounded retries and blank-frame rejection', renderer:'Chromium ANGLE SwiftShader', assemblyId, source:before, sourceReferences:artifact.receipt.source,
      artifactHash:artifact.hash, mode, camera:capturedCamera, focus, selectionStyle:!!selection, lighting:'neutral-studio-v1', views:view?[view]:['front','back','right','left','top','oblique-orthographic'], frames, consoleErrors,
      remoteRequests:network.filter(url=>!url.startsWith(origin+'/')), sourceUnchanged:true,
      verdict:'captured-unreviewed', note:'Rendered evidence and measurements; an agent or human must judge the requested appearance.' };
    const reportFile = path.join(directory,'inspection.json');await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
    return { reportFile, image:frames[0].image, report };
  } finally { await browser?.close();await new Promise(resolve=>server.close(resolve)); }
}
