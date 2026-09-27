import {append} from '../../../../contracts/io.js';
import { concat, utf8, digest, u32, fail, abort } from '../../../../contracts/io.js';
import { inverseMatrix, multiplyMatrix } from '../../../../contracts/transforms.js';
import { encodePNG, rasterPixels } from '../../codecs/png.js';
/** glTF 2.0 binary encoding of the canonical evaluated packet. No renderer or Node runtime required. */
export async function encodeGLB(packet,{signal}={}){
  abort(signal);
  const g={asset:{version:'2.0',generator:'NexusEngine Authoring GLB/2'},scene:0,scenes:[{nodes:[0]}],
    nodes:[{name:'Authoring units',scale:Array(3).fill(packet.assembly.units.metersPerUnit),children:[]}],
    meshes:[],materials:[],accessors:[],bufferViews:[],buffers:[{byteLength:0}],images:[],textures:[],samplers:[],skins:[],animations:[],cameras:[]};
  const binary=[],resources=Object.create(null);let offset=0;
  const view=(bytes,target)=>{const padding=(4-offset%4)%4;if(padding){binary.push(new Uint8Array(padding));offset+=padding;}
    const i=g.bufferViews.length;g.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,...(target?{target}:{})});binary.push(bytes);offset+=bytes.length;return i;};
  const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
  function accessor(values,type,componentType=5126,{target,minmax=false}={}){
    const width=widths[type],size=componentType===5123?2:4;
    if(!width||!values.length||values.length%width||values.some(n=>!Number.isFinite(n)))throw fail('AUTHORING_GLTF_ACCESSOR','Invalid accessor values.');
    const bytes=new Uint8Array(values.length*size),v=new DataView(bytes.buffer);
    values.forEach((n,i)=>{if(componentType===5126){if(Math.abs(n)>3.402823466e38)throw fail('AUTHORING_GLTF_ACCESSOR','Float32 overflow.');v.setFloat32(i*4,n,true);}
      else{if(!Number.isSafeInteger(n)||n<0||n>(componentType===5123?65535:4294967295))throw fail('AUTHORING_GLTF_ACCESSOR','Invalid unsigned index.');componentType===5123?v.setUint16(i*2,n,true):v.setUint32(i*4,n,true);}});
    const a={bufferView:view(bytes,target),componentType,count:values.length/width,type};
    if(minmax){a.min=Array(width).fill(Infinity);a.max=Array(width).fill(-Infinity);values.forEach((n,i)=>{n=Math.fround(n);a.min[i%width]=Math.min(a.min[i%width],n);a.max[i%width]=Math.max(a.max[i%width],n);});}
    const id=g.accessors.length;g.accessors.push(a);return id;
  }
  const materials=new Map(),images=new Map(),textures=new Map(),samplers=new Map();
  function texture(binding,role){
    const colorSpace=['baseColor','emissive'].includes(role)?'srgb':'linear',key=`${binding.imageId}:${colorSpace}`;
    if(!images.has(key)){const image=packet.images.find(x=>x.id===binding.imageId);if(!image)throw fail('AUTHORING_IMAGE','Missing texture source.');
      const bytes=encodePNG(rasterPixels(image.raster,colorSpace));resources[`textures/${digest(bytes).slice(7)}.png`]=bytes;images.set(key,g.images.length);g.images.push({name:key,mimeType:'image/png',bufferView:view(bytes)});}
    const sampler={wrapS:{REPEAT:10497,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648}[binding.wrapS],wrapT:{REPEAT:10497,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648}[binding.wrapT],magFilter:binding.magFilter==='NEAREST'?9728:9729,minFilter:binding.minFilter==='NEAREST'?9728:9729},sk=JSON.stringify(sampler);
    if(!samplers.has(sk)){samplers.set(sk,g.samplers.length);g.samplers.push(sampler);}
    const tk=key+sk;if(!textures.has(tk)){textures.set(tk,g.textures.length);g.textures.push({source:images.get(key),sampler:samplers.get(sk)});}
    return {index:textures.get(tk),texCoord:binding.uvSet};
  }
  for(const m of packet.materials){
    abort(signal);const p=m.pbr,out={name:m.id,pbrMetallicRoughness:{baseColorFactor:p.baseColor,metallicFactor:p.metallic,roughnessFactor:p.roughness},emissiveFactor:p.emissive,alphaMode:p.alphaMode,doubleSided:p.doubleSided};if(p.alphaMode==='MASK')out.alphaCutoff=p.alphaCutoff;
    for(const [role,b]of Object.entries(p.textures)){const t=texture(b,role);switch(role){case 'baseColor':out.pbrMetallicRoughness.baseColorTexture=t;break;case 'metallicRoughness':out.pbrMetallicRoughness.metallicRoughnessTexture=t;break;case 'normal':out.normalTexture={...t,scale:p.normalScale};break;case 'occlusion':out.occlusionTexture={...t,strength:p.occlusionStrength};break;case 'emissive':out.emissiveTexture=t;break;}}
    materials.set(m.id,g.materials.length);g.materials.push(out);
  }
  const nodes=new Map(),meshCache=new Map(),geometryCache=new Map(),jointInstances=new Map(),geometryNodes=new Map(),included=packet.assembly.nodes.filter(n=>n.included);
  for(const n of included){nodes.set(n.id,g.nodes.length);g.nodes.push({name:n.name,translation:n.transform.translation,rotation:n.transform.rotation,scale:n.transform.scale,children:[],extras:{sourceNodeId:n.id}});}
  for(const n of included){const parent=n.parent===null?0:nodes.get(n.parent);if(parent===undefined)throw fail('AUTHORING_HIERARCHY','Included node has an excluded parent.');g.nodes[parent].children.push(nodes.get(n.id));}
  function geometry(mesh,skin,shape){
    const key=JSON.stringify([mesh.id,skin?.id??null,shape?.id??null]);if(geometryCache.has(key))return geometryCache.get(key);
    const attributes={POSITION:accessor(mesh.positions,'VEC3',5126,{target:34962,minmax:true}),NORMAL:accessor(mesh.normals,'VEC3',5126,{target:34962}),TEXCOORD_0:accessor(mesh.uvs,'VEC2',5126,{target:34962}),TANGENT:accessor(mesh.tangents,'VEC4',5126,{target:34962}),COLOR_0:accessor(mesh.colors,'VEC4',5126,{target:34962})};
    if(skin){const rig=packet.rigs.find(r=>r.id===skin.rigId),ids=new Map(rig.bones.map((b,i)=>[b.id,i])),joints=[],weights=[];
      for(const id of mesh.sourceVertices){const row=skin.weights[id];if(!row||row.length>4)throw fail('AUTHORING_GLTF_SKIN','Skin requires 1-4 influences.');for(let k=0;k<4;k++){joints.push(row[k]?ids.get(row[k].boneId):0);weights.push(row[k]?.weight??0);}}
      attributes.JOINTS_0=accessor(joints,'VEC4',5123,{target:34962});attributes.WEIGHTS_0=accessor(weights,'VEC4',5126,{target:34962});}
    const targets=shape?.keys.map(k=>({POSITION:accessor(mesh.sourceVertices.flatMap(id=>k.deltas[id]??[0,0,0]),'VEC3',5126,{target:34962,minmax:true}),...(k.normalDeltas?{NORMAL:accessor(k.normalDeltas,'VEC3',5126,{target:34962})}:{})}));
    const result={attributes,targets};geometryCache.set(key,result);return result;
  }
  for(const n of included){
    abort(signal);if(!n.meshId)continue;const mesh=packet.meshes.find(m=>m.id===n.meshId),skin=packet.skins.find(s=>s.id===n.skinId),shape=packet.shapes.find(s=>s.id===n.shapeId),key=JSON.stringify([mesh.id,n.materials,n.skinId,n.shapeId]);
    if(!meshCache.has(key)){
      const {attributes,targets}=geometry(mesh,skin,shape),slots=new Map();for(const group of mesh.groups){if(!slots.has(group.material))slots.set(group.material,[]);append(slots.get(group.material),mesh.indices.slice(group.start,group.start+group.count));}
      const primitives=[...slots].map(([slot,indices])=>{const material=n.materials[slot];if(material!==undefined&&!materials.has(material))throw fail('AUTHORING_MATERIAL','Missing material assignment.');return {attributes,indices:accessor(indices,'SCALAR',5125,{target:34963}),mode:4,...(material?{material:materials.get(material)}:{}),...(targets?{targets}:{})};});
      meshCache.set(key,g.meshes.length);g.meshes.push({name:mesh.id,primitives,...(shape?{weights:shape.keys.map(k=>k.weight),extras:{targetNames:shape.keys.map(k=>k.id)}}:{})});
    }
    const gi=g.nodes.length;geometryNodes.set(n.id,gi);g.nodes.push({name:`${n.name} geometry`,mesh:meshCache.get(key)});g.nodes[nodes.get(n.id)].children.push(gi);
    if(skin){const rig=packet.rigs.find(r=>r.id===skin.rigId),boneMap=new Map(),root=g.nodes.length;
      g.nodes.push({name:`${n.name} skeleton`,matrix:inverseMatrix(skin.meshBindMatrix),children:[]});g.nodes[nodes.get(n.id)].children.push(root);
      for(const bone of rig.bones){boneMap.set(bone.id,g.nodes.length);g.nodes.push({name:bone.name,translation:bone.rest.translation,rotation:bone.rest.rotation,scale:bone.rest.scale,children:[]});}
      for(const bone of rig.bones)g.nodes[bone.parent===null?root:boneMap.get(bone.parent)].children.push(boneMap.get(bone.id));
      g.nodes[gi].skin=g.skins.length;g.skins.push({name:skin.id,skeleton:root,joints:rig.bones.map(b=>boneMap.get(b.id)),inverseBindMatrices:accessor(rig.bones.flatMap(b=>multiplyMatrix(skin.inverseBindMatrices[b.id],skin.meshBindMatrix)),'MAT4')});jointInstances.set(n.id,boneMap);
    }
  }
  for(const n of included)for(const id of n.animationIds){
    const doc=packet.animations.find(a=>a.id===id);for(const clip of doc.clips){const channels=[],samplers=[];
      const add=(track,target,path,values,type)=>{const sampler=samplers.length;samplers.push({input:accessor(track.keys.map(k=>k.time),'SCALAR',5126,{minmax:true}),output:accessor(values,type),interpolation:track.interpolation});channels.push({sampler,target:{node:target,path}});};
      for(const track of clip.tracks.filter(t=>t.property!=='weight')){const target=jointInstances.get(n.id)?.get(track.target);if(target===undefined)throw fail('AUTHORING_GLTF_ANIMATION','Track has no exported joint.');add(track,target,track.property,track.keys.flatMap(k=>track.interpolation==='CUBICSPLINE'?[...k.inTangent,...k.value,...k.outTangent]:k.value),track.property==='rotation'?'VEC4':'VEC3');}
      const morph=clip.tracks.filter(t=>t.property==='weight');if(morph.length){const shape=packet.shapes.find(s=>s.id===n.shapeId),first=morph[0];if(!shape||morph.some(t=>t.interpolation!==first.interpolation||JSON.stringify(t.keys.map(k=>k.time))!==JSON.stringify(first.keys.map(k=>k.time))))throw fail('AUTHORING_GLTF_MORPH','Morph tracks need a common timeline.');
        const values=[];for(let k=0;k<first.keys.length;k++)for(const field of first.interpolation==='CUBICSPLINE'?['inTangent','value','outTangent']:['value'])for(const key of shape.keys){const t=morph.find(t=>t.target===key.id);values.push(t?t.keys[k][field][0]:field==='value'?key.weight:0);}add(first,geometryNodes.get(n.id),'weights',values,'SCALAR');}
      if(channels.length)g.animations.push({name:`${n.name} / ${clip.name}`,channels,samplers});
    }
  }
  for(const camera of packet.assembly.cameras){const ni=nodes.get(camera.nodeId);if(ni===undefined)continue;g.nodes[ni].camera=g.cameras.length;g.cameras.push({name:camera.id,type:'perspective',perspective:{yfov:camera.yfov,znear:camera.near,zfar:camera.far}});}
  if(packet.assembly.lights.length){g.extensionsUsed=['KHR_lights_punctual'];const lights=[];g.extensions={KHR_lights_punctual:{lights}};
    for(const light of packet.assembly.lights){const ni=nodes.get(light.nodeId);if(ni===undefined)continue;g.nodes[ni].extensions={KHR_lights_punctual:{light:lights.length}};lights.push({name:light.id,type:light.type,color:light.color,intensity:light.intensity,...(light.range?{range:light.range}:{}),...(light.type==='spot'?{spot:{innerConeAngle:0,outerConeAngle:Math.PI/4}}:{})});}}
  if(!g.meshes.length)throw fail('AUTHORING_EXPORT_EMPTY','No included mesh can be exported.');
  for(const node of g.nodes)if(node.children?.length===0)delete node.children;
  for(const key of ['images','textures','samplers','skins','animations','cameras','materials'])if(!g[key].length)delete g[key];
  g.buffers[0].byteLength=offset;const rawJson=utf8.encode(JSON.stringify(g)),json=concat([rawJson,new Uint8Array((4-rawJson.length%4)%4).fill(32)]),raw=concat(binary),bin=concat([raw,new Uint8Array((4-raw.length%4)%4)]);
  const bytes=concat([u32(0x46546c67),u32(2),u32(12+8+json.length+8+bin.length),u32(json.length),u32(0x4e4f534a),json,u32(bin.length),u32(0x004e4942),bin]);abort(signal);
  return {bytes,resources,fileName:'scene.glb',format:'glb',hash:digest(bytes),metadata:{json:g}};
}
