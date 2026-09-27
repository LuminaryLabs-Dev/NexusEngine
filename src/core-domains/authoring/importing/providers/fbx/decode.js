import { decodeFBXTree, child, children, value, properties } from '../../../publishing/export/codecs/fbx-binary.js';
import { decodePNG, srgbToLinear } from './texture-helpers.js';
import { eulerToQuat } from '../../../publishing/export/providers/fbx/encode.js';
import { decompose } from '../glb/decode.js';
import { normalizeTransform, transformMatrix, multiplyMatrix, inverseMatrix, identityMatrix } from '../../../contracts/transforms.js';
import { triangulateAuthoringPolygon } from '../../../mesh/geometry.js';
import { fail, issue, resource, abort } from '../../../contracts/io.js';
const name=n=>String(n.props[1]??n.name).split('\x00')[0].replace(/^[^:]+::/,'');
const TIME=46186158000;
export async function decodeFBX(bytes,{resources={},signal}={}){
 abort(signal);const tree=await decodeFBXTree(bytes),objects=tree.nodes.find(n=>n.name==='Objects'),links=children(tree.nodes.find(n=>n.name==='Connections'),'C').map(n=>n.props),byId=new Map();
 if(!objects)throw fail('AUTHORING_FBX','Objects section missing.');
 for(const o of objects.children){const id=o.props[0];if(!Number.isSafeInteger(id)||byId.has(id))throw fail('AUTHORING_FBX','Invalid or duplicate object ID.');byId.set(id,o);}
 const linked=(id,objectType,relationship)=>links.filter(l=>l[2]===id&&(!relationship||l[3]===relationship)).map(l=>({object:byId.get(l[1]),relationship:l[3]})).filter(x=>x.object&&(!objectType||x.object.name===objectType));
 const scene={meshes:[],materials:[],images:[],nodes:[],rigs:[],skins:[],shapes:[],animations:[],cameras:[],lights:[],warnings:[]};
 const settings=properties(tree.nodes.find(n=>n.name==='GlobalSettings'));
 if((settings.UpAxis??1)!==1||(settings.UpAxisSign??1)!==1||(settings.CoordAxis??0)!==0)throw fail('AUTHORING_FBX_COORDINATES','This import profile requires Y-up, right-handed coordinates; explicit axis conversion is not yet implemented.');
 scene.metersPerUnit=(settings.UnitScaleFactor??1)/100;
 const modelObjects=objects.children.filter(o=>o.name==='Model'),modelById=new Map(modelObjects.map(o=>[o.props[0],o])),parentMap=new Map(),worlds=new Map(),local=new Map(),active=new Set();
 for(const m of modelObjects){const id=m.props[0],p=properties(m),parents=links.filter(l=>l[0]==='OO'&&l[1]===id&&modelById.has(l[2]));if(parents.length>1)throw fail('AUTHORING_FBX_HIERARCHY','A model has multiple parents.');parentMap.set(id,parents[0]?.[2]??null);
  if((p.RotationOrder??0)!==0||['PreRotation','PostRotation','RotationPivot','ScalingPivot','GeometricTranslation','GeometricRotation'].some(k=>p[k]?.some(n=>Math.abs(n)>1e-10))||p.GeometricScaling?.some(n=>Math.abs(n-1)>1e-10))throw fail('AUTHORING_FBX_TRANSFORM_PROFILE','Nondefault FBX pivots/pre-rotations need explicit transform baking.');
  local.set(id,normalizeTransform({translation:p['Lcl Translation']??[0,0,0],rotation:eulerToQuat(p['Lcl Rotation']??[0,0,0]),scale:p['Lcl Scaling']??[1,1,1]}));
 }
 function world(id){if(worlds.has(id))return worlds.get(id);if(active.has(id)||active.size>256)throw fail('AUTHORING_FBX_HIERARCHY','Cycle/depth limit in model hierarchy.');active.add(id);const parent=parentMap.get(id),m=multiplyMatrix(parent===null?identityMatrix():world(parent),transformMatrix(local.get(id)));active.delete(id);worlds.set(id,m);return m;}
 for(const id of modelById.keys())world(id);
 const imageCache=new Set();
 for(const m of objects.children.filter(n=>n.name==='Material')){const p=properties(m),out={baseColor:[...(p.DiffuseColor??[.8,.8,.8]),p.Opacity??1-(p.TransparencyFactor??0)],metallic:p.NexusMetallic??0,roughness:p.NexusRoughness??Math.max(0,Math.min(1,1-(p.Shininess??0)/100)),emissive:p.EmissiveColor??[0,0,0],textures:{}};
  for(const {object:t,relationship}of linked(m.props[0],'Texture')){
   const settings=properties(t),role=settings.NexusTextureRole??{DiffuseColor:'baseColor',NormalMap:'normal',EmissiveColor:'emissive',AmbientColor:'occlusion'}[relationship];if(!role)throw fail('AUTHORING_FBX_TEXTURE_PROFILE',`Texture connection ${relationship} requires conversion.`);
   const video=linked(t.props[0],'Video')[0]?.object,filename=value(t,'RelativeFilename',value(t,'FileName',value(video,'RelativeFilename'))),data=value(video,'Content')??resource(filename,resources);
   const colorSpace=settings.NexusColorSpace??(['baseColor','emissive'].includes(role)?'srgb':'linear'),imageId=`image${t.props[0]}`;
   if(!imageCache.has(imageId)){scene.images.push({id:imageId,colorSpace,pixels:await decodePNG(data)});imageCache.add(imageId);}
   out.textures[role]={imageId,uvSet:0,wrapS:settings.NexusWrapS??(settings.WrapModeU===1?'CLAMP_TO_EDGE':'REPEAT'),wrapT:settings.NexusWrapT??(settings.WrapModeV===1?'CLAMP_TO_EDGE':'REPEAT'),magFilter:'LINEAR',minFilter:'LINEAR'};
  }
  scene.materials.push({id:`mat${m.props[0]}`,pbr:out});
 }
 function layerValue(geo,type,field,width,control,polygon,corner,defaultValue){const layer=children(geo,`LayerElement${type}`)[0];if(!layer)return defaultValue;
  const mapping=value(layer,'MappingInformationType'),reference=value(layer,'ReferenceInformationType'),data=value(layer,field,[]);let index={ByPolygonVertex:corner,ByVertice:control,ByVertex:control,ByPolygon:polygon,AllSame:0}[mapping];
  if(index===undefined)throw fail('AUTHORING_FBX_LAYER',`Unsupported ${type} mapping ${mapping}.`);
  if(reference==='IndexToDirect'||reference==='Index')index=value(layer,`${field}Index`,value(layer,`${type}Index`,[]))[index];else if(reference!=='Direct')throw fail('AUTHORING_FBX_LAYER','Unsupported reference mapping.');
  if(!Number.isSafeInteger(index)||index<0||index*width+width>data.length)throw fail('AUTHORING_FBX_LAYER','Layer array index out of bounds.');return data.slice(index*width,index*width+width);
 }
 const controlsForMesh=new Map(),geometriesForNode=new Map(),jointMaps=new Map(),morphMaps=new Map();
 for(const m of modelObjects){abort(signal);const mid=m.props[0],node={id:`n${mid}`,name:name(m),parent:parentMap.get(mid)===null?null:`n${parentMap.get(mid)}`,transform:local.get(mid),materials:[],animationIds:[]};scene.nodes.push(node);
  const meshes=linked(mid,'Geometry').filter(x=>x.object.props[2]==='Mesh');if(meshes.length>1)throw fail('AUTHORING_FBX_MESH','Multiple geometry objects per model are not supported by this profile.');
  if(meshes.length){const geo=meshes[0].object,gid=geo.props[0],positions=value(geo,'Vertices',[]),indices=value(geo,'PolygonVertexIndex',[]);if(!positions.length||positions.length%3||!indices.length)throw fail('AUTHORING_FBX_MESH','Missing geometry arrays.');
    const out={id:`mesh${mid}`,positions:[],normals:[],uvs:[],colors:[],indices:[],materialIndices:[]},sourceIndices=[];let face=[],corner=0,polygon=0;
    node.materials=linked(mid,'Material').map(x=>`mat${x.object.props[0]}`);if(!node.materials.length){if(!scene.materials.some(x=>x.id==='default'))scene.materials.push({id:'default',pbr:{baseColor:[.8,.8,.8,1],roughness:.5,metallic:0,textures:{}}});node.materials=['default'];}
    for(const raw of indices){const control=raw<0?-raw-1:raw;if(!Number.isInteger(control)||control<0||control*3+2>=positions.length)throw fail('AUTHORING_FBX_MESH','Control point out of bounds.');face.push({control,corner:corner++});
      if(raw<0){if(face.length<3)throw fail('AUTHORING_FBX_MESH','Degenerate polygon.');const points=face.map(x=>positions.slice(x.control*3,x.control*3+3)),triangles=triangulateAuthoringPolygon(points).triangles;
       const materialLayer=children(geo,'LayerElementMaterial')[0],materialArray=value(materialLayer,'Materials',[0]),mapping=value(materialLayer,'MappingInformationType','AllSame');const material=materialArray[mapping==='ByPolygon'?polygon:0]??0;
       if(!Number.isInteger(material)||material<0||material>=node.materials.length)throw fail('AUTHORING_FBX_MATERIAL','Material slot has no assignment.');
       for(const triangle of triangles){out.materialIndices.push(material);for(const k of triangle){const {control,c}= {control:face[k].control,c:face[k].corner};out.indices.push(out.positions.length/3);out.positions.push(...positions.slice(control*3,control*3+3));sourceIndices.push(control);
         out.normals.push(...layerValue(geo,'Normal','Normals',3,control,polygon,c,[0,1,0]));out.uvs.push(...layerValue(geo,'UV','UV',2,control,polygon,c,[0,0]));out.colors.push(...layerValue(geo,'Color','Colors',4,control,polygon,c,[1,1,1,1]));}}
       face=[];polygon++;
      }
    }
    if(face.length)throw fail('AUTHORING_FBX_MESH','Unterminated polygon.');scene.meshes.push(out);node.meshId=out.id;controlsForMesh.set(node.id,sourceIndices);geometriesForNode.set(node.id,gid);
    scene.warnings.push(issue('IMPORTED_NORMALS_REEVALUATED','Imported source uses canonical Authoring normal generation.','warning',{meshId:out.id}));
    const skins=linked(gid,'Deformer').filter(x=>x.object.props[2]==='Skin');if(skins.length>1)throw fail('AUTHORING_FBX_SKIN','Multiple skin deformers require conversion.');
    if(skins.length){const skin=skins[0].object,clusters=linked(skin.props[0],'Deformer').filter(x=>x.object.props[2]==='Cluster').map(x=>x.object),joints=new Map();
      for(const cluster of clusters){const bone=linked(cluster.props[0],'Model')[0]?.object;if(!bone)throw fail('AUTHORING_FBX_SKIN','Cluster has no bone.');joints.set(bone.props[0],bone);}
      const bones=[...joints].map(([id,b])=>{const parent=parentMap.get(id),boneParent=joints.has(parent)?parent:null,rest=boneParent===null?decompose(multiplyMatrix(inverseMatrix(world(mid)),world(id))):local.get(id);return {id:`j${id}`,name:name(b),parent:boneParent===null?null:`j${boneParent}`,rest,length:1};}),weightTable=new Map(),inverseBindMatrices={};
      for(const cluster of clusters){const bone=linked(cluster.props[0],'Model')[0].object,bid=bone.props[0],ci=value(cluster,'Indexes',[]),cw=value(cluster,'Weights',[]),bind=value(cluster,'Transform',identityMatrix()),link=value(cluster,'TransformLink',identityMatrix());if(ci.length!==cw.length)throw fail('AUTHORING_FBX_SKIN','Skin index/weight count mismatch.');
        inverseBindMatrices[`j${bid}`]=multiplyMatrix(inverseMatrix(link),bind);ci.forEach((v,k)=>{if(!weightTable.has(v))weightTable.set(v,[]);weightTable.get(v).push({boneId:`j${bid}`,weight:cw[k]});});}
      const weights=sourceIndices.map(i=>{const row=weightTable.get(i)??[],sum=row.reduce((n,w)=>n+w.weight,0);if(sum<=0)throw fail('AUTHORING_FBX_SKIN','Unweighted vertex.');return row.map(w=>({...w,weight:w.weight/sum}));});
      node.rigId=`rig${mid}`;node.skinId=`skin${mid}`;scene.rigs.push({id:node.rigId,bones});scene.skins.push({id:node.skinId,rigId:node.rigId,meshId:out.id,inverseBindMatrices,weights});jointMaps.set(node.id,new Map([...joints].map(([id])=>[id,`j${id}`])));
    }
    const blends=linked(gid,'Deformer').filter(x=>x.object.props[2]==='BlendShape');if(blends.length){const keys=[],channels=new Map();
      for(const {object:blend}of blends)for(const {object:channel}of linked(blend.props[0],'Deformer')){if(channel.props[2]!=='BlendShapeChannel')continue;const targets=linked(channel.props[0],'Geometry');if(targets.length!==1)throw fail('AUTHORING_FBX_MORPH','In-between blend shapes require baking.');const geometry=targets[0].object,ix=value(geometry,'Indexes',[]),values=value(geometry,'Vertices',[]),map=new Map(ix.map((i,k)=>[i,values.slice(k*3,k*3+3)]));
        const id=`shape${channel.props[0]}`;channels.set(channel.props[0],id);keys.push({id,weight:value(channel,'DeformPercent',0)/100,deltas:sourceIndices.flatMap(i=>map.get(i)??[0,0,0])});}
      node.shapeId=`shapes${mid}`;scene.shapes.push({id:node.shapeId,meshId:out.id,keys});morphMaps.set(node.id,channels);
    }
  }
  const attribute=linked(mid,'NodeAttribute')[0]?.object;
  if(attribute?.props[2]==='Camera'){const p=properties(attribute);if((p.CameraProjectionType??0)!==0)throw fail('AUTHORING_FBX_CAMERA','Orthographic camera source is not yet supported.');scene.cameras.push({id:`camera${mid}`,nodeId:node.id,yfov:(p.FieldOfViewY??p.FieldOfView??45)*Math.PI/180,near:(p.NearPlane??100)/1000,far:(p.FarPlane??100000)/1000});}
  if(attribute?.props[2]==='Light'){const p=properties(attribute),type={0:'point',1:'directional',2:'spot'}[p.LightType??0];if(!type)throw fail('AUTHORING_FBX_LIGHT','Unsupported light type.');scene.lights.push({id:`light${mid}`,nodeId:node.id,type,color:p.Color??[1,1,1],intensity:(p.Intensity??100)/100,...(p.FarAttenuationEnd>0?{range:p.FarAttenuationEnd}:{})});}
 }
 for(const stack of objects.children.filter(x=>x.name==='AnimationStack')){
  const layers=linked(stack.props[0],'AnimationLayer');if(layers.length!==1)throw fail('AUTHORING_FBX_ANIMATION','Exactly one baked animation layer per stack is required.');const curveNodes=linked(layers[0].object.props[0],'AnimationCurveNode');let claimed=0;
  for(const node of scene.nodes.filter(n=>n.rigId||n.shapeId)){const tracks=[];
   for(const {object:cn}of curveNodes){const destinations=links.filter(l=>l[0]==='OP'&&l[1]===cn.props[0]);if(destinations.length!==1)throw fail('AUTHORING_FBX_ANIMATION','Curve-node target is ambiguous.');const dest=destinations[0],bone=jointMaps.get(node.id)?.get(dest[2]),morph=morphMaps.get(node.id)?.get(dest[2]);if(!bone&&!morph)continue;claimed++;
    const property=morph?'weight':{'Lcl Translation':'translation','Lcl Rotation':'rotation','Lcl Scaling':'scale'}[dest[3]];if(!property)throw fail('AUTHORING_FBX_ANIMATION','Unsupported animated property.');
    const curves=linked(cn.props[0],'AnimationCurve').map(({object,relationship})=>({axis:relationship?.split('|').at(-1),times:value(object,'KeyTime',[]).map(t=>t/TIME),values:value(object,'KeyValueFloat',[]),flags:value(object,'KeyAttrFlags',[])})),times=curves[0]?.times??[];
    if(!times.length||curves.some(c=>c.values.length!==times.length||JSON.stringify(c.times)!==JSON.stringify(times)))throw fail('AUTHORING_FBX_ANIMATION','Baked curves must use the same timeline.');
    const step=curves.every(c=>c.flags.every(f=>(f&2)!==0));if(!step&&curves.some(c=>c.flags.some(f=>(f&4)===0)))throw fail('AUTHORING_FBX_ANIMATION','Unbaked cubic FBX curves require an explicit conversion profile.');
    const defaults=properties(cn),keys=times.map((time,k)=>{const raw=(morph?['DeformPercent']:['X','Y','Z']).map(axis=>curves.find(c=>c.axis===axis)?.values[k]??defaults[`d|${axis}`]??(property==='scale'?1:0));return {time,value:morph?[raw[0]/100]:property==='rotation'?eulerToQuat(raw):raw};});tracks.push({id:`track${cn.props[0]}`,target:morph??bone,property,interpolation:step?'STEP':'LINEAR',keys});
   }
   if(tracks.length){const id=`animation${stack.props[0]}-${node.id}`;scene.animations.push({id,rigId:node.rigId??null,shapeId:node.shapeId??null,clips:[{id:`clip${stack.props[0]}`,name:name(stack),duration:Math.max(...tracks.flatMap(t=>t.keys.map(k=>k.time))),tracks}]});node.animationIds.push(id);}
  }
  if(claimed!==curveNodes.length)throw fail('AUTHORING_FBX_ANIMATION_PROFILE','Arbitrary object animation is outside the current Authoring source schema.');
 }
 abort(signal);return scene;
}
