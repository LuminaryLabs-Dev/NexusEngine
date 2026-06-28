# core-diagnostics-kit

Purpose: proof, telemetry, replay, determinism, performance, kit health, and promotion evidence.

Owns: telemetry snapshots, replay fixtures, deterministic guards, performance counters, kit health reports, and promotion evidence.

Does not own: external observability vendor integration.

Public API: `createCoreDiagnosticsKit(config?)` plus seed exports from `telemetry-kit.js`.

Proof required: telemetry smoke, replay fixture smoke, promotion guard smoke, deterministic headless smoke.
