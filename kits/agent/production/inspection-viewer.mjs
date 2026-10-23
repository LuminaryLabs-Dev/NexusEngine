import * as THREE from 'three';
import { GLTFLoader } from '/three/GLTFLoader.js';
const { times, mode, focus, view, camera: suppliedCamera, selection } = window.inspectionOptions;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x243440);
scene.add(new THREE.HemisphereLight(0xf4f8ff,0x657078,2));
const key=new THREE.DirectionalLight(0xffe7cc,3);key.position.set(4,7,5);scene.add(key);
const fill=new THREE.DirectionalLight(0xb8e1ff,1.8);fill.position.set(-4,2,-3);scene.add(fill);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1200,800);renderer.setPixelRatio(1);document.body.prepend(renderer.domElement);
const gltf=await new GLTFLoader().loadAsync('/asset.glb');scene.add(gltf.scene);
const sourceId=o=>{const association=gltf.parser.associations.get(o);return association?.meshes!==undefined?(gltf.parser.json.meshes[association.meshes].name??o.name):o.name.replace(/_geometry$/,'');};
const matches=(o,id)=>sourceId(o)===id||o.name===id||o.name===id+'_geometry';
const meshes=[];gltf.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
for(const id of focus)if(!meshes.some(o=>matches(o,id)))throw Error('Unknown focus mesh '+id);
for(const o of meshes)o.visible=!focus.length||focus.some(id=>matches(o,id));
const overlay=selection?new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0xffcc22,size:7,depthTest:false})):null;if(overlay){overlay.renderOrder=100;scene.add(overlay);}
function overlayPose(){if(!selection)return;const positions=[];for(const o of meshes.filter(o=>o.visible&&matches(o,selection.meshId))){const attr=o.geometry.attributes.position;for(let i=0;i<attr.count;i++){const v=new THREE.Vector3().fromBufferAttribute(attr,i);if(selection.vertices.some(p=>v.distanceTo(new THREE.Vector3(...p.position))<1e-5)){const point=o.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(o.matrixWorld);positions.push(...point.toArray());}}}if(!positions.length)throw Error('Selected vertices are not visible in this assembly/focus.');overlay.geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));}
const mixer=new THREE.AnimationMixer(gltf.scene);const actions=gltf.animations.map(clip=>{const a=mixer.clipAction(clip).setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;return a;});
if(mode==='wireframe')gltf.scene.traverse(o=>{if(o.isMesh){const wire=m=>{const c=m.clone();c.wireframe=true;return c;};o.material=Array.isArray(o.material)?o.material.map(wire):wire(o.material);}});
if(mode==='normals')for(const o of meshes)o.material=new THREE.MeshNormalMaterial({flatShading:true});
function posed(time){for(const a of actions)a.reset().play();mixer.setTime(time);scene.updateMatrixWorld(true);gltf.scene.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update();});}
function metrics(){const meshes=[];gltf.scene.traverse(o=>{if(!o.isMesh||!o.visible)return;const count=o.geometry.attributes.position.count,bounds=new THREE.Box3(),samples=[],unique=new Map();
 const used=o.geometry.index?[...new Set(o.geometry.index.array)]:Array.from({length:count},(_,i)=>i);for(const i of used){const v=o.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(o.matrixWorld);bounds.expandByPoint(v);if(i<32)samples.push(v.toArray());if(unique.size<=2000)unique.set(v.toArray().map(n=>n.toFixed(9)).join(),v.toArray());}
 meshes.push({name:o.name,sourceMeshId:sourceId(o),vertexCount:used.length,triangles:(o.geometry.index?.count??count)/3,skinned:o.isSkinnedMesh===true,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},samples,witnesses:[...unique.values()].slice(0,2000),witnessesComplete:unique.size<=2000});});return {meshes,clips:gltf.animations.map(c=>({name:c.name,duration:c.duration}))};}
const union=new THREE.Box3();for(const t of times){posed(t);for(const m of metrics().meshes){union.expandByPoint(new THREE.Vector3(...m.bounds.min));union.expandByPoint(new THREE.Vector3(...m.bounds.max));}}
if(union.isEmpty())throw Error('No visible geometry in assembly.');
const center=suppliedCamera?new THREE.Vector3(...suppliedCamera.center):union.getCenter(new THREE.Vector3()),size=union.getSize(new THREE.Vector3()),span=suppliedCamera?.span??Math.max(size.x,size.y,size.z)*1.65;
window.inspectionCamera={center:center.toArray(),span};
const directions=[[0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[0,1,0],[1,.65,1.1]];
const cameras=directions.map((d,i)=>{const camera=new THREE.OrthographicCamera(-span*(view?.75:.5),span*(view?.75:.5),span*.5,-span*.5,.001,span*10);camera.position.copy(center).add(new THREE.Vector3(...d).normalize().multiplyScalar(span*3));if(i===4)camera.up.set(0,0,-1);camera.lookAt(center);return camera;});
window.inspectPose=time=>{posed(time);overlayPose();renderer.setScissorTest(true);const indexes=view?[['front','back','right','left','top','oblique'].indexOf(view)]:[0,1,2,3,4,5];for(const i of indexes){const x=view?0:(i%3)*400,y=view?0:(1-Math.floor(i/3))*400;renderer.setViewport(x,y,view?1200:400,view?800:400);renderer.setScissor(x,y,view?1200:400,view?800:400);renderer.render(scene,cameras[i]);renderer.getContext().finish();}
 document.getElementById('caption').textContent=`${mode} · ${time.toFixed(3)} s · fixed framing across poses · ${gltf.animations.length} animation clip(s)`;return metrics();};
window.inspectPose(times[0]);window.inspectionReady=true;

// Read back rendered pixels directly; avoid compositor screenshots returning an unpresented white surface.
window.inspectionPng=()=>{
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=800;const ctx=canvas.getContext('2d');ctx.drawImage(renderer.domElement,0,0);
 const pixels=ctx.getImageData(0,0,1200,800).data;let white=0,opaque=0;const colors=new Set();for(let i=0;i<pixels.length;i+=4){if(pixels[i]>245&&pixels[i+1]>245&&pixels[i+2]>245)white++;if(pixels[i+3]>250)opaque++;if(i%64===0)colors.add([pixels[i]>>3,pixels[i+1]>>3,pixels[i+2]>>3].join());}
 if(white>1200*800*.97||opaque<1200*800*.99||colors.size<2)throw Error('Blank inspection pixel readback rejected: white='+white+', opaque='+opaque+', colors='+colors.size);
 ctx.font='15px system-ui';ctx.fillStyle='#eef3f5';ctx.shadowColor='#17242e';ctx.shadowBlur=3;
 const labels=view?[view]:['Front','Back','Right','Left','Top','Oblique (ortho)'];labels.forEach((label,i)=>ctx.fillText(label,view?12:(i%3)*400+12,view?26:Math.floor(i/3)*400+26));
 ctx.font='12px system-ui';ctx.fillText(document.getElementById('caption').textContent,12,785);return canvas.toDataURL('image/png').split(',')[1];
};
