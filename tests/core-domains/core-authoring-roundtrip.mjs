import {test} from 'node:test';import assert from 'node:assert/strict';
import {newEngine,building} from '../fixtures/authoring-assets.mjs';
import {decodeFBXTree} from '../../src/core-domains/authoring/publishing/export/codecs/fbx-binary.js';
test('FBX re-import retains authored corner normals',async()=>{
 const source=building(newEngine(),{animated:false}),before=source.n.authoringPublishing.prepare({assemblyId:'scene'}).meshes[0];
 const artifact=await source.n.authoringExport.export({format:'fbx',assemblyId:'scene'}),target=newEngine();
 const imported=await target.n.authoringImport.import({requestId:'normal-roundtrip',prefix:'normals',format:'fbx',bytes:artifact.bytes,resources:artifact.resources});
 const after=target.n.authoringPublishing.prepare({assemblyId:imported.assemblyId}).meshes[0];
 assert.equal(after.normals.length,before.normals.length);
 for(let i=0;i<before.normals.length;i++)assert.ok(Math.abs(after.normals[i]-before.normals[i])<1e-6,`normal component ${i}`);
 assert.ok(!imported.warnings?.some(w=>w.code==='IMPORTED_NORMALS_REEVALUATED'));
});
test('FBX property values use the declared integer and time types',async()=>{
 const e=building(newEngine(),{animated:true}),artifact=await e.n.authoringExport.export({format:'fbx',assemblyId:'scene'}),bytes=Buffer.from(artifact.bytes);
 const stringProperty=s=>{const b=Buffer.from(s),header=Buffer.alloc(5);header.write('S');header.writeUInt32LE(b.length,1);return Buffer.concat([header,b]);};
 for(const [name,type,tag] of [['InheritType','enum','I'],['UpAxis','int','I'],['LocalStop','KTime','L']]){
  const prefix=Buffer.concat([stringProperty(name),stringProperty(type),stringProperty(''),stringProperty('A')]),at=bytes.indexOf(prefix);
  assert.notEqual(at,-1,`missing ${name}`);assert.equal(String.fromCharCode(bytes[at+prefix.length]),tag,`${name} property type`);
 }
 const footer=bytes.lastIndexOf(Buffer.from('fabcab09d0c8d466b176fb831cf7267e','hex'));
 assert.ok(footer>=0,'missing FBX footer');
 const after=footer+16,aligned=after+(16-after%16);
 assert.ok(bytes.subarray(after,aligned+4).every(b=>b===0),'FBX footer padding');
 assert.equal(bytes.readUInt32LE(aligned+4),7400,'FBX footer version follows padding and reserved bytes');
 const tree=await decodeFBXTree(bytes),root=Object.fromEntries(tree.nodes.map(n=>[n.name,n]));
 assert.equal(root.FileId.props[0].length,16);assert.equal(root.CreationTime.props[0],'1970-01-01 10:00:00:000');
 assert.ok(root.References);assert.ok(root.FBXHeaderExtension.children.some(n=>n.name==='EncryptionType'&&n.props[0]===0));
});
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

test('ASCII FBX container preserves source array precision and enforces syntax budgets',async()=>{
 const ascii=`; FBX 7.5.0 project file
FBXHeaderExtension: {
 FBXVersion: 7500
}
Objects: {
 Geometry: 123, "Geometry::mesh", "Mesh" {
  Vertices: *6 { a: 1.23456789012345, -2e-7, 3,
  4, 5, 6 }
  PolygonVertexIndex: *3 { a: 0, 1, -3 }
  Content: "AQIDBA=="
 }
}
`;
 const tree=await decodeFBXTree(new TextEncoder().encode(ascii));assert.equal(tree.version,7500);const geo=tree.nodes[1].children[0];assert.deepEqual(geo.props,[123,'Geometry::mesh','Mesh']);assert.deepEqual([...geo.children[2].props[0]],[1,2,3,4]);assert.deepEqual(geo.children[0].props[0],[1.23456789012345,-2e-7,3,4,5,6]);
 for(const invalid of [ascii.replace('*6','*5'),ascii.replace('*6','*16000001'),ascii.slice(0,-3),ascii.replace('123,','9007199254740993,')])await assert.rejects(()=>decodeFBXTree(new TextEncoder().encode(invalid)));
});

test('ASCII FBX imports through Project with authored normals and UVs',async()=>{
 const text=`; FBX 7.5.0 project file
FBXHeaderExtension: {
 FBXVersion: 7500
}
GlobalSettings: {
 Properties70: {
  P: "UnitScaleFactor", "double", "Number", "", 100
 }
}
Objects: {
 Geometry: 100, "Geometry::triangle", "Mesh" {
  Vertices: *9 { a: 0,0,0,0,0,1,1,0,0 }
  PolygonVertexIndex: *3 { a: 0,1,-3 }
  LayerElementNormal: 0 {
   MappingInformationType: "ByPolygonVertex"
   ReferenceInformationType: "Direct"
   Normals: *9 { a: 0,1,0,0,1,0,0,1,0 }
  }
  LayerElementUV: 0 {
   MappingInformationType: "ByPolygonVertex"
   ReferenceInformationType: "Direct"
   UV: *6 { a: 0,0,0,1,1,0 }
  }
 }
 Model: 200, "Model::triangle", "Mesh" {
 }
}
Connections: {
 C: "OO",100,200
 C: "OO",200,0
}
`;
 const e=newEngine(),receipt=await e.n.authoringImport.import({requestId:'ascii-source',prefix:'ascii',format:'fbx',bytes:new TextEncoder().encode(text)});const before=e.n.authoringPublishing.prepare({assemblyId:receipt.assemblyId});assert.equal(before.meshes[0].indices.length,3);assert.ok(!receipt.warnings.some(w=>w.code==='IMPORTED_NORMALS_REEVALUATED'));
 const fbx=await e.n.authoringExport.export({format:'fbx',assemblyId:receipt.assemblyId});const other=newEngine(),again=await other.n.authoringImport.import({requestId:'ascii-binary',prefix:'again',format:'fbx',bytes:fbx.bytes});const after=other.n.authoringPublishing.prepare({assemblyId:again.assemblyId});assert.deepEqual(after.meshes[0].positions,before.meshes[0].positions);assert.deepEqual(after.meshes[0].normals,before.meshes[0].normals);assert.deepEqual(after.meshes[0].uvs,before.meshes[0].uvs);
 const left=text.replace('P: "UnitScaleFactor", "double", "Number", "", 100','P: "UnitScaleFactor", "double", "Number", "", 100\n  P: "FrontAxisSign", "int", "Integer", "", 1\n  P: "CoordAxisSign", "int", "Integer", "", 1');const converted=newEngine(),lr=await converted.n.authoringImport.import({requestId:'left-source',prefix:'left',format:'fbx',bytes:new TextEncoder().encode(left)});const lp=converted.n.authoringPublishing.prepare({assemblyId:lr.assemblyId});const frame=lp.assembly.nodes.find(n=>n.id==='fbx-coordinate-frame');assert.deepEqual(frame.transform.scale,[1,1,-1]);assert.ok(lr.warnings.some(w=>w.code==='FBX_COORDINATE_FRAME_CONVERTED'));const lb=await converted.n.authoringExport.export({format:'fbx',assemblyId:lr.assemblyId});const final=newEngine(),fr=await final.n.authoringImport.import({requestId:'frame-roundtrip',prefix:'frame',format:'fbx',bytes:lb.bytes});assert.ok(pointCloudError(pointsAt(converted,lr.assemblyId,0),pointsAt(final,fr.assemblyId,0))<1e-9);
});
