import { decodeUSDZ } from '../../../publishing/export/codecs/zip.js';
import { parseUSDA, get, pathValue } from '../../../publishing/export/codecs/usda.js';
import { decodePNG } from '../../../publishing/export/codecs/png.js';
import { normalizeTransform, transformMatrix, multiplyMatrix, inverseMatrix, identityMatrix } from '../../../contracts/transforms.js';
import { decompose } from '../glb/decode.js';
import { triangulateAuthoringPolygon } from '../../../mesh/geometry.js';
import { asBytes, text, resource, fail, issue, abort } from '../../../contracts/io.js';
export async function decodeUSDAsset(input,{resources={},signal}={}){
 abort(signal);let bytes=asBytes(input),assets={...resources},sourceName='scene.usda';
 if(bytes[0]===80&&bytes[1]===75){const pack=await decodeUSDZ(bytes);sourceName=Object.keys(pack.entries)[0];if(!/\.usd[ac]?$/.test(sourceName))throw fail('AUTHORING_USDZ','The first USDZ entry must be the root USD layer.');assets={...assets,...pack.entries};bytes=pack.entries[sourceName];}
 if(bytes[0]===80&&bytes[1]===88)throw fail('AUTHORING_USDC_UNSUPPORTED','Binary USDC crate decoding is not implemented by the canonical USDA profile.');
 const tree=parseUSDA(text(bytes)),byPath=new Map(),parents=new Map();
 function scan(n,parent=null){if(byPath.has(n.path))throw fail('AUTHORING_USDA','Duplicate prim path.');byPath.set(n.path,n);parents.set(n.path,parent);for(const c of n.children)scan(c,n.path);}tree.roots.forEach(n=>scan(n));
 const scene={metersPerUnit:tree.metadata.metersPerUnit?.value??.01,meshes:[],materials:[],images:[],nodes:[],rigs:[],skins:[],shapes:[],animations:[],cameras:[],lights:[],warnings:[]};
 if((tree.metadata.upAxis?.value??'Y')!=='Y')throw fail('AUTHORING_USD_COORDINATES','Z-up import requires an explicit axis conversion profile.');
 for(const n of byPath.values())if(['references','payload','inherits','specializes'].some(k=>n.metadata[k]))throw fail('AUTHORING_USD_COMPOSITION','Layer composition arcs require a resolved stage; no referenced content is silently omitted.');
 const worldCache=new Map(),locals=new Map();
 function local(n){if(locals.has(n.path))return locals.get(n.path);let m=identityMatrix();for(const op of get(n,'xformOpOrder',[])){
   if(op==='!resetXformStack!')throw fail('AUTHORING_USD_TRANSFORM','Reset transform stacks require an explicit conversion profile.');let value=get(n,op);if(value===null)throw fail('AUTHORING_USD_TRANSFORM','Missing ordered transform.');let matrix;
   if(op.startsWith('xformOp:transform'))matrix=value.flat();else if(op.startsWith('xformOp:translate'))matrix=transformMatrix({translation:value});else if(op.startsWith('xformOp:scale'))matrix=transformMatrix({scale:value});else if(op.startsWith('xformOp:orient'))matrix=transformMatrix({rotation:[...value.slice(1),value[0]]});else throw fail('AUTHORING_USD_TRANSFORM',`Unsupported transform op ${op}.`);
   m=multiplyMatrix(m,matrix);
  }locals.set(n.path,m);return m;}
 function world(n){if(worldCache.has(n.path))return worldCache.get(n.path);const p=byPath.get(parents.get(n.path)),m=multiplyMatrix(p?world(p):identityMatrix(),local(n));worldCache.set(n.path,m);return m;}
 const propPath=v=>pathValue(v)?.replace(/\.outputs:.*$/,''),materialIds=new Map(),imageKeys=new Map();
 const assetBytes=file=>{const base=sourceName.includes('/')?sourceName.slice(0,sourceName.lastIndexOf('/')+1):'';return resource(base+file,assets);};
 for(const mat of [...byPath.values()].filter(n=>n.type==='Material')){
  const shader=byPath.get(propPath(get(mat,'outputs:surface.connect')));if(get(shader,'info:id')!=='UsdPreviewSurface')throw fail('AUTHORING_USD_MATERIAL','Only UsdPreviewSurface material conversion is implemented.');
  const id=`mat${materialIds.size}`,opacity=get(shader,'inputs:opacity',1),cutoff=get(shader,'inputs:opacityThreshold',0),pbr={baseColor:[...get(shader,'inputs:diffuseColor',[.18,.18,.18]),opacity],metallic:get(shader,'inputs:metallic',0),roughness:get(shader,'inputs:roughness',.5),emissive:get(shader,'inputs:emissiveColor',[0,0,0]),alphaMode:cutoff>0?'MASK':opacity<1||get(shader,'inputs:opacity.connect')?'BLEND':'OPAQUE',alphaCutoff:cutoff||.5,doubleSided:false,textures:{}};
  for(const [input,role]of [['diffuseColor','baseColor'],['normal','normal'],['roughness','metallicRoughness'],['metallic','metallicRoughness'],['emissiveColor','emissive'],['occlusion','occlusion']]){
    const c=get(shader,`inputs:${input}.connect`);if(!c)continue;const texture=byPath.get(propPath(c));if(get(texture,'info:id')!=='UsdUVTexture')throw fail('AUTHORING_USD_MATERIAL','Unsupported shader network; bake or provide a supported UsdUVTexture binding.');
    const file=get(texture,'inputs:file')?.$asset;if(!file)throw fail('AUTHORING_USD_TEXTURE','Texture has no asset path.');const colorSpace=get(texture,'inputs:sourceColorSpace',['baseColor','emissive'].includes(role)?'sRGB':'raw')==='sRGB'?'srgb':'linear',key=file+':'+colorSpace;
    if(!imageKeys.has(key)){const imageId=`image${imageKeys.size}`;scene.images.push({id:imageId,colorSpace,pixels:await decodePNG(assetBytes(file))});imageKeys.set(key,imageId);}
    const reader=byPath.get(propPath(get(texture,'inputs:st.connect')));if(reader&&get(reader,'inputs:varname')!=='st')throw fail('AUTHORING_USD_UV','Source supports the primary st UV set.');
    const wrap=x=>({repeat:'REPEAT',clamp:'CLAMP_TO_EDGE',mirror:'MIRRORED_REPEAT'}[x??'repeat']);const binding={imageId:imageKeys.get(key),uvSet:0,wrapS:wrap(get(texture,'inputs:wrapS')),wrapT:wrap(get(texture,'inputs:wrapT')),magFilter:'LINEAR',minFilter:'LINEAR'};
    if(!binding.wrapS||!binding.wrapT)throw fail('AUTHORING_USD_SAMPLER','Unsupported texture wrap mode.');
    if(pbr.textures[role]&&pbr.textures[role].imageId!==binding.imageId)throw fail('AUTHORING_USD_PACKING','Separate metallic and roughness textures require explicit channel packing.');pbr.textures[role]=binding;
    const scale=get(texture,'inputs:scale',[1,1,1,1]);if(role==='baseColor')pbr.baseColor=scale;if(role==='metallicRoughness'){pbr.roughness=scale[1];pbr.metallic=scale[2];}if(role==='emissive')pbr.emissive=scale.slice(0,3);if(role==='normal')pbr.normalScale=scale[0]/2;
  }
  materialIds.set(mat.path,id);scene.materials.push({id,pbr});
 }
 const renderTypes=new Set(['Xform','Scope','SkelRoot','Mesh','Camera','DistantLight','SphereLight']);
 function inherited(n,key){let current=n;while(current){const value=get(current,key);if(value!==null)return value;current=byPath.get(parents.get(current.path));}return null;}
 const commonNodes=new Map();
 for(const n of byPath.values()){
  if(!renderTypes.has(n.type)||n.path.includes('/Materials/'))continue;
  // Material and animation helper containers are not scene objects.
  if(n.type==='Scope'&&!n.children.some(c=>renderTypes.has(c.type)))continue;
  let parent=parents.get(n.path);while(parent&&!commonNodes.has(parent))parent=parents.get(parent);
  const node={id:n.path,name:get(n,'nexus:displayName',n.name),parent:parent??null,transform:decompose(parent?multiplyMatrix(inverseMatrix(world(byPath.get(parent))),world(n)):world(n)),materials:[],animationIds:[]};commonNodes.set(n.path,node);scene.nodes.push(node);
  if(n.type==='Mesh'){
   if(get(n,'subdivisionScheme','catmullClark')!=='none')throw fail('AUTHORING_USD_SUBDIVISION','Import requires an evaluated polygon mesh (subdivisionScheme=none).');
   const points=get(n,'points',[]),counts=get(n,'faceVertexCounts',[]),indices=get(n,'faceVertexIndices',[]),out={id:`mesh${scene.meshes.length}`,positions:[],normals:[],uvs:[],colors:[],indices:[],materialIndices:[]},sourceIndices=[];
   if(!points.length||points.length>100000||counts.length>200000)throw fail('AUTHORING_USD_GEOMETRY','Missing/oversized geometry.');
   const materialForFace=Array(counts.length).fill(pathValue(inherited(n,'material:binding')));let assigned=new Set();
   for(const subset of n.children.filter(c=>c.type==='GeomSubset')){if(get(subset,'familyName')!=='materialBind')continue;if(get(subset,'elementType')!=='face')throw fail('AUTHORING_USD_SUBSET','Material subsets must reference faces.');const binding=pathValue(get(subset,'material:binding'));
    for(const face of get(subset,'indices',[])){if(!Number.isInteger(face)||face<0||face>=counts.length||assigned.has(face))throw fail('AUTHORING_USD_SUBSET','Invalid/overlapping material subsets.');assigned.add(face);materialForFace[face]=binding;}}
   function attribute(key,control,face,corner,fallback){const property=n.properties[key];if(!property)return fallback;const data=property.value,mode=property.metadata?.interpolation?.value??(data.length===1?'constant':'vertex');let i={constant:0,uniform:face,vertex:control,varying:control,faceVarying:corner}[mode];const ix=get(n,key+':indices');if(ix)i=ix[i];if(i===undefined||data[i]===undefined)throw fail('AUTHORING_USD_ATTRIBUTE','Primvar index or interpolation is invalid.');return data[i];}
   let offset=0;counts.forEach((count,face)=>{if(!Number.isSafeInteger(count)||count<3||offset+count>indices.length)throw fail('AUTHORING_USD_GEOMETRY','Invalid face vertex counts.');const ids=indices.slice(offset,offset+count);if(ids.some(i=>!Number.isSafeInteger(i)||i<0||i>=points.length))throw fail('AUTHORING_USD_GEOMETRY','Invalid point index.');
    const materialPath=materialForFace[face];let material=materialIds.get(materialPath);if(!material){if(materialPath)throw fail('AUTHORING_USD_MATERIAL','Bound material is missing.');material='default';if(!scene.materials.some(m=>m.id===material))scene.materials.push({id:material,pbr:{baseColor:[.8,.8,.8,1],roughness:.5,metallic:0,textures:{}}});}
    let slot=node.materials.indexOf(material);if(slot<0){slot=node.materials.length;node.materials.push(material);}const triangles=triangulateAuthoringPolygon(ids.map(i=>points[i])).triangles;
    for(const tri of triangles){out.materialIndices.push(slot);for(const k of tri){const control=ids[k],corner=offset+k;out.indices.push(out.positions.length/3);out.positions.push(...points[control]);sourceIndices.push(control);out.normals.push(...attribute('normals',control,face,corner,[0,1,0]));out.uvs.push(...attribute('primvars:st',control,face,corner,[0,0]));out.colors.push(...attribute('primvars:displayColor',control,face,corner,[1,1,1]),attribute('primvars:displayOpacity',control,face,corner,1));}}
    offset+=count;
   });if(offset!==indices.length)throw fail('AUTHORING_USD_GEOMETRY','Unreferenced index data.');
   node.meshId=out.id;scene.meshes.push(out);for(const id of node.materials){const material=scene.materials.find(m=>m.id===id);material.pbr.doubleSided=get(n,'doubleSided',false);}
   scene.warnings.push(issue('IMPORTED_NORMALS_REEVALUATED','Imported source uses canonical Authoring normal generation.','warning',{meshId:out.id}));
   const skeleton=byPath.get(pathValue(inherited(n,'skel:skeleton')));let jointNames=[],boneMap=new Map(),rootCorrection=identityMatrix();
   if(skeleton){jointNames=get(skeleton,'joints',[]);const rest=get(skeleton,'restTransforms',[]),bind=get(skeleton,'bindTransforms',[]),geomBind=get(n,'primvars:skel:geomBindTransform',chunksIdentity()).flat();if(!jointNames.length||rest.length!==jointNames.length||bind.length!==jointNames.length)throw fail('AUTHORING_USD_SKIN','Skeleton matrix counts differ.');
    jointNames.forEach((j,i)=>boneMap.set(j,`j${i}`));rootCorrection=multiplyMatrix(multiplyMatrix(geomBind,inverseMatrix(world(n))),world(skeleton));
    const bones=jointNames.map((j,i)=>{const parent=j.includes('/')?j.slice(0,j.lastIndexOf('/')):null,known=boneMap.has(parent)?parent:null;return {id:`j${i}`,name:j.split('/').at(-1),parent:known?boneMap.get(known):null,rest:decompose(known?rest[i].flat():multiplyMatrix(rootCorrection,rest[i].flat())),length:1};});
    const ji=get(n,'primvars:skel:jointIndices',[]),jw=get(n,'primvars:skel:jointWeights',[]),size=n.properties['primvars:skel:jointIndices']?.metadata?.elementSize?.value??1;
    if(ji.length!==points.length*size||jw.length!==ji.length||size>32)throw fail('AUTHORING_USD_SKIN','Joint influence array size mismatch.');
    const weights=sourceIndices.map(i=>{const row=[];for(let k=0;k<size;k++){const index=ji[i*size+k],weight=jw[i*size+k];if(weight>0){if(!jointNames[index])throw fail('AUTHORING_USD_SKIN','Invalid joint index.');row.push({boneId:`j${index}`,weight});}}const sum=row.reduce((n,w)=>n+w.weight,0);if(sum<=0)throw fail('AUTHORING_USD_SKIN','Unweighted vertex.');return row.map(w=>({...w,weight:w.weight/sum}));});
    node.rigId=`rig${scene.rigs.length}`;node.skinId=`skin${scene.skins.length}`;scene.rigs.push({id:node.rigId,bones});scene.skins.push({id:node.skinId,rigId:node.rigId,meshId:out.id,weights,meshBindMatrix:geomBind,inverseBindMatrices:Object.fromEntries(bind.map((b,i)=>[`j${i}`,inverseMatrix(b.flat())]))});
   }
   const blendNames=get(n,'skel:blendShapes',[]),targets=get(n,'skel:blendShapeTargets',[]),keys=[];
   if(blendNames.length){if(targets.length!==blendNames.length)throw fail('AUTHORING_USD_MORPH','Blend target count differs.');for(let k=0;k<targets.length;k++){const shape=byPath.get(targets[k].$path);if(shape?.type!=='BlendShape')throw fail('AUTHORING_USD_MORPH','Blend shape target missing.');const offsets=get(shape,'offsets',[]),ix=get(shape,'pointIndices',Array.from({length:offsets.length},(_,i)=>i)),map=new Map(ix.map((v,i)=>[v,offsets[i]]));keys.push({id:blendNames[k],weight:0,deltas:sourceIndices.flatMap(i=>map.get(i)??[0,0,0])});}
    node.shapeId=`shapes${scene.shapes.length}`;scene.shapes.push({id:node.shapeId,meshId:out.id,keys});}
   const animation=byPath.get(pathValue(skeleton?inherited(skeleton,'skel:animationSource'):inherited(n,'skel:animationSource')));
   if(animation){if(animation.type!=='SkelAnimation')throw fail('AUTHORING_USD_ANIMATION','Expected a SkelAnimation source.');const defaults=get(animation,'blendShapeWeights',[]);keys.forEach((k,i)=>k.weight=defaults[i]??0);
    const animationJoints=get(animation,'joints',jointNames),tracks=[],tcps=tree.metadata.timeCodesPerSecond?.value??24;
    for(const [field,property]of [['translations','translation'],['rotations','rotation'],['scales','scale']]){const samples=get(animation,field+'.timeSamples');if(!samples)continue;
      for(let j=0;j<animationJoints.length;j++){const target=boneMap.get(animationJoints[j]);if(!target)throw fail('AUTHORING_USD_ANIMATION','Animation joint missing from skeleton.');
        // Nonidentity root rebasing needs coordinated TRS sampling, not independent scalar offsets.
        if(rootCorrection.some((v,i)=>Math.abs(v-identityMatrix()[i])>1e-6))throw fail('AUTHORING_USD_ANIMATION_PROFILE','Animated root rebasing requires a resolved transform-bake profile.');
        tracks.push({id:`${field}-${j}`,target,property,interpolation:'LINEAR',keys:Object.entries(samples).map(([time,values])=>{const value=values[j];if(!value)throw fail('AUTHORING_USD_ANIMATION','Animated joint count differs.');return {time:Number(time)/tcps,value:property==='rotation'?[...value.slice(1),value[0]]:value};}).sort((a,b)=>a.time-b.time)});
      }
    }
    const blendSamples=get(animation,'blendShapeWeights.timeSamples');if(blendSamples){const names=get(animation,'blendShapes',blendNames);for(let k=0;k<names.length;k++){if(!blendNames.includes(names[k]))throw fail('AUTHORING_USD_ANIMATION','Animation blend shape missing.');tracks.push({id:`blend-${k}`,target:names[k],property:'weight',interpolation:'LINEAR',keys:Object.entries(blendSamples).map(([time,values])=>({time:Number(time)/tcps,value:[values[k]]})).sort((a,b)=>a.time-b.time)});}}
    if(tracks.length){const id=`animation${scene.animations.length}`;scene.animations.push({id,rigId:node.rigId??null,shapeId:node.shapeId??null,clips:[{id:'clip',name:animation.name,duration:Math.max(...tracks.flatMap(t=>t.keys.map(k=>k.time))),tracks}]});node.animationIds.push(id);}
   }
  }
  if(n.type==='Camera'){if(get(n,'projection','perspective')!=='perspective')throw fail('AUTHORING_USD_CAMERA','Orthographic cameras are not supported by the source schema.');const aperture=get(n,'verticalAperture',15.2908),focal=get(n,'focalLength',50),clip=get(n,'clippingRange',[.1,1000]);scene.cameras.push({id:`camera${scene.cameras.length}`,nodeId:node.id,yfov:2*Math.atan(aperture/(2*focal)),near:clip[0],far:clip[1]});}
  if(n.type==='DistantLight'||n.type==='SphereLight'){const cone=get(n,'inputs:shaping:cone:angle');scene.lights.push({id:`light${scene.lights.length}`,nodeId:node.id,type:n.type==='DistantLight'?'directional':cone!==null?'spot':'point',color:get(n,'inputs:color',[1,1,1]),intensity:get(n,'inputs:intensity',1)*2**get(n,'inputs:exposure',0)});}
 }
 if(!scene.meshes.length)throw fail('AUTHORING_USD_EMPTY','Stage has no supported mesh.');abort(signal);return scene;
}
function chunksIdentity(){return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];}
