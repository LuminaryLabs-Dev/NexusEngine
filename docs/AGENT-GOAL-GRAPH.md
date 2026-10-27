# Agent graph, goals and optional loop strategy

`n:agent:graph` owns portable typed topology. `n:agent:goal` interprets that topology as desired outcomes, conditions and evidence. `runAgentGoalLoop` optionally follows those goals through the existing model-neutral loop. No provider, Cloud policy, renderer or filesystem enters Core. Existing task graphs and plain loops are unchanged.

## Compose

Import `createAgentGraphKit`, `createAgentGoalKit` and `createAgentGoalLoopKit` from `nexusengine/domains/agent` (also available through graph, goal and loop subpaths). Install Agent then Graph then Goal; the optional loop kit follows the installed Goal capability. Graph owns all persisted goal data; Goal does not copy topology into another store. The public pure helpers `createAgentGraph`, `createAgentGoalMap` and `runAgentGoalLoop` support applications that supply persistence and lifecycle explicitly.

```js
const graph = createAgentGraph({id:'game'});
const goals = createAgentGoalMap({graph,verifiers:{
  driving: async ({goal,context}) => {
    // Call the owning Engine runtime/host and return its real evidence.
    return verifyDriving(goal.id, context.sourceRevision);
  }
}});
goals.add({operationId:'design:car',expectedRevision:0,id:'car',goal:{
  outcome:'Drive the car',origin:'user',sourceRevision:'source:1',targets:['car:1'],
  gates:[{id:'can-drive',check:'driving',when:{kind:'always'}}]
}});
```

A source operation receipt establishes implementation with `implemented()`. `verify()` invokes registered checks and requires `{ok,receiptRef,evidenceRefs}`; passing checks need at least one evidence reference. Check functions are trusted host/domain adapters, never executable code stored in design documents. A successful graph operation is not proof of game behavior.

## Graph contracts

Graph nodes are `{id,type,data,retired}` and edges are `{id,type,from,to}`. `requires` points from a dependent node to its prerequisite. Only these edges must form a DAG; descriptive `implements` and `verifies` references may cycle. Traversal is bounded and tracks visited nodes. All graph state is JSON-portable.

`apply({operationId,expectedRevision,changes})` stages the entire patch before publishing it. Supported changes: add_node, update_node, retire_node, add_edge, remove_edge. Node identity/type are immutable. Duplicate operation IDs reuse matching receipts and reject changed content. History is bounded without silently dropping replay identities; exhaustion requires the caller to checkpoint/rotate explicitly. Graph snapshots include topology and the operation journal; restore validates before replacing state, and reset returns to the construction baseline. Provider financial ledgers are never reset by these operations.

Defaults: 256 nodes, 1024 edges, 1024 journal operations, 256 changes per patch, 1 MiB serialized state and dependency/traversal depth 32. Installed Graph kits hold at most 32 graphs by default. Limits are explicit trusted configuration. No unbounded recursive expansion is scheduled.

## Goals and conditions

Origins are user, inferred or dependency. Goal operations add, expand, update, record implementation, verify and supersede. `expand` atomically adds child goals and parent requirements. Dependency evidence participates in each goal's binding. Source revision, goal meaning, condition facts or dependency changes invalidate affected proof. A retained receipt alone does not preserve verification across changed inputs.

Conditions use `always`, `fact` with an exact named-fact equality, or bounded `all`/`any` combinations. Missing facts are unknown, not false. Facts are supplied by a trusted observation port. Inapplicable gates are not_applicable; unknown applicability blocks. A goal with no verification gates is blocked. The current source revision must be explicit.

Goal evaluation returns active, waiting, ready_to_verify, needs_revision, verified, stale, blocked or superseded. There is no writable verified flag. Failed checks create needs_revision; they do not turn into successful completion. `acceptance(requiredIds, context)` requires every explicitly required goal to be verified. Superseded requirements do not silently pass. Supersession requires explicit application policy and retains history; it never deletes authored game entities. Goal updates preserve origin, increment version and retain prior data. Capacity exhaustion is reported rather than erasing evidence/history.

## Optional loop

`runAgentGoalLoop` requires a map, explicit requiredGoals and observe/propose/decide/authorize/execute ports. Observation returns `{sourceRevision,facts}`. Proposal generation returns at most 32 typed actions targeting eligible nodes. Built-in verification candidates are added for ready_to_verify goals. Correction proposals use repair after a failed check. Other kinds are implement, expand, update and supersede. Each proposal identifies id, kind and goalId; expand includes children, update includes goal, supersede includes reason. The caller must retrieve real supported capabilities and authorize the complete proposal before any action.

`decide` selects `{action:'invoke_capability',proposalId}` and uses the existing loop's explicit actual usage accounting. It may be deterministic, an LLM, a classifier or a mixture. Decisions cannot replace offered proposal parameters. Context/graph freshness is checked after selection and authorization. Engine Decision bindings optionally include graphRef and graphRevision alongside goal version, source revision and evidence references. Hosts still resolve/authorize real capabilities through Harness routing.

The execute port receives the proposal, expected graph revision, idempotency key and signal. Successful source operations return `{ok:true,receiptRef,sourceRevision}`. The observed post-operation revision must match that receipt before implementation is recorded. Revision changes leave other affected goals stale; refresh their definitions through scoped update proposals. Verifiers must inspect real domain outcomes: e.g. car identity/bindings, input-to-motion behavior, checkpoint progression, persistence or independent delivery as required by the design.

A failed verification is an observed finding so the loop can select a bounded repair. No eligible work produces a blocker, not completion. Existing loop maxSteps/model/tokens/time limits bound expansion and repeated repairs. Completion reobserves and reevaluates required goals. A checkpoint includes goalGraph; the host must restore/reconcile its persisted graph before resuming. A pending decision is never automatically repeated. For pending execution, resolvePending must reconcile the authoritative source receipt **and** graph update before returning success; it must return unresolved if it cannot do so. The strategy does not blindly replay source changes. An interrupted operation with a newer persisted graph requires explicit reconciliation, not checkpoint overwrite.

## Validation scope

Existing Agent/loop suites exercise topology, evidence, installed-kit lifecycle, plain-loop compatibility, deterministic and synthetic LLM/classifier selection, repairs, blockers, snapshots, stale inputs and cancellation. Synthetic inference proves contracts and accounting, not live model accuracy. Cloud integration, visual game acceptance and paid inference are separate consumer work.
