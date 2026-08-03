# Runtime Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:runtime`
- Status: `stable-candidate`
- Registry SHA-256: `8d65c7d6589811bdb9a56b80021095b16c1b8ce91bac4b488698132179c7f359`
- Public entry: `nexusengine/domains/runtime`

## Responsibility

Own deterministic engine lifecycle, ticks, state mutation contracts, and runtime service installation.

## Owns

- deterministic ticks
- runtime lifecycle
- runtime service installation
- state mutation ordering

## Does Not Own

- authored content
- game rules
- platform process lifecycle
- renderer lifecycle

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:runtime:realtime` | Own deterministic frame context and realtime phase execution. |
| `n:runtime:data` | Own schemas, snapshots, selectors, migrations, deterministic random streams, and portable data envelopes. |
| `n:runtime:transaction` | Own portable repeat-safe operation and transaction receipts. |
| `n:runtime:persistence` | Own save/load targets, save slots, recovery records, and adapter contracts. |
| `n:runtime:sequence` | Own deterministic sequence nodes, ordered execution, and frame-driven sequence state. |
| `n:runtime:startup` | Own launch truth, preparation facts, continuation choice, structured failure, and readiness receipts. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `runtime-lifecycle-kit` | `nexusengine/domains/runtime/lifecycle` | Own deterministic runtime lifecycle and Kit installation receipts. |
| `realtime-runtime-kit` | `nexusengine/domains/runtime/realtime` | Create deterministic realtime frame context and phase execution. |
| `runtime-data-kit` | `nexusengine/domains/runtime/data` | Provide deterministic schemas, snapshots, selectors, migrations, and data envelopes. |
| `transaction-ledger-kit` | `nexusengine/domains/runtime/transaction` | Record repeat-safe operation keys and immutable transaction receipts. |
| `persistence-contract-kit` | `nexusengine/domains/runtime/persistence` | Describe save/load targets, slots, recovery records, and persistence adapter contracts. |
| `runtime-sequence-kit` | `nexusengine/domains/runtime/sequence` | Install deterministic sequence node definitions and execution state. |
| `runtime-startup-kit` | `nexusengine/domains/runtime/startup` | Coordinate deterministic startup preparation and readiness receipts. |

## Lifecycle

- Duplicate install: Return the installed Runtime API without duplicate state or systems.
- Snapshot: Serialize Runtime state and descriptors.
- Reset: Restore the configured Runtime baseline.
