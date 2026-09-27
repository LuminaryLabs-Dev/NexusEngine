import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,readFile,writeFile,readdir,rm,symlink} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFileSync} from 'node:child_process';
import {building,newEngine,operations} from '../fixtures/authoring-assets.mjs';
import {authoringDomainManifest} from 'nexusengine/domains/authoring';
import {digest} from '../../src/core-domains/authoring/contracts/io.js';
import {encodeUSDZ,decodeUSDZ} from '../../src/core-domains/authoring/publishing/export/codecs/zip.js';
import {encodePNG,decodePNG} from '../../src/core-domains/authoring/publishing/export/codecs/png.js';
const copy=x=>structuredClone(x);
const makeFile=()=>mkdtemp(join(tmpdir(),'authoring-proof-'));
test('all 39 installed kits retain declared owners and duplicate installs do not alter source',async()=>{
 const e=building(),p=e.n.authoringProject,snapshot=p.getSnapshot();assert.equal(authoringDomainManifest.publicKits.length,39);
 for(const m of authoringDomainManifest.publicKits){const module=await import('nexusengine/'+m.source.publicSubpath.slice(2)),kit=module[m.source.exportName]();e.installKit(kit);assert.ok(e.n.ownersOf(m.domainPath).includes(m.id));assert.equal(e.n.api(m.apiName).ownerKitId,m.id);}
 assert.deepEqual(p.getSnapshot(),snapshot);
});
test('registry reset/load restores portable selections, never executable functions',()=>{
 const e=newEngine(),r=e.n.authoringImportRegistry,original=r.getSnapshot(),provider={id:'proof-import/1',version:'1',format:'proof',profile:'proof/1',capabilities:{},decode:async()=>({})};
 r.register(provider);assert.equal(r.list().length,5);assert.equal(JSON.stringify(r.getSnapshot()).includes('decode'),false);assert.throws(()=>r.register({...provider,version:'2'}));
 r.reset();assert.equal(r.list().length,4);r.loadSnapshot(original);assert.deepEqual(r.getSnapshot(),original);assert.throws(()=>r.loadSnapshot({...original,kitId:'wrong'}));
});
test('cancelled, stale and altered packets leave no export success receipt',async()=>{
 const e=building(),p=e.n.authoringProject,packet=e.n.authoringPublishing.prepare({assemblyId:'scene'}),before=e.n.authoringExportReceipt.getSnapshot();
 const aborter=new AbortController();aborter.abort();await assert.rejects(e.n.authoringExport.export({requestId:'cancelled',packet,format:'glb',signal:aborter.signal}));assert.deepEqual(e.n.authoringExportReceipt.getSnapshot(),before);
 const altered=copy(packet);altered.meshes[0].positions[0]+=1;await assert.rejects(e.n.authoringExport.export({requestId:'altered',packet:altered}),{code:'AUTHORING_PACKET_HASH'});
 let changed=false;await assert.rejects(e.n.authoringExport.export({requestId:'stale',packet,onProgress:progress=>{if(progress.stage==='validate'&&!changed){changed=true;operations(e).edit('material.set',{id:'roof',content:{baseColor:[.9,.1,.1,1]}});}}}),{code:'AUTHORING_STALE_SOURCE'});
 assert.deepEqual(e.n.authoringExportReceipt.getSnapshot(),before);assert.equal(p.getDocument('roof').content.baseColor[0],.9);
});
test('filesystem failure does not record a success receipt; publication retry returns stable identity',async()=>{
 const e=building(),dir=await makeFile();try{
 const file=join(dir,'not-directory');await writeFile(file,'sentinel');await assert.rejects(e.n.authoringExport.export({requestId:'failed',assemblyId:'scene',target:{storage:'filesystem',path:file}}));assert.equal(e.n.authoringExportReceipt.get('failed'),null);
 const request={requestId:'published',format:'glb',assemblyId:'scene',target:{storage:'filesystem',path:join(dir,'exports')}};
 const a=await e.n.authoringExport.export(request),b=await e.n.authoringExport.export(request);assert.equal(a.directory,b.directory);assert.equal(digest(new Uint8Array(await readFile(a.artifact))),a.hash);assert.equal((await readdir(join(dir,'exports'))).filter(n=>n.startsWith('pending-')).length,0);
 const altered={...request,format:'fbx'};await assert.rejects(e.n.authoringExport.export(altered),{code:'AUTHORING_REQUEST_CONFLICT'});
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('filesystem package reloads in a fresh process with source, image tiles and history',async()=>{
 const e=building(undefined,{animated:true}),dir=await makeFile();try{
 const saved=await e.n.authoringPersistence.save({requestId:'disk',target:{storage:'filesystem',path:dir},expectedGeneration:0});assert.equal(saved.generation,1);
 const code=`import{createEngine}from'nexusengine';import{createAuthoringDomain}from'nexusengine/domains/authoring';const e=createEngine({kits:createAuthoringDomain()});await e.n.authoringPersistence.load({source:{storage:'filesystem',path:process.argv[1]}});console.log(JSON.stringify({documents:e.n.authoringProject.getSnapshot().documents,undo:e.n.authoringProject.getSnapshot().undo.length,errors:e.n.authoringValidation.project().errors}));`;
 const result=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',code,dir],{cwd:process.cwd(),encoding:'utf8'}));for(const d of e.n.authoringProject.listDocuments())assert.deepEqual(result.documents[d.id].content,e.n.authoringProject.getDocument(d.id).content);assert.equal(result.errors,0);assert.equal(result.undo,e.n.authoringProject.getSnapshot().undo.length);
 await assert.rejects(e.n.authoringPersistence.save({requestId:'bad-gen',target:{storage:'filesystem',path:dir},expectedGeneration:0}),{code:'AUTHORING_STORAGE_CONFLICT'});
 const m=JSON.parse(await readFile(join(dir,'authoring-project.json'),'utf8')),victim=Object.keys(m.files).find(k=>k.startsWith('documents/'));await writeFile(join(dir,victim),'corrupt');const fresh=newEngine(),before=fresh.n.authoringProject.getSnapshot();await assert.rejects(fresh.n.authoringPersistence.load({source:{storage:'filesystem',path:dir}}),{code:'AUTHORING_STORAGE_CORRUPT'});assert.deepEqual(fresh.n.authoringProject.getSnapshot(),before);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('filesystem rejects manifest symlinks and cancelled saves preserve prior manifest',async()=>{
 const e=building(),dir=await makeFile();try{const target={storage:'filesystem',path:dir};await e.n.authoringPersistence.save({requestId:'one',target,expectedGeneration:0});const old=await readFile(join(dir,'authoring-project.json'));const controller=new AbortController();controller.abort();await assert.rejects(e.n.authoringPersistence.save({requestId:'cancel',target,expectedGeneration:1,signal:controller.signal}));assert.deepEqual(await readFile(join(dir,'authoring-project.json')),old);
 await rm(join(dir,'authoring-project.json'));await writeFile(join(dir,'manifest-copy'),old);await symlink(join(dir,'manifest-copy'),join(dir,'authoring-project.json'));await assert.rejects(e.n.authoringPersistence.load({source:target}),{code:'AUTHORING_UNSAFE_PATH'});
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('import collision and source mutation after preview reject before any document changes',async()=>{
 const bytes=new TextEncoder().encode('v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n'),e=newEngine(),request={requestId:'import',format:'obj',prefix:'object',bytes};
 const first=await e.n.authoringImport.import(request),before=e.n.authoringProject.getSnapshot();assert.deepEqual(await e.n.authoringImport.import(request),first);assert.deepEqual(e.n.authoringProject.getSnapshot(),before);
 await assert.rejects(e.n.authoringImport.import({...request,requestId:'collision'}));assert.deepEqual(e.n.authoringProject.getSnapshot(),before);
 const plan=await e.n.authoringImport.plan({...request,requestId:'planned',prefix:'second'});e.n.authoringCreate.create({requestId:'new',kind:'material',id:'new',content:{}});const changed=e.n.authoringProject.getSnapshot();assert.throws(()=>e.n.authoringImport.commit(plan),{code:'AUTHORING_STALE_SOURCE'});assert.deepEqual(e.n.authoringProject.getSnapshot(),changed);
});
test('PNG and USDZ bytes are deterministic, CRC checked, truncated input rejected',async()=>{
 const pixels={width:2,height:1,data:new Uint8Array([22,45,99,255,0,1,2,3])},png=encodePNG(pixels);assert.deepEqual((await decodePNG(png)).data,pixels.data);const zip=encodeUSDZ({'scene.usda':new TextEncoder().encode('#usda 1.0\n'),'Textures/a.png':png});assert.deepEqual(zip,encodeUSDZ({'scene.usda':new TextEncoder().encode('#usda 1.0\n'),'Textures/a.png':png}));assert.equal(Object.keys((await decodeUSDZ(zip)).entries).length,2);
 await assert.rejects(decodeUSDZ(zip.subarray(0,zip.length-10)));const bad=png.slice();bad[45]^=1;await assert.rejects(decodePNG(bad));
});
