# Diagnostics Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:diagnostics`
- Status: `stable-candidate`
- Registry SHA-256: `8d65c7d6589811bdb9a56b80021095b16c1b8ce91bac4b488698132179c7f359`
- Public entry: `nexusengine/domains/diagnostics`

## Responsibility

Own renderer-neutral telemetry, health, determinism, performance, replay, and debug evidence descriptors.

## Owns

- debug descriptors
- determinism evidence
- health state
- performance counters
- telemetry descriptors

## Does Not Own

- debug overlay rendering
- developer UI
- log transport
- platform profiling implementation

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `diagnostics-kit` | `nexusengine/domains/diagnostics/runtime` | Collect serializable telemetry, runtime health, determinism, and performance evidence. |
| `debug-descriptor-kit` | `nexusengine/domains/diagnostics/debug` | Record renderer-neutral rays, markers, scalars, and capture packets for diagnostics. |
| `debug-draw-descriptor-kit` | `nexusengine/domains/diagnostics/debug-draw` | Create stateless renderer-neutral debug draw descriptors. |

## Lifecycle

- Duplicate install: Return the installed Diagnostics API without duplicate state or systems.
- Snapshot: Serialize Diagnostics state and descriptors.
- Reset: Restore the configured Diagnostics baseline.
