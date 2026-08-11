# Cycle 012 Goal

Complete the dependency-ready `n:render:lifecycle` master package as one
bounded, evidence-backed batch. Establish provider-neutral Render composition
installation, startup, shutdown, reset, portable snapshot, and recovery state
without duplicating Runtime lifecycle or executing a concrete provider.

This cycle covers exactly 42 detailed actions across six atomic Kits:

- `render-installation-kit`
- `render-startup-kit`
- `render-shutdown-kit`
- `render-reset-kit`
- `render-snapshot-kit`
- `render-recovery-kit`

Runtime continues to own engine ticking and Kit installation. Concrete
provider initialization, disposal, recovery, GPU handles, host surfaces, frame
execution, browser integration, The Open Above mutation, push, release branch,
and protected-ref changes are outside this cycle.
