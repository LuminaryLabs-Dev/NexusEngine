import {operationRequestHash} from "../../../../foundation/idempotency-ledger.js";
const clone=x=>structuredClone(x);
const terminal=new Set(["completed","blocked","failed","cancelled"]);
const edges={cancelled:["cancelled"],blocked:["active","blocked","cancelled"],created:["active","cancelled"],active:["active","waiting","suspended","completed","blocked","failed","cancelled"],waiting:["active","blocked","cancelled"],suspended:["active","cancelled"]};
const amount=n=>Number.isSafeInteger(n)&&n>=0;
export function createLoopControl({loopId,agentId,goalRef,budgets={}}={}){
 if(!loopId||!agentId||!goalRef)throw new TypeError("Loop identity, agent and goal required");
 const b={maxSteps:budgets.maxSteps??100,maxModelCalls:budgets.maxModelCalls??75,maxDepth:budgets.maxDepth??4,maxTokens:budgets.maxTokens??100000,maxWallTimeMs:budgets.maxWallTimeMs??1800000};
 if(Object.entries(b).some(([key,x])=>!amount(x)||(!["maxModelCalls","maxTokens"].includes(key)&&x<1)))throw new RangeError("Invalid loop budgets");
 return Object.freeze({schema:"nexusengine.agent.loop.control/1",loopId,agentId,goalRef,status:"created",revision:0,activeStepId:null,budgets:b,
  progress:{steps:0,modelCalls:0,tokens:0,wallTimeMs:0},lastReceiptRef:null});
}
export function advanceLoopControl(state,{status="active",stepId=null,modelCalls=0,tokens=0,elapsedMs=0,receiptRef=null,expectedRevision=null,memoryReceipt=null}={}){
 if(state?.schema!=="nexusengine.agent.loop.control/1"||!edges[state.status]?.includes(status))throw new Error("Invalid loop lifecycle transition");
 if(state.status==="blocked"&&status==="active"&&!receiptRef&&!(memoryReceipt?.agentId===state.agentId&&typeof memoryReceipt.key==='string'&&typeof memoryReceipt.commitId==='string'&&Number.isSafeInteger(memoryReceipt.revision)&&memoryReceipt.revision>0))throw new Error("Recovery requires an authoritative receipt");
 if(expectedRevision!==null&&state.revision!==expectedRevision)throw new Error("Loop revision conflict");
 if([modelCalls,tokens,elapsedMs].some(x=>!amount(x)))throw new TypeError("Invalid loop usage");
 if(stepId&&stepId===state.activeStepId)throw new Error("Step already accounted");
 if(status==="completed"&&!receiptRef)throw new Error("Verified completion receipt required");
 const current=state.progress;
 const progress={steps:current.steps+(stepId?1:0),modelCalls:current.modelCalls+modelCalls,tokens:(current.tokens??0)+tokens,wallTimeMs:(current.wallTimeMs??0)+elapsedMs};
 if(["active","completed"].includes(status)&&(progress.steps>state.budgets.maxSteps||progress.modelCalls>state.budgets.maxModelCalls||progress.tokens>state.budgets.maxTokens||progress.wallTimeMs>state.budgets.maxWallTimeMs))status="blocked";
 return Object.freeze({...clone(state),status,revision:state.revision+1,activeStepId:stepId??state.activeStepId,progress,lastReceiptRef:receiptRef??state.lastReceiptRef});
}
export function checkpointLoopControl(state){if(state?.schema!=="nexusengine.agent.loop.control/1")throw new TypeError("Invalid loop checkpoint");return clone(state);}
export function restoreLoopControl(snapshot){
 if(snapshot?.schema!=="nexusengine.agent.loop.control/1"||!amount(snapshot.revision)||![snapshot.loopId,snapshot.agentId,snapshot.goalRef].every(x=>typeof x==='string'&&x.trim())||!edges[snapshot.status]&&!terminal.has(snapshot.status))throw new TypeError("Invalid checkpoint");
 const expected=createLoopControl({loopId:snapshot.loopId,agentId:snapshot.agentId,goalRef:snapshot.goalRef,budgets:snapshot.budgets});
 if(!snapshot.budgets||Object.keys(expected.budgets).some(k=>snapshot.budgets[k]!==expected.budgets[k])||!snapshot.progress||['steps','modelCalls','tokens','wallTimeMs'].some(k=>!amount(snapshot.progress[k])))throw new TypeError('Invalid checkpoint budgets or progress');
 if(snapshot.activeStepId!==null&&typeof snapshot.activeStepId!=='string'||snapshot.lastReceiptRef!==null&&typeof snapshot.lastReceiptRef!=='string')throw new TypeError('Invalid checkpoint references');
 return Object.freeze(clone(snapshot));
}
export function validateLoopCheckpoint(value){
 if(!['nexusengine.agent.loop.run/1','nexusengine.agent.loop.run/2'].includes(value?.schema)||!Array.isArray(value.steps))throw new TypeError('Invalid loop checkpoint');
 const state=restoreLoopControl(value.state),seen=new Set();
 const validStep=step=>step?.schema==='nexusengine.agent.loop.step/1'&&step.loopId===state.loopId&&typeof step.stepId==='string'&&typeof step.idempotencyKey==='string'&&amount(step.revision)&&['running','uncertain','succeeded','failed'].includes(step.status);
 for(const [index,step] of value.steps.entries()){if(!validStep(step)||seen.has(step.stepId)||step.stepId!==state.loopId+':step:'+(index+1)||!['uncertain','succeeded','failed'].includes(step.status)||step.status==='succeeded'&&step.kind==='action'&&(!Array.isArray(step.evidenceRefs)||!step.evidenceRefs.length))throw new TypeError('Invalid checkpoint trace');seen.add(step.stepId);}
 if(value.steps.length!==state.progress.steps)throw new TypeError('Checkpoint step accounting mismatch');
 if(value.pending){const pending=value.pending;
  if(!validStep(pending.step)||!['running','uncertain'].includes(pending.step.status)||pending.idempotencyKey!==pending.step.idempotencyKey||pending.phase!==undefined&&!['decision','execution','verification','acceptance'].includes(pending.phase))throw new TypeError('Invalid pending step');
  if(!['decision','verification'].includes(pending.phase)&&(!pending.decision||typeof pending.decision.action!=='string'))throw new TypeError('Missing pending operation');
  if(pending.step.stepId!==state.loopId+':step:'+(seen.has(pending.step.stepId)?state.progress.steps:state.progress.steps+1)||seen.has(pending.step.stepId)&&state.activeStepId!==pending.step.stepId)throw new TypeError('Pending step identity mismatch');
 }
 if(value.schema==='nexusengine.agent.loop.run/2'){
  const p=value.program,expected=p&&createLoopProgram(p.definitions,p.mode);
  if(!p||p.schema!=='nexusengine.agent.loop.program/1'||p.hash!==expected.hash||!amount(p.cursor)||p.mode==='array'&&p.cursor>p.definitions.length)throw new TypeError('Invalid loop program checkpoint');
  const m=p.memory;
  if(!m||m.agentId!==state.agentId||typeof m.key!=='string'||!m.key||!Number.isSafeInteger(m.revision)||m.revision<1||!m.value||typeof m.value!=='object'||Array.isArray(m.value))throw new TypeError('Invalid loop memory checkpoint');
  if(p.mode==='array'){let index=0;for(const s of value.steps){if(s.definitionId!==p.definitions[index]?.id||!Number.isSafeInteger(s.memoryRevision)||s.memoryRevision<1)throw new TypeError('Step definition or memory binding mismatch');if(s.status==='succeeded')index++;}}
  if(p.cursor!==value.steps.filter(s=>s.status==='succeeded').length)throw new TypeError('Loop cursor accounting mismatch');
  if(value.pending?.phase==='acceptance'&&(!value.pending.result||value.pending.result.ok!==true||value.pending.definitionId!==(p.mode==='array'?p.definitions[p.cursor]?.id:'cycle')||value.pending.memoryRevision!==m.revision))throw new TypeError('Invalid pending memory acceptance');
 }else if(value.pending?.phase==='acceptance')throw new TypeError('Memory acceptance requires a v2 checkpoint');
 return clone(value);
}
export function createLoopProgram(definitions,mode='array'){
 if(!['array','adaptive'].includes(mode)||!Array.isArray(definitions)||!definitions.length||definitions.length>256)throw new TypeError('Loop needs 1-256 ordered steps');
 const ids=new Set();
 const steps=definitions.map((s,index)=>{
  if(!s||typeof s.id!=='string'||!s.id||ids.has(s.id)||typeof s.operation!=='string'||!s.operation||Object.keys(s).some(k=>!['id','operation','kind','input','version'].includes(k)))throw new TypeError('Invalid or duplicate loop step');
  ids.add(s.id);const kind=s.kind??'compute',version=s.version??1;
  if(!['compute','effect','verify'].includes(kind)||!Number.isSafeInteger(version)||version<1||mode==='array'&&(kind==='verify')!==(index===definitions.length-1))throw new TypeError('Array must end with one verification step');
  return {id:s.id,operation:s.operation,kind,input:clone(s.input??null),version};
 });
 return {schema:'nexusengine.agent.loop.program/1',mode,definitions:steps,hash:operationRequestHash({mode,definitions:steps}),cursor:0};
}
export function loopIsTerminal(state){return terminal.has(state.status);}
