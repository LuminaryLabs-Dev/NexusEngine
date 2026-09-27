import { text, resource, fail, issue, abort } from '../../../contracts/io.js';
import { triangulateAuthoringPolygon } from '../../../mesh/geometry.js';
import { decodePNG } from '../../../publishing/export/codecs/png.js';
export async function decodeOBJ(bytes,{resources={},signal}={}){
 const lines=text(bytes).replace(/\\\r?\n/g,'').split(/\r?\n/),positions=[],uvs=[],normals=[],objects=[],materials=new Map();let current={name:'Object',faces:[]},material='default';objects.push(current);const libraries=[];
 const finite=(values,n)=>{if(values.length<n||values.slice(0,n).some(x=>!Number.isFinite(Number(x))))throw fail('AUTHORING_OBJ','Invalid numeric tuple.');return values.slice(0,n).map(Number);};
 const index=(v,array)=>{const n=Number(v);if(!Number.isInteger(n)||n===0)throw fail('AUTHORING_OBJ','Invalid OBJ index.');const i=n<0?array.length+n:n-1;if(i<0||i>=array.length)throw fail('AUTHORING_OBJ','OBJ index out of bounds.');return i;};
 for(const line of lines){abort(signal);const parts=line.trim().split(/\s+/),tag=parts.shift();if(!tag||tag.startsWith('#'))continue;
  if(tag==='v'){if(parts.length>3&&Number(parts[3])!==1)throw fail('AUTHORING_OBJ_PROFILE','Homogeneous/color OBJ vertices require an explicit profile.');positions.push(finite(parts,3));}
  else if(tag==='vt')uvs.push(finite(parts,2));else if(tag==='vn')normals.push(finite(parts,3));else if(tag==='o'||tag==='g'){if(current.faces.length){current={name:parts.join(' ')||'Object',faces:[]};objects.push(current);}else current.name=parts.join(' ')||'Object';}
  else if(tag==='usemtl')material=parts.join(' ');else if(tag==='mtllib')libraries.push(...parts);else if(tag==='s'){}else if(tag==='f'){
   if(parts.length<3)throw fail('AUTHORING_OBJ','Face needs three vertices.');const vertices=parts.map(p=>{const [v,t,n]=p.split('/');return {v:index(v,positions),t:t?index(t,uvs):null,n:n?index(n,normals):null};});current.faces.push({vertices,material});
  }else if(['l','p','curv','surf'].includes(tag))throw fail('AUTHORING_OBJ_PROFILE','Non-polygon OBJ primitives require conversion.');else throw fail('AUTHORING_OBJ_PROFILE',`Unsupported OBJ statement ${tag}.`);
  if(positions.length>100000)throw fail('AUTHORING_IMPORT_BUDGET','OBJ vertex limit exceeded.');
 }
 const scene={meshes:[],materials:[],images:[],nodes:[],warnings:[]};
 materials.set('default',{baseColor:[.8,.8,.8,1],metallic:0,roughness:.5,textures:{}});
 for(const library of libraries){let active=null;const base=library.includes('/')?library.slice(0,library.lastIndexOf('/')+1):'';
  for(const line of text(resource(library,resources)).split(/\r?\n/)){const parts=line.trim().split(/\s+/),tag=parts.shift();if(!tag||tag.startsWith('#'))continue;if(tag==='newmtl'){active={baseColor:[.8,.8,.8,1],metallic:0,roughness:.5,emissive:[0,0,0],textures:{}};materials.set(parts.join(' '),active);continue;}if(!active)throw fail('AUTHORING_OBJ_MTL','Material statement precedes newmtl.');
   if(tag==='Kd')active.baseColor=[...finite(parts,3),active.baseColor[3]];else if(tag==='Ke')active.emissive=finite(parts,3);else if(tag==='d'||tag==='Tr'){active.baseColor[3]=tag==='Tr'?1-Number(parts[0]):Number(parts[0]);active.alphaMode=active.baseColor[3]<1?'BLEND':'OPAQUE';}
   else if(tag==='Ns')active.roughness=Math.sqrt(2/(Number(parts[0])+2));else if(tag==='Pm')active.metallic=Number(parts[0]);else if(tag==='Pr')active.roughness=Number(parts[0]);
   else if(['map_Kd','map_Ke','norm'].includes(tag)){if(parts[0]?.startsWith('-'))throw fail('AUTHORING_OBJ_MTL_PROFILE','Texture transform options require explicit conversion.');const role={map_Kd:'baseColor',map_Ke:'emissive',norm:'normal'}[tag],id=`image${scene.images.length}`,colorSpace=role==='normal'?'linear':'srgb';scene.images.push({id,colorSpace,pixels:await decodePNG(resource(base+parts.join(' '),resources))});active.textures[role]={imageId:id};}
   else if(['Ka','Ks','Ni','illum'].includes(tag))scene.warnings.push(issue('MTL_SHADING_APPROXIMATION',`${tag} has no exact metallic-roughness representation.`,'warning'));
   else throw fail('AUTHORING_OBJ_MTL_PROFILE',`Unsupported material statement ${tag}.`);
  }
 }
 scene.materials=[...materials].map(([id,pbr])=>({id,pbr}));
 for(const object of objects.filter(o=>o.faces.length)){const mesh={id:`mesh${scene.meshes.length}`,positions:[],uvs:[],normals:[],indices:[],materialIndices:[]},node={id:`object${scene.nodes.length}`,name:object.name,meshId:mesh.id,materials:[]};
  for(const face of object.faces){if(!materials.has(face.material))throw fail('AUTHORING_OBJ_MTL','Referenced material is not provided.');let slot=node.materials.indexOf(face.material);if(slot<0){slot=node.materials.length;node.materials.push(face.material);}const triangles=triangulateAuthoringPolygon(face.vertices.map(v=>positions[v.v])).triangles;
   for(const tri of triangles){mesh.materialIndices.push(slot);for(const k of tri){const v=face.vertices[k];mesh.indices.push(mesh.positions.length/3);mesh.positions.push(...positions[v.v]);mesh.uvs.push(...(v.t===null?[0,0]:uvs[v.t]));mesh.normals.push(...(v.n===null?[0,1,0]:normals[v.n]));}}}
  scene.meshes.push(mesh);scene.nodes.push(node);
 }
 if(!scene.meshes.length)throw fail('AUTHORING_OBJ','No polygon geometry.');if(normals.length)scene.warnings.push(issue('IMPORTED_NORMALS_REEVALUATED','Imported source uses canonical Authoring normal generation.','warning'));return scene;
}
