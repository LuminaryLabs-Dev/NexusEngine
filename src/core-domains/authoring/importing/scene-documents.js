import { normalizeAuthoringMesh } from '../mesh/geometry.js';
import { normalizeAuthoringRig } from '../rig/services.js';
import { meshTopologyHash, rigRestHash } from '../skin/services.js';
import { normalizeTransform, identityMatrix } from '../contracts/transforms.js';
import { imageDocument } from '../publishing/export/codecs/png.js';
import { fail } from '../contracts/io.js';
import { requireText } from '../contracts/value.js';
/** Converts decoded standard asset data to ordinary editable Project documents, never embedded source backups. */
export function sceneToDocuments(scene,prefix){
 requireText(prefix,'import prefix');const docs=[],id=(kind,key)=>`${prefix}:${kind}:${key}`,meshMap=new Map(),rigMap=new Map();
 for(const image of scene.images??[])docs.push({id:id('image',image.id),kind:'image',content:imageDocument(image.pixels,image.colorSpace)});
 for(const m of scene.materials??[]){const p=structuredClone(m.pbr);p.textures=Object.fromEntries(Object.entries(p.textures??{}).map(([role,b])=>[role,{...b,imageId:id('image',b.imageId)}]));docs.push({id:id('material',m.id),kind:'material',content:p});}
 for(const m of scene.meshes){
  if(!m.positions?.length||m.positions.length%3||!m.indices?.length||m.indices.length%3)throw fail('AUTHORING_IMPORT_GEOMETRY','Imported mesh needs finite triangle data.');
  const vertices=Array.from({length:m.positions.length/3},(_,i)=>({id:`v${i}`,position:m.positions.slice(i*3,i*3+3)})),faces=[],uv={},colors={},normal={},material={};
  for(let f=0;f<m.indices.length/3;f++){const indices=m.indices.slice(f*3,f*3+3);if(indices.some(i=>!Number.isInteger(i)||i<0||i>=vertices.length))throw fail('AUTHORING_IMPORT_GEOMETRY','Invalid vertex index.');
    const corners=indices.map((v,c)=>`f${f}c${c}`);faces.push({id:`f${f}`,vertices:indices.map(i=>`v${i}`),corners});
    indices.forEach((v,c)=>{if(m.uvs?.length)uv[corners[c]]=m.uvs.slice(v*2,v*2+2);if(m.normals?.length)normal[corners[c]]=m.normals.slice(v*3,v*3+3);});
    if(m.materialIndices?.length)material[`f${f}`]=[m.materialIndices[f]];
  }
  if(m.colors?.length)vertices.forEach((v,i)=>colors[v.id]=m.colors.slice(i*4,i*4+4));
  const attr=(name,domain,arity,values)=>({id:name,domain,arity,values});
  const attributes=[...(m.uvs?.length?[attr('uv0','corner',2,uv)]:[]),...(m.colors?.length?[attr('color','vertex',4,colors)]:[]),...(m.materialIndices?.length?[attr('material','face',1,material)]:[])];
  const content=normalizeAuthoringMesh({vertices,faces,attributes});meshMap.set(m.id,content);docs.push({id:id('mesh',m.id),kind:'mesh',content});
 }
 for(const rig of scene.rigs??[]){const content=normalizeAuthoringRig({bones:rig.bones,constraints:[]});rigMap.set(rig.id,content);docs.push({id:id('rig',rig.id),kind:'rig',content});}
 for(const s of scene.skins??[]){const mesh=meshMap.get(s.meshId),rig=rigMap.get(s.rigId);if(!mesh||!rig)throw fail('AUTHORING_IMPORT_SKIN','Missing mesh or rig.');
  const weights=Object.fromEntries(mesh.vertices.map((v,i)=>[v.id,s.weights[i]]));docs.push({id:id('skin',s.id),kind:'skin',content:{meshId:id('mesh',s.meshId),rigId:id('rig',s.rigId),meshTopologyHash:meshTopologyHash(mesh),rigRestHash:rigRestHash(rig),meshBindMatrix:s.meshBindMatrix??identityMatrix(),inverseBindMatrices:s.inverseBindMatrices,weights}});
 }
 for(const s of scene.shapes??[]){const mesh=meshMap.get(s.meshId);docs.push({id:id('shape',s.id),kind:'shape',content:{meshId:id('mesh',s.meshId),topologyHash:meshTopologyHash(mesh),keys:s.keys.map(k=>({id:k.id,weight:k.weight??0,deltas:Object.fromEntries(mesh.vertices.map((v,i)=>[v.id,k.deltas.slice(i*3,i*3+3)]))}))}});}
 for(const a of scene.animations??[])docs.push({id:id('animation',a.id),kind:'animation',content:{rigId:a.rigId?id('rig',a.rigId):null,shapeId:a.shapeId?id('shape',a.shapeId):null,clips:a.clips}});
 const nodes=scene.nodes.map(n=>({id:String(n.id),name:n.name||String(n.id),parent:n.parent??null,transform:normalizeTransform(n.transform),materials:(n.materials??[]).map(m=>id('material',m)),animationIds:(n.animationIds??[]).map(a=>id('animation',a)),...Object.fromEntries(['meshId','rigId','skinId','shapeId'].filter(k=>n[k]!=null).map(k=>[k,id(k.slice(0,-2),n[k])]))}));
 const assemblyId=`${prefix}:scene`;docs.push({id:assemblyId,kind:'assembly',content:{nodes,units:{metersPerUnit:scene.metersPerUnit??1,upAxis:'Y',handedness:'right'},cameras:scene.cameras??[],lights:scene.lights??[]}});
 return {documents:docs,assemblyId,warnings:scene.warnings??[]};
}
