# Assigned workers

`runAssignedWorker()` accepts an Engine Worker record and model-neutral loop
ports. It rechecks injected authorization before every port. Persist its complete
checkpoint and restore the same worker revision before resuming. Host queues may
run independent instances concurrently. Hosts enforce assignment capabilities,
parent budgets, execution leases and serialized source commits. No provider or
process pool is created by this adapter. See the Agent Worker README for fields.


## Adaptive goal mode and waiting

`runAssignedWorker({goalMap,requiredGoals,propose,...ports})` uses the existing
`runAgentGoalLoop` rather than nesting another execution loop. The agent's proposal
and decision ports choose the work; the host supplies authorization and execution
ports. `delegate` records a child assignment but does **not** mark the delegated
goal implemented; integration and authoritative gate verification remain necessary.

The `wait` action must return a real receipt and nonempty `waitForRefs`.
It yields an explicit `waiting` checkpoint without repeated inference. Resume via
the optional `wake` port only after the host can provide a trusted event receipt.
Unknown or unresolved effects require reconciliation, not blind replay.
