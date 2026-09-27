import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createEngine} from 'nexusengine';
import {createAuthoringDomain, authoringDomainManifest} from 'nexusengine/domains/authoring';
const make=()=>createEngine({kits:createAuthoringDomain()});
const create=(e,kind,id,extra={})=>e.n.authoringCreate.create({requestId:`create-${id}`,kind,id,...extra});
function scene(e){
 create(e,'mesh','cube',{primitive:'box'});
 create(e,'material','stone',{content:{baseColor:[.3,.25,.2,1],roughness:.8}});
 create(e,'assembly','scene',{content:{nodes:[{id:'rock',name:'Rock',meshId:'cube',materials:['stone']}]}});
}
test('root installs complete Authoring APIs without Editor or experimental kits',()=>{
 const e=make();for(const name of ['authoringCreate','authoringImport','authoringValidation','authoringPersistence','authoringExport']) assert.ok(e.n[name],name);
 assert.deepEqual(e.n.authoringExport.formats().map(x=>x.format).sort(),['fbx','glb','usdz']);
 assert.deepEqual(e.n.authoringImport.formats().map(x=>x.format).sort(),['fbx','glb','obj','usdz']);
 for(const m of authoringDomainManifest.publicKits){assert.ok(e.n.ownersOf(m.domainPath).includes(m.id));assert.equal(e.n.api(m.apiName).ownerKitId,m.id);}
});
test('create routes typed operations, duplicate ID rejects and identical request retries once',()=>{
 const e=make();const result=create(e,'mesh','cube',{primitive:'box'});const before=e.n.authoringProject.getSnapshot();
 assert.deepEqual(create(e,'mesh','cube',{primitive:'box'}),result);assert.deepEqual(e.n.authoringProject.getSnapshot(),before);
 assert.throws(()=>create(e,'material','cube',{content:{}}));
 assert.equal(e.n.authoringValidation.project().errors,0);
});
test('source publication guard rejects concurrent mutations and releases on failure',async()=>{
 const e=make(),p=e.n.authoringProject;let release;const done=p.withSourceGuard(p.context(),()=>new Promise(r=>release=r));
 assert.throws(()=>create(e,'mesh','blocked',{primitive:'box'}),{code:'AUTHORING_PUBLICATION_BUSY'});
 release();await done;create(e,'mesh','ok',{primitive:'box'});
 await assert.rejects(p.withSourceGuard(p.context(),()=>Promise.reject(Error('io'))));create(e,'material','ok2',{content:{}});
});
test('native project persistence survives fresh engine and preserves source/history/receipts',async()=>{
 const e=make();scene(e);const snap=e.n.authoringProject.getSnapshot();
 const target={storage:'memory',path:'roundtrip-project'};
 const saved=await e.n.authoringPersistence.save({requestId:'save-1',target,expectedGeneration:0});
 assert.equal(saved.generation,1);
 await assert.rejects(e.n.authoringPersistence.save({requestId:'save-conflict',target,expectedGeneration:0}),{code:'AUTHORING_STORAGE_CONFLICT'});
 const restored=make();await restored.n.authoringPersistence.load({source:target});
 const loaded=restored.n.authoringProject.getSnapshot();
 for(const [id,d] of Object.entries(snap.documents)) assert.deepEqual(loaded.documents[id].content,d.content);
 assert.deepEqual(loaded.receipts,snap.receipts);assert.equal(loaded.undo.length,snap.undo.length);
});
test('import OBJ creates editable canonical documents atomically',async()=>{
 const e=make();const source=new TextEncoder().encode('o Quad\nv 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nvt 0 0\nvt 1 0\nvt 1 1\nvt 0 1\nf 1/1 2/2 3/3 4/4\n');
 const result=await e.n.authoringImport.import({requestId:'obj-1',format:'obj',bytes:source,prefix:'obj'});
 assert.equal(result.format,'obj');const mesh=e.n.authoringProject.listDocuments('mesh')[0];assert.ok(mesh);
 e.n.authoringProject.execute({requestId:'move',epoch:e.n.authoringProject.context().epoch,operations:[{id:'mesh.transform',args:{id:mesh.id,expectedRevision:mesh.revision,translation:[0,2,0]}}]});
 assert.equal(e.n.authoringValidation.project().errors,0);
 const before=e.n.authoringProject.getSnapshot();await assert.rejects(e.n.authoringImport.import({requestId:'bad',format:'obj',prefix:'bad',bytes:new TextEncoder().encode('v 0 0 0\nf 1 2 3\n')}));
 assert.deepEqual(e.n.authoringProject.getSnapshot(),before);
});
test('GLB, FBX and USDZ encode real files then reimport into a fresh Core runtime',async()=>{
 for(const format of ['glb','fbx','usdz']) {
  const e=make();scene(e);const result=await e.n.authoringExport.export({assemblyId:'scene',format});
  assert.ok(result.bytes instanceof Uint8Array);assert.ok(result.bytes.length>100);
  const fresh=make();const loaded=await fresh.n.authoringImport.import({requestId:`read-${format}`,prefix:format,format,bytes:result.bytes,resources:result.resources});
  assert.ok(loaded.assemblyId);const packet=fresh.n.authoringPublishing.prepare({assemblyId:loaded.assemblyId});
  assert.equal(packet.meshes.reduce((n,m)=>n+m.indices.length/3,0),12,format);
  assert.equal(fresh.n.authoringValidation.project().errors,0);
 }
});
