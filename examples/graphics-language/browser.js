import { createEngine } from 'nexusengine';
import { installGraphicsLanguage, createNexusGLProvider } from 'nexusengine/domains/render/graphics-language';
import { populate, sceneFrame, sceneResources } from './scene.js';
const engine=createEngine(), canvas=document.querySelector('#view');
const graphics=installGraphicsLanguage(engine,{canvas,backend:'wasm',memoryBudgetBytes:32*1024**2,maxResourceBytes:1024**2,maxFragments:65536});
let angle=0,serial=0,swaps=0,busy=false,tint=false;
const status=document.querySelector('#status'),error=document.querySelector('#error');
const controls=[...document.querySelectorAll('button')];
const spec=()=>sceneFrame('browser-'+(++serial),angle,canvas.width,canvas.height,document.querySelector('#quality').value);
function show(message='Ready') {const s=graphics.getState();status.textContent=`${message}\nBackend: ${s.diagnostics?.backend} · provider generation: ${s.generation} · resource revision: ${s.resourceRevision}`;}
async function action(task) {
  if(busy)return;busy=true;controls.forEach(b=>b.disabled=true);error.textContent='';
  try {await task();show();} catch(e) {error.textContent=e.message;show('Active renderer retained');}
  finally {busy=false;controls.forEach(b=>b.disabled=false);}
}
await graphics.ready;await populate(graphics);await graphics.render(spec());show();controls.forEach(b=>b.disabled=false);
document.querySelector('#swap').onclick=()=>action(async()=>{await graphics.switchRenderer({operationId:'browser-swap-'+(++swaps),backend:'wasm'});});
document.querySelector('#move').onclick=()=>action(async()=>{angle+=.2;engine.tick(1/60);await graphics.render(spec());});
document.querySelector('#change').onclick=()=>action(async()=>{tint=!tint;const material=sceneResources().find(r=>r.id==='glass');material.data.tint=tint?[1,.14,.35]:[.18,.45,1];await graphics.updateResource(material);await graphics.render(spec());});
document.querySelector('#fail').onclick=()=>action(async()=>{const p=createNexusGLProvider({backend:'wasm'});p.initialize=()=>{throw Error('Candidate rejected: injected startup failure');};await graphics.switchRenderer({operationId:'browser-failure-'+(++swaps),selection:{provider:p,reservationBytes:64*1024**2}});});
document.querySelector('#quality').onchange=()=>action(()=>graphics.render(spec()));
canvas.addEventListener('keydown',event=>{if(event.key==='ArrowRight')document.querySelector('#move').click();});
window.addEventListener('pagehide',()=>graphics.dispose());
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
window.graphicsProof={graphics,engine,spec,async resize(width,height){return action(async()=>{canvas.width=width;canvas.height=height;await graphics.render(spec());});}};
