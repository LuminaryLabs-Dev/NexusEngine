# Assigned workers

`runAssignedWorker()` accepts an Engine Worker record and model-neutral loop
ports. It rechecks injected authorization before every port. Persist its complete
checkpoint and restore the same worker revision before resuming. Host queues may
run independent instances concurrently. Hosts enforce assignment capabilities,
parent budgets, execution leases and serialized source commits. No provider or
process pool is created by this adapter. See the Agent Worker README for fields.
