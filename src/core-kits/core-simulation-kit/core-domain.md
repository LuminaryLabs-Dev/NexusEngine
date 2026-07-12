# core-simulation-kit

Purpose: deterministic simulation primitives and optional authoritative per-tick resolution for realtime apps and games.

Owns: resource meters, pressure channels, timers, cooldowns, progress windows, objectives, routes, checkpoints, hazard descriptors, proposal and observation ordering, resolution policy execution, and committed simulation frames.

Does not own: game-specific fiction, renderer effects, raw input, physics backend implementation, GPU dispatch, or draw submission.

Public API: `createCoreSimulationKit(config?)`; pass `{ resolution: true }` to enable proposal, observation, policy, committed-frame, reset, and ledger services.

Proof required: resource meter smoke, timer smoke, objective smoke, resolution ordering smoke, duplicate-step smoke, committed-frame serialization, reset smoke, and deterministic headless smoke.
