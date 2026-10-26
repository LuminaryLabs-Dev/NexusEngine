const copy=x=>structuredClone(x);
const kinds=new Set(["request_context","invoke_capability","delegate_loop","request_validation","propose_completion","report_blocker"]);
export function normalizeRouteDecision(input){
 const d=typeof input==="string"?JSON.parse(input):input;
 if(!d||!kinds.has(d.action)||typeof d.decisionId!=="string"||!d.decisionId||!d.loopId)throw new TypeError("Invalid decision envelope");
 if(["invoke_capability","request_context","request_validation","delegate_loop"].includes(d.action)&&!d.capabilityId)throw new TypeError("Missing capability");
 return Object.freeze({schema:"nexusengine.harness.route/1",decisionId:d.decisionId,loopId:d.loopId,action:d.action,capabilityId:d.capabilityId??null,args:copy(d.args??{}),traceId:d.traceId??d.decisionId});
}
export function createDecisionRouter({discover,authorize=()=>false}={}){
 if(typeof discover!=="function")throw new TypeError("Capability discovery required");
 return Object.freeze({resolve(raw){
  const decision=normalizeRouteDecision(raw);
  if(!decision.capabilityId)return {ok:true,decision,route:null};
  const matches=discover().filter(x=>x.id===decision.capabilityId);
  if(!matches.length)return {ok:false,code:"UNAVAILABLE",decision};
  if(matches.length!==1)return {ok:false,code:"AMBIGUOUS",decision};
  const target=matches[0];
  if(authorize({decision,target})!==true)return {ok:false,code:"UNAUTHORIZED",decision};
  return {ok:true,decision,route:{capabilityId:target.id,domainPath:target.domainPath??null,version:target.version??"1"}};
 }});
}
