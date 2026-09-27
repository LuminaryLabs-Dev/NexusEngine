import {test} from 'node:test';import assert from 'node:assert/strict';
import {newEngine,building} from '../fixtures/authoring-assets.mjs';
for(const animated of [false,true])for(const format of ['glb','fbx','usdz'])test(`${format} ${animated?'rig/skin/morph/animation':'textured multi-material 12-triangle building'} native round trip`,async()=>{
 const e=building(newEngine(),{animated}),source=e.n.authoringProject.getSnapshot();
 let result;try{result=await e.n.authoringExport.export({format,assemblyId:'scene'});}catch(error){console.dir(error.details,{depth:8});throw error;}
 assert.equal(result.validation.errors,0);assert.deepEqual(e.n.authoringProject.getSnapshot(),source);
 const fresh=newEngine();let loaded;try{loaded=await fresh.n.authoringImport.import({requestId:'read',prefix:'roundtrip',format,bytes:result.bytes,resources:result.resources});}catch(error){console.dir(error.details,{depth:8});throw error;}
 const packet=fresh.n.authoringPublishing.prepare({assemblyId:loaded.assemblyId});
 assert.equal(packet.meshes.reduce((n,m)=>n+m.indices.length/3,0),12);
 const node=packet.assembly.nodes.find(n=>n.meshId);assert.equal(node.materials.length,2);assert.equal(packet.images.length>=3,true);
 const groups=packet.meshes[0].groups;assert.deepEqual([...new Set(groups.map(g=>g.material))].sort(),[0,1]);
 assert.equal(packet.assembly.cameras.length,1);assert.equal(packet.assembly.lights.length,1);
 if(animated){assert.equal(packet.rigs.length,1);assert.equal(packet.rigs[0].bones.length,2);assert.equal(packet.skins.length,1);assert.equal(packet.shapes[0].keys.length,1);assert.equal(packet.animations.length,1);assert.equal(packet.animations[0].clips[0].duration,1);}
 assert.equal(fresh.n.authoringValidation.project().errors,0);
});
import {pointsAt,pointCloudError} from '../fixtures/authoring-assets.mjs';
for(const format of ['glb','fbx','usdz'])test(`${format} preserves sampled world-space skin + morph deformation`,async()=>{
 const source=building(newEngine(),{animated:true}),artifact=await source.n.authoringExport.export({format,assemblyId:'scene'}),fresh=newEngine();
 const imported=await fresh.n.authoringImport.import({requestId:'deformed',prefix:'poses',format,bytes:artifact.bytes,resources:artifact.resources});
 for(const t of [0,.125,.25,.5,.75,1]){const error=pointCloudError(pointsAt(source,'scene',t),pointsAt(fresh,imported.assemblyId,t));console.log(JSON.stringify({proof:'native-pose-sample',format,time:t,maxWorldPointError:error}));assert.ok(error<.001,`${format} t=${t} error=${error}`);}
});
