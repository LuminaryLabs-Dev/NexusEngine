export async function validateLoopResult({target,checks=[]}={}){
 if(!Array.isArray(checks)||checks.length===0)throw new TypeError("Validation checks required");
 const results=[];
 for(const check of checks){
  if(!check?.id||typeof check.run!=="function")throw new TypeError("Invalid validation check");
  try{
   const outcome=await check.run(target);
   results.push({id:check.id,ok:outcome?.ok===true,evidence:outcome?.evidence??null,reason:outcome?.reason??null});
  }catch(error){results.push({id:check.id,ok:false,evidence:null,reason:String(error?.message??error)});}
 }
 return {schema:"nexusengine.agent.loop.validation/1",ok:results.every(x=>x.ok),checks:results};
}
