import {runAgentLoop} from '../../runner.js';
// Existing coding API is a recipe for the canonical runner, not an executor.
export async function runCodingLoop({goal,inspect,propose,apply,validate,authorize,loopId='coding',agentId='coding',goalRef='coding-goal',checkpoint,resume,resolvePending,memoryStore,signal,limits}={}){
 for(const fn of [inspect,propose,apply,validate,authorize])if(typeof fn!=='function')throw new TypeError('Coding providers required');
 let failure=null;
 const original={inspect,propose,apply,validate,authorize};
 const call=async(name,...args)=>{try{return await original[name](...args);}catch(error){failure=error;throw error;}};
 const result=await runAgentLoop({loopId,agentId,goalRef,checkpoint,resume,resolvePending,memoryStore,signal,limits,
  memory:resume?undefined:{goal:goal??null},steps:[
   {id:'inspect',operation:'coding.inspect'},
   {id:'propose',operation:'coding.propose'},
   {id:'authorize',operation:'coding.authorize'},
   {id:'apply',operation:'coding.apply',kind:'effect'},
   {id:'validate',operation:'coding.validate',kind:'verify'}
  ],
  execute:async({step,memory,signal,idempotencyKey})=>{
   switch(step.id){
    case 'inspect':return {ok:true,memoryPatch:{set:{context:(await call('inspect',{goal,...(signal?{signal}:{})}))??null}}};
    case 'propose':{
     const proposal=await call('propose',{goal,context:memory.context,...(signal?{signal}:{})});
     if(!proposal?.id||!proposal?.expectedRevision||!proposal?.operation){failure=new TypeError('Invalid coding proposal');throw failure;}
     return {ok:true,memoryPatch:{set:{proposal}}};
    }
    case 'authorize':return await call('authorize',memory.proposal)===true?{ok:true}:{ok:false,output:{status:'unauthorized'}};
    case 'apply':{
     const receipt=await call('apply',memory.proposal,{signal,idempotencyKey});
     return {...receipt,ok:receipt?.ok===true,...(receipt?.ok===true?{memoryPatch:{set:{receipt}}}:{})};
    }
   }
  },
  verify:async({memory})=>{
   const validation=await call('validate',{goal,proposal:memory.proposal,receipt:memory.receipt});
   return {ok:validation?.ok===true,receiptRef:validation?.receiptRef??memory.receipt.receiptRef,validation};
  }
 });
 if(failure)throw failure;
 const last=result.steps.at(-1)?.output;
 const status=result.state.status==='completed'?'complete':last?.output?.status??(last?.error==='No authoritative execution receipt'?'uncertain':'failed');
 return {status,ok:status==='complete',...(last?.receiptRef?{receiptRef:last.receiptRef}:{}),...(last?.validation?{validation:last.validation}:{}),loop:result};
}
