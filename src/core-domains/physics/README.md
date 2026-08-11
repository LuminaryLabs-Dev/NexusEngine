# Physics Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:physics`
- Status: `stable-candidate`
- Registry SHA-256: `8bb0900127eded3eba62ade325c4b3f488b70b62e78c625be184fa2b2b83cbb8`
- Public entry: `nexusengine/domains/physics`

## Responsibility

Own the canonical backend-neutral Physics boundary and compose its atomic capability subdomains.

## Owns

- Physics capability catalog
- Physics domain identity
- provider-neutral Physics contracts

## Does Not Own

- concrete physics backend implementation
- gameplay damage or scoring
- input bindings
- renderer resources or frame submission

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:physics:contracts` | Own portable Physics provider, state, command, event, and query boundary schemas. |
| `n:physics:lifecycle` | Own deterministic installation, startup, stepping, shutdown, reset, and snapshot orchestration contracts. |
| `n:physics:material` | Own portable physical material identity, coefficients, surface classification, and deterministic pair-combine policy. |
| `n:physics:world` | Own portable solver-facing Physics world records, physical fields, Physics time scales, and physical simulation regions. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `physics-domain-contract-kit` | `nexusengine/domains/physics/contract` | Expose the canonical backend-neutral Physics ownership and contract boundary. |
| `physics-provider-contract-kit` | `nexusengine/domains/physics/provider-contract` | Describe and validate backend Physics providers without owning a concrete solver. |
| `physics-state-schema-kit` | `nexusengine/domains/physics/state-schema` | Validate and normalize portable Physics snapshots for deterministic replay. |
| `physics-command-schema-kit` | `nexusengine/domains/physics/command-schema` | Define deterministic, exact-once Physics command envelopes. |
| `physics-event-schema-kit` | `nexusengine/domains/physics/event-schema` | Define ordered, portable Physics event envelopes. |
| `physics-query-schema-kit` | `nexusengine/domains/physics/query-schema` | Define read-only portable Physics query request and result envelopes. |
| `physics-installation-kit` | `nexusengine/domains/physics/lifecycle/installation` | Own the aggregate phase and provider identity for one installed Physics composition. |
| `physics-startup-kit` | `nexusengine/domains/physics/lifecycle/startup` | Own deterministic startup requests and provider-readiness receipts. |
| `physics-step-kit` | `nexusengine/domains/physics/lifecycle/step` | Own deterministic Physics step requests, completion ordering, and provider-neutral frame receipts. |
| `physics-shutdown-kit` | `nexusengine/domains/physics/lifecycle/shutdown` | Own deterministic provider shutdown requests and completion receipts. |
| `physics-reset-kit` | `nexusengine/domains/physics/lifecycle/reset` | Reset composed Physics lifecycle state atomically through public capability APIs. |
| `physics-snapshot-kit` | `nexusengine/domains/physics/lifecycle/snapshot` | Capture and atomically restore portable snapshots of composed Physics lifecycle state. |
| `friction-material-kit` | `nexusengine/domains/physics/material/friction` | Normalize portable isotropic and anisotropic physical friction descriptors. |
| `restitution-material-kit` | `nexusengine/domains/physics/material/restitution` | Normalize physical restitution coefficient and activation-threshold descriptors. |
| `density-material-kit` | `nexusengine/domains/physics/material/density` | Normalize positive SI physical mass-density descriptors. |
| `surface-material-kit` | `nexusengine/domains/physics/material/surface` | Normalize renderer-neutral physical surface classification and tags. |
| `material-combine-policy-kit` | `nexusengine/domains/physics/material/combine-policy` | Resolve physical material pairs with deterministic symmetric coefficient-combine policy. |
| `physics-material-kit` | `nexusengine/domains/physics/material/registry` | Own immutable portable physical material records and exact-once registry mutations. |
| `physics-world-settings-kit` | `nexusengine/domains/physics/world/settings` | Normalize portable Physics coordinate, unit, bounds, and out-of-bounds settings. |
| `gravity-field-kit` | `nexusengine/domains/physics/world/gravity-field` | Own portable deterministic uniform and point-gravity field records and sampling. |
| `force-field-kit` | `nexusengine/domains/physics/world/force-field` | Own portable deterministic non-gravity force and acceleration field records and sampling. |
| `wind-field-kit` | `nexusengine/domains/physics/world/wind-field` | Own portable deterministic physical flow-velocity field records and sampling. |
| `time-scale-kit` | `nexusengine/domains/physics/world/time-scale` | Own portable deterministic Physics-only time-scale records and delta resolution. |
| `simulation-region-kit` | `nexusengine/domains/physics/world/simulation-region` | Own portable physical simulation activation regions and deterministic point resolution. |
| `physics-world-kit` | `nexusengine/domains/physics/world/registry` | Own immutable Physics world records and compose public field, scale, and region capabilities into read-only samples. |

## Lifecycle

- Duplicate install: Return the installed Physics API without duplicate state or systems.
- Snapshot: Serialize Physics state and descriptors.
- Reset: Restore the configured Physics baseline.
