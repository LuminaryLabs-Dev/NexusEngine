import {cloneSerializableState as copy} from '../../../foundation/serializable-state.js';
import {operationRequestHash as hash} from '../../../foundation/idempotency-ledger.js';
import {createAgentGraph,graphText} from '../graph/index.js';

const origins=new Set(['user','inferred','dependency']);
function condition(value,depth=0) {
  if(depth>16||!value||typeof value!=='object') throw new TypeError('Invalid goal condition');
  if(value.kind==='always') return;
  if(value.kind==='fact'&&graphText(value.key)&&Object.hasOwn(value,'equals')) {copy(value.equals);return;}
  if(value.kind==='all'||value.kind==='any') {
    if(!Array.isArray(value.conditions)||!value.conditions.length||value.conditions.length>32) throw new TypeError('Invalid compound goal condition');
    for(const item of value.conditions) condition(item,depth+1);return;
  }
  throw new TypeError('Unsupported goal condition');
}
function applies(value,facts) {
  if(value.kind==='always') return true;
  if(value.kind==='fact') return Object.hasOwn(facts,value.key)?hash(facts[value.key])===hash(value.equals):null;
  const answers=value.conditions.map(c=>applies(c,facts));
  return value.kind==='all'?(answers.includes(false)?false:answers.includes(null)?null:true):(answers.includes(true)?true:answers.includes(null)?null:false);
}
export function createAgentGoal(input={}) {
  if(!graphText(input.outcome)||!origins.has(input.origin)||!graphText(input.sourceRevision)||!Number.isSafeInteger(input.version??1)||(input.version??1)<1) throw new TypeError('Goal outcome, origin, version and source revision required');
  const gates=copy(input.gates??[]),ids=new Set();
  if(gates.length>64) throw new RangeError('Goal gate capacity exceeded');
  for(const gate of gates) {
    if(!graphText(gate.id)||!graphText(gate.check)||ids.has(gate.id)) throw new TypeError('Invalid goal gate');
    ids.add(gate.id);gate.when??={kind:'always'};condition(gate.when);
  }
  const targets=copy(input.targets??[]);
  if(!Array.isArray(targets)||targets.some(t=>!graphText(t))) throw new TypeError('Invalid goal targets');
  const constraints=copy(input.constraints??[]),requirementRef=input.requirementRef??null;
  if(!Array.isArray(constraints)||constraints.some(c=>!graphText(c))||requirementRef!==null&&!graphText(requirementRef)) throw new TypeError('Invalid goal requirements');
  return {constraints,requirementRef,outcome:input.outcome,origin:input.origin,version:input.version??1,sourceRevision:input.sourceRevision,targets,gates,
    disposition:'active',implementation:null,evidence:[],history:[]};
}
function validateGoalNode(node) {
  if(node.type!=='goal') return;
  const d=node.data;createAgentGoal(d);
  if(!['active','superseded'].includes(d.disposition)||!Array.isArray(d.evidence)||!Array.isArray(d.history)||d.history.length>128||d.evidence.length>64) throw new TypeError('Invalid goal lifecycle');
  if(d.implementation!==null&&(!graphText(d.implementation?.receiptRef)||!graphText(d.implementation.sourceRevision))) throw new TypeError('Invalid implementation evidence');
  if(d.evidence.some(e=>!graphText(e?.gateId)||!graphText(e.binding)||typeof e.ok!=='boolean'||!graphText(e.receiptRef)||!Array.isArray(e.evidenceRefs)||e.evidenceRefs.some(x=>!graphText(x)))) throw new TypeError('Invalid verification evidence');
}

/** Goal semantics over one graph. Applications inject trusted checks and policy. */
export function createAgentGoalMap({graph,verifiers={},authorizeSupersession=()=>false}={}) {
  if(!graph?.snapshot||!graph?.apply||!graph?.traverse) throw new TypeError('Agent graph port required');
  function snapshot() {
    const state=graph.snapshot();for(const node of state.nodes) validateGoalNode(node);return state;
  }
  function goal(id) {const n=snapshot().nodes.find(n=>n.id===id);if(n?.type!=='goal') throw new Error('Unknown goal');return n;}
  function context(input) {
    if(!graphText(input?.sourceRevision)||!input.facts||Array.isArray(input.facts)||typeof input.facts!=='object') throw new TypeError('Current source revision and condition facts required');
    return copy(input);
  }
  function binding(id,input) {
    const ctx=context(input),node=goal(id),state=snapshot();
    const dependencies=graph.traverse(id,{type:'requires'}).sort().map(key=>state.nodes.find(n=>n.id===key));
    const {evidence,history,...meaning}=node.data;
    return hash({id,data:meaning,retired:node.retired,dependencies,sourceRevision:ctx.sourceRevision,facts:ctx.facts});
  }
  function evaluate(id,input) {
    const ctx=context(input),state=snapshot(),memo=new Map();
    function visit(key) {
      if(memo.has(key)) return memo.get(key);
      const node=state.nodes.find(n=>n.id===key);
      if(!node||node.type!=='goal') return {id:key,status:'blocked',reason:'missing_goal_dependency',gates:[]};
      const data=node.data;
      if(node.retired||data.disposition==='superseded') return {id:key,status:'superseded',gates:[]};
      const dependencies=state.edges.filter(e=>e.type==='requires'&&e.from===key).map(e=>visit(e.to));
      const token=binding(key,ctx),gates=data.gates.map(gate=>{
        const applicable=applies(gate.when,ctx.facts),proof=data.evidence.find(e=>e.gateId===gate.id&&e.binding===token);
        return {id:gate.id,check:gate.check,status:applicable===null?'unresolved':applicable===false?'not_applicable':proof?(proof.ok?'passed':'failed'):'unverified',receiptRef:proof?.receiptRef??null};
      });
      let status,reason=null;
      if(dependencies.some(d=>d.status!=='verified')) {status='waiting';reason='unverified_dependency';}
      else if(!gates.length) {status='blocked';reason='missing_verification';}
      else if(gates.some(g=>g.status==='unresolved')) {status='blocked';reason='unknown_condition';}
      else if(data.sourceRevision!==ctx.sourceRevision||data.implementation&&data.implementation.sourceRevision!==ctx.sourceRevision) status='stale';
      else if(!data.implementation) status='active';
      else if(gates.some(g=>g.status==='failed')) status='needs_revision';
      else if(gates.every(g=>['passed','not_applicable'].includes(g.status))) status='verified';
      else status='ready_to_verify';
      const result={id:key,status,reason,gates,binding:token};memo.set(key,result);return result;
    }
    return copy(visit(id));
  }
  function replay(operationId,input) {
    const previous=snapshot().operations.find(op=>op.operationId===operationId);
    if(!previous) return null;
    if(previous.commandHash!==hash(input)) throw new Error('Goal operation identity conflict');
    return previous;
  }
  function commit(operationId,expectedRevision,changes,input) {
    // Validate semantic data and the entire resulting topology before mutation.
    const staged=createAgentGraph({snapshot:snapshot(),limits:graph.limits});
    const receipt=staged.apply({operationId,expectedRevision,changes,commandHash:hash(input)});
    for(const node of staged.snapshot().nodes) validateGoalNode(node);
    graph.apply({operationId,expectedRevision,changes,commandHash:hash(input)});return receipt;
  }
  function add(command) {
    const {operationId,expectedRevision,id,goal:input,dependencies=[]}=command;
    const previous=replay(operationId,command);if(previous) return previous;
    const data=createAgentGoal(input);
    const changes=[{kind:'add_node',node:{id,type:'goal',data}},...dependencies.map(target=>({kind:'add_edge',edge:{id:id+':requires:'+target,type:'requires',from:id,to:target}}))];
    return commit(operationId,expectedRevision,changes,command);
  }
  function expand(command) {
    const {operationId,expectedRevision,parent,children}=command;
    const previous=replay(operationId,command);if(previous) return previous;
    goal(parent);
    if(!Array.isArray(children)||!children.length) throw new TypeError('Goal expansion children required');
    const changes=[];
    for(const child of children) {
      changes.push({kind:'add_node',node:{id:child.id,type:'goal',data:createAgentGoal(child.goal)}});
      for(const dependency of child.dependencies??[]) changes.push({kind:'add_edge',edge:{id:child.id+':requires:'+dependency,type:'requires',from:child.id,to:dependency}});
      changes.push({kind:'add_edge',edge:{id:parent+':requires:'+child.id,type:'requires',from:parent,to:child.id}});
    }
    return commit(operationId,expectedRevision,changes,command);
  }
  function update(command) {
    const {operationId,expectedRevision,id,goal:input}=command;
    const previous=replay(operationId,command);if(previous) return previous;
    const node=goal(id),data=createAgentGoal({...input,origin:node.data.origin,version:node.data.version+1});
    if(node.retired||node.data.disposition!=='active') throw new Error('Superseded goal');
    data.history=[...node.data.history,{version:node.data.version,data:copy({...node.data,history:[]})}];
    return commit(operationId,expectedRevision,[{kind:'update_node',id,data}],command);
  }
  function implemented(command) {
    const {operationId,expectedRevision,id,sourceRevision,receiptRef}=command;
    const previous=replay(operationId,command);if(previous) return previous;
    const node=goal(id);if(!graphText(receiptRef)||!graphText(sourceRevision)||node.data.disposition!=='active') throw new Error('Current implementation receipt required');
    return commit(operationId,expectedRevision,[{kind:'update_node',id,data:{...node.data,sourceRevision,implementation:{receiptRef,sourceRevision},evidence:[],history:node.data.implementation?[...node.data.history,{event:'implementation_replaced',version:node.data.version,implementation:node.data.implementation,evidence:node.data.evidence}]:node.data.history}}],command);
  }
  const inflight=new Map();
  function verify(input) {
    const command=copy(input),key=hash(command),existing=inflight.get(command.operationId);
    if(existing) {if(existing.key!==key) return Promise.reject(new Error('Goal operation identity conflict'));return existing.promise;}
    const promise=Promise.resolve().then(()=>performVerify(command)).finally(()=>inflight.delete(command.operationId));
    inflight.set(command.operationId,{key,promise});return promise;
  }
  async function performVerify(command) {
    const {operationId,expectedRevision,id,context:input}=command;
    const previous=replay(operationId,command);if(previous) return {receipt:previous,result:evaluate(id,input)};
    const ctx=context(input),before=snapshot(),node=goal(id),view=evaluate(id,ctx);
    if(expectedRevision!==before.revision||!['ready_to_verify','needs_revision','verified'].includes(view.status)) throw new Error('Goal is not ready for verification');
    const evidence=[];
    for(const gate of node.data.gates) {
      if(applies(gate.when,ctx.facts)!==true) continue;
      const run=Object.hasOwn(verifiers,gate.check)?verifiers[gate.check]:null;
      if(typeof run!=='function') throw new Error('Missing registered goal verifier: '+gate.check);
      const proof=await run({goal:copy(node),gate:copy(gate),context:copy(ctx),binding:view.binding});
      if(typeof proof?.ok!=='boolean'||!graphText(proof.receiptRef)||!Array.isArray(proof.evidenceRefs)||proof.evidenceRefs.some(x=>!graphText(x))||proof.ok&&!proof.evidenceRefs.length) throw new TypeError('Authoritative verification evidence required');
      evidence.push({gateId:gate.id,binding:view.binding,ok:proof.ok,receiptRef:proof.receiptRef,evidenceRefs:copy(proof.evidenceRefs)});
    }
    if(snapshot().revision!==expectedRevision||binding(id,ctx)!==view.binding) throw new Error('Stale goal verification');
    const receipt=commit(operationId,expectedRevision,[{kind:'update_node',id,data:{...node.data,evidence,history:node.data.evidence.length?[...node.data.history,{event:'verification_replaced',version:node.data.version,evidence:node.data.evidence}]:node.data.history}}],command);
    return {receipt,result:evaluate(id,ctx)};
  }
  function supersede(command) {
    const {operationId,expectedRevision,id,reason}=command;
    const previous=replay(operationId,command);if(previous) return previous;
    const node=goal(id);
    if(!graphText(reason)||authorizeSupersession(copy(node),reason)!==true) throw new Error('Goal supersession requires explicit application policy');
    return commit(operationId,expectedRevision,[{kind:'update_node',id,data:{...node.data,disposition:'superseded',supersession:{reason},history:[...node.data.history,{version:node.data.version,event:'superseded',reason}]}},{kind:'retire_node',id}],command);
  }
  function board(input) {return snapshot().nodes.filter(n=>n.type==='goal').map(n=>evaluate(n.id,input));}
  function acceptance(ids,input) {
    if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length) throw new TypeError('Explicit required goal IDs required');
    const results=ids.map(id=>evaluate(id,input));return {ok:results.every(r=>r.status==='verified'),results};
  }
  return Object.freeze({snapshot,read:goal,binding,evaluate,board,acceptance,add,expand,update,implemented,verify,supersede});
}
