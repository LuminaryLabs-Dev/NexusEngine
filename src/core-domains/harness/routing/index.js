const copy=x=>structuredClone(x);
const kinds=new Set(["request_context","invoke_capability","delegate_loop","request_validation","propose_completion","report_blocker"]);
export function normalizeRouteDecision(input){
 const d=typeof input==="string"?JSON.parse(input):input;
 if(!d||!kinds.has(d.action)||typeof d.decisionId!=="string"||!d.decisionId||!d.loopId)throw new TypeError("Invalid decision envelope");
 if(["invoke_capability","request_context","request_validation","delegate_loop"].includes(d.action)&&!d.capabilityId)throw new TypeError("Missing capability");
 return Object.freeze({schema:"nexusengine.harness.route/1",decisionId:d.decisionId,loopId:d.loopId,action:d.action,capabilityId:d.capabilityId??null,args:copy(d.args??{}),traceId:d.traceId??d.decisionId});
}
export function createDecisionRouter({discover,authorize=()=>false,policy=null}={}){
 if(typeof discover!=="function")throw new TypeError("Capability discovery required");
 return Object.freeze({resolve(raw){
  const decision=normalizeRouteDecision(raw);
  if(!decision.capabilityId)return {ok:true,decision,route:null};
  const options=discover().filter(x=>x.id===decision.capabilityId||x.implements===decision.capabilityId).filter(x=>x.enabled!==false);
  if(!options.length)return {ok:false,code:"UNAVAILABLE",decision};
  const eligible=options.filter(x=>authorize({decision,target:x})===true);
  if(!eligible.length)return {ok:false,code:"UNAUTHORIZED",decision};
  const exact=eligible.filter(x=>x.id===decision.capabilityId);
  const candidates=exact.length?exact:eligible.filter(x=>x.implements===decision.capabilityId);
  const chosen=typeof policy==="function"?policy({decision,candidates:copy(candidates)}):candidates.length===1?candidates[0]:null;
  if(!chosen||!candidates.some(x=>x.id===chosen.id))return {ok:false,code:"AMBIGUOUS",decision};
  return {ok:true,decision,route:{capabilityId:chosen.id,domainPath:chosen.domainPath??null,version:chosen.version??"1",requestedCapability:decision.capabilityId}};
 }});
}
