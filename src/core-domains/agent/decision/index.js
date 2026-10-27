import {createDomainKit} from '../../domain-kit.js';
import {cloneSerializableState} from '../../../foundation/serializable-state.js';
import {operationRequestHash} from '../../../foundation/idempotency-ledger.js';
const copy=cloneSerializableState;
const text=x=>typeof x==='string'&&x.trim().length>0&&x.length<=4096;
const probability=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1;
const statuses=new Set(['answered','uncertain','insufficient_evidence','failed','budget_paused','unresolved']);
function unique(values){return Array.isArray(values)&&values.every(text)&&new Set(values).size===values.length;}
export function createDecisionRequest(input={}){
 const {id,profile,state=null,binding,proposalIds=[]}=input;
 if(!text(id)||!text(profile?.id)||!Number.isSafeInteger(profile.version)||profile.version<1||!Array.isArray(profile.questions)||profile.questions.length<1||profile.questions.length>64)throw new TypeError('Versioned decision profile required');
 if(!text(binding?.goalRef)||!Number.isSafeInteger(binding.goalVersion)||binding.goalVersion<1||!text(binding.sourceRevision)||!unique(binding.evidenceRefs??[]))throw new TypeError('Goal, revision and evidence binding required');
 if((binding.graphRef!==undefined||binding.graphRevision!==undefined)&&(!text(binding.graphRef)||!Number.isSafeInteger(binding.graphRevision)||binding.graphRevision<0))throw new TypeError('Valid graph binding required');
 if(!unique(proposalIds))throw new TypeError('Unique permitted proposal IDs required');
 const ids=new Set();const questions=profile.questions.map(q=>{
  if(!text(q?.id)||ids.has(q.id)||!text(q.instructions)||!['choice','score','probability'].includes(q.type))throw new TypeError('Invalid decision question');ids.add(q.id);
  if(q.type==='choice'&&(!unique(q.options)||q.options.length<2||q.options.length>64))throw new TypeError('Choice options required');
  if(q.type==='score'&&(!unique(q.levels)||q.levels.length<2||q.levels.length>64))throw new TypeError('Ordered score levels required');
  return {id:q.id,type:q.type,instructions:q.instructions,...(q.type==='choice'?{options:copy(q.options)}:{}),...(q.type==='score'?{levels:copy(q.levels)}:{})};
 });
 const request={schema:'nexusengine.agent.decision.request/1',id,profile:{id:profile.id,version:profile.version,questions},state:copy(state),binding:{goalRef:binding.goalRef,goalVersion:binding.goalVersion,sourceRevision:binding.sourceRevision,evidenceRefs:copy(binding.evidenceRefs??[]),...(binding.graphRef!==undefined?{graphRef:binding.graphRef,graphRevision:binding.graphRevision}:{})},proposalIds:copy(proposalIds)};
 return Object.freeze({...request,requestHash:operationRequestHash(request)});
}
export function validateDecisionJudgment(request,input={}){
 const r=createDecisionRequest(request);
 if(input.requestId!==r.id||input.requestHash!==r.requestHash||!statuses.has(input.status)||!text(input.receiptRef))throw new TypeError('Decision result identity, status and receipt required');
 if(operationRequestHash(input.binding)!==operationRequestHash(r.binding))throw new TypeError('Stale decision binding');
 const answers=input.answers??{};if(!answers||Array.isArray(answers)||typeof answers!=='object')throw new TypeError('Typed answers required');
 const questions=new Map(r.profile.questions.map(q=>[q.id,q]));
 if(Object.keys(answers).some(id=>!questions.has(id))||input.status==='answered'&&Object.keys(answers).length!==questions.size)throw new TypeError('Unexpected or missing answers');
 for(const [id,a] of Object.entries(answers)){
  const q=questions.get(id);if(!a||a.type!==q.type)throw new TypeError('Answer type mismatch');
  if(q.type==='choice'&&!q.options.includes(a.value))throw new TypeError('Unknown choice');
  if(q.type==='score'&&(!Number.isFinite(a.value)||a.value<0||a.value>q.levels.length-1))throw new TypeError('Invalid score');
  if(q.type==='probability'&&!probability(a.value))throw new TypeError('Invalid probability');
  if(a.confidence!==undefined&&!probability(a.confidence))throw new TypeError('Invalid confidence');
  if(a.probabilities!==undefined){
   const keys=q.type==='choice'?q.options:q.type==='score'?q.levels.map((_,i)=>String(i)):[];
   if(!a.probabilities||Array.isArray(a.probabilities)||keys.length!==Object.keys(a.probabilities).length||keys.some(k=>!Object.hasOwn(a.probabilities,k))||Object.values(a.probabilities).some(x=>!probability(x)))throw new TypeError('Invalid distribution');
   const total=Object.values(a.probabilities).reduce((sum,x)=>sum+x,0);
   if(Math.abs(total-1)>0.000001&&!(input.status==='uncertain'&&Math.abs(total-1)<=0.020001))throw new TypeError('Distribution not normalized');
   if(q.type==='choice'&&a.probabilities[a.value]<Math.max(...Object.values(a.probabilities)))throw new TypeError('Choice contradicts distribution');
   if(q.type==='score'&&Math.abs(a.value-Object.entries(a.probabilities).reduce((sum,[key,x])=>sum+Number(key)*x,0)/total)>0.03)throw new TypeError('Score contradicts distribution');
  }
 }
 const selected=input.selectedProposalId??null;
 if(selected!==null&&(input.status!=='answered'||!r.proposalIds.includes(selected)))throw new TypeError('Unavailable or unresolved proposal selection');
 return Object.freeze(copy({schema:'nexusengine.agent.decision.result/1',requestId:r.id,requestHash:r.requestHash,binding:r.binding,status:input.status,answers,selectedProposalId:selected,receiptRef:input.receiptRef,provenance:input.provenance??null,usage:input.usage??null}));
}
// This policy only checks a retained judgment's applicability. Hosts still
// authorize selected capabilities through the existing Harness router.
export function resolveDecision(request,result,{binding,proposals=[],accept=null}={}){
 const judgment=validateDecisionJudgment(request,result);
 if(operationRequestHash(binding)!==operationRequestHash(judgment.binding))return {ok:false,code:'STALE'};
 if(judgment.status!=='answered')return {ok:false,code:'UNRESOLVED',status:judgment.status};
 const proposal=proposals.find(p=>p.id===judgment.selectedProposalId);
 if(!proposal)return {ok:false,code:'NO_PROPOSAL'};
 if(typeof accept!=='function'||accept(copy(judgment),copy(proposal))!==true)return {ok:false,code:'POLICY_REJECTED'};
 return {ok:true,proposal:copy(proposal),judgment};
}
export function createAgentDecisionKit(config={}){
 if(!Number.isSafeInteger(config.maxRecords??1000)||(config.maxRecords??1000)<1)throw new RangeError("Invalid decision record limit");
 return createDomainKit({...config,id:config.id??'agent-decision-kit',manifestId:'agent-decision-kit',domain:'agent-decision',apiName:'decision',config:{...config.config,maxRecords:config.maxRecords??1000},initialState:{records:{}},
  createApi:({baseApi})=>({
   createRequest:createDecisionRequest,validateJudgment:validateDecisionJudgment,resolve:resolveDecision,
   record(request,result){const r=createDecisionRequest(request),judgment=validateDecisionJudgment(r,result),records=baseApi.getState().records,old=Object.hasOwn(records,r.id)?records[r.id]:null;
    if(old){if(operationRequestHash(old)!==operationRequestHash({request:r,judgment}))throw new Error('Decision ID already recorded with different content');return copy(old);}
    if(Object.keys(records).length>=(config.maxRecords??1000))throw new Error('Decision record budget reached');
    const record={request:r,judgment};baseApi.update({records:{...records,[r.id]:record}});return copy(record);},
   read(id){const records=baseApi.getState().records;if(!Object.hasOwn(records,id))return null;const record=records[id];return {request:createDecisionRequest(record.request),judgment:validateDecisionJudgment(record.request,record.judgment)};},
   snapshot(){return copy(baseApi.getState());}
  })});
}
