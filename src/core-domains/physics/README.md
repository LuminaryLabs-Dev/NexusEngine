# Physics Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:physics`
- Status: `stable-candidate`
- Registry SHA-256: `a5e0ac2156e86da208c6525d7c611d0245d7d1a57f5e5f186fbe83bac2f04e82`
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
| `n:physics:body` | Own portable provider-neutral body identity, state, mass properties, sleep state, lifecycle, and exact-once registry mutations. |
| `n:physics:shape` | Own portable provider-neutral collision-shape identity, geometry descriptors, validation, and exact-once registration. |
| `n:physics:material` | Own portable physical material identity, coefficients, surface classification, and deterministic pair-combine policy. |
| `n:physics:collider` | Own portable collider identity, attachment, filtering, sensor semantics, lifecycle, and exact-once records. |
| `n:physics:detection` | Own provider-neutral broad-phase and narrow-phase collision classification without contact or solver behavior. |
| `n:physics:constraints` | Own portable constraint descriptors, exact records, lifecycle status, revisions, and break policy semantics. |
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
| `body-identity-kit` | `nexusengine/domains/physics/body/identity` | Normalize stable portable Physics body identity, tags, and metadata. |
| `body-type-kit` | `nexusengine/domains/physics/body/type` | Normalize static, dynamic, and kinematic Physics body modes. |
| `body-pose-kit` | `nexusengine/domains/physics/body/pose` | Normalize body position and canonical quaternion orientation. |
| `body-velocity-kit` | `nexusengine/domains/physics/body/velocity` | Normalize finite linear and angular Physics body velocity descriptors. |
| `body-force-kit` | `nexusengine/domains/physics/body/force` | Normalize portable force, torque, and impulse accumulator descriptors. |
| `body-mass-kit` | `nexusengine/domains/physics/body/mass` | Normalize body mass, inverse mass, and center-of-mass descriptors. |
| `body-inertia-kit` | `nexusengine/domains/physics/body/inertia` | Normalize principal inertia, inverse inertia, and local inertia orientation. |
| `body-damping-kit` | `nexusengine/domains/physics/body/damping` | Normalize finite nonnegative linear and angular damping descriptors. |
| `body-sleep-kit` | `nexusengine/domains/physics/body/sleep` | Normalize body sleep state and explicit exact-once sleep commands. |
| `body-wake-kit` | `nexusengine/domains/physics/body/wake` | Normalize explicit exact-once Physics body wake commands. |
| `body-lifecycle-kit` | `nexusengine/domains/physics/body/lifecycle` | Normalize active and disabled body lifecycle state and exact transition commands. |
| `body-state-kit` | `nexusengine/domains/physics/body/state` | Compose atomic portable body descriptors into one coherent provider-neutral body state. |
| `body-registry-kit` | `nexusengine/domains/physics/body/registry` | Own portable Physics body records and exact-once lifecycle transitions without solver execution. |
| `shape-identity-kit` | `nexusengine/domains/physics/shape/identity` | Normalize stable portable Physics shape identity, type, and metadata. |
| `shape-validation-kit` | `nexusengine/domains/physics/shape/validation` | Validate any canonical portable Physics shape descriptor without mutation. |
| `sphere-shape-kit` | `nexusengine/domains/physics/shape/sphere` | Normalize portable sphere collision geometry. |
| `box-shape-kit` | `nexusengine/domains/physics/shape/box` | Normalize portable box collision geometry. |
| `capsule-shape-kit` | `nexusengine/domains/physics/shape/capsule` | Normalize portable capsule collision geometry. |
| `cylinder-shape-kit` | `nexusengine/domains/physics/shape/cylinder` | Normalize portable cylinder collision geometry. |
| `cone-shape-kit` | `nexusengine/domains/physics/shape/cone` | Normalize portable cone collision geometry. |
| `plane-shape-kit` | `nexusengine/domains/physics/shape/plane` | Normalize portable infinite-plane collision geometry. |
| `convex-shape-kit` | `nexusengine/domains/physics/shape/convex` | Normalize portable convex-hull collision geometry. |
| `triangle-mesh-shape-kit` | `nexusengine/domains/physics/shape/triangle-mesh` | Normalize indexed portable triangle-mesh collision geometry. |
| `heightfield-shape-kit` | `nexusengine/domains/physics/shape/heightfield` | Normalize sampled portable heightfield collision geometry. |
| `compound-shape-kit` | `nexusengine/domains/physics/shape/compound` | Normalize portable compound collision-shape references and local poses. |
| `scaled-shape-kit` | `nexusengine/domains/physics/shape/scaled` | Normalize portable positive nonuniform scaling of a referenced collision shape. |
| `shape-registry-kit` | `nexusengine/domains/physics/shape/registry` | Own exact-once deterministic registration and lookup of portable Physics shapes. |
| `friction-material-kit` | `nexusengine/domains/physics/material/friction` | Normalize portable isotropic and anisotropic physical friction descriptors. |
| `restitution-material-kit` | `nexusengine/domains/physics/material/restitution` | Normalize physical restitution coefficient and activation-threshold descriptors. |
| `density-material-kit` | `nexusengine/domains/physics/material/density` | Normalize positive SI physical mass-density descriptors. |
| `surface-material-kit` | `nexusengine/domains/physics/material/surface` | Normalize renderer-neutral physical surface classification and tags. |
| `material-combine-policy-kit` | `nexusengine/domains/physics/material/combine-policy` | Resolve physical material pairs with deterministic symmetric coefficient-combine policy. |
| `physics-material-kit` | `nexusengine/domains/physics/material/registry` | Own immutable portable physical material records and exact-once registry mutations. |
| `collider-identity-kit` | `nexusengine/domains/physics/collider/identity` | Normalize stable portable Physics collider identity, tags, and metadata. |
| `collider-attachment-kit` | `nexusengine/domains/physics/collider/attachment` | Normalize a collider attachment to public Body and Shape registry identities. |
| `collider-pose-kit` | `nexusengine/domains/physics/collider/pose` | Normalize provider-neutral collider-local position and orientation descriptors. |
| `collider-material-kit` | `nexusengine/domains/physics/collider/material` | Normalize a collider reference to one public Physics material identity. |
| `collision-layer-kit` | `nexusengine/domains/physics/collider/layer` | Normalize one bounded provider-neutral collision layer. |
| `collision-mask-kit` | `nexusengine/domains/physics/collider/mask` | Normalize a deterministic bounded collision-layer set and its portable bit value. |
| `collision-group-kit` | `nexusengine/domains/physics/collider/group` | Normalize a named collision layer-and-mask policy descriptor. |
| `collider-filter-kit` | `nexusengine/domains/physics/collider/filter` | Normalize provider-neutral collider layer, mask, group, and exclusion descriptors. |
| `sensor-collider-kit` | `nexusengine/domains/physics/collider/sensor` | Normalize non-solving sensor semantics independently from collision detection and event dispatch. |
| `trigger-collider-kit` | `nexusengine/domains/physics/collider/trigger` | Normalize event-selection semantics for a sensor-backed trigger collider. |
| `collider-lifecycle-kit` | `nexusengine/domains/physics/collider/lifecycle` | Normalize provider-neutral enabled and disabled collider lifecycle state and commands. |
| `collider-registry-kit` | `nexusengine/domains/physics/collider/registry` | Own portable collider records, revisions, reference validation, and exact-once mutations. |
| `collision-detection-result-kit` | `nexusengine/domains/physics/detection/result` | Normalize finite portable collision results and stable result ordering. |
| `broad-phase-pair-kit` | `nexusengine/domains/physics/detection/broad-phase-pair` | Normalize, filter, deduplicate, and stably order broad-phase pairs. |
| `spatial-partition-kit` | `nexusengine/domains/physics/detection/spatial-partition` | Own exact-once portable broad-phase proxy records and deterministic bounds queries. |
| `dynamic-tree-kit` | `nexusengine/domains/physics/detection/dynamic-tree` | Build and query deterministic immutable AABB trees from portable proxies. |
| `sweep-and-prune-kit` | `nexusengine/domains/physics/detection/sweep-and-prune` | Generate deterministic broad-phase pairs by sorted-axis interval sweeping. |
| `shape-intersection-kit` | `nexusengine/domains/physics/detection/shape-intersection` | Resolve exact analytic primitive and convex-plane shape intersections. |
| `gjk-detection-kit` | `nexusengine/domains/physics/detection/gjk` | Determine convex support-shape separation or intersection with deterministic GJK simplex evolution. |
| `epa-penetration-kit` | `nexusengine/domains/physics/detection/epa` | Expand an intersecting GJK simplex into deterministic convex penetration witnesses. |
| `continuous-collision-kit` | `nexusengine/domains/physics/detection/continuous-collision` | Compute exact linear sphere-sphere time of impact and reject unsupported sweep pairs. |
| `narrow-phase-kit` | `nexusengine/domains/physics/detection/narrow-phase` | Dispatch supported analytic and convex algorithms into one portable collision result. |
| `broad-phase-kit` | `nexusengine/domains/physics/detection/broad-phase` | Own canonical Detection discovery and deterministic broad-phase strategy selection. |
| `ball-socket-constraint-kit` | `nexusengine/domains/physics/constraints/ball-socket` | Normalize portable ball-socket constraint descriptors without provider or solver execution. |
| `cone-twist-constraint-kit` | `nexusengine/domains/physics/constraints/cone-twist` | Normalize portable cone-twist constraint descriptors without provider or solver execution. |
| `distance-constraint-kit` | `nexusengine/domains/physics/constraints/distance` | Normalize portable bounded-distance constraint descriptors without provider or solver execution. |
| `drive-constraint-kit` | `nexusengine/domains/physics/constraints/drive` | Normalize portable positional and velocity drive constraint descriptors. |
| `fixed-constraint-kit` | `nexusengine/domains/physics/constraints/fixed` | Normalize portable fixed constraint descriptors without provider or solver execution. |
| `hinge-constraint-kit` | `nexusengine/domains/physics/constraints/hinge` | Normalize portable local-axis hinge constraint descriptors. |
| `limit-constraint-kit` | `nexusengine/domains/physics/constraints/limit` | Normalize portable linear and angular limit constraint descriptors. |
| `motor-constraint-kit` | `nexusengine/domains/physics/constraints/motor` | Normalize portable bounded motor constraint descriptors. |
| `slider-constraint-kit` | `nexusengine/domains/physics/constraints/slider` | Normalize portable local-axis slider constraint descriptors. |
| `spring-constraint-kit` | `nexusengine/domains/physics/constraints/spring` | Normalize portable linear and angular spring constraint descriptors. |
| `constraint-break-kit` | `nexusengine/domains/physics/constraints/break` | Normalize and purely evaluate portable constraint break thresholds. |
| `constraint-registry-kit` | `nexusengine/domains/physics/constraints/registry` | Own deterministic portable constraint records, terminal break state, and exact-once mutations. |
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
