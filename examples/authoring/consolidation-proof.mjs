import {mkdir,writeFile} from 'node:fs/promises';import {resolve,join,dirname} from 'node:path';
import {building,newEngine,pointsAt} from './fixtures.mjs';
const root=resolve(process.argv[2]??'authoring-proof');await mkdir(root,{recursive:true});const proof=[];
for(const animated of [false,true]){
 const name=animated?'animated-building':'building',e=building(newEngine(),{animated}),expected={name,animated,sourceHash:e.n.authoringPublishing.prepare({assemblyId:'scene'}).hash,triangles:12,materials:2,points:Object.fromEntries([0,.125,.25,.5,.75,1].map(t=>[t,pointsAt(e,'scene',t)]))};
 const dir=join(root,name);await mkdir(dir,{recursive:true});await writeFile(join(dir,'expected.json'),JSON.stringify(expected,null,2));
 for(const format of ['glb','fbx','usdz']){
  const out=await e.n.authoringExport.export({requestId:`${name}-${format}`,assemblyId:'scene',format});await writeFile(join(dir,`${name}.${format}`),out.bytes);
  for(const [path,bytes]of Object.entries(out.resources)){await mkdir(dirname(join(dir,path)),{recursive:true});await writeFile(join(dir,path),bytes);}
  await writeFile(join(dir,`${format}-receipt.json`),JSON.stringify(out.receipt,null,2));proof.push({name,format,bytes:out.bytes.length,hash:out.hash,validation:out.validation});
 }
 await e.n.authoringPersistence.save({requestId:'saved-proof',target:{storage:'filesystem',path:join(dir,'source')},expectedGeneration:0});
}
await writeFile(join(root,'native-artifact-report.json'),JSON.stringify(proof,null,2));console.log(JSON.stringify({root,proof}));
