# core-simulation-kit

Purpose: deterministic simulation primitives and optional authoritative per-tick resolution for realtime apps and games.

Owns: resource collections, pressure channels, passive rates, thresholds, action windows, cooldowns, timers, objectives, routes, checkpoints, hazard descriptors, proposal and observation ordering, resolution policy execution, and committed simulation frames.

Does not own: game-specific fiction, renderer effects, raw input, physics backend implementation, GPU dispatch, or draw submission.

Public API: `createCoreSimulationKit(config?)`; pass `{ resolution: true }` to enable proposal, observation, policy, committed-frame, reset, and ledger services.

Promoted service surfaces:

```txt
engine.n.coreSimulation.resources
engine.n.coreSimulation.pressure
engine.n.coreSimulation.windows
```

The services advance through the existing simulation tick and support deterministic descriptors, snapshots, restore, reset, thresholds, locks, passive rates, pressure status, timing grades, and cooldown rejection.

Compatibility aliases are installed only when they are not already owned, including `engine.n.resourceMeter`, `engine.n.genericResourceLoop`, `engine.n.genericPressureLoop`, and `engine.timingWindows`.

Proof required: resource mutation/rate/threshold smoke, pressure warning/failure smoke, action-window/cooldown smoke, objective smoke, resolution ordering smoke, service snapshot restore, reset smoke, and deterministic headless smoke.
