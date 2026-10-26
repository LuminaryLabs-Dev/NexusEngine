const clone=x=>structuredClone(x);
const terminal=new Set(["completed","blocked","failed","cancelled"]);
const edges={created:["active","cancelled"],active:["active","suspended","waiting","completed","blocked","failed","cancelled"],waiting:["active","blocked","cancelled"],suspended:["active","cancelled"]};
export function createLoopControl({loopId,agentId,goalRef,budgets={}}={}){
 if(!loopId||!agentId||!goalRef)throw new TypeError("Loop identity, agent and goal required.");
 const b={maxSteps:budgets.maxSteps??100,maxModelCalls:budgets.maxModelCalls??75,maxDepth:budgets.maxDepth??4};
 if(Object.values(b).some(x=>!Number.isSafeInteger(x)||x<1))throw new RangeError("Invalid loop budgets.");
 return Object.freeze({schema:"nexusengine.agent.loop.control/1",loopId,agentId,goalRef,status:"created",revision:0,activeStepId:null,budgets:b,progress:{steps:0,modelCalls:0},lastReceiptRef:null});
}
export function advanceLoopControl(state,{status="active",stepId=null,modelCalls=0,receiptRef=null}={}){
 if(state?.schema!=="nexusengine.agent.loop.control/1"||!edges[state.status]?.includes(status))throw new Error("Invalid loop lifecycle transition.");
 if(!Number.isSafeInteger(modelCalls)||modelCalls<0)throw new TypeError("Invalid inference count.");
 const progress={steps:state.progress.steps+(stepId?1:0),modelCalls:state.progress.modelCalls+modelCalls};
 if(status==="active" && (progress.steps>state.budgets.maxSteps||progress.modelCalls>state.budgets.maxModelCalls)) status="blocked";
 return Object.freeze({...clone(state),status,revision:state.revision+1,activeStepId:stepId??state.activeStepId,progress,lastReceiptRef:receiptRef??state.lastReceiptRef});
}
export function checkpointLoopControl(state){if(state?.schema!=="nexusengine.agent.loop.control/1")throw new TypeError("Invalid loop checkpoint");return clone(state);}
export function restoreLoopControl(snapshot){if(snapshot?.schema!=="nexusengine.agent.loop.control/1"||!Number.isSafeInteger(snapshot.revision)||snapshot.revision<0)throw new TypeError("Invalid checkpoint");return Object.freeze(clone(snapshot));}
export function loopIsTerminal(state){return terminal.has(state.status);}
