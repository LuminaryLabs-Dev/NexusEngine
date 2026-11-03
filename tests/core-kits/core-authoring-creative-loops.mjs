import test from 'node:test';
import assert from 'node:assert/strict';
import {createCreativeHarnessContract} from '../../src/core-domains/authoring/contracts/creative-harness.js';
import {createCreativeAuthoringRunner} from '../../kits/agent/production/authoring-harnesses/index.mjs';
import {createAuthoringStepProgram,createAuthoringProgramRunner} from '../../kits/agent/loop-host/authoring-steps.mjs';
// Synthetic provider: proves orchestration, not real rendering, gameplay or export.
function fixture(){
 const context={projectId:'museum',epoch:1,clock:0},docs=new Map(),receipts=new Map();let counter=0,commits=0;
 const tools=[{id:'assembly.set',domainPath:'n:authoring:assembly'},{id:'mesh.cube',domainPath:'n:authoring:mesh'},{id:'sequence.set',domainPath:'n:authoring:sequence'}];
 const project={context:()=>({...context}),tools:()=>tools,getDocument:id=>{if(!docs.has(id))throw Error('Missing document');return docs.get(id);},getReceipt:()=>null};
 const n={authoringProject:project};
 for(const kind of ['design','art','interaction','craft'])n['authoring'+kind[0].toUpperCase()+kind.slice(1)]=createCreativeHarnessContract(kind);
 const host={engine:{n},call:async(name,args={})=>{
   const action='kit_'+name.slice('production.'.length),id='proof-'+(++counter);let result={};
   if(name==='production.author'&&!args.preview){
      context.clock++;commits++;
      const changed=[];
      for(const op of args.request.operations){const docId=op.args.id,doc={id:docId,kind:'mesh',revision:context.clock,hash:'hash:'+docId+':'+context.clock};docs.set(docId,doc);changed.push({id:docId,after:doc});}
      result={changed};
   }
   if(name==='production.validate')result={valid:true};
   receipts.set(id,{requestId:id,action,ok:true});return {ok:true,requestId:id,action,result};
 },readReceipt:id=>receipts.get(id)};
 return {host,project,context,commitCount:()=>commits};
}
const allow=()=>true;
const request=(kind,project,cap)=>({requestId:'r-'+kind,harnessId:kind,goalRef:'EXH-001',projectRef:'museum',targetRef:'EXH-001',sourceRevision:{epoch:1,clock:project.context().clock},acceptanceCriteria:[{id:'valid',kind:'structural',description:'Must validate source'}],allowedCapabilities:cap?[cap]:[]});
const approved=async()=>({status:'accepted',reviewer:{id:'curator',kind:'human'}});
test('standalone Art can correct source-bound synthetic geometry',async()=>{
 const f=fixture();let reviews=0;
 const r=createCreativeAuthoringRunner({host:f.host,authorize:allow,
  reviewer:async()=>++reviews===1?{status:'needs_revision',reviewFindings:[{id:'shape',subject:'front',reason:'incorrect silhouette'}]}:await approved(),
  reviser:async()=>[{id:'mesh.cube',args:{id:'pedestal'}}]});
 const result=await r.run({discipline:'art',request:request('art',f.project,'mesh.cube'),operations:[{id:'mesh.cube',args:{id:'pedestal'}}]});
 assert.equal(result.status,'accepted');assert.equal(result.ok,true);
 assert.equal(f.commitCount(),2);assert.equal(result.outputRefs[0].revision,2);
 assert.equal(result.review?.result?.status,'accepted');
});
test('no review, denied route and stale source never claim acceptance',async()=>{
 const f=fixture(),req=request('art',f.project,'mesh.cube');
 const noReview=await createCreativeAuthoringRunner({host:f.host,authorize:allow}).run({discipline:'art',request:req,operations:[{id:'mesh.cube',args:{id:'pedestal'}}]});
 assert.equal(noReview.ok,false);assert.equal(noReview.review?.result?.status,'blocked');
 await assert.rejects(createCreativeAuthoringRunner({host:f.host,authorize:allow}).run({discipline:'art',request:req,operations:[{id:'mesh.cube',args:{id:'bad'}}]}),/stale/);
 const g=fixture();const denied=await createCreativeAuthoringRunner({host:g.host,authorize:()=>false,reviewer:approved}).run({discipline:'art',request:request('art',g.project,'mesh.cube'),operations:[{id:'mesh.cube',args:{id:'denied'}}]});
 assert.equal(denied.ok,false);assert.equal(g.commitCount(),0);
});
test('program composes four steps with distinct artifact handoffs',async()=>{
 const f=fixture(),program=createAuthoringStepProgram({targetRef:'EXH-001'});
 assert.deepEqual(program.map(s=>s.id),['design','art','interaction','craft','accept']);
 const runner=createAuthoringProgramRunner({host:f.host,authorize:allow,reviewer:Object.fromEntries(['design','art','interaction','craft'].map(x=>[x,approved]))});
 const run=await runner.run({targetRef:'EXH-001',goalRef:'museum',loopId:'program:1',
  plans:{design:[{id:'assembly.set',args:{id:'layout'}}],art:[{id:'mesh.cube',args:{id:'asset'}}],interaction:[{id:'sequence.set',args:{id:'behavior'}}],craft:[]},
  criteria:Object.fromEntries(['design','art','interaction','craft'].map(x=>[x,[{id:'quality',kind:'structural',description:'Proof required'}]])),
  allowedCapabilities:{design:['assembly.set'],art:['mesh.cube'],interaction:['sequence.set'],craft:[]}});
 assert.equal(run.ok,true);assert.equal(run.status,'completed');assert.equal(f.commitCount(),3);
 for(const kind of ['design','art','interaction','craft'])assert.equal(run.outcomes[kind]?.status,'accepted');
});
test('interrupted effects cannot be silently replayed without reconciliation',async()=>{
 const f=fixture();let fail=true;const original=f.host.call;
 f.host.call=async(name,args)=>{if(name==='production.author'&&!args.preview&&fail){fail=false;throw Error('uncertain host failure');}return original(name,args);};
 const runner=createCreativeAuthoringRunner({host:f.host,authorize:allow,reviewer:approved}),req=request('art',f.project,'mesh.cube');
 const first=await runner.run({discipline:'art',request:req,operations:[{id:'mesh.cube',args:{id:'x'}}]});
 assert.equal(first.ok,false);assert.equal(f.commitCount(),0);
 const next=await runner.run({discipline:'art',request:req,operations:[{id:'mesh.cube',args:{id:'x'}}],resume:first.checkpoint});
 assert.equal(next.ok,false);assert.equal(f.commitCount(),0);
});
