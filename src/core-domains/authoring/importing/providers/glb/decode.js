import {append} from '../../../contracts/io.js';
import { asBytes, text, resource, fail, issue, abort } from '../../../contracts/io.js';
import { identityMatrix, normalizeTransform, multiplyMatrix, inverseMatrix, transformMatrix } from '../../../contracts/transforms.js';
import { decodePNG } from '../../../publishing/export/codecs/png.js';
const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};
export function parseGLB(input){
 const bytes=asBytes(input),v=new DataView(bytes.buffer,bytes.byteOffset,bytes.length);
 if(bytes.length<20||v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==bytes.length)throw fail('AUTHORING_GLTF','Invalid GLB header/length/version.');
 let p=12,gltf=null,binary=null;
 while(p<bytes.length){if(p+8>bytes.length)throw fail('AUTHORING_GLTF','Truncated GLB chunk.');const length=v.getUint32(p,true),type=v.getUint32(p+4,true);p+=8;
  if(length%4||p+length>bytes.length)throw fail('AUTHORING_GLTF','Invalid GLB chunk length.');
  if(type===0x4e4f534a){if(gltf||p!==20)throw fail('AUTHORING_GLTF','JSON must be first and unique.');gltf=JSON.parse(text(bytes.subarray(p,p+length)));}
  else if(type===0x004e4942){if(binary)throw fail('AUTHORING_GLTF','Duplicate binary chunk.');binary=bytes.slice(p,p+length);}p+=length;
 }
 if(gltf?.asset?.version!=='2.0')throw fail('AUTHORING_GLTF','Expected glTF 2.0 asset.');return {gltf,binary};
}
export function decompose(m){
 if(!Array.isArray(m)||m.length!==16||m.some(n=>!Number.isFinite(n))||[3,7,11].some(i=>Math.abs(m[i])>1e-8)||Math.abs(m[15]-1)>1e-8)throw fail('AUTHORING_IMPORT_TRANSFORM','Expected affine matrix.');
 const det=m[0]*(m[5]*m[10]-m[9]*m[6])-m[4]*(m[1]*m[10]-m[9]*m[2])+m[8]*(m[1]*m[6]-m[5]*m[2]);
 const s=[Math.hypot(m[0],m[1],m[2])*(det<0?-1:1),Math.hypot(m[4],m[5],m[6]),Math.hypot(m[8],m[9],m[10])];if(s.some(x=>Math.abs(x)<1e-6))throw fail('AUTHORING_IMPORT_TRANSFORM','Singular transform.');
 const r=[m[0]/s[0],m[4]/s[1],m[8]/s[2],m[1]/s[0],m[5]/s[1],m[9]/s[2],m[2]/s[0],m[6]/s[1],m[10]/s[2]],trace=r[0]+r[4]+r[8];let q;
 if(trace>0){const t=Math.sqrt(trace+1)*2;q=[(r[7]-r[5])/t,(r[2]-r[6])/t,(r[3]-r[1])/t,t/4];}
 else if(r[0]>r[4]&&r[0]>r[8]){const t=Math.sqrt(1+r[0]-r[4]-r[8])*2;q=[t/4,(r[1]+r[3])/t,(r[2]+r[6])/t,(r[7]-r[5])/t];}
 else if(r[4]>r[8]){const t=Math.sqrt(1+r[4]-r[0]-r[8])*2;q=[(r[1]+r[3])/t,t/4,(r[5]+r[7])/t,(r[2]-r[6])/t];}
 else{const t=Math.sqrt(1+r[8]-r[0]-r[4])*2;q=[(r[2]+r[6])/t,(r[5]+r[7])/t,t/4,(r[3]-r[1])/t];}
 const result=normalizeTransform({translation:m.slice(12,15),rotation:q,scale:s}),test=transformMatrix(result);
 if(test.some((n,i)=>Math.abs(n-m[i])>1e-6*Math.max(1,Math.abs(m[i]))))throw fail('AUTHORING_IMPORT_TRANSFORM','Sheared transforms require explicit baking; no silent approximation.');return result;
}
export async function decodeGLB(input,{resources={},signal}={}){
 abort(signal);const {gltf:g,binary}=parseGLB(input),warnings=[];
 const supported=new Set(['KHR_lights_punctual']);for(const name of g.extensionsRequired??[])if(!supported.has(name))throw fail('AUTHORING_GLTF_EXTENSION',`Required extension ${name} is unsupported.`);
 const buffers=(g.buffers??[]).map((b,i)=>{const data=b.uri?resource(b.uri,resources):i===0?binary:null;if(!data||!Number.isSafeInteger(b.byteLength)||b.byteLength<0||data.length<b.byteLength)throw fail('AUTHORING_GLTF_BUFFER','Missing/truncated buffer.');return data;});
 function bufferView(index){const b=g.bufferViews?.[index];if(!b)throw fail('AUTHORING_GLTF_BUFFER','Missing buffer view.');const buffer=buffers[b.buffer],start=b.byteOffset??0;
  if(!buffer||!Number.isSafeInteger(start)||start<0||!Number.isSafeInteger(b.byteLength)||b.byteLength<0||start+b.byteLength>buffer.length)throw fail('AUTHORING_GLTF_BUFFER','Invalid buffer view bounds.');return {bytes:buffer.subarray(start,start+b.byteLength),descriptor:b};}
 const accessorCache=new Map();
 function accessor(index){
  if(accessorCache.has(index))return accessorCache.get(index);const a=g.accessors?.[index],width=widths[a?.type],size={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}[a?.componentType];
  if(!a||!width||!size||!Number.isSafeInteger(a.count)||a.count<1||a.count>4000000)throw fail('AUTHORING_GLTF_ACCESSOR','Invalid accessor.');
  if(a.type.startsWith('MAT')&&a.componentType!==5126)throw fail('AUTHORING_GLTF_ACCESSOR','Integer matrix accessor is unsupported.');
  const values=Array(a.count*width).fill(0),method={5120:'getInt8',5121:'getUint8',5122:'getInt16',5123:'getUint16',5125:'getUint32',5126:'getFloat32'}[a.componentType];
  const normalize=n=>!a.normalized?n:a.componentType===5120?Math.max(n/127,-1):a.componentType===5122?Math.max(n/32767,-1):n/({5121:255,5123:65535,5125:4294967295}[a.componentType]??1);
  if(a.bufferView!==undefined){const b=bufferView(a.bufferView),offset=a.byteOffset??0,stride=b.descriptor.byteStride??width*size;
    if(!Number.isSafeInteger(offset)||offset<0||offset%size||!Number.isInteger(stride)||stride<width*size||stride%size||offset+(a.count-1)*stride+width*size>b.bytes.length)throw fail('AUTHORING_GLTF_ACCESSOR','Accessor exceeds view bounds.');
    const view=new DataView(b.bytes.buffer,b.bytes.byteOffset,b.bytes.length);for(let i=0;i<a.count;i++)for(let c=0;c<width;c++)values[i*width+c]=normalize(view[method](offset+i*stride+c*size,true));}
  if(a.sparse){const s=a.sparse;if(!Number.isSafeInteger(s.count)||s.count<1||s.count>a.count||![5121,5123,5125].includes(s.indices.componentType))throw fail('AUTHORING_GLTF_ACCESSOR','Invalid sparse accessor.');
    const ib=bufferView(s.indices.bufferView).bytes,vb=bufferView(s.values.bufferView).bytes,is={5121:1,5123:2,5125:4}[s.indices.componentType],io=s.indices.byteOffset??0,vo=s.values.byteOffset??0;
    if(io<0||vo<0||io+s.count*is>ib.length||vo+s.count*width*size>vb.length)throw fail('AUTHORING_GLTF_ACCESSOR','Sparse accessor out of bounds.');const iv=new DataView(ib.buffer,ib.byteOffset,ib.length),vv=new DataView(vb.buffer,vb.byteOffset,vb.length);let prior=-1;
    for(let i=0;i<s.count;i++){const ix=iv[{1:'getUint8',2:'getUint16',4:'getUint32'}[is]](io+i*is,true);if(ix<=prior||ix>=a.count)throw fail('AUTHORING_GLTF_ACCESSOR','Sparse indices must increase.');prior=ix;for(let c=0;c<width;c++)values[ix*width+c]=normalize(vv[method](vo+(i*width+c)*size,true));}}
  if(values.some(n=>!Number.isFinite(n)))throw fail('AUTHORING_GLTF_ACCESSOR','Non-finite accessor data.');accessorCache.set(index,values);return values;
 }
 const scene={meshes:[],materials:[],images:[],nodes:[],rigs:[],skins:[],shapes:[],animations:[],cameras:[],lights:[],warnings},imageCache=new Map();
 async function binding(t,role){if((t.texCoord??0)!==0||t.extensions?.KHR_texture_transform)throw fail('AUTHORING_GLTF_UV_PROFILE','The current source binding profile supports UV0 without texture transforms.');
  const texture=g.textures?.[t.index],image=g.images?.[texture?.source];if(!image)throw fail('AUTHORING_GLTF_TEXTURE','Missing texture or image.');
  const space=['baseColor','emissive'].includes(role)?'srgb':'linear',key=`${texture.source}-${space}`;
  if(!imageCache.has(key)){const bytes=image.uri?resource(image.uri,resources):bufferView(image.bufferView).bytes;const pixels=await decodePNG(bytes);scene.images.push({id:key,pixels,colorSpace:space});imageCache.set(key,true);}
  const sampler=g.samplers?.[texture.sampler]??{};const wrap=n=>({10497:'REPEAT',33071:'CLAMP_TO_EDGE',33648:'MIRRORED_REPEAT'}[n??10497]);if(!wrap(sampler.wrapS)||!wrap(sampler.wrapT))throw fail('AUTHORING_GLTF_SAMPLER','Invalid sampler wrap.');
  if(sampler.minFilter&&![9728,9729].includes(sampler.minFilter))warnings.push(issue('MIP_FILTER_NORMALIZED','Source sampler stores base filter; mip selection remains a delivery concern.','warning'));
  return {imageId:key,uvSet:0,wrapS:wrap(sampler.wrapS),wrapT:wrap(sampler.wrapT),magFilter:sampler.magFilter===9728?'NEAREST':'LINEAR',minFilter:[9728,9984,9986].includes(sampler.minFilter)?'NEAREST':'LINEAR'};
 }
 for(let i=0;i<(g.materials??[]).length;i++){const m=g.materials[i],p=m.pbrMetallicRoughness??{},out={baseColor:p.baseColorFactor??[1,1,1,1],metallic:p.metallicFactor??1,roughness:p.roughnessFactor??1,emissive:m.emissiveFactor??[0,0,0],alphaMode:m.alphaMode??'OPAQUE',alphaCutoff:m.alphaCutoff??.5,doubleSided:m.doubleSided??false,normalScale:m.normalTexture?.scale??1,occlusionStrength:m.occlusionTexture?.strength??1,textures:{}};
  if(m.extensions&&Object.keys(m.extensions).length)throw fail('AUTHORING_GLTF_MATERIAL_PROFILE','Material extensions require an explicit conversion profile.');
  for(const [role,t]of Object.entries({baseColor:p.baseColorTexture,metallicRoughness:p.metallicRoughnessTexture,normal:m.normalTexture,occlusion:m.occlusionTexture,emissive:m.emissiveTexture}))if(t)out.textures[role]=await binding(t,role);
  scene.materials.push({id:`m${i}`,pbr:out});}
 const parents=new Map(),included=new Set(),worlds=new Map(),active=new Set();
 function visit(i,parent=null,world=identityMatrix()){
  const n=g.nodes?.[i];if(!n||active.has(i)||parents.has(i))throw fail('AUTHORING_GLTF_HIERARCHY','Invalid/cyclic or multiply parented node.');
  if(included.size>100000)throw fail('AUTHORING_IMPORT_BUDGET','Node budget exceeded.');active.add(i);included.add(i);parents.set(i,parent);
  const transform=n.matrix?decompose(n.matrix):normalizeTransform({translation:n.translation??[0,0,0],rotation:n.rotation??[0,0,0,1],scale:n.scale??[1,1,1]}),matrix=multiplyMatrix(world,transformMatrix(transform));worlds.set(i,matrix);
  scene.nodes.push({id:`n${i}`,name:n.name??`Node ${i}`,parent:parent===null?null:`n${parent}`,transform,materials:[],animationIds:[]});for(const child of n.children??[])visit(child,i,matrix);active.delete(i);
 }
 const roots=g.scenes?.[g.scene??0]?.nodes;if(!Array.isArray(roots))throw fail('AUTHORING_GLTF_SCENE','Default scene missing.');for(const i of roots)visit(i);
 const nodesById=new Map(scene.nodes.map(n=>[n.id,n]));
 for(const i of included){abort(signal);const src=g.nodes[i],node=nodesById.get(`n${i}`);
  if(src.mesh!==undefined){const original=g.meshes?.[src.mesh];if(!original?.primitives?.length)throw fail('AUTHORING_GLTF_MESH','Missing mesh.');
   const out={id:`mesh${i}`,positions:[],normals:[],uvs:[],colors:[],indices:[],materialIndices:[],joints:[],weights:[]},shapes=[];
   for(const p of original.primitives){if((p.mode??4)!==4||p.extensions?.KHR_draco_mesh_compression)throw fail('AUTHORING_GLTF_PRIMITIVE','Only uncompressed triangles are supported.');
    const attrs=p.attributes,positions=accessor(attrs.POSITION),count=positions.length/3,base=out.positions.length/3;
    const indices=p.indices===undefined?Array.from({length:count},(_,i)=>i):accessor(p.indices);if(indices.length%3||indices.some(x=>!Number.isSafeInteger(x)||x<0||x>=count))throw fail('AUTHORING_GLTF_INDICES','Invalid triangle indices.');
    append(out.positions,positions);for(const [name,key,width,defaultValue]of [['NORMAL','normals',3,[0,1,0]],['TEXCOORD_0','uvs',2,[0,0]],['COLOR_0','colors',4,[1,1,1,1]],['JOINTS_0','joints',4,[0,0,0,0]],['WEIGHTS_0','weights',4,[1,0,0,0]]]){
      let values=attrs[name]===undefined?Array.from({length:count},()=>defaultValue).flat():accessor(attrs[name]);if(name==='COLOR_0'&&values.length===count*3)values=Array.from({length:count},(_,j)=>[...values.slice(j*3,j*3+3),1]).flat();if(values.length!==count*width)throw fail('AUTHORING_GLTF_ATTRIBUTE','Attribute count mismatch.');append(out[key],values);}
    append(out.indices,indices.map(n=>n+base));const material=p.material===undefined?'default':`m${p.material}`;
    if(material==='default'&&!scene.materials.some(m=>m.id==='default'))scene.materials.push({id:'default',pbr:{baseColor:[1,1,1,1],metallic:1,roughness:1,textures:{}}});
    if(!scene.materials.some(m=>m.id===material))throw fail('AUTHORING_GLTF_MATERIAL','Missing material.');let slot=node.materials.indexOf(material);if(slot<0){slot=node.materials.length;node.materials.push(material);}append(out.materialIndices,Array(indices.length/3).fill(slot));
    for(let k=0;k<(p.targets??[]).length;k++){const t=p.targets[k];if(!shapes[k])shapes[k]={id:`shape${k}`,weight:src.weights?.[k]??original.weights?.[k]??0,deltas:Array(base*3).fill(0)};append(shapes[k].deltas,(t.POSITION===undefined?Array(count*3).fill(0):accessor(t.POSITION)));}
   }
   // Normals are currently regenerated by the mesh evaluator; this is explicit, not a preservation claim.
   warnings.push(issue('IMPORTED_NORMALS_REEVALUATED','Imported source uses canonical Authoring normal generation.','warning',{meshId:out.id}));
   scene.meshes.push(out);node.meshId=out.id;
   if(shapes.length){if(shapes.some(s=>s.deltas.length!==out.positions.length))throw fail('AUTHORING_GLTF_MORPH','All primitives must have matching morph targets.');node.shapeId=`shapes${i}`;scene.shapes.push({id:node.shapeId,meshId:out.id,keys:shapes});}
   if(src.skin!==undefined){const s=g.skins?.[src.skin];if(!s?.joints?.length||s.joints.length>512)throw fail('AUTHORING_GLTF_SKIN','Invalid skin.');
    const jointSet=new Set(s.joints),bones=s.joints.map(j=>{const parent=parents.get(j);if(!worlds.has(j))throw fail('AUTHORING_GLTF_SKIN','Joint is outside the selected scene.');
      const boneParent=jointSet.has(parent)?parent:null,rest=boneParent===null?decompose(multiplyMatrix(inverseMatrix(worlds.get(i)),worlds.get(j))):g.nodes[j].matrix?decompose(g.nodes[j].matrix):normalizeTransform({translation:g.nodes[j].translation??[0,0,0],rotation:g.nodes[j].rotation??[0,0,0,1],scale:g.nodes[j].scale??[1,1,1]});
      return {id:`j${j}`,name:g.nodes[j].name??`Joint ${j}`,parent:boneParent===null?null:`j${boneParent}`,rest,length:1};});
    const matrices=s.inverseBindMatrices!==undefined?accessor(s.inverseBindMatrices):s.joints.flatMap(()=>identityMatrix());if(matrices.length!==s.joints.length*16)throw fail('AUTHORING_GLTF_SKIN','Inverse bind count mismatch.');
    node.rigId=`rig${i}`;node.skinId=`skin${i}`;scene.rigs.push({id:node.rigId,bones});
    const weights=Array.from({length:out.positions.length/3},(_,v)=>{const row=[];for(let k=0;k<4;k++){const w=out.weights[v*4+k],j=out.joints[v*4+k];if(w>0){if(!s.joints[j]){if(s.joints[j]!==0)throw fail('AUTHORING_GLTF_SKIN','Joint index outside skin.');}row.push({boneId:`j${s.joints[j]}`,weight:w});}}const sum=row.reduce((n,x)=>n+x.weight,0);if(sum<=0)throw fail('AUTHORING_GLTF_SKIN','Unweighted vertex.');return row.map(x=>({...x,weight:x.weight/sum}));});
    // glTF inverse binds are relative to the mesh bind space; root rest transforms above use that same space.
    scene.skins.push({id:node.skinId,rigId:node.rigId,meshId:out.id,weights,meshBindMatrix:identityMatrix(),inverseBindMatrices:Object.fromEntries(s.joints.map((j,k)=>[`j${j}`,matrices.slice(k*16,k*16+16)]))});
   }
  }
  if(src.camera!==undefined){const c=g.cameras?.[src.camera];if(c?.type!=='perspective'||!c.perspective.zfar)throw fail('AUTHORING_GLTF_CAMERA','Source profile requires finite perspective cameras.');scene.cameras.push({id:`camera${i}`,nodeId:node.id,yfov:c.perspective.yfov,near:c.perspective.znear,far:c.perspective.zfar});}
  const li=src.extensions?.KHR_lights_punctual?.light;if(li!==undefined){const l=g.extensions?.KHR_lights_punctual?.lights?.[li];if(!l)throw fail('AUTHORING_GLTF_LIGHT','Missing light.');scene.lights.push({id:`light${i}`,nodeId:node.id,type:l.type,color:l.color??[1,1,1],intensity:l.intensity??1,...(l.range?{range:l.range}:{})});}
 }
 for(let ai=0;ai<(g.animations??[]).length;ai++){
  const animation=g.animations[ai],claimed=new Set();
  for(const node of scene.nodes.filter(n=>n.meshId&&(n.rigId||n.shapeId))){const rig=scene.rigs.find(r=>r.id===node.rigId),shape=scene.shapes.find(s=>s.id===node.shapeId),tracks=[];
   for(let ci=0;ci<animation.channels.length;ci++){const c=animation.channels[ci],target=`j${c.target.node}`,isWeight=c.target.path==='weights'&&node.id===`n${c.target.node}`;
    if(!isWeight&&!rig?.bones.some(b=>b.id===target))continue;claimed.add(ci);const sampler=animation.samplers[c.sampler],times=accessor(sampler.input),values=accessor(sampler.output),interpolation=sampler.interpolation??'LINEAR',factor=interpolation==='CUBICSPLINE'?3:1;
    if(isWeight){const width=shape?.keys.length??0;if(!width||values.length!==times.length*width*factor)throw fail('AUTHORING_GLTF_ANIMATION','Morph sampler width mismatch.');
     for(let k=0;k<width;k++){const keys=times.map((time,j)=>{const base=j*width*factor;return {time,value:[values[base+(factor===3?width:0)+k]],...(factor===3?{inTangent:[values[base+k]],outTangent:[values[base+width*2+k]]}:{})};});tracks.push({id:`c${ci}-${k}`,target:shape.keys[k].id,property:'weight',interpolation,keys});}}
    else{const width=c.target.path==='rotation'?4:3;if(values.length!==times.length*width*factor)throw fail('AUTHORING_GLTF_ANIMATION','TRS sampler width mismatch.');tracks.push({id:`c${ci}`,target,property:c.target.path,interpolation,keys:times.map((time,j)=>{const base=j*width*factor;return {time,value:values.slice(base+(factor===3?width:0),base+(factor===3?width*2:width)),...(factor===3?{inTangent:values.slice(base,base+width),outTangent:values.slice(base+width*2,base+width*3)}:{})};})});}
   }
   if(tracks.length){const id=`animation${ai}-${node.id}`;node.animationIds.push(id);scene.animations.push({id,rigId:node.rigId??null,shapeId:node.shapeId??null,clips:[{id:`clip${ai}`,name:animation.name??`Clip ${ai}`,duration:Math.max(...tracks.flatMap(t=>t.keys.map(k=>k.time))),tracks}]});}
  }
  if(claimed.size!==animation.channels.length)throw fail('AUTHORING_GLTF_ANIMATION_PROFILE','Source currently supports skeletal/morph tracks, not arbitrary object animation.');
 }
 abort(signal);return scene;
}
