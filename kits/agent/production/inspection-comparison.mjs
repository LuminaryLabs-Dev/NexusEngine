import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import path from 'node:path';
import {digest} from './receipt-mapping.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export async function compareInspections({beforeFile,afterFile,destination,reason,finding,inside}){
 const read=async f=>{const bytes=await readFile(f);if(bytes.length>4*1024*1024)throw Error('Inspection report exceeds 4 MiB.');const r=JSON.parse(bytes);if(r.schema!=='nexus-engine-kit.visual-inspection/1')throw Error('Expected a kit inspection report.');return r;};
 const before=await read(beforeFile),after=await read(afterFile);
 for(const key of ['assemblyId','renderer','views','mode','camera','focus','selectionStyle','lighting'])if(JSON.stringify(before[key])!==JSON.stringify(after[key]))throw Error(`Comparison requires identical ${key}; reuse the first capture camera and settings.`);
 if(before.frames.length!==after.frames.length||before.frames.some((f,i)=>f.time!==after.frames[i].time))throw Error('Comparison pose times differ.');
 await mkdir(destination,{recursive:true});const dir=await mkdtemp(path.join(destination,'comparison-'));
 const frames=[];
 for(let i=0;i<before.frames.length;i++){const a=before.frames[i],b=after.frames[i];for(const f of [a,b]){const source=await inside(f.image);const bytes=await readFile(source);if(bytes.length>8*1024*1024||digest(bytes)!==f.imageHash)throw Error('Inspection image integrity mismatch.');await writeFile(path.join(dir,`${i}-${f===a?'before':'after'}.png`),bytes);}frames.push({time:a.time,before:`${i}-before.png`,after:`${i}-after.png`,imageChanged:a.imageHash!==b.imageHash});}
 const refs=r=>new Map(r.sourceReferences.map(x=>[x.id,x]));const a=refs(before),b=refs(after);const changed=[...new Set([...a.keys(),...b.keys()])].filter(id=>a.get(id)?.hash!==b.get(id)?.hash).map(id=>({id,before:a.get(id),after:b.get(id)}));
 const geometryChanges=before.frames.map((f,i)=>({time:f.time,meshes:f.meshes.map(m=>({name:m.name,before:{triangles:m.triangles,vertices:m.vertexCount,bounds:m.bounds},after:after.frames[i].meshes.filter(n=>n.name===m.name).map(n=>({triangles:n.triangles,vertices:n.vertexCount,bounds:n.bounds}))[0]??null}))}));
 const report={geometryChanges,schema:'nexus-engine-kit.inspection-comparison/1',beforeFile,afterFile,reason,finding,changed,frames,verdict:'evidence-awaiting-review',note:'Image/source differences do not automatically establish improvement.'};
 await writeFile(path.join(dir,'comparison.json'),JSON.stringify(report,null,2)+'\n');
 await writeFile(path.join(dir,'index.html'),`<!doctype html><meta charset="utf-8"><title>Modeling correction</title><style>body{background:#17242e;color:#eff4f6;font:16px system-ui;margin:24px}main{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}figure{margin:0}img{width:100%}@media(max-width:700px){main{grid-template-columns:1fr}}h1{font-size:24px}</style><h1>${esc(reason)}</h1><p>${esc(finding)}</p><p>Left: before. Right: after. Identical cameras and lighting. Judgment remains explicit.</p><main>${frames.map(f=>`<figure><figcaption>Before · ${f.time}s</figcaption><img src="${f.before}"></figure><figure><figcaption>After · ${f.time}s</figcaption><img src="${f.after}"></figure>`).join('')}</main>`);
 return {reportFile:path.join(dir,'comparison.json'),gallery:path.join(dir,'index.html'),changed:changed.map(x=>x.id),geometryChanges,images:[path.join(dir,'0-before.png'),path.join(dir,'0-after.png')],frames,verdict:report.verdict};
}
