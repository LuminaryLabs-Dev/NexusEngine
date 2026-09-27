import { encodeUSDZ } from '../../codecs/zip.js';
import { encodePNG, rasterPixels } from '../../codecs/png.js';
import { utf8, digest, fail, abort, issue } from '../../../../contracts/io.js';
import { transformMatrix, inverseMatrix } from '../../../../contracts/transforms.js';
import { sampleAuthoringClip } from '../../../../animation/services.js';
const q=JSON.stringify,n=x=>{if(!Number.isFinite(x))throw fail('AUTHORING_USDA','Nonfinite number.');return Number(x.toPrecision(12)).toString();};
const tuple=a=>'('+a.map(n).join(', ')+')',list=a=>'['+a.join(', ')+']',chunks=(a,k)=>Array.from({length:a.length/k},(_,i)=>a.slice(i*k,i*k+k));
const matrix=a=>'('+chunks(a,4).map(tuple).join(', ')+')';
const ident=value=>'n_'+Array.from(String(value)).map(c=>/[a-zA-Z0-9_]/.test(c)?c:'_'+c.codePointAt(0).toString(16)+'_').join('');
export async function encodeUSDZAsset(packet,{signal}={}){
 abort(signal);const lines=[],resources={},images=new Map(),materials=new Map(packet.materials.map((m,i)=>[m.id,'m'+i])),nodes=packet.assembly.nodes.filter(n=>n.included),byId=new Map(nodes.map(n=>[n.id,n])),paths=new Map(),warnings=[];
 const path=id=>{if(paths.has(id))return paths.get(id);const node=byId.get(id);if(!node)throw fail('AUTHORING_HIERARCHY','Excluded parent.');const result=(node.parent===null?'/Root':path(node.parent))+'/'+ident(id);paths.set(id,result);return result;};nodes.forEach(node=>path(node.id));
 const put=(depth,text)=>lines.push('    '.repeat(depth)+text),attr=(depth,type,name,value)=>put(depth,`${type} ${name} = ${value}`);
 const maxTime=Math.max(0,...packet.animations.flatMap(a=>a.clips.map(c=>c.duration)));
 lines.push('#usda 1.0','(', '    defaultPrim = "Root"',`    metersPerUnit = ${n(packet.assembly.units.metersPerUnit)}`,'    upAxis = "Y"','    timeCodesPerSecond = 1','    startTimeCode = 0',`    endTimeCode = ${n(maxTime)}`,')','def Xform "Root"','{');
 function texture(m,role,b){const colorSpace=['baseColor','emissive'].includes(role)?'srgb':'linear',key=b.imageId+':'+colorSpace;if(!images.has(key)){const src=packet.images.find(i=>i.id===b.imageId);if(!src)throw fail('AUTHORING_IMAGE','Missing texture.');const bytes=encodePNG(rasterPixels(src.raster,colorSpace)),file=`Textures/${digest(bytes).slice(7)}.png`;resources[file]=bytes;images.set(key,file);}return images.get(key);}
 put(1,'def Scope "Materials"');put(1,'{');
 for(const m of packet.materials){const p=m.pbr,mid=materials.get(m.id),mpath=`/Root/Materials/${mid}`;put(2,`def Material "${mid}"`);put(2,'{');attr(3,'token','outputs:surface.connect',`<${mpath}/Surface.outputs:surface>`);
  put(3,'def Shader "Surface"');put(3,'{');attr(4,'uniform token','info:id',q('UsdPreviewSurface'));attr(4,'color3f','inputs:diffuseColor',tuple(p.baseColor.slice(0,3)));attr(4,'float','inputs:metallic',n(p.metallic));attr(4,'float','inputs:roughness',n(p.roughness));attr(4,'float','inputs:opacity',n(p.alphaMode==='OPAQUE'?1:p.baseColor[3]));attr(4,'float','inputs:opacityThreshold',n(p.alphaMode==='MASK'?p.alphaCutoff:0));attr(4,'color3f','inputs:emissiveColor',tuple(p.emissive));
  for(const [role,b]of Object.entries(p.textures)){
    const output=`${mpath}/${role}.outputs:`,connections={baseColor:[['color3f','diffuseColor','rgb'],...(p.alphaMode==='OPAQUE'?[]:[['float','opacity','a']])],normal:[['normal3f','normal','rgb']],metallicRoughness:[['float','roughness','g'],['float','metallic','b']],occlusion:[['float','occlusion','r']],emissive:[['color3f','emissiveColor','rgb']]}[role];
    for(const [type,input,channel]of connections)attr(4,type,`inputs:${input}.connect`,`<${output}${channel}>`);
  }
  put(4,'token outputs:surface');put(3,'}');
  if(Object.keys(p.textures).length){put(3,'def Shader "UV"');put(3,'{');attr(4,'uniform token','info:id',q('UsdPrimvarReader_float2'));attr(4,'string','inputs:varname',q('st'));put(4,'float2 outputs:result');put(3,'}');}
  for(const [role,b]of Object.entries(p.textures)){put(3,`def Shader ${q(role)}`);put(3,'{');attr(4,'uniform token','info:id',q('UsdUVTexture'));attr(4,'asset','inputs:file',`@${texture(m,role,b)}@`);attr(4,'token','inputs:sourceColorSpace',q(['baseColor','emissive'].includes(role)?'sRGB':'raw'));attr(4,'float2','inputs:st.connect',`<${mpath}/UV.outputs:result>`);
    const wrap=x=>({REPEAT:'repeat',CLAMP_TO_EDGE:'clamp',MIRRORED_REPEAT:'mirror'}[x]);attr(4,'token','inputs:wrapS',q(wrap(b.wrapS)));attr(4,'token','inputs:wrapT',q(wrap(b.wrapT)));
    const scale=role==='baseColor'?p.baseColor:role==='metallicRoughness'?[1,p.roughness,p.metallic,1]:role==='emissive'?[...p.emissive,1]:role==='normal'?[2*p.normalScale,2*p.normalScale,2,1]:[1,1,1,1];attr(4,'float4','inputs:scale',tuple(scale));
    if(role==='normal')attr(4,'float4','inputs:bias',tuple([-p.normalScale,-p.normalScale,-1,0]));
    for(const channel of ['r','g','b','a'])put(4,`float outputs:${channel}`);put(4,'float3 outputs:rgb');put(3,'}');
  }put(2,'}');
 }
 put(1,'}');
 const writeNode=(node,depth)=>{
   abort(signal);const skin=packet.skins.find(s=>s.id===node.skinId),rig=packet.rigs.find(r=>r.id===node.rigId),shape=packet.shapes.find(s=>s.id===node.shapeId),np=path(node.id);
   put(depth,`def ${skin||shape?'SkelRoot':'Xform'} ${q(ident(node.id))}`);put(depth,'{');attr(depth+1,'matrix4d','xformOp:transform',matrix(transformMatrix(node.transform)));attr(depth+1,'uniform token[]','xformOpOrder','["xformOp:transform"]');
   attr(depth+1,'custom string','nexus:displayName',q(node.name));
   const bonePaths=new Map();function bonePath(b){if(bonePaths.has(b.id))return bonePaths.get(b.id);const result=(b.parent?bonePath(rig.bones.find(x=>x.id===b.parent))+'/':'')+ident(b.id);bonePaths.set(b.id,result);return result;}
   if(skin){put(depth+1,'def Skeleton "Skeleton" (');put(depth+2,'prepend apiSchemas = ["SkelBindingAPI"]');put(depth+1,')');put(depth+1,'{');attr(depth+2,'matrix4d','xformOp:transform',matrix(inverseMatrix(skin.meshBindMatrix)));attr(depth+2,'uniform token[]','xformOpOrder','["xformOp:transform"]');
    attr(depth+2,'uniform token[]','joints',list(rig.bones.map(b=>q(bonePath(b)))));attr(depth+2,'matrix4d[]','bindTransforms',list(rig.bones.map(b=>matrix(inverseMatrix(skin.inverseBindMatrices[b.id])))));attr(depth+2,'matrix4d[]','restTransforms',list(rig.bones.map(b=>matrix(transformMatrix(b.rest)))));
    if(node.animationIds.length||shape)attr(depth+2,'rel','skel:animationSource',`<${np}/Animation>`);put(depth+1,'}');}
   if(node.meshId){const mesh=packet.meshes.find(m=>m.id===node.meshId);put(depth+1,'def Mesh "Geometry" (');put(depth+2,`prepend apiSchemas = ["MaterialBindingAPI"${skin||shape?', "SkelBindingAPI"':''}]`);put(depth+1,')');put(depth+1,'{');
    attr(depth+2,'int[]','faceVertexCounts',list(Array(mesh.indices.length/3).fill('3')));attr(depth+2,'int[]','faceVertexIndices',list(mesh.indices.map(n)));attr(depth+2,'point3f[]','points',list(chunks(mesh.positions,3).map(tuple)));attr(depth+2,'normal3f[]','normals',list(chunks(mesh.normals,3).map(tuple))+' ( interpolation = "vertex" )');attr(depth+2,'texCoord2f[]','primvars:st',list(chunks(mesh.uvs,2).map(tuple))+' ( interpolation = "vertex" )');
    attr(depth+2,'color3f[]','primvars:displayColor',list(chunks(mesh.colors,4).map(c=>tuple(c.slice(0,3))))+' ( interpolation = "vertex" )');attr(depth+2,'float[]','primvars:displayOpacity',list(chunks(mesh.colors,4).map(c=>n(c[3])))+' ( interpolation = "vertex" )');attr(depth+2,'uniform token','subdivisionScheme',q('none'));
    attr(depth+2,'bool','doubleSided',node.materials.some(id=>packet.materials.find(m=>m.id===id)?.pbr.doubleSided)?'true':'false');
    if(node.materials.length===1)attr(depth+2,'rel','material:binding',`</Root/Materials/${materials.get(node.materials[0])}>`);
    else if(node.materials.length){attr(depth+2,'uniform token','subsetFamily:materialBind:familyType',q('partition'));
      const slots=new Map();for(const group of mesh.groups){if(!slots.has(group.material))slots.set(group.material,[]);for(let i=group.start/3;i<(group.start+group.count)/3;i++)slots.get(group.material).push(i);}
      for(const [slot,faces]of slots){put(depth+2,`def GeomSubset "Material${slot}" (`);put(depth+3,'prepend apiSchemas = ["MaterialBindingAPI"]');put(depth+2,')');put(depth+2,'{');attr(depth+3,'uniform token','elementType',q('face'));attr(depth+3,'uniform token','familyName',q('materialBind'));attr(depth+3,'int[]','indices',list(faces.map(n)));attr(depth+3,'rel','material:binding',`</Root/Materials/${materials.get(node.materials[slot])}>`);put(depth+2,'}');}}
    if(skin){attr(depth+2,'rel','skel:skeleton',`<${np}/Skeleton>`);attr(depth+2,'matrix4d','primvars:skel:geomBindTransform',matrix(skin.meshBindMatrix));const joints=[],weights=[];for(const id of mesh.sourceVertices){const row=skin.weights[id];for(let k=0;k<4;k++){joints.push(row[k]?rig.bones.findIndex(b=>b.id===row[k].boneId):0);weights.push(row[k]?.weight??0);}}
      attr(depth+2,'int[]','primvars:skel:jointIndices',list(joints.map(n))+' ( elementSize = 4 interpolation = "vertex" )');attr(depth+2,'float[]','primvars:skel:jointWeights',list(weights.map(n))+' ( elementSize = 4 interpolation = "vertex" )');}
    if(shape){attr(depth+2,'uniform token[]','skel:blendShapes',list(shape.keys.map(k=>q(ident(k.id)))));attr(depth+2,'rel','skel:blendShapeTargets',list(shape.keys.map((_,i)=>`<${np}/Shape${i}>`)));if(!skin)attr(depth+2,'rel','skel:animationSource',`<${np}/Animation>`);}
    put(depth+1,'}');
    if(shape)shape.keys.forEach((key,k)=>{put(depth+1,`def BlendShape "Shape${k}"`);put(depth+1,'{');attr(depth+2,'vector3f[]','offsets',list(mesh.sourceVertices.map(id=>tuple(key.deltas[id]??[0,0,0]))));attr(depth+2,'int[]','pointIndices',list(mesh.sourceVertices.map((_,i)=>n(i))));if(key.normalDeltas)attr(depth+2,'vector3f[]','normalOffsets',list(chunks(key.normalDeltas,3).map(tuple)));put(depth+1,'}');});
    const clips=node.animationIds.flatMap(id=>packet.animations.find(a=>a.id===id).clips);if(clips.length>1)throw fail('AUTHORING_USD_CLIP_PROFILE','This USD delivery profile exports one active clip per instance; multi-clip composition requires a named USD variant profile.');
    if(clips.length||shape){const clip=clips[0];if(clip?.tracks.some(t=>t.interpolation==='STEP'))throw fail('AUTHORING_USD_STEP_PROFILE','USD default linear stage interpolation cannot preserve STEP discontinuities; select an explicit held-stage profile.');
      put(depth+1,'def SkelAnimation "Animation"');put(depth+1,'{');if(rig)attr(depth+2,'uniform token[]','joints',list(rig.bones.map(b=>q(bonePath(b)))));if(shape){attr(depth+2,'uniform token[]','blendShapes',list(shape.keys.map(k=>q(ident(k.id)))));attr(depth+2,'float[]','blendShapeWeights',list(shape.keys.map(k=>n(k.weight))));}
      if(clip){const times=[...new Set([...clip.tracks.flatMap(t=>t.keys.map(k=>k.time)),...Array.from({length:Math.ceil(clip.duration*120)+1},(_,i)=>Math.min(clip.duration,i/120))])].sort((a,b)=>a-b);if(times.length>100000)throw fail('AUTHORING_USD_ANIMATION_BUDGET','Animation sample budget exceeded.');
        const rest=Object.fromEntries((rig?.bones??[]).map(b=>[b.id,b.rest])),samples=times.map(time=>sampleAuthoringClip(clip,time,rest));
        for(const [field,type,key]of [['translations','float3[]','translation'],['rotations','quatf[]','rotation'],['scales','half3[]','scale']])if(rig){put(depth+2,`${type} ${field}.timeSamples = {`);times.forEach((time,i)=>put(depth+3,`${n(time)}: ${list(rig.bones.map(b=>{const v=samples[i].pose[b.id][key];return tuple(key==='rotation'?[v[3],...v.slice(0,3)]:v);}))},`));put(depth+2,'}');}
        if(shape){put(depth+2,'float[] blendShapeWeights.timeSamples = {');times.forEach((time,i)=>put(depth+3,`${n(time)}: ${list(shape.keys.map(k=>n(samples[i].weights[k.id]??k.weight)))},`));put(depth+2,'}');}
        warnings.push(issue('USD_ANIMATION_SAMPLED','USD clip is sampled at up to 120 Hz plus source key times; independent pose-tolerance verification is required.','warning',{clipId:clip.id,samples:times.length}));
      }put(depth+1,'}');
    }
   }
   for(const camera of packet.assembly.cameras.filter(c=>c.nodeId===node.id)){put(depth+1,'def Camera "Camera"');put(depth+1,'{');attr(depth+2,'token','projection',q('perspective'));attr(depth+2,'float','verticalAperture','20');attr(depth+2,'float','horizontalAperture','20');attr(depth+2,'float','focalLength',n(10/Math.tan(camera.yfov/2)));attr(depth+2,'float2','clippingRange',tuple([camera.near,camera.far]));put(depth+1,'}');}
   for(const light of packet.assembly.lights.filter(l=>l.nodeId===node.id)){put(depth+1,`def ${light.type==='directional'?'DistantLight':'SphereLight'} "Light"${light.type==='spot'?' ( prepend apiSchemas = ["ShapingAPI"] )':''}`);put(depth+1,'{');attr(depth+2,'color3f','inputs:color',tuple(light.color));attr(depth+2,'float','inputs:intensity',n(light.intensity));if(light.type!=='directional'){attr(depth+2,'float','inputs:radius','0');attr(depth+2,'bool','treatAsPoint','true');}if(light.type==='spot'){attr(depth+2,'float','inputs:shaping:cone:angle','45');attr(depth+2,'float','inputs:shaping:cone:softness','0');}if(light.range)warnings.push(issue('USD_LIGHT_RANGE','UsdLux attenuation does not carry the same hard range cutoff; geometry and intensity retained.','warning',{lightId:light.id}));put(depth+1,'}');}
   nodes.filter(n=>n.parent===node.id).forEach(n=>writeNode(n,depth+1));put(depth,'}');
 };
 nodes.filter(n=>n.parent===null).forEach(n=>writeNode(n,1));put(0,'}');const bytes=encodeUSDZ({'scene.usda':utf8.encode(lines.join('\n')+'\n'),...resources});abort(signal);return {bytes,resources,fileName:'scene.usdz',format:'usdz',hash:digest(bytes),warnings};
}
