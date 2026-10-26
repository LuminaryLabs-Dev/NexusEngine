export function createProductionLoopDispatcher({host,allowedCapabilities=[]}={}){
 if(typeof host?.call!=="function"||typeof host?.readReceipt!=="function")throw new TypeError("Production host required");
 const allowed=new Set(allowedCapabilities);
 return Object.freeze({
  discover(){return [...allowed].map(id=>({id,domainPath:"n:agent"}));},
  async dispatch({route,decision,signal}={}){
   const operation=route?.capabilityId;
   if(!allowed.has(operation)||!/^production\.[a-z][a-z0-9_-]*$/.test(operation))throw new Error("Unapproved production capability");
   const result=await host.call(operation,decision?.args??{},{signal});
   const id=result?.requestId;
   if(!id||!host.readReceipt(id))return {ok:false,status:"uncertain",receiptRef:null};
   return {ok:result.ok===true,receiptRef:id,status:result.ok===true?"complete":"failed"};
  }
 });
}
