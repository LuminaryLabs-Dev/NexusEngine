// Compose creative harnesses as ordered steps in the existing Agent Loop.
// Child loops own local corrections; the parent owns final verification.
import { runAgentLoop } from '../../../src/core-domains/agent/loop/runner.js';
import { createDecisionRouter } from '../../../src/core-domains/harness/routing/index.js';
import { createCreativeAuthoringRunner, AUTHORING_HARNESS_APIS } from '../production/authoring-harnesses/index.mjs';
import { authoringSource } from '../../../src/core-domains/authoring/contracts/creative-harness.js';

const ordered=Object.freeze(['design','art','interaction','craft']);
const text=x=>typeof x==='string'&&x.length>0;
export function createAuthoringStepProgram({disciplines=ordered,targetRef}={}) {
  if(!text(targetRef)||!Array.isArray(disciplines)||!disciplines.length||new Set(disciplines).size!==disciplines.length||disciplines.some(x=>!ordered.includes(x)))throw new TypeError('Invalid ordered Authoring discipline set');
  return [...disciplines.map(id=>({id,kind:'effect',operation:'production.'+id,version:1,input:{targetRef}})),{id:'accept',kind:'verify',operation:'authoring.accept',version:1,input:{targetRef}}];
}
export function createAuthoringProgramRunner({host,authorize,planner={},reviewer={},reviser={}}={}) {
  if(!host?.engine?.n?.authoringProject||typeof host.call!=='function'||typeof host.readReceipt!=='function'||typeof authorize!=='function')throw new TypeError('Authorized Authoring production host required');
  const project=host.engine.n.authoringProject;
  const router=createDecisionRouter({discover:()=>ordered.filter(k=>host.engine.n[AUTHORING_HARNESS_APIS[k]]).map(k=>({id:'production.'+k,domainPath:'n:authoring:'+k})),authorize});
  async function run({targetRef,goalRef,disciplines=ordered,plans={},criteria={},reviewPolicies={},allowedCapabilities={},inspect={},budgets={},inputRefs=[],loopId,agentId='authoring-program',checkpoint=null,resume=null,resolvePending=null,childCheckpoint=null,childResume=null,childResolvePending=null,limits={},signal}={}) {
    if(!text(goalRef)||!text(loopId)||!Array.isArray(inputRefs))throw new TypeError('Goal, loop identity and input artifact references required');
    const steps=createAuthoringStepProgram({targetRef,disciplines});
    const result=await runAgentLoop({
      loopId,agentId,goalRef,steps,checkpoint,resume,resolvePending,limits:{maxSteps:steps.length,maxModelCalls:0,maxTokens:0,maxWallTimeMs:limits.maxWallTimeMs??1800000,maxDepth:limits.maxDepth??4},
      memory:resume?undefined:{outcomes:{},inputRefs},signal,
      observe:async()=>({}),
      execute:async({decision,memory,idempotencyKey,signal})=>{
        const kind=decision.capabilityId?.slice('production.'.length);
        const route=router.resolve({decisionId:idempotencyKey,loopId,action:'invoke_capability',capabilityId:decision.capabilityId,args:decision.args});
        if(!route.ok||route.route?.capabilityId!==decision.capabilityId||!disciplines.includes(kind))throw new Error('Unauthorized Authoring harness step');
        const current=project.context(),sourceRevision=authoringSource(current);
        const refs=new Map();
        for(const ref of memory.inputRefs??[])refs.set(ref.id,ref);
        for(const value of Object.values(memory.outcomes??{}))for(const ref of value.outputRefs??[])refs.set(ref.id,ref);
        const inputs=[...refs.values()];
        for(const ref of inputs){const doc=project.getDocument(ref.id);if(doc.revision!==ref.revision||doc.hash!==ref.hash)throw new Error('Previous step output is stale');}
        const request={requestId:idempotencyKey,goalRef,projectRef:current.projectId,targetRef,harnessId:kind,sourceRevision,inputRefs:inputs,acceptanceCriteria:criteria[kind]??[],allowedCapabilities:allowedCapabilities[kind]??[],resourceBudgets:budgets[kind]??{},reviewPolicy:reviewPolicies[kind]??{}};
        const runner=createCreativeAuthoringRunner({host,authorize,planner:planner[kind],reviewer:reviewer[kind],reviser:reviser[kind]});
        const child=await runner.run({discipline:kind,request,operations:plans[kind]??[],inspect:inspect[kind]??null,checkpoint:childCheckpoint?.[kind]??null,resume:childResume?.[kind]??null,resolvePending:childResolvePending?.[kind]??null,limits,signal});
        if(!child.receiptRef)return {ok:false,receiptRef:null};
        if(!child.ok)return {ok:false,receiptRef:child.receiptRef,review:child.review,status:child.status};
        const outcome={status:child.status,sourceRevision:child.sourceRevision,receiptRef:child.receiptRef,outputRefs:child.outputRefs,review:child.review};
        return {ok:true,receiptRef:child.receiptRef,memoryPatch:{set:{outcomes:{...memory.outcomes,[kind]:outcome}}}};
      },
      verify:async({memory,signal})=>{
        if(disciplines.some(id=>memory.outcomes?.[id]?.status!=='accepted'))return {ok:false,receiptRef:null};
        const last=memory.outcomes[disciplines[disciplines.length-1]],source=project.context();
        if(!last||last.sourceRevision.epoch!==source.epoch||last.sourceRevision.clock!==source.clock)return {ok:false,receiptRef:null};
        for(const ref of last.outputRefs??[]){const doc=project.getDocument(ref.id);if(doc.hash!==ref.hash||doc.revision!==ref.revision)return {ok:false,receiptRef:null};}
        const r=await host.call('production.validate',{}, {signal}),p=r?.requestId&&host.readReceipt(r.requestId);
        if(r?.ok!==true||!p||p.ok!==true||p.action!==r.action||r.result?.valid===false||r.result?.errors)return {ok:false,receiptRef:r?.requestId??null};
        return {ok:true,receiptRef:r.requestId};
      }
    });
    return {status:result.state.status,ok:result.state.status==='completed',outcomes:result.memory.outcomes??{},checkpoint:result.checkpoint,steps:result.steps,unresolved:result.unresolved??null};
  }
  return Object.freeze({run});
}
