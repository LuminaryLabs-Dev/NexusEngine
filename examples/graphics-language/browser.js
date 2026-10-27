import { createEngine } from 'nexusengine';
import { installGraphicsLanguage, createNexusGLProvider, createFramePacer } from 'nexusengine/domains/render/graphics-language';
import { populate, sceneFrame, sceneResources } from './scene.js';
const engine=createEngine(), canvas=document.querySelector('#view');
const graphics=installGraphicsLanguage(engine,{canvas,backend:'wasm',memoryBudgetBytes:32*1024**2,maxResourceBytes:1024**2,maxFragments:65536});
let angle=0,serial=0,swaps=0,busy=false,tint=false;
const status=document.querySelector('#status'),error=document.querySelector('#error');
const controls=[...document.querySelectorAll('button')];
const animate=document.querySelector('#animate'), fps=document.querySelector('#fps');
const pacer=createFramePacer({targetFps:Number(fps.value)});
let animationHandle=null, animationWork=null, animationTime=null, disposed=false;
const spec=()=>sceneFrame('browser-'+(++serial),angle,canvas.width,canvas.height,document.querySelector('#quality').value);
function show(message='Ready') {
  const s=graphics.getState(), d=s.diagnostics??{}, p=pacer.getDiagnostics();
  status.textContent=`${message}\nBackend: ${d.backend} · provider generation: ${s.generation} · resource revision: ${s.resourceRevision}\nRender: ${(d.timings?.renderMs??d.session?.renderMs??p.renderMs).toFixed(1)} ms · presentation: ${(d.host?.presentationMs??0).toFixed(1)} ms · copies: ${(d.copiedBytes??0)+(d.framePool?.copiedBytes??0)+(d.session?.copiedBytes??0)+(d.host?.copiedBytes??0)} bytes\nMesh uploads: ${d.meshUploads??0} · upload: ${d.uploadedBytes??0} bytes · frame pool: ${d.framePool?.slots??0} slots · shadow cache hits: ${d.shadowCacheHits??0}\nPacing: ${animate.checked?p.targetFps+' FPS target':'on demand'} · queued: ${p.queuedFrames}`;
}
function stopAnimation() {
  if(animationHandle!==null)cancelAnimationFrame(animationHandle);
  animationHandle=null;animationTime=null;
}
function scheduleAnimation() {
  if(disposed||document.hidden||!animate.checked||animationHandle!==null)return;
  animationHandle=requestAnimationFrame(timestamp=>{
    animationHandle=null;
    if(!busy&&!animationWork&&!disposed&&!document.hidden&&animate.checked) {
      animationWork=pacer.request(async()=>{
        const elapsed=animationTime===null?0:Math.min(.1,(timestamp-animationTime)/1000);
        animationTime=timestamp;angle+=elapsed*.4;
        await graphics.render(spec());
      },timestamp);
      animationWork.then(()=>show(),e=>{error.textContent=e.message;animate.checked=false;stopAnimation();}).finally(()=>{animationWork=null;});
    }
    scheduleAnimation();
  });
}

async function action(task) {
  if(busy)return;busy=true;controls.forEach(b=>b.disabled=true);error.textContent='';
  try {await animationWork?.catch(()=>{});await task();show();} catch(e) {error.textContent=e.message;show('Active renderer retained');}
  finally {busy=false;controls.forEach(b=>b.disabled=false);}
}
await graphics.ready;await populate(graphics);await graphics.render(spec());show();controls.forEach(b=>b.disabled=false);
document.querySelector('#swap').onclick=()=>action(async()=>{await graphics.switchRenderer({operationId:'browser-swap-'+(++swaps),backend:'wasm'});});
document.querySelector('#move').onclick=()=>action(async()=>{angle+=.2;engine.tick(1/60);await graphics.render(spec());});
document.querySelector('#change').onclick=()=>action(async()=>{tint=!tint;const material=sceneResources().find(r=>r.id==='glass');material.data.tint=tint?[1,.14,.35]:[.18,.45,1];await graphics.updateResource(material);await graphics.render(spec());});
document.querySelector('#fail').onclick=()=>action(async()=>{const p=createNexusGLProvider({backend:'wasm'});p.initialize=()=>{throw Error('Candidate rejected: injected startup failure');};await graphics.switchRenderer({operationId:'browser-failure-'+(++swaps),selection:{provider:p,reservationBytes:64*1024**2}});});
document.querySelector('#quality').onchange=()=>action(()=>graphics.render(spec()));
canvas.addEventListener('keydown',event=>{if(event.key==='ArrowRight')document.querySelector('#move').click();});
animate.onchange=()=>{animationTime=null;if(animate.checked){pacer.resume();scheduleAnimation();}else{pacer.pause();stopAnimation();}show();};
fps.onchange=()=>{pacer.setTargetFps(Number(fps.value));show();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){pacer.pause();stopAnimation();}else{pacer.resume();scheduleAnimation();}});
window.addEventListener('pagehide',()=>{disposed=true;stopAnimation();pacer.dispose();graphics.dispose();});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
window.graphicsProof={graphics,engine,spec,pacer,async resize(width,height){return action(async()=>{canvas.width=width;canvas.height=height;await graphics.render(spec());});}};
