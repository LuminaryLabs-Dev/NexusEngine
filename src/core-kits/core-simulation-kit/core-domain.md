# core-simulation-kit

Purpose: deterministic simulation primitives for realtime apps and games.

Owns: resource meters, pressure channels, timers, cooldowns, progress windows, objectives, routes, checkpoints, and hazard descriptors.

Does not own: game-specific fiction, renderer effects, or raw input.

Public API: `createCoreSimulationKit(config?)` plus seed exports from timing, resource-pressure, and objective-flow kits.

Proof required: resource meter smoke, timer smoke, objective smoke, snapshot/reset smoke, deterministic headless smoke.
