# Agent Worker

`n:agent:worker` owns portable identity and versioned assignments. Install
`createAgentWorkerKit()` after Agent for `engine.n.agentWorker`, or use pure
create/assign/transition/restore functions from `nexusengine/domains/agent/worker`.

Assignments contain `id`, `version`, `outcomeRef`, `loopId`, explicit `capabilities`
and `gateRefs`. Optional graph, source, target and parent-delegation references
point to existing owners. Roles are metadata. No provider or world is mandatory.
Every change checks the worker revision. Completion requires a receipt but never
accepts a parent goal. Archive previous results before assigning fresh identities.

The optional `runAssignedWorker` from `nexusengine/kits/agent/loop-host` composes
`runAgentLoop` with authorize, observe, decide, execute, verify, limits, signal and
checkpoint ports. Decisions retain actual usage, including zero model calls.
The host must enforce scope, allocated budgets, leases and current source/graph
revisions. A Worker record grants no authority. The host owns scheduling and
serialized source commits; Harness routing remains capability resolution.

Persist worker checkpoints atomically. Resume requires matching worker revision,
assignment content, loop and outcome. Pending operations use `resolvePending`;
uncertain decisions never automatically repeat inference. Terminal blocked
checkpoints require explicit host reconciliation before resumption. Provider
accounting remains external to Worker reset and replay.


## Goal-bound production assignments

The optional Production Worker route binds an assignment to an existing Agent Goal/Graph
revision, a bounded versioned `contextRef`, source read/write references and explicit
capabilities. The context packet references relevant decisions, sibling commitments,
evidence and expected outputs. The text is a handoff, **not** authority to run tools.
Legacy Worker assignments remain valid without a graph or context.

A Worker can enter `waiting` after an evidence-bound loop wait, with the same
assignment identity and budget. Resume requires its complete checkpoint plus a
trusted wake receipt. A waiting Worker cannot be reassigned or silently started as
a fresh loop. Child completion does not accept the parent's goal.
