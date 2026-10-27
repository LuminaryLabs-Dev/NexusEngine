import {createDomainKit} from '../../../../domain-kit.js';
import {runAgentLoop} from '../self-propagation-loop-kit/index.js';
import {cloneSerializableState as copy} from '../../../../../foundation/serializable-state.js';
import {operationRequestHash as hash} from '../../../../../foundation/idempotency-ledger.js';

/** Optional strategy; providers, authorized source execution and evidence stay injected. */
export async function runAgentGoalLoop({map,requiredGoals,observe,propose,decide,authorize,execute,resolvePending,
  checkpoint,resume,signal,...options}={}) {
  if(!map?.acceptance||!Array.isArray(requiredGoals)||!requiredGoals.length||new Set(requiredGoals).size!==requiredGoals.length||[observe,propose,decide,authorize,execute].some(p=>typeof p!=='function')) throw new TypeError('Goal map, explicit requirements and authorized loop ports required');
  requiredGoals=[...requiredGoals];
  let current=null;
  if(resume?.goalGraph&&hash(resume.goalGraph)!==hash(map.snapshot())) throw new Error('Goal checkpoint requires graph reconciliation');
  const view=context=>{
    const graph=map.snapshot(),relevant=new Set(requiredGoals);
    let changed=true;while(changed){changed=false;for(const edge of graph.edges) if(edge.type==='requires'&&relevant.has(edge.from)&&!relevant.has(edge.to)){relevant.add(edge.to);changed=true;}}
    const board=map.board(context).filter(g=>relevant.has(g.id));
    const active=board.filter(g=>['active','stale','ready_to_verify','needs_revision'].includes(g.status));
    return {graphRevision:graph.revision,context:copy(context),board,eligible:active.map(g=>g.id),acceptance:map.acceptance(requiredGoals,context)};
  };
  async function perform(decision,idempotencyKey,context) {
    if(decision.action==='report_blocker') return {ok:false,receiptRef:'goal-blocker:'+idempotencyKey,reason:decision.reason??'No eligible goal work'};
    const selection=context.candidates.find(p=>p.id===decision.proposalId);
    if(!selection||map.snapshot().revision!==context.graphRevision) throw new Error('Stale or unavailable goal proposal');
    const fresh=await observe({signal});signal?.throwIfAborted();
    if(hash(fresh)!==hash(context.context)) throw new Error('Stale source context');
    if(await authorize({proposal:copy(selection),context:copy(context),signal})!==true) throw new Error('Unauthorized goal action');
    if(map.snapshot().revision!==context.graphRevision) throw new Error('Goal graph changed during authorization');
    const operationId=idempotencyKey+':goal',expectedRevision=context.graphRevision;
    if(selection.kind==='verify') {
      const result=await map.verify({operationId,expectedRevision,id:selection.goalId,context:context.context});
      // A rejected check is successful observation, not successful goal completion.
      return {ok:true,receiptRef:'goal-check:'+operationId,result};
    }
    if(selection.kind==='expand') {
      const receipt=map.expand({operationId,expectedRevision,parent:selection.goalId,children:selection.children});
      return {ok:true,receiptRef:'goal-expansion:'+operationId,receipt};
    }
    if(selection.kind==='update') {
      const receipt=map.update({operationId,expectedRevision,id:selection.goalId,goal:selection.goal});
      return {ok:true,receiptRef:'goal-update:'+operationId,receipt};
    }
    if(selection.kind==='supersede') {
      const receipt=map.supersede({operationId,expectedRevision,id:selection.goalId,reason:selection.reason});
      return {ok:true,receiptRef:'goal-supersession:'+operationId,receipt};
    }
    const result=await execute({proposal:copy(selection),context:copy(context),idempotencyKey,signal,expectedGraphRevision:expectedRevision});
    if(result?.ok!==true||!result.receiptRef) return result;
    signal?.throwIfAborted();
    if(map.snapshot().revision!==expectedRevision) throw new Error('Graph changed during source operation; reconcile retained receipt');
    const after=await observe({signal});signal?.throwIfAborted();
    if(!result.sourceRevision||after.sourceRevision!==result.sourceRevision) throw new Error('Source revision must match the retained execution receipt');
    map.implemented({operationId,expectedRevision,id:selection.goalId,sourceRevision:result.sourceRevision,receiptRef:result.receiptRef});
    return result;
  }
  return runAgentLoop({...options,goalRef:options.goalRef??requiredGoals[0],signal,resume,resolvePending,
    checkpoint:checkpoint?state=>checkpoint({...state,goalGraph:map.snapshot()}):null,
    observe:async args=>{
      const facts=await observe({...args,signal});current=view(facts);
      if(current.acceptance.ok) return current={...current,candidates:[]};
      const builtins=current.board.filter(g=>g.status==='ready_to_verify').map(g=>({id:'verify:'+g.id,kind:'verify',goalId:g.id}));
      const offered=await propose({...copy(current),signal});
      if(!Array.isArray(offered)||offered.length>32) throw new TypeError('Bounded goal proposals required');
      const candidates=[...builtins,...copy(offered)];
      if(candidates.length>64||new Set(candidates.map(p=>p.id)).size!==candidates.length||candidates.some(p=>!p.id||!current.eligible.includes(p.goalId)||!['implement','repair','expand','verify','update','supersede'].includes(p.kind))) throw new TypeError('Invalid or ineligible goal proposals');
      return current={...current,candidates};
    },
    decide:async args=>{
      const {context}=args;
      if(context.acceptance.ok) return {decision:{action:'propose_completion'},usage:{modelCalls:0,tokens:0}};
      if(!context.candidates.length) return {decision:{action:'report_blocker',reason:'No eligible goal work'},usage:{modelCalls:0,tokens:0}};
      const answer=await decide({...args,context:copy(args.context),state:copy(args.state)}),decision=answer?.decision??answer;
      if(!decision||typeof decision!=='object') return answer;
      const proposal=context.candidates.find(p=>p.id===decision.proposalId);
      const bound={...decision,goalContext:{graphRevision:context.graphRevision,context:copy(context.context),proposal:copy(proposal??null)}};
      return answer?.decision?{...answer,decision:bound}:bound;
    },
    validateDecision:(decision,{context})=>decision.action==='propose_completion'?context.acceptance.ok:
      decision.action==='report_blocker'?!context.acceptance.ok:
      decision.action==='invoke_capability'&&context.candidates.some(p=>p.id===decision.proposalId),
    execute:({decision,idempotencyKey})=>perform(decision,idempotencyKey,currentContext()),
    verify:async()=>{
      const fresh=await observe({signal}),result=map.acceptance(requiredGoals,fresh);
      return {ok:result.ok,receiptRef:result.ok?'goal-acceptance:'+hash({graph:map.snapshot(),context:fresh,requiredGoals}):null,result};
    }
  });
  function currentContext() {
    // The decision was made against this exact offered candidate set.
    if(!current?.candidates) throw new Error('Missing goal decision context');return current;
  }
}

export function createAgentGoalLoopKit(config={}) {
  return createDomainKit({...config,id:'agent-goal-loop-kit',manifestId:'agent-goal-loop-kit',domain:'agent-goal-loop',apiName:'agentGoalLoop',
    createApi:()=>({run:runAgentGoalLoop})});
}
