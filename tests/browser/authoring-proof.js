import {newEngine,building,pointsAt,pointCloudError} from '../fixtures/authoring-assets.mjs';
import * as THREE from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
window.proof={state:'running',tests:[],errors:[]};
const check=(name,passed,details={})=>{const result={name,passed,...details};window.proof.tests.push(result);if(!passed)throw Error(name+': '+JSON.stringify(details));};
try {
 const engine=building(newEngine(),{animated:true}),target={storage:'indexeddb',path:'sandbox-'+crypto.randomUUID()},saved=await engine.n.authoringPersistence.save({requestId:'browser-save',target,expectedGeneration:0});
 check('IndexedDB save',saved.generation===1);
 const restored=newEngine();await restored.n.authoringPersistence.load({source:target});
 const original=engine.n.authoringProject.getSnapshot(),snapshot=restored.n.authoringProject.getSnapshot();
 check('IndexedDB source/history restoration',JSON.stringify(Object.values(original.documents).map(d=>d.content))===JSON.stringify(Object.values(snapshot.documents).map(d=>d.content))&&original.undo.length===snapshot.undo.length);
 let rejected=false;try{await restored.n.authoringPersistence.save({requestId:'conflict',target,expectedGeneration:0});}catch(e){rejected=e.code==='AUTHORING_STORAGE_CONFLICT';}check('IndexedDB stale generation',rejected);
 for(const format of ['glb','fbx','usdz']){const r=await restored.n.authoringExport.export({format,assemblyId:'scene'});check('Browser '+format+' encoder',r.validation.errors===0,{bytes:r.bytes.length});}
 await new Promise((resolve,reject)=>{const request=indexedDB.open('nexusengine-authoring',1);request.onsuccess=()=>{const db=request.result,tx=db.transaction('projects','readwrite');tx.objectStore('projects').delete(target.path);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};request.onerror=()=>reject(request.error);});
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1100,800);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 document.querySelector('#preview').appendChild(renderer.domElement);const scene=new THREE.Scene();scene.background=new THREE.Color('#111925');
 const camera=new THREE.PerspectiveCamera(40,1100/800,.01,100);camera.position.set(4.8,3.3,5.8);camera.lookAt(1.25,.1,-.5);
 const hemi=new THREE.HemisphereLight('#dceaff','#5b5043',2);scene.add(hemi);const sun=new THREE.DirectionalLight('#fff1d7',3);sun.position.set(4,7,5);scene.add(sun);
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:'#242f3a',roughness:1}));plane.rotation.x=-Math.PI/2;plane.position.y=-1.04;scene.add(plane);
 let asset=null,mixer=null;
 window.renderArtifact=async(name,time=0)=>{
  if(asset)scene.remove(asset);const gltf=await new GLTFLoader().loadAsync(`/artifacts/${name}/${name}.glb`);asset=gltf.scene;scene.add(asset);
  const expected=await (await fetch(`/artifacts/${name}/expected.json`)).json();
  mixer=new THREE.AnimationMixer(asset);for(const clip of gltf.animations)mixer.clipAction(clip).play();mixer.setTime(time);asset.updateMatrixWorld(true);
  let triangles=0,textures=0,skins=0,morphs=0;const points=[],materials=new Set();
  asset.traverse(o=>{if(!o.isMesh)return;o.updateMatrixWorld(true);if(o.isSkinnedMesh){o.skeleton.update();skins++;}if(o.morphTargetInfluences?.length)morphs++;const geo=o.geometry;triangles+=(geo.index?geo.index.count:geo.attributes.position.count)/3;
   for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);if(m.map)textures++;}
   for(let i=0;i<geo.attributes.position.count;i++){const v=new THREE.Vector3();o.getVertexPosition(i,v);v.applyMatrix4(o.matrixWorld);points.push(v.toArray());}
  });
  const maxError=pointCloudError(expected.points[String(time)],points);check(`Independent GLTFLoader ${name} t=${time}`,triangles===12&&maxError<.001,{triangles,materialCount:materials.size,texturedMeshes:textures,skins,morphs,maxWorldPointError:maxError});
  document.querySelector('#heading').textContent=name==='building'?'Textured building':'Skin + morph animation';document.querySelector('#detail').textContent=`Actual GLB bytes | Three.js GLTFLoader | 12 triangles | t=${time.toFixed(3)}`;
  renderer.render(scene,camera);await new Promise(r=>requestAnimationFrame(r));return window.proof.tests.at(-1);
 };
 await window.renderArtifact('building',0);for(const t of [0,.125,.25,.5,.75])await window.renderArtifact('animated-building',t);
 window.proof.state='passed';
}catch(error){window.proof.state='failed';window.proof.errors.push({message:error.message,stack:error.stack});console.error(error);}
