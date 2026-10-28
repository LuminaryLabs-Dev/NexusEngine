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
