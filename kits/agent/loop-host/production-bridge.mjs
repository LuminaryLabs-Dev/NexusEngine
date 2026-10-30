import {operationRequestHash} from "../../../src/foundation/idempotency-ledger.js";
export function createProductionLoopDispatcher({host,allowedCapabilities=[]}={}){
 if(typeof host?.call!=="function"||typeof host?.readReceipt!=="function")throw new TypeError("Production host required");
 const allowed=new Set(allowedCapabilities);
 return Object.freeze({
  discover(){return [...allowed].map(id=>({id,domainPath:"n:agent"}));},
  async dispatch({route,decision,signal,state,idempotencyKey}={}){
   const operation=route?.capabilityId;
   if(!allowed.has(operation)||!/^production\.[a-z][a-z0-9_-]*$/.test(operation))throw new Error("Unapproved production capability");
   const result=await host.call(operation,decision?.args??{},{signal});
   const id=result?.requestId;
   const retained=id?host.readReceipt(id):null;
   if(!id||!retained||typeof result.ok!=='boolean'||result.action!==retained.action||retained.requestId!==id||retained.ok!==result.ok||retained.action!=='kit_'+operation.slice(11))return {ok:false,status:"uncertain",receiptRef:null};
   return {requestHash:operationRequestHash({operation,args:decision?.args??{}}),operation,...(state?{loopId:state.loopId,agentId:state.agentId,goalRef:state.goalRef,stepId:state.loopId+':step:'+(state.progress.steps+1),idempotencyKey}:{}),ok:result.ok===true,receiptRef:id,status:result.ok===true?"complete":"failed"};
  }
 });
}
