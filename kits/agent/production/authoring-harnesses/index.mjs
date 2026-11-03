// Optional host execution for the four portable Authoring mini-harnesses.
// Agent Loop owns continuation; Production Host owns tool receipts and source writes.
import { runAgentLoop } from '../../../../src/core-domains/agent/loop/runner.js';
import { createDecisionRouter } from '../../../../src/core-domains/harness/routing/index.js';
import { authoringSource, sameSource } from '../../../../src/core-domains/authoring/contracts/creative-harness.js';

export const AUTHORING_HARNESS_APIS=Object.freeze({design:'authoringDesign',art:'authoringArt',interaction:'authoringInteraction',craft:'authoringCraft'});
const callable=x=>typeof x==='function';
const hostTools=Object.freeze(['production.discover','production.status','production.author','production.validate','production.look']);
const receiptOf=response=>{
  if(response?.ok!==true||!response.requestId)throw new Error('Production host did not return a successful operation receipt');
  return response.requestId;
};
export function createCreativeAuthoringRunner({host,authorize,planner,reviewer,reviser}={}) {
  if(!host?.engine?.n?.authoringProject||!callable(host.call)||!callable(host.readReceipt))throw new TypeError('Canonical production host required');
  if(!callable(authorize))throw new TypeError('Explicit host authorization required');
  const router=createDecisionRouter({discover:()=>hostTools.map(id=>({id,domainPath:'n:authoring'})),authorize});
  const project=host.engine.n.authoringProject;
  const call=async(name,args,signal)=>{
    const r=await host.call(name,args,{signal}),id=receiptOf(r),retained=host.readReceipt(id);
    if(!retained||retained.ok!==true||retained.requestId!==id||retained.action!==r.action)throw new Error('Unverified production host receipt');
    return {id,data:r.result};
  };
  async function run({discipline,request:input,operations=[],inspect=null,checkpoint=null,resume=null,resolvePending=null,limits={},signal}={}) {
    const apiName=AUTHORING_HARNESS_APIS[discipline],api=apiName&&host.engine.n[apiName];
    if(!api||!callable(api.request))throw new Error('Requested Authoring harness Kit is not installed');
    const request=api.request(input),resumeSource=resume?.program?.memory?.value?.sourceRevision;
    if(request.projectRef!==project.context().projectId||!sameSource(resume?resumeSource:request.sourceRevision,project.context()))throw new Error('Authoring source is stale or belongs to another project');
    if(!Array.isArray(operations))throw new TypeError('Authoring operations must be an array');
    if(inspect!==null&&(!inspect||typeof inspect.assemblyId!=='string'||!inspect.assemblyId||typeof inspect.destination!=='string'||!inspect.destination))throw new TypeError('Inspection needs assemblyId and destination');
    if(!resume)for(const ref of request.inputRefs){const doc=project.getDocument(ref.id);if(doc.revision!==ref.revision||doc.hash!==ref.hash)throw new Error('Stale or invalid input artifact reference');}
    const loopId=request.requestId+':'+discipline;
    const initial={phase:'discover',iteration:1,sourceRevision:request.sourceRevision,operations,outputRefs:request.inputRefs,changeReceipts:[],inspectionEvidenceRefs:[],validationEvidenceRefs:[],review:null};
    const result=await runAgentLoop({
      loopId,agentId:'authoring-'+discipline,goalRef:request.goalRef,
      decide:async({memory})=>({decision:['complete','blocked'].includes(memory.phase)?{action:'propose_completion'}:{action:'invoke_capability',capabilityId:memory.phase==='discover'?'production.discover':memory.phase==='model'?'production.author':memory.phase==='inspect'&&inspect?'production.look':memory.phase==='inspect'?'production.validate':'production.status',args:{phase:memory.phase}},usage:{modelCalls:0,tokens:0}}),
      observe:async()=>({}),
      execute:async({decision,memory,signal})=>{
        const resolved=router.resolve({decisionId:loopId+':'+memory.iteration+':'+memory.phase,loopId,action:'invoke_capability',capabilityId:decision.capabilityId,args:decision.args});
        if(!resolved.ok)throw new Error('Authoring capability route rejected: '+resolved.code);
        if(memory.phase==='discover'){
          const r=await call('production.discover',{},signal);
          return {ok:true,receiptRef:r.id,memoryPatch:{set:{phase:'plan'}}};
        }
        if(memory.phase==='plan'){
          const r=await call('production.status',{},signal);
          if(!sameSource(memory.sourceRevision,project.context()))throw new Error('Authoring source changed during planning');
          const ops=callable(planner)?await planner({discipline,request,iteration:memory.iteration,operations:memory.operations,tools:project.tools(),sourceRevision:memory.sourceRevision,signal}):memory.operations;
          api.plan({...request,sourceRevision:memory.sourceRevision},ops,project.tools());
          return {ok:true,receiptRef:r.id,memoryPatch:{set:{phase:ops.length?'model':'inspect',operations:ops}}};
        }
        if(memory.phase==='model'){
          if(!sameSource(memory.sourceRevision,project.context()))throw new Error('Source changed before modeling');
          const mutation={requestId:request.requestId+':revision:'+memory.iteration,epoch:memory.sourceRevision.epoch,operations:memory.operations};
          const preview=await call('production.author',{request:mutation,preview:true},signal);
          if(!sameSource(memory.sourceRevision,project.context()))throw new Error('Source changed after modeling preview');
          const committed=await call('production.author',{request:mutation,preview:false},signal);
          const changed=committed.data?.changed??project.getReceipt(mutation.requestId)?.changed??[];
          const refs=changed.filter(x=>x.after).map(x=>{const d=project.getDocument(x.id);return {id:d.id,kind:d.kind,revision:d.revision,hash:d.hash};});
          if(!refs.length)throw new Error('Modeling operation produced no verifiable source artifact');
          const retained=memory.outputRefs.filter(x=>!refs.some(y=>x.id===y.id));
          return {ok:true,receiptRef:committed.id,memoryPatch:{set:{phase:'inspect',sourceRevision:authoringSource(project.context()),outputRefs:[...retained,...refs],changeReceipts:[...memory.changeReceipts,committed.id]}}};
        }
        if(memory.phase==='inspect'){
          if(!sameSource(memory.sourceRevision,project.context()))throw new Error('Source changed before inspection');
          const validation=await call('production.validate',{},signal);
          if(validation.data?.valid===false||validation.data?.errors||validation.data?.validation?.errors)throw new Error('Authoring project validation failed');
          const validationEvidenceRefs=[...memory.validationEvidenceRefs,validation.id],inspectionEvidenceRefs=[...memory.inspectionEvidenceRefs];
          if(inspect){const visual=await call('production.look',inspect,signal);inspectionEvidenceRefs.push(visual.id);}
          if(!sameSource(memory.sourceRevision,project.context()))throw new Error('Source changed during inspection');
          return {ok:true,receiptRef:validation.id,memoryPatch:{set:{phase:'review',validationEvidenceRefs,inspectionEvidenceRefs}}};
        }
        if(memory.phase==='review'){
          const read=await call('production.status',{},signal);
          if(!sameSource(memory.sourceRevision,project.context()))throw new Error('Source changed before review');
          const v=callable(reviewer)?await reviewer({discipline,request,sourceRevision:memory.sourceRevision,outputRefs:memory.outputRefs,changeReceipts:memory.changeReceipts,inspectionEvidenceRefs:memory.inspectionEvidenceRefs,validationEvidenceRefs:memory.validationEvidenceRefs,iteration:memory.iteration,signal}):{status:'blocked',reviewer:null};
          const review=api.review({...request,sourceRevision:memory.sourceRevision},{status:v.status,sourceRevision:memory.sourceRevision,outputRefs:memory.outputRefs,changeReceipts:memory.changeReceipts,inspectionEvidenceRefs:memory.inspectionEvidenceRefs,validationEvidenceRefs:memory.validationEvidenceRefs,reviewFindings:v.reviewFindings??[],unresolvedRequirements:v.unresolvedRequirements??[],nextRecommendedActions:v.nextRecommendedActions??[],reviewer:v.reviewer??null});
          if(review.result.status==='accepted')return {ok:true,receiptRef:read.id,memoryPatch:{set:{phase:'complete',review}}};
          if(review.result.status==='needs_revision'&&discipline!=='craft'&&memory.iteration<request.resourceBudgets.maxIterations&&callable(reviser))return {ok:true,receiptRef:read.id,memoryPatch:{set:{phase:'revise',review}}};
          return {ok:true,receiptRef:read.id,memoryPatch:{set:{phase:'blocked',review}}};
        }
        if(memory.phase==='revise'){
          const read=await call('production.status',{},signal);
          if(!sameSource(memory.sourceRevision,project.context()))throw new Error('Source changed before correction');
          const next=await reviser({discipline,request,iteration:memory.iteration,sourceRevision:memory.sourceRevision,review:memory.review,tools:project.tools(),signal});
          api.revision({...request,sourceRevision:memory.sourceRevision},memory.review,next,project.tools(),project.context());
          return {ok:true,receiptRef:read.id,memoryPatch:{set:{phase:'model',iteration:memory.iteration+1,operations:next,inspectionEvidenceRefs:[],validationEvidenceRefs:[],review:null}}};
        }
        throw new Error('Invalid harness phase');
      },
      verify:async({memory,signal})=>{
        const r=await call('production.validate',{},signal);
        const ok=memory.phase==='complete'&&memory.review?.result?.status==='accepted'&&sameSource(memory.sourceRevision,project.context())&&r.data?.valid!==false&&!r.data?.errors;
        return {ok,receiptRef:r.id};
      },
      checkpoint,resume,resolvePending,signal,
      limits:{maxSteps:Math.min(request.resourceBudgets.maxSteps,5+request.resourceBudgets.maxIterations*6),maxModelCalls:0,maxTokens:0,maxWallTimeMs:Math.min(request.resourceBudgets.maxWallTimeMs,limits.maxWallTimeMs??request.resourceBudgets.maxWallTimeMs),maxDepth:Math.min(request.resourceBudgets.maxDepth,limits.maxDepth??request.resourceBudgets.maxDepth)},
      memory:resume?undefined:initial,
    });
    return {ok:result.state.status==='completed'&&result.memory.review?.result?.status==='accepted',status:result.state.status==='completed'?'accepted':result.state.status,discipline,review:result.memory.review??null,outputRefs:result.memory.outputRefs??[],sourceRevision:result.memory.sourceRevision,receiptRef:result.state.lastReceiptRef,checkpoint:result.checkpoint,unresolved:result.unresolved??null,steps:result.steps};
  }
  return Object.freeze({run});
}
