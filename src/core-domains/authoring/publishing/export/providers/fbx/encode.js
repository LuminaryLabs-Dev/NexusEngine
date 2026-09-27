import { N, P, encodeFBXTree } from '../../codecs/fbx-binary.js';
import { encodePNG, rasterPixels } from '../../codecs/png.js';
import { digest, fail, abort, issue } from '../../../../contracts/io.js';
import { transformMatrix, multiplyMatrix, inverseMatrix, identityMatrix } from '../../../../contracts/transforms.js';
import { sampleAuthoringTrack } from '../../../../animation/services.js';
const S=v=>P('S',String(v)),I=v=>P('I',v),D=v=>P('D',v),L=v=>P('L',v),A=(t,v)=>P(t,Array.from(v));
const p70=(name,type,values)=>N('P',[S(name),S(type),S(''),S('A'),...values.map(n=>typeof n==='string'?S(n):D(n))]);
export function quatToEuler([x,y,z,w]){const d=180/Math.PI;return [Math.atan2(2*(w*x+y*z),1-2*(x*x+y*y))*d,Math.asin(Math.max(-1,Math.min(1,2*(w*y-z*x))))*d,Math.atan2(2*(w*z+x*y),1-2*(y*y+z*z))*d];}
export function eulerToQuat([x,y,z]){x*=Math.PI/360;y*=Math.PI/360;z*=Math.PI/360;const sx=Math.sin(x),cx=Math.cos(x),sy=Math.sin(y),cy=Math.cos(y),sz=Math.sin(z),cz=Math.cos(z);return [sx*cy*cz-cx*sy*sz,cx*sy*cz+sx*cy*sz,cx*cy*sz-sx*sy*cz,cx*cy*cz+sx*sy*sz];}
const TIME=46186158000;
export async function encodeFBX(packet,{signal}={}){
 abort(signal);let next=1000;const fresh=()=>next++,objects=[],connections=[],resources=Object.create(null),warnings=[issue('FBX_PBR_TRANSLATION','FBX includes connected texture roles and custom roughness/metallic properties; target render-pipeline shader reconstruction may differ.','warning')];
 const connect=(a,b,property)=>connections.push(N('C',[S(property?'OP':'OO'),L(a),L(b),...(property?[S(property)]:[])]));
 const included=packet.assembly.nodes.filter(n=>n.included),models=new Map(included.map(n=>[n.id,fresh()])),materials=new Map(),geometry=new Map(),worlds=new Map(),allNodes=new Map(included.map(n=>[n.id,n]));
 const world=id=>{if(worlds.has(id))return worlds.get(id);const n=allNodes.get(id);if(!n)throw fail('AUTHORING_HIERARCHY','Missing included parent.');const m=multiplyMatrix(n.parent===null?identityMatrix():world(n.parent),transformMatrix(n.transform));worlds.set(id,m);return m;};
 function model(id,name,type,t){return N('Model',[L(id),S(name+'\x00\x01Model'),S(type)],[N('Version',[I(232)]),N('Properties70',[],[
   p70('Lcl Translation','Lcl Translation',t.translation),p70('Lcl Rotation','Lcl Rotation',quatToEuler(t.rotation)),p70('Lcl Scaling','Lcl Scaling',t.scale),p70('RotationOrder','enum',[0]),p70('InheritType','enum',[1])]),N('Shading',[P('C',true)]),N('Culling',[S('CullingOff')])]);}
 for(const m of packet.materials){const mid=fresh();materials.set(m.id,mid);const p=m.pbr;objects.push(N('Material',[L(mid),S(m.id+'\x00\x01Material'),S('')],[N('Version',[I(102)]),N('ShadingModel',[S('phong')]),N('MultiLayer',[I(0)]),N('Properties70',[],[
   p70('DiffuseColor','Color',p.baseColor.slice(0,3)),p70('DiffuseFactor','Number',[1]),p70('EmissiveColor','Color',p.emissive),p70('EmissiveFactor','Number',[1]),p70('TransparencyFactor','Number',[1-p.baseColor[3]]),p70('Opacity','Number',[p.baseColor[3]]),p70('Shininess','Number',[(1-p.roughness)*100]),p70('NexusRoughness','Number',[p.roughness]),p70('NexusMetallic','Number',[p.metallic])])]));
   for(const [role,b]of Object.entries(p.textures)){
    const image=packet.images.find(i=>i.id===b.imageId);if(!image)throw fail('AUTHORING_FBX_TEXTURE','Image missing.');
    const space=['baseColor','emissive'].includes(role)?'srgb':'linear',bytes=encodePNG(rasterPixels(image.raster,space)),filename=`Textures/${digest(bytes).slice(7)}.png`;resources[filename]=bytes;const video=fresh(),texture=fresh();
    objects.push(N('Video',[L(video),S(filename+'\x00\x01Video'),S('Clip')],[N('Type',[S('Clip')]),N('Properties70',[],[p70('Path','KString',[filename])]),N('Filename',[S(filename)]),N('RelativeFilename',[S(filename)]),N('Content',[P('R',bytes)])]));
    objects.push(N('Texture',[L(texture),S(`${m.id}-${role}\x00\x01Texture`),S('')],[N('Type',[S('TextureVideoClip')]),N('Version',[I(202)]),N('TextureName',[S(role)]),N('Media',[S(filename)]),N('FileName',[S(filename)]),N('RelativeFilename',[S(filename)]),N('ModelUVTranslation',[D(0),D(0)]),N('ModelUVScaling',[D(1),D(1)]),N('Texture_Alpha_Source',[S('None')]),N('Cropping',[I(0),I(0),I(0),I(0)]),N('Properties70',[],[
      p70('UVSet','KString',['UVChannel_1']),p70('WrapModeU','enum',[b.wrapS==='CLAMP_TO_EDGE'?1:0]),p70('WrapModeV','enum',[b.wrapT==='CLAMP_TO_EDGE'?1:0]),p70('NexusTextureRole','KString',[role]),p70('NexusWrapS','KString',[b.wrapS]),p70('NexusWrapT','KString',[b.wrapT]),p70('NexusColorSpace','KString',[space])]) ]));
    connect(video,texture);connect(texture,mid,{baseColor:'DiffuseColor',normal:'NormalMap',emissive:'EmissiveColor',metallicRoughness:'NexusMetallicRoughness',occlusion:'AmbientColor'}[role]);
   }
 }
 const boneInstances=new Map(),shapeInstances=new Map();
 for(const n of included){
  abort(signal);const mid=models.get(n.id);objects.push(model(mid,n.name,n.meshId?'Mesh':packet.assembly.cameras.some(c=>c.nodeId===n.id)?'Camera':packet.assembly.lights.some(l=>l.nodeId===n.id)?'Light':'Null',n.transform));connect(mid,n.parent===null?0:models.get(n.parent));
  if(!n.meshId)continue;const mesh=packet.meshes.find(m=>m.id===n.meshId),gid=fresh();geometry.set(n.id,gid);connect(gid,mid);for(const material of n.materials){if(!materials.has(material))throw fail('AUTHORING_MATERIAL','Missing material.');connect(materials.get(material),mid);}
  const poly=mesh.indices.map((v,i)=>i%3===2?-v-1:v),mat=Array(mesh.indices.length/3).fill(0);for(const group of mesh.groups)for(let i=group.start;i<group.start+group.count;i+=3)mat[i/3]=group.material;
  const layer=(kind,field,width,values)=>N(`LayerElement${kind}`,[I(0)],[N('Version',[I(101)]),N('Name',[S(kind==='UV'?'UVChannel_1':'')]),N('MappingInformationType',[S('ByPolygonVertex')]),N('ReferenceInformationType',[S('Direct')]),N(field,[A('d',mesh.indices.flatMap(i=>values.slice(i*width,i*width+width)))])]);
  const elements=[layer('Normal','Normals',3,mesh.normals),layer('UV','UV',2,mesh.uvs),layer('Color','Colors',4,mesh.colors),layer('Tangent','Tangents',3,Array.from({length:mesh.positions.length/3},(_,i)=>mesh.tangents.slice(i*4,i*4+3)).flat()),
   N('LayerElementMaterial',[I(0)],[N('Version',[I(101)]),N('Name',[S('')]),N('MappingInformationType',[S('ByPolygon')]),N('ReferenceInformationType',[S('IndexToDirect')]),N('Materials',[A('i',mat)])])];
  objects.push(N('Geometry',[L(gid),S(mesh.id+'\x00\x01Geometry'),S('Mesh')],[N('GeometryVersion',[I(124)]),N('Vertices',[A('d',mesh.positions)]),N('PolygonVertexIndex',[A('i',poly)]),...elements,N('Layer',[I(0)],[N('Version',[I(100)]),...elements.map(e=>N('LayerElement',[],[N('Type',[S(e.name)]),N('TypedIndex',[I(0)])]))])]));
  const skin=packet.skins.find(s=>s.id===n.skinId);
  if(skin){const rig=packet.rigs.find(r=>r.id===skin.rigId),sid=fresh(),root=fresh(),boneMap=new Map(rig.bones.map(b=>[b.id,fresh()])),rworld=new Map();
    // Root bind-space transform is an ordinary model; supports non-identity mesh bind matrices.
    const {decompose}=await import('../../../../importing/providers/glb/decode.js');
    objects.push(model(root,`${n.name} skeleton`,'Null',decompose(inverseMatrix(skin.meshBindMatrix))));connect(root,mid);
    objects.push(N('Deformer',[L(sid),S(skin.id+'\x00\x01Deformer'),S('Skin')],[N('Version',[I(101)]),N('Link_DeformAcuracy',[D(50)])]));connect(sid,gid);
    const boneWorld=id=>{if(rworld.has(id))return rworld.get(id);const b=rig.bones.find(b=>b.id===id),m=multiplyMatrix(b.parent===null?multiplyMatrix(world(n.id),inverseMatrix(skin.meshBindMatrix)):boneWorld(b.parent),transformMatrix(b.rest));rworld.set(id,m);return m;};
    const poseNodes=[N('PoseNode',[],[N('Node',[L(mid)]),N('Matrix',[A('d',world(n.id))])])];
    for(const b of rig.bones){const bid=boneMap.get(b.id),attribute=fresh(),cluster=fresh();objects.push(model(bid,b.name,'LimbNode',b.rest));connect(bid,b.parent===null?root:boneMap.get(b.parent));
      objects.push(N('NodeAttribute',[L(attribute),S(b.name+'\x00\x01NodeAttribute'),S('LimbNode')],[N('TypeFlags',[S('Skeleton')]),N('Properties70',[],[p70('Size','Number',[b.length])])]));connect(attribute,bid);
      const indices=[],weights=[];mesh.sourceVertices.forEach((v,i)=>{const influence=skin.weights[v].find(w=>w.boneId===b.id);if(influence&&influence.weight>0){indices.push(i);weights.push(influence.weight);}});
      const link=multiplyMatrix(multiplyMatrix(world(n.id),inverseMatrix(skin.meshBindMatrix)),inverseMatrix(skin.inverseBindMatrices[b.id]));
      objects.push(N('Deformer',[L(cluster),S(b.name+'\x00\x01SubDeformer'),S('Cluster')],[N('Version',[I(100)]),N('UserData',[S(''),S('')]),N('Indexes',[A('i',indices)]),N('Weights',[A('d',weights)]),N('Transform',[A('d',world(n.id))]),N('TransformLink',[A('d',link)])]));connect(cluster,sid);connect(bid,cluster);
      poseNodes.push(N('PoseNode',[],[N('Node',[L(bid)]),N('Matrix',[A('d',boneWorld(b.id))])]));
    }
    objects.push(N('Pose',[L(fresh()),S('BindPose\x00\x01Pose'),S('BindPose')],[N('Type',[S('BindPose')]),N('Version',[I(100)]),N('NbPoseNodes',[I(poseNodes.length)]),...poseNodes]));boneInstances.set(n.id,boneMap);
  }
  const shape=packet.shapes.find(s=>s.id===n.shapeId);if(shape){const blend=fresh(),channels=new Map();objects.push(N('Deformer',[L(blend),S(shape.id+'\x00\x01Deformer'),S('BlendShape')],[N('Version',[I(100)])]));connect(blend,gid);
    for(const key of shape.keys){const channel=fresh(),geometry=fresh(),deltas=mesh.sourceVertices.flatMap(v=>key.deltas[v]??[0,0,0]);channels.set(key.id,channel);
      objects.push(N('Deformer',[L(channel),S(key.id+'\x00\x01SubDeformer'),S('BlendShapeChannel')],[N('Version',[I(100)]),N('DeformPercent',[D(key.weight*100)]),N('FullWeights',[A('d',[100])])]));connect(channel,blend);
      objects.push(N('Geometry',[L(geometry),S(key.id+'\x00\x01Geometry'),S('Shape')],[N('Version',[I(100)]),N('Indexes',[A('i',Array.from({length:mesh.positions.length/3},(_,i)=>i))]),N('Vertices',[A('d',deltas)]),N('Normals',[A('d',key.normalDeltas??Array(deltas.length).fill(0))])]));connect(geometry,channel);
    }shapeInstances.set(n.id,channels);
  }
 }
 for(const n of included)for(const animationId of n.animationIds){const a=packet.animations.find(a=>a.id===animationId);for(const clip of a.clips){
   const stack=fresh(),layer=fresh();objects.push(N('AnimationStack',[L(stack),S(`${n.name}/${clip.name}\x00\x01AnimStack`),S('')],[N('Properties70',[],[p70('LocalStart','KTime',[0]),p70('LocalStop','KTime',[Math.round(clip.duration*TIME)]),p70('ReferenceStart','KTime',[0]),p70('ReferenceStop','KTime',[Math.round(clip.duration*TIME)])])]));
   objects.push(N('AnimationLayer',[L(layer),S('BaseLayer\x00\x01AnimLayer'),S('')],[]));connect(layer,stack);
   for(const track of clip.tracks){const cn=fresh(),weight=track.property==='weight',target=weight?shapeInstances.get(n.id)?.get(track.target):boneInstances.get(n.id)?.get(track.target);if(target===undefined)throw fail('AUTHORING_FBX_ANIMATION','Missing animation target.');
     const attr=weight?'DeformPercent':{translation:'T',rotation:'R',scale:'S'}[track.property],axes=weight?['DeformPercent']:['X','Y','Z'];
     const samples=sampleTrack(track);if(samples.baked)warnings.push(issue('FBX_ANIMATION_BAKED','Track converted to bounded sampled FBX curves.','warning',{track:track.id,sampleCount:samples.times.length}));
     objects.push(N('AnimationCurveNode',[L(cn),S(`${attr}\x00\x01AnimCurveNode`),S('')],[N('Properties70',[],axes.map((axis,i)=>p70(`d|${axis}`,'Number',[samples.values[0][i]])))]));connect(cn,layer);connect(cn,target,weight?'DeformPercent':`Lcl ${{translation:'Translation',rotation:'Rotation',scale:'Scaling'}[track.property]}`);
     for(let axis=0;axis<axes.length;axis++){const curve=fresh();objects.push(N('AnimationCurve',[L(curve),S(`curve-${curve}\x00\x01AnimCurve`),S('')],[N('Default',[D(samples.values[0][axis])]),N('KeyVer',[I(4008)]),N('KeyTime',[A('l',samples.times.map(t=>Math.round(t*TIME)))]),N('KeyValueFloat',[A('f',samples.values.map(v=>v[axis]))]),N('KeyAttrFlags',[A('i',samples.times.map(()=>track.interpolation==='STEP'?2:4))]),N('KeyAttrDataFloat',[A('f',samples.times.flatMap(()=>[0,0,0,0]))]),N('KeyAttrRefCount',[A('i',samples.times.map(()=>1))])]));connect(curve,cn,`d|${axes[axis]}`);}
   }
 }}
 for(const c of packet.assembly.cameras){if(!models.has(c.nodeId))continue;const id=fresh();objects.push(N('NodeAttribute',[L(id),S(c.id+'\x00\x01NodeAttribute'),S('Camera')],[N('TypeFlags',[S('Camera')]),N('Properties70',[],[p70('CameraProjectionType','enum',[0]),p70('FieldOfView','Number',[c.yfov*180/Math.PI]),p70('FieldOfViewY','Number',[c.yfov*180/Math.PI]),p70('NearPlane','Number',[c.near*1000]),p70('FarPlane','Number',[c.far*1000]),p70('AspectWidth','Number',[1]),p70('AspectHeight','Number',[1])])]));connect(id,models.get(c.nodeId));}
 for(const l of packet.assembly.lights){if(!models.has(l.nodeId))continue;const id=fresh();objects.push(N('NodeAttribute',[L(id),S(l.id+'\x00\x01NodeAttribute'),S('Light')],[N('TypeFlags',[S('Light')]),N('Properties70',[],[p70('LightType','enum',[{point:0,directional:1,spot:2}[l.type]]),p70('Color','Color',l.color),p70('Intensity','Number',[l.intensity*100]),p70('DecayType','enum',[2]),p70('FarAttenuationEnd','Number',[l.range??0]),p70('InnerAngle','Number',[0]),p70('OuterAngle','Number',[90])])]));connect(id,models.get(l.nodeId));}
 const counts=new Map();for(const o of objects)counts.set(o.name,(counts.get(o.name)??0)+1);
 const root=[N('FBXHeaderExtension',[],[N('FBXHeaderVersion',[I(1003)]),N('FBXVersion',[I(7400)]),N('Creator',[S('NexusEngine Authoring FBX/2')])]),
  N('GlobalSettings',[],[N('Version',[I(1000)]),N('Properties70',[],[p70('UpAxis','int',[1]),p70('UpAxisSign','int',[1]),p70('FrontAxis','int',[2]),p70('FrontAxisSign','int',[-1]),p70('CoordAxis','int',[0]),p70('CoordAxisSign','int',[1]),p70('UnitScaleFactor','double',[packet.assembly.units.metersPerUnit*100]),p70('OriginalUnitScaleFactor','double',[packet.assembly.units.metersPerUnit*100])])]),
  N('Documents',[],[N('Count',[I(1)]),N('Document',[L(1),S('Scene'),S('Scene')],[N('RootNode',[L(0)])])]),
  N('Definitions',[],[N('Version',[I(100)]),N('Count',[I(objects.length)]),...[...counts].map(([type,count])=>N('ObjectType',[S(type)],[N('Count',[I(count)])]))]),N('Objects',[],objects),N('Connections',[],connections),N('Takes',[],[N('Current',[S('')])])];
 const bytes=encodeFBXTree(root);abort(signal);return {bytes,resources,fileName:'scene.fbx',format:'fbx',hash:digest(bytes),warnings};
}
function sampleTrack(track){
 const convert=value=>track.property==='rotation'?quatToEuler(value):track.property==='weight'?[value[0]*100]:value;
 // Translation/scale LINEAR and all STEP tracks map directly. Curved/rotation tracks use sampled conversion.
 const baked=track.interpolation==='CUBICSPLINE'||(track.property==='rotation'&&track.interpolation!=='STEP');
 let times=track.keys.map(k=>k.time);if(baked){const duration=times.at(-1)-times[0],count=Math.ceil(duration*120);if(count>100000)throw fail('AUTHORING_FBX_ANIMATION_BUDGET','Sampled track exceeds 100k keys.');times=[...new Set([...times,...Array.from({length:count+1},(_,i)=>Math.min(times.at(-1),times[0]+i/120))])].sort((a,b)=>a-b);}
 const values=times.map(t=>convert(sampleAuthoringTrack(track,t)));
 if(track.property==='rotation')for(let i=1;i<values.length;i++)for(let a=0;a<3;a++){while(values[i][a]-values[i-1][a]>180)values[i][a]-=360;while(values[i][a]-values[i-1][a]<-180)values[i][a]+=360;}
 // Check interval quarter points against the source. Fail rather than quietly accepting a poor bake.
 if(baked)for(let i=0;i+1<times.length;i++)for(const u of [.25,.5,.75]){const expected=sampleAuthoringTrack(track,times[i]+(times[i+1]-times[i])*u),v=values[i].map((n,a)=>n+(values[i+1][a]-n)*u);
  let difference;if(track.property==='rotation'){const q=eulerToQuat(v),dot=Math.abs(q.reduce((n,x,a)=>n+x*expected[a],0));difference=2*Math.acos(Math.min(1,dot));if(difference>Math.PI/1800)throw fail('AUTHORING_FBX_ANIMATION_TOLERANCE','Rotation bake exceeds 0.1 degrees.');}
  else{difference=Math.max(...v.map((n,a)=>Math.abs((track.property==='weight'?n/100:n)-expected[a])));if(difference>(track.property==='scale'?.0001:.001))throw fail('AUTHORING_FBX_ANIMATION_TOLERANCE','Animation bake exceeds source-space tolerance.');}}
 return {times,values,baked};
}
