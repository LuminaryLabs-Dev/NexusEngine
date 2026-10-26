const clone = value => structuredClone(value);
const transitions = Object.freeze({created:["ready"],ready:["running"],running:["succeeded","failed","uncertain"],uncertain:["succeeded","failed"]});
const terminal = new Set(["succeeded","failed"]);
export function createLoopStep({stepId,loopId,kind="operation",input={},attempt=1,idempotencyKey=null}={}){
  if(!stepId||!loopId||!Number.isSafeInteger(attempt)||attempt<1)throw new TypeError("Valid step, loop and attempt required.");
  return Object.freeze({schema:"nexusengine.agent.loop.step/1",stepId,loopId,kind,attempt,idempotencyKey,status:"created",revision:0,input:clone(input),output:null,evidenceRefs:[],transition:null});
}
export function transitionLoopStep(step,to,{output=null,evidenceRefs=[]}={}){
  if(step?.schema!=="nexusengine.agent.loop.step/1"||!transitions[step.status]?.includes(to))throw new Error("Invalid step transition.");
  if(!Array.isArray(evidenceRefs))throw new TypeError("Evidence references must be an array.");
  if(to==="succeeded" && step.kind==="action" && (!step.idempotencyKey||!evidenceRefs.length))throw new Error("Action success requires idempotency key and execution evidence.");
  return Object.freeze({...clone(step),status:to,revision:step.revision+1,output:clone(output),evidenceRefs:clone(evidenceRefs),transition:{from:step.status,to,revision:step.revision+1}});
}
export function isLoopStepTerminal(step){return terminal.has(step?.status);}
