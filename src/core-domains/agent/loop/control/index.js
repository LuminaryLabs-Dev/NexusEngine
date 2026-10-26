const clone=x=>structuredClone(x);
const terminal=new Set(["completed","blocked","failed","cancelled"]);
const edges={created:["active","cancelled"],active:["active","waiting","suspended","completed","blocked","failed","cancelled"],waiting:["active","blocked","cancelled"],suspended:["active","cancelled"]};
const amount=n=>Number.isSafeInteger(n)&&n>=0;
export function createLoopControl({loopId,agentId,goalRef,budgets={}}={}){
 if(!loopId||!agentId||!goalRef)throw new TypeError("Loop identity, agent and goal required");
 const b={maxSteps:budgets.maxSteps??100,maxModelCalls:budgets.maxModelCalls??75,maxDepth:budgets.maxDepth??4,maxTokens:budgets.maxTokens??100000,maxWallTimeMs:budgets.maxWallTimeMs??1800000};
 if(Object.values(b).some(x=>!amount(x)||x<1))throw new RangeError("Invalid loop budgets");
 return Object.freeze({schema:"nexusengine.agent.loop.control/1",loopId,agentId,goalRef,status:"created",revision:0,activeStepId:null,budgets:b,
  progress:{steps:0,modelCalls:0,tokens:0,wallTimeMs:0},lastReceiptRef:null});
}
export function advanceLoopControl(state,{status="active",stepId=null,modelCalls=0,tokens=0,elapsedMs=0,receiptRef=null,expectedRevision=null}={}){
 if(state?.schema!=="nexusengine.agent.loop.control/1"||!edges[state.status]?.includes(status))throw new Error("Invalid loop lifecycle transition");
 if(expectedRevision!==null&&state.revision!==expectedRevision)throw new Error("Loop revision conflict");
 if([modelCalls,tokens,elapsedMs].some(x=>!amount(x)))throw new TypeError("Invalid loop usage");
 if(stepId&&stepId===state.activeStepId)throw new Error("Step already accounted");
 if(status==="completed"&&!receiptRef)throw new Error("Verified completion receipt required");
 const current=state.progress;
 const progress={steps:current.steps+(stepId?1:0),modelCalls:current.modelCalls+modelCalls,tokens:(current.tokens??0)+tokens,wallTimeMs:(current.wallTimeMs??0)+elapsedMs};
 if(status==="active"&&(progress.steps>state.budgets.maxSteps||progress.modelCalls>state.budgets.maxModelCalls||progress.tokens>state.budgets.maxTokens||progress.wallTimeMs>state.budgets.maxWallTimeMs))status="blocked";
 return Object.freeze({...clone(state),status,revision:state.revision+1,activeStepId:stepId??state.activeStepId,progress,lastReceiptRef:receiptRef??state.lastReceiptRef});
}
export function checkpointLoopControl(state){if(state?.schema!=="nexusengine.agent.loop.control/1")throw new TypeError("Invalid loop checkpoint");return clone(state);}
export function restoreLoopControl(snapshot){
 if(snapshot?.schema!=="nexusengine.agent.loop.control/1"||!amount(snapshot.revision)||!snapshot.loopId||!edges[snapshot.status]&&!terminal.has(snapshot.status))throw new TypeError("Invalid checkpoint");
 return Object.freeze(clone(snapshot));
}
export function loopIsTerminal(state){return terminal.has(state.status);}
