# Described Examples

These are long-form DSK composition examples. They describe large-scale project shapes where small domain additions can unlock much larger feature sets because each domain exposes services through the same `engine.n.*` bridge model.

## 1. Living Open World

Domain: `world-simulation`

Intent: one reusable world stack that can scale from a small island to a streaming continent. The world is not a single god kit. It is a composition of space, terrain, traversal, ecology, objectives, and telemetry services.

```txt
living-open-world
├─ world-space-domain
│  ├─ world-space-kit
│  ├─ spatial-scale-kit
│  └─ boundary-policy-kit
├─ terrain-domain
│  ├─ terrain-data-kit
│  ├─ terrain-streaming-kit
│  ├─ biome-field-kit
│  ├─ forest-placement-kit
│  └─ terrain-renderer-kit
├─ traversal-domain
│  ├─ physics-kit
│  ├─ locomotion-kit
│  ├─ camera-kit
│  └─ pathfinding-kit
├─ ecology-domain
│  ├─ wildlife-spawn-kit
│  ├─ resource-pressure-kit
│  └─ lifecycle-progression-kit
└─ objective-domain
   ├─ landmark-guidance-kit
   ├─ objective-flow-kit
   └─ telemetry-kit
```

## 2. City Operations Simulator

Domain: `urban-operations`

Intent: a city, facility, transit, or service-management stack that can run buildings, queues, schedules, economics, hazards, and telemetry through reusable operational services.

```txt
city-operations-simulator
├─ spatial-domain
│  ├─ world-space-kit
│  ├─ room-layout-kit
│  ├─ transport-route-kit
│  └─ spatial-scale-kit
├─ population-domain
│  ├─ occupant-flow-kit
│  ├─ request-queue-kit
│  ├─ schedule-kit
│  └─ lifecycle-progression-kit
├─ economy-domain
│  ├─ economy-kit
│  ├─ cargo-manifest-kit
│  └─ resource-pressure-kit
├─ facility-domain
│  ├─ facility-operations-kit
│  ├─ hazard-field-kit
│  └─ assistance-target-kit
└─ analysis-domain
   ├─ telemetry-kit
   ├─ scenario-driver-kit
   └─ debug-overlay-kit
```

## 3. Modular Aquarium Ecosystem

Domain: `contained-ecosystem`

Intent: a fish tank that can scale into aquariums, reef simulations, biology displays, or educational micro-worlds. The tank is a mini-app composed from normal world services, not a special-case runtime.

```txt
modular-aquarium-ecosystem
├─ container-domain
│  ├─ world-space-kit
│  ├─ fish-tank-kit
│  ├─ glass-boundary-kit
│  └─ spatial-scale-kit
├─ water-domain
│  ├─ water-volume-kit
│  ├─ water-surface-kit
│  ├─ resource-pressure-kit
│  └─ realism-kit
├─ habitat-domain
│  ├─ terrain-data-kit
│  ├─ terrain-renderer-kit
│  ├─ object-streaming-kit
│  └─ environmental-affordance-kit
├─ life-domain
│  ├─ fish-school-kit
│  ├─ lifecycle-progression-kit
│  ├─ hazard-field-kit
│  └─ interaction-target-kit
└─ presentation-domain
   ├─ camera-kit
   ├─ object-inspection-kit
   └─ telemetry-kit
```

## 4. Rescue And Recovery Network

Domain: `emergency-response`

Intent: reusable rescue logic for boats, drones, vehicles, hospitals, evacuation, disaster zones, and salvage scenarios. The emergency fiction changes by host app, but the route, target, pressure, and recovery services stay reusable.

```txt
rescue-and-recovery-network
├─ environment-domain
│  ├─ world-space-kit
│  ├─ water-surface-kit
│  ├─ terrain-data-kit
│  └─ hazard-field-kit
├─ mobility-domain
│  ├─ vehicle-dynamics-kit
│  ├─ route-field-kit
│  ├─ pathfinding-kit
│  └─ transfer-zone-kit
├─ target-domain
│  ├─ assistance-target-kit
│  ├─ request-fulfillment-kit
│  ├─ cargo-manifest-kit
│  └─ lifecycle-progression-kit
├─ pressure-domain
│  ├─ timing-window-kit
│  ├─ resource-pressure-kit
│  └─ scenario-duration-kit
└─ operation-domain
   ├─ scenario-driver-kit
   ├─ objective-flow-kit
   └─ telemetry-kit
```

## 5. AR Training World

Domain: `spatial-training`

Intent: AR scenes that scale from one object placement to full training simulations with inspection, surface placement, guided objectives, and validation. Device/session behavior stays separate from spatial and lesson behavior.

```txt
ar-training-world
├─ device-domain
│  ├─ ar-device-kit
│  ├─ ar-session-kit
│  ├─ ar-launcher-kit
│  └─ ar-renderer-kit
├─ spatial-domain
│  ├─ world-space-kit
│  ├─ spatial-anchor-kit
│  ├─ surface-placement-kit
│  └─ spatial-scale-kit
├─ interaction-domain
│  ├─ object-inspection-kit
│  ├─ interaction-kit
│  ├─ interaction-target-kit
│  └─ environmental-affordance-kit
├─ lesson-domain
│  ├─ objective-flow-kit
│  ├─ sequence-node-kit
│  ├─ landmark-guidance-kit
│  └─ reveal-light-kit
└─ validation-domain
   ├─ telemetry-kit
   ├─ scenario-driver-kit
   └─ debug-overlay-kit
```

## 6. Logistics World Platform

Domain: `logistics`

Intent: reusable delivery, warehousing, cargo, request, route, pressure, and fulfillment systems for many games or simulations. The same service graph can support couriers, warehouses, field service, transit, or evacuation routing.

```txt
logistics-world-platform
├─ route-domain
│  ├─ world-space-kit
│  ├─ route-field-kit
│  ├─ pathfinding-kit
│  └─ transport-route-kit
├─ cargo-domain
│  ├─ cargo-manifest-kit
│  ├─ transfer-zone-kit
│  ├─ request-fulfillment-kit
│  └─ resource-pressure-kit
├─ vehicle-domain
│  ├─ vehicle-dynamics-kit
│  ├─ physics-kit
│  └─ input-intent-kit
├─ demand-domain
│  ├─ request-queue-kit
│  ├─ schedule-kit
│  ├─ economy-kit
│  └─ facility-operations-kit
└─ proof-domain
   ├─ scenario-driver-kit
   ├─ telemetry-kit
   └─ lifecycle-progression-kit
```

## 7. Puzzle Adventure Framework

Domain: `puzzle-adventure`

Intent: reusable puzzle rooms, locks, symbols, reveal logic, object inspection, traversal, and progression. The host app supplies theme, art, and story while DSKs own deterministic puzzle services.

```txt
puzzle-adventure-framework
├─ world-domain
│  ├─ world-space-kit
│  ├─ room-layout-kit
│  ├─ camera-kit
│  └─ render-descriptor-kit
├─ puzzle-domain
│  ├─ symbol-alignment-kit
│  ├─ lock-and-socket-kit
│  ├─ reveal-light-kit
│  └─ objective-flow-kit
├─ interaction-domain
│  ├─ object-inspection-kit
│  ├─ interaction-target-kit
│  ├─ environmental-affordance-kit
│  └─ input-intent-kit
├─ traversal-domain
│  ├─ physics-kit
│  ├─ locomotion-kit
│  └─ pathfinding-kit
└─ narrative-domain
   ├─ sequence-node-kit
   ├─ landmark-guidance-kit
   └─ telemetry-kit
```

## 8. Infinite Runner Ecosystem

Domain: `procedural-motion`

Intent: a runner stack that can become trees, rooftops, caves, rails, roads, water streams, or space lanes by swapping services. The motion loop stays stable while world generation and challenge kits change.

```txt
infinite-runner-ecosystem
├─ world-domain
│  ├─ world-space-kit
│  ├─ procedural-kit
│  ├─ terrain-data-kit
│  └─ object-streaming-kit
├─ movement-domain
│  ├─ tree-runner-kit
│  ├─ locomotion-kit
│  ├─ physics-kit
│  └─ camera-kit
├─ challenge-domain
│  ├─ hazard-field-kit
│  ├─ timing-window-kit
│  ├─ resource-pressure-kit
│  └─ collectible-kit
├─ progression-domain
│  ├─ lifecycle-progression-kit
│  ├─ objective-flow-kit
│  └─ scenario-duration-kit
└─ validation-domain
   ├─ telemetry-kit
   ├─ scenario-driver-kit
   └─ debug-overlay-kit
```

## 9. Social Simulation Hub

Domain: `social-world`

Intent: reusable spaces, people flow, schedules, requests, objects, economy, and interaction for towns, offices, schools, events, or service simulations.

```txt
social-simulation-hub
├─ place-domain
│  ├─ world-space-kit
│  ├─ room-layout-kit
│  ├─ landmark-guidance-kit
│  └─ environmental-affordance-kit
├─ actor-domain
│  ├─ occupant-flow-kit
│  ├─ schedule-kit
│  ├─ lifecycle-progression-kit
│  └─ request-queue-kit
├─ interaction-domain
│  ├─ object-inspection-kit
│  ├─ interaction-target-kit
│  ├─ objective-flow-kit
│  └─ sequence-node-kit
├─ economy-domain
│  ├─ economy-kit
│  ├─ cargo-manifest-kit
│  └─ request-fulfillment-kit
└─ operations-domain
   ├─ facility-operations-kit
   ├─ telemetry-kit
   └─ scenario-driver-kit
```

## 10. Multiplayer-Ready Simulation Slice

Domain: `replicated-simulation`

Intent: a future-facing composition where deterministic domains can be snapshotted, reset, streamed, audited, and eventually partitioned for network or server execution. It stays linear today but designs every domain around ownership and service boundaries.

```txt
multiplayer-ready-simulation-slice
├─ state-domain
│  ├─ world-space-kit
│  ├─ snapshot-kit
│  ├─ reset-policy-kit
│  └─ lifecycle-progression-kit
├─ simulation-domain
│  ├─ physics-kit
│  ├─ terrain-data-kit
│  ├─ hazard-field-kit
│  └─ objective-flow-kit
├─ actor-domain
│  ├─ input-intent-kit
│  ├─ locomotion-kit
│  ├─ interaction-kit
│  └─ camera-kit
├─ streaming-domain
│  ├─ terrain-streaming-kit
│  ├─ object-streaming-kit
│  └─ resource-pressure-kit
└─ observability-domain
   ├─ telemetry-kit
   ├─ scenario-driver-kit
   └─ debug-overlay-kit
```

## 11. Service Graph Proof Harness

Domain: `composition-governance`

Intent: a reusable validation composition that proves a selected DSK graph can install, expose services, own paths, deliver cross-domain events, and report browser/local proof state without changing source or product UI.

```txt
service-graph-proof-harness
├─ governance-domain
│  ├─ service-registry-kit
│  ├─ install-transaction-kit
│  └─ composition-audit-kit
├─ event-domain
│  ├─ event-handoff-kit
│  ├─ scenario-driver-kit
│  └─ telemetry-kit
├─ state-domain
│  ├─ snapshot-kit
│  ├─ reset-policy-kit
│  └─ retention-policy-kit
├─ proof-domain
│  ├─ proof-surface-kit
│  ├─ render-descriptor-kit
│  └─ debug-overlay-kit
└─ operations-sample-domain
   ├─ request-queue-kit
   ├─ economy-ledger-kit
   └─ cargo-manifest-kit
```

## 12. Recovery Transfer Policy Harness

Domain: `state-transition-policy`

Intent: a reusable validation composition for rescue, evacuation, logistics, AR training, and puzzle flows where terminal states, transfer constraints, restored progress, and one-shot inputs must stay deterministic before broad DSK promotion.

```txt
recovery-transfer-policy-harness
├─ state-policy-domain
│  ├─ terminal-state-policy-kit
│  ├─ progress-normalization-kit
│  └─ retention-policy-kit
├─ transfer-domain
│  ├─ transfer-constraint-kit
│  ├─ transfer-zone-kit
│  └─ cargo-manifest-kit
├─ recovery-domain
│  ├─ assistance-target-kit
│  ├─ request-fulfillment-kit
│  └─ objective-flow-kit
├─ input-domain
│  ├─ input-edge-semantics-kit
│  ├─ interaction-target-kit
│  └─ environmental-affordance-kit
└─ proof-domain
   ├─ proof-surface-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 13. Accepted Mutation Time Harness

Domain: `accepted-mutation-time-policy`

Intent: a reusable validation composition for operations, logistics, progression, and transport flows where a service call should validate first, mutate once, emit completion once, and consume large or scaled time deterministically.

```txt
accepted-mutation-time-harness
├─ mutation-policy-domain
│  ├─ accepted-mutation-kit
│  ├─ completion-idempotency-kit
│  └─ economy-ledger-kit
├─ time-policy-domain
│  ├─ time-step-catchup-kit
│  ├─ schedule-kit
│  └─ transport-route-kit
├─ config-policy-domain
│  ├─ config-normalization-kit
│  ├─ lifecycle-progression-kit
│  └─ objective-flow-kit
├─ operations-domain
│  ├─ request-queue-kit
│  ├─ facility-operations-kit
│  └─ scenario-driver-kit
└─ proof-domain
   ├─ proof-coverage-matrix-kit
   ├─ telemetry-kit
   └─ debug-overlay-kit
```

## 14. Operations Data Integrity Harness

Domain: `operations-data-integrity`

Intent: a reusable validation composition for service-flow, logistics, facility, and resource-pressure simulations where authored data must stay immutable, generated ids must be collision-free, economy mutations must stay finite, and restored state must be internally consistent across reset/replay.

```txt
operations-data-integrity-harness
├─ data-integrity-domain
│  ├─ immutable-config-kit
│  ├─ stable-id-allocation-kit
│  └─ restored-resource-state-kit
├─ operations-domain
│  ├─ occupant-flow-kit
│  ├─ facility-operations-kit
│  └─ request-queue-kit
├─ economy-domain
│  ├─ finite-transaction-policy-kit
│  ├─ economy-ledger-kit
│  └─ accepted-mutation-kit
├─ pressure-domain
│  ├─ resource-pressure-kit
│  ├─ config-normalization-kit
│  └─ scenario-driver-kit
└─ proof-domain
   ├─ operations-invariant-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 15. Spatial Mobility Invariant Harness

Domain: `spatial-mobility-invariants`

Intent: a reusable validation composition for AR training, rescue mobility, hazard fields, runners, and spatial guidance flows where query state must not hide transition events, immediate time thresholds must settle deterministically, generated hazards need stable ids, and movement resources must respect capacity before simulation uses them.

```txt
spatial-mobility-invariant-harness
├─ spatial-transition-domain
│  ├─ transition-state-policy-kit
│  ├─ spatial-scale-kit
│  └─ landmark-guidance-kit
├─ time-threshold-domain
│  ├─ immediate-threshold-policy-kit
│  ├─ scenario-duration-kit
│  └─ timing-window-kit
├─ hazard-identity-domain
│  ├─ hazard-identity-policy-kit
│  ├─ hazard-field-kit
│  └─ stable-id-allocation-kit
├─ mobility-resource-domain
│  ├─ resource-bound-normalization-kit
│  ├─ vehicle-dynamics-kit
│  └─ resource-pressure-kit
└─ proof-domain
   ├─ spatial-mobility-invariant-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 16. Receipt Integrity Harness

Domain: `receipt-integrity`

Intent: a reusable validation composition for timing, interaction, reward, and logistics flows where action result ids, completion events, claim events, and request ids must stay stable and idempotent before they feed telemetry, replay, rewards, or public proof rows.

```txt
receipt-integrity-harness
├─ receipt-domain
│  ├─ receipt-identity-kit
│  ├─ timing-window-kit
│  └─ telemetry-kit
├─ event-idempotency-domain
│  ├─ event-idempotency-kit
│  ├─ interaction-target-kit
│  └─ completion-idempotency-kit
├─ reward-domain
│  ├─ claim-receipt-policy-kit
│  ├─ collectible-kit
│  └─ economy-ledger-kit
├─ request-domain
│  ├─ request-identity-policy-kit
│  ├─ request-fulfillment-kit
│  └─ stable-id-allocation-kit
└─ proof-domain
   ├─ receipt-integrity-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ scenario-driver-kit
```

## 17. Bridge State Ownership Harness

Domain: `bridge-state-ownership`

Intent: a reusable validation composition for AR placement, objective lessons, puzzle wrappers, platformer wrappers, telemetry, and proof surfaces where emitted bridge events must reach their consumers, step transitions must emit receipts once, and wrapper snapshots must reflect real owned state or declare themselves stateless adapters.

```txt
bridge-state-ownership-harness
├─ bridge-phase-domain
│  ├─ bridge-phase-policy-kit
│  ├─ event-handoff-kit
│  └─ surface-placement-kit
├─ step-receipt-domain
│  ├─ step-transition-receipt-kit
│  ├─ objective-flow-kit
│  └─ ar-experience-kit
├─ delegated-action-domain
│  ├─ delegated-action-reconciliation-kit
│  ├─ interaction-target-kit
│  └─ receipt-identity-kit
├─ wrapper-state-domain
│  ├─ wrapper-state-contract-kit
│  ├─ symbol-alignment-kit
│  └─ micro-platformer-kit
└─ proof-domain
   ├─ bridge-state-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 18. Source State Integrity Harness

Domain: `source-state-integrity`

Intent: a reusable validation composition for dataset-heavy, ledger, pressure, replay, and proof services where runtime mutation must not leak into authored config, reset must rebuild from clean source data, retention limits must mean what they say, and initial terminal states must emit or record consistent receipts.

```txt
source-state-integrity-harness
├─ authored-source-domain
│  ├─ authored-source-isolation-kit
│  ├─ immutable-config-kit
│  └─ config-normalization-kit
├─ reset-source-domain
│  ├─ reset-source-policy-kit
│  ├─ water-surface-kit
│  └─ route-field-kit
├─ retention-domain
│  ├─ retention-limit-policy-kit
│  ├─ economy-ledger-kit
│  └─ telemetry-kit
├─ initial-terminal-domain
│  ├─ initial-terminal-receipt-kit
│  ├─ pursuit-pressure-kit
│  └─ terminal-state-policy-kit
└─ proof-domain
   ├─ source-state-integrity-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ render-descriptor-kit
```

## 19. State Signal Contract Harness

Domain: `state-signal-contract`

Intent: a reusable validation composition for placement, interaction, puzzle/combat, validation-driver, and camera safety services where changes must emit clear signals: descriptors rebuild when meaningful inputs change, held actions do not accidentally repeat one-shot work, state machines emit transition receipts once, coordinate axes are normalized, and camera/presentation adjustments publish derived state without corrupting source targets.

```txt
state-signal-contract-harness
├─ invalidation-domain
│  ├─ descriptor-invalidation-kit
│  ├─ forest-placement-kit
│  └─ terrain-data-kit
├─ action-semantics-domain
│  ├─ action-repeat-policy-kit
│  ├─ input-edge-semantics-kit
│  └─ interaction-target-kit
├─ state-machine-domain
│  ├─ state-machine-transition-kit
│  ├─ shrine-puzzle-kit
│  └─ light-combat-kit
├─ coordinate-domain
│  ├─ coordinate-axis-policy-kit
│  ├─ scenario-driver-kit
│  └─ route-field-kit
├─ derived-state-domain
│  ├─ derived-state-boundary-kit
│  ├─ camera-kit
│  └─ camera-occlusion-kit
└─ proof-domain
   ├─ state-signal-contract-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 20. Service Lifecycle Config Harness

Domain: `service-lifecycle-config`

Intent: a reusable validation composition for companion/guide, world-state, spatial-room, and generated traversal services where command lifecycle, elapsed-time progression, descriptor normalization, and generated geometry bounds must be explicit before DSK promotion or public proof claims.

```txt
service-lifecycle-config-harness
├─ command-lifecycle-domain
│  ├─ command-lifecycle-kit
│  ├─ companion-command-kit
│  └─ receipt-identity-kit
├─ elapsed-time-domain
│  ├─ elapsed-rate-policy-kit
│  ├─ corruption-world-kit
│  └─ time-step-catchup-kit
├─ descriptor-normalization-domain
│  ├─ descriptor-normalization-kit
│  ├─ spatial-room-kit
│  └─ authored-source-isolation-kit
├─ generated-geometry-domain
│  ├─ generated-geometry-bounds-kit
│  ├─ tree-runner-kit
│  └─ config-normalization-kit
└─ proof-domain
   ├─ service-lifecycle-config-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 21. Traversal Proof Integrity Harness

Domain: `traversal-proof-integrity`

Intent: a reusable validation composition for pathfinding, navmesh, procedural generation, and physics recovery services where traversal costs must be valid, graph ids must be stable and unique, procedural signatures must reflect proof-relevant generator changes, and recovery events must publish one receipt with final state that matches the recovered entity.

```txt
traversal-proof-integrity-harness
├─ navigation-cost-domain
│  ├─ navigation-cost-policy-kit
│  ├─ pathfinding-kit
│  └─ route-field-kit
├─ navmesh-identity-domain
│  ├─ navmesh-identity-policy-kit
│  ├─ navmesh-kit
│  └─ stable-id-allocation-kit
├─ procedural-signature-domain
│  ├─ procedural-signature-taxonomy-kit
│  ├─ procedural-kit
│  └─ descriptor-invalidation-kit
├─ recovery-state-domain
│  ├─ recovery-receipt-state-kit
│  ├─ physics-kit
│  └─ event-idempotency-kit
└─ proof-domain
   ├─ traversal-proof-integrity-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 22. Runtime Failure Boundary Harness

Domain: `runtime-failure-boundary`

Intent: a reusable validation composition for DSK install and scheduler failure surfaces where service namespaces must be prototype-safe, failed installs must roll back or remain retryable, direct and composed dependencies must agree, and thrown ticks must not leak failed events into later success proof.

```txt
runtime-failure-boundary-harness
├─ namespace-policy-domain
│  ├─ dsk-namespace-policy-kit
│  ├─ service-registry-kit
│  └─ composition-audit-kit
├─ install-rollback-domain
│  ├─ dsk-install-rollback-kit
│  ├─ install-transaction-kit
│  └─ event-handoff-kit
├─ dependency-policy-domain
│  ├─ dsk-dependency-parity-kit
│  ├─ service-registry-kit
│  └─ composition-audit-kit
├─ scheduler-failure-domain
│  ├─ scheduler-failure-lifetime-kit
│  ├─ event-handoff-kit
│  └─ telemetry-kit
└─ proof-domain
   ├─ runtime-failure-boundary-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ proof-surface-kit
```

## 23. Experience Edge Contract Harness

Domain: `experience-edge-contract`

Intent: a reusable validation composition for character control, AR launch, presentation quality, and content-driven kits where one-shot receipts must not repeat every frame, start-time launch failures must fall back or diagnose clearly, custom visual profiles must be explicit, and empty authored datasets must not create placeholder simulation state.

```txt
experience-edge-contract-harness
├─ control-receipt-domain
│  ├─ control-recovery-receipt-kit
│  ├─ recovery-receipt-state-kit
│  └─ event-idempotency-kit
├─ launch-fallback-domain
│  ├─ launch-fallback-chain-kit
│  ├─ bridge-phase-policy-kit
│  └─ proof-surface-kit
├─ presentation-profile-domain
│  ├─ quality-profile-contract-kit
│  ├─ config-normalization-kit
│  └─ derived-state-boundary-kit
├─ content-contract-domain
│  ├─ content-dataset-contract-kit
│  ├─ authored-source-isolation-kit
│  └─ immutable-config-kit
└─ proof-domain
   ├─ experience-edge-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 24. Lifecycle Parity Cleanup Harness

Domain: `lifecycle-parity-cleanup`

Intent: a reusable validation composition for locomotion, terrain streaming, camera startup, and AR/session lifecycle services where state receipts, query output, acquired resources, and stopped-session snapshots must agree before proof routes or promoted DSK compositions can rely on them.

```txt
lifecycle-parity-cleanup-harness
├─ movement-receipt-domain
│  ├─ movement-receipt-transition-kit
│  ├─ action-repeat-policy-kit
│  └─ event-idempotency-kit
├─ terrain-parity-domain
│  ├─ terrain-query-chunk-parity-kit
│  ├─ terrain-data-kit
│  └─ procedural-signature-taxonomy-kit
├─ startup-cleanup-domain
│  ├─ partial-start-cleanup-kit
│  ├─ launch-fallback-chain-kit
│  └─ proof-surface-kit
├─ session-stop-domain
│  ├─ session-stop-state-kit
│  ├─ state-machine-transition-kit
│  └─ event-handoff-kit
└─ proof-domain
   ├─ lifecycle-parity-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 25. Query Command Semantics Harness

Domain: `query-command-semantics`

Intent: a reusable validation composition for spatial guidance, affordance, route, and read API services where query calls must not masquerade as transitions, rejected commands must preserve active state, terminal targets must not emit fresh receipts, and public read results must be snapshots before telemetry, replay, or DSK promotion can trust them.

```txt
query-command-semantics-harness
├─ terminal-receipt-domain
│  ├─ terminal-receipt-policy-kit
│  ├─ landmark-guidance-kit
│  └─ event-idempotency-kit
├─ proximity-query-domain
│  ├─ proximity-query-transition-kit
│  ├─ environmental-affordance-kit
│  └─ transition-state-policy-kit
├─ rejected-command-domain
│  ├─ rejected-command-state-kit
│  ├─ accepted-mutation-kit
│  └─ command-lifecycle-kit
├─ query-isolation-domain
│  ├─ query-snapshot-isolation-kit
│  ├─ route-field-kit
│  └─ authored-source-isolation-kit
└─ proof-domain
   ├─ query-command-semantics-proof-kit
   ├─ proof-coverage-matrix-kit
   └─ telemetry-kit
```

## 26. Proof Readiness Queue Harness

Domain: `proof-readiness-queue`

Intent: a reusable validation composition for DSK promotion and public proof review where hardening fixtures, local/fetched/browser proof, aggregate scripts, targeted smokes, module-source strategy, npm availability, package-version policy, blockers, and not-claimed rows stay separate until each claim has direct evidence.

```txt
proof-readiness-queue-harness
|-- fixture-queue-domain
|   |-- hardening-fixture-queue-kit
|   |-- runtime-failure-boundary-proof-kit
|   |-- lifecycle-parity-proof-kit
|   |-- query-command-semantics-proof-kit
|   `-- experience-edge-proof-kit
|-- claim-taxonomy-domain
|   |-- proof-claim-taxonomy-kit
|   |-- proof-coverage-matrix-kit
|   `-- proof-surface-kit
|-- module-source-domain
|   |-- module-source-gate-kit
|   |-- proof-surface-kit
|   `-- telemetry-kit
|-- aggregate-targeted-domain
|   |-- aggregate-targeted-proof-parity-kit
|   |-- proof-coverage-matrix-kit
|   `-- telemetry-kit
`-- release-evidence-domain
    |-- release-evidence-checklist-kit
    |-- proof-claim-taxonomy-kit
    `-- hardening-fixture-queue-kit
```

## 27. Read Model Orchestration Isolation Harness

Domain: `read-model-orchestration-isolation`

Intent: a reusable validation composition for renderer registries, engine surfaces, and SequenceNode orchestration where descriptors, snapshots, sibling lifecycle state, and child receipt counts must be isolated before proof harnesses, telemetry, debug tools, or promoted DSK flows can trust read surfaces.

```txt
read-model-orchestration-isolation-harness
|-- registry-isolation-domain
|   |-- registry-descriptor-isolation-kit
|   |-- descriptor-normalization-kit
|   `-- derived-state-boundary-kit
|-- surface-read-model-domain
|   |-- surface-snapshot-isolation-kit
|   |-- event-handoff-kit
|   `-- query-snapshot-isolation-kit
|-- sequence-race-domain
|   |-- sequence-race-cleanup-kit
|   |-- scheduler-failure-lifetime-kit
|   `-- event-idempotency-kit
|-- sequence-any-domain
|   |-- sequence-any-receipt-policy-kit
|   |-- event-idempotency-kit
|   `-- receipt-identity-kit
`-- proof-domain
    |-- read-model-orchestration-proof-kit
    |-- proof-coverage-matrix-kit
    `-- telemetry-kit
```

## 28. Legacy Sequence AR Compatibility Harness

Domain: `legacy-sequence-ar-compatibility`

Intent: a reusable validation composition for legacy sequence runtime, multi-kit compatibility, FishingKit sequence defaults, and AR DOM rendering where replay/reset behavior, `AnyChild` loser cleanup, owning-kit action lookup, and authored AR text safety must be explicit before older exported surfaces can support composed DSK or public browser proof flows.

```txt
legacy-sequence-ar-compatibility-harness
|-- replay-reset-domain
|   |-- legacy-sequence-replay-reset-kit
|   |-- terminal-state-policy-kit
|   `-- event-handoff-kit
|-- any-cleanup-domain
|   |-- legacy-any-sibling-cleanup-kit
|   |-- event-idempotency-kit
|   `-- receipt-identity-kit
|-- owning-kit-domain
|   |-- legacy-sequence-owning-kit-context-kit
|   |-- service-registry-kit
|   `-- composition-audit-kit
|-- ar-content-safety-domain
|   |-- ar-default-text-safety-kit
|   |-- proof-surface-kit
|   `-- quality-profile-contract-kit
`-- proof-domain
    |-- compatibility-content-safety-proof-kit
    |-- proof-coverage-matrix-kit
    `-- telemetry-kit
```

## 29. AR Launch Spatial Read Model Harness

Domain: `ar-launch-spatial-read-model`

Intent: a reusable validation composition for AR launcher, AR device selection, launch-state callbacks, and SpatialRoom descriptors where missing AR composition, explicit mode fallback, live support state, and mutable room/anchor getters must be explicit before browser AR proof routes or spatial inspectors can trust capability claims.

```txt
ar-launch-spatial-read-model-harness
|-- launch-precondition-domain
|   |-- ar-launch-precondition-kit
|   |-- service-registry-kit
|   `-- proof-surface-kit
|-- mode-selection-domain
|   |-- ar-mode-selection-policy-kit
|   |-- launch-fallback-chain-kit
|   `-- proof-claim-taxonomy-kit
|-- launch-state-domain
|   |-- ar-launch-state-isolation-kit
|   |-- surface-snapshot-isolation-kit
|   `-- derived-state-boundary-kit
|-- spatial-read-model-domain
|   |-- spatial-room-getter-isolation-kit
|   |-- query-snapshot-isolation-kit
|   `-- authored-source-isolation-kit
`-- proof-domain
    |-- ar-spatial-read-model-proof-kit
    |-- proof-coverage-matrix-kit
    `-- telemetry-kit
```

## 30. Proof Signal Integrity Harness

Domain: `proof-signal-integrity`

Intent: a reusable validation composition for AR experience flows, WebXR helpers, engine time, and spatial descriptors where proof signals must be one-shot, nullable or structured on device failure, monotonic in normal ticks, and finite before telemetry, reward flows, browser proof, or DSK hardening reviews rely on them.

```txt
proof-signal-integrity-harness
|-- terminal-receipt-domain
|   |-- experience-terminal-receipt-kit
|   |-- event-idempotency-kit
|   `-- terminal-state-policy-kit
|-- device-helper-domain
|   |-- webxr-hit-test-failure-policy-kit
|   |-- launch-fallback-chain-kit
|   `-- proof-claim-taxonomy-kit
|-- time-policy-domain
|   |-- monotonic-tick-time-kit
|   |-- scheduler-failure-lifetime-kit
|   `-- proof-surface-kit
|-- spatial-config-domain
|   |-- finite-spatial-scale-kit
|   |-- descriptor-normalization-kit
|   `-- config-normalization-kit
`-- proof-domain
    |-- proof-signal-integrity-kit
    |-- proof-coverage-matrix-kit
    `-- telemetry-kit
```

## 31. Composition Proof Ownership Harness

Domain: `composition-proof-ownership`

Intent: a reusable validation composition for composer capability graphs, SequenceNode type registries, event-bus proof history, and AR launcher device sources where provider ownership, type meaning, diagnostic history, and support/session state must be explicit before large DSK graphs or browser proof routes can trust composition evidence.

```txt
composition-proof-ownership-harness
|-- provider-ownership-domain
|   |-- capability-provider-ownership-kit
|   |-- service-registry-kit
|   `-- composition-audit-kit
|-- sequence-type-domain
|   |-- sequence-type-registry-policy-kit
|   |-- sequence-node-kit
|   `-- legacy-sequence-owning-kit-context-kit
|-- event-history-domain
|   |-- sequence-event-history-isolation-kit
|   |-- surface-snapshot-isolation-kit
|   `-- event-idempotency-kit
|-- ar-runtime-source-domain
|   |-- ar-runtime-source-consistency-kit
|   |-- ar-mode-selection-policy-kit
|   `-- ar-launch-state-isolation-kit
`-- proof-domain
    |-- composition-proof-ownership-kit
    |-- proof-coverage-matrix-kit
    `-- telemetry-kit
```

## 32. Runtime Identity Lifecycle Harness

Domain: `runtime-identity-lifecycle-ownership`

Intent: a reusable validation composition for runtime kit bindings, ECS definition names, SequenceNode install-only adapters, and event-bus teardown where ownership and lifecycle policy must be explicit before composed DSK graphs or proof harnesses can trust binding services, state isolation, repeated deployments, or disposed listener counts.

```txt
runtime-identity-lifecycle-harness
|-- binding-ownership-domain
|   |-- runtime-binding-ownership-kit
|   |-- capability-provider-ownership-kit
|   `-- service-registry-kit
|-- definition-identity-domain
|   |-- ecs-definition-identity-kit
|   |-- authored-source-isolation-kit
|   `-- query-snapshot-isolation-kit
|-- sequence-install-domain
|   |-- sequence-install-only-idempotency-kit
|   |-- sequence-type-registry-policy-kit
|   `-- install-transaction-kit
|-- event-bus-lifecycle-domain
|   |-- event-bus-disposed-parity-kit
|   |-- sequence-event-history-isolation-kit
|   `-- lifecycle-parity-proof-kit
`-- proof-domain
    |-- runtime-identity-lifecycle-proof-kit
    |-- proof-coverage-matrix-kit
    `-- telemetry-kit
```

## 33. Content Boundary Objective Harness

Domain: `content-boundary-objective-contract`

Intent: a reusable validation composition for public API boundary, content-kit preset identity, objective thresholds, and authored dataset validation where a kit can look reusable or complete while exporting themed presets from core, sharing runtime ids, or accepting invalid completion criteria.

```txt
content-boundary-objective-harness
|-- public-api-boundary-domain
|   |-- public-api-product-boundary-kit
|   |-- proof-claim-taxonomy-kit
|   `-- release-evidence-checklist-kit
|-- preset-identity-domain
|   |-- preset-runtime-identity-kit
|   |-- runtime-binding-ownership-kit
|   `-- service-registry-kit
|-- objective-policy-domain
|   |-- objective-threshold-policy-kit
|   |-- terminal-state-policy-kit
|   `-- config-normalization-kit
|-- content-validation-domain
|   |-- content-dataset-validation-kit
|   |-- content-dataset-contract-kit
|   `-- authored-source-isolation-kit
`-- proof-domain
    |-- content-boundary-objective-proof-kit
    |-- proof-coverage-matrix-kit
    `-- telemetry-kit
```

## 34. Query Read Model Isolation Harness

Domain: `query-read-model-isolation`

Intent: a reusable validation composition for public query helpers and engine read methods where read-only APIs must return isolated snapshots before renderers, dashboards, telemetry, AI adapters, or proof harnesses can inspect logistics, spatial, hazard, and water state safely.

```txt
query-read-model-isolation-harness
|-- public-helper-domain
|   |-- public-query-helper-contract-kit
|   |-- query-snapshot-isolation-kit
|   `-- authored-source-isolation-kit
|-- engine-read-domain
|   |-- engine-read-method-snapshot-kit
|   |-- accepted-mutation-kit
|   `-- query-snapshot-isolation-kit
|-- metadata-isolation-domain
|   |-- nested-metadata-read-isolation-kit
|   |-- content-dataset-validation-kit
|   `-- immutable-config-kit
|-- stored-query-domain
|   |-- stored-query-proof-snapshot-kit
|   |-- surface-snapshot-isolation-kit
|   `-- telemetry-kit
`-- proof-domain
    |-- query-read-model-isolation-proof-kit
    |-- query-command-semantics-proof-kit
    `-- proof-coverage-matrix-kit
```

## 35. Scheduler World Mutation Isolation Harness

Domain: `scheduler-world-mutation-isolation`

Intent: a reusable validation composition for ECS scheduler and world APIs where one simulation pass must have explicit topology, membership, and event-read mutation boundaries before DSK installers, proof adapters, cleanup systems, or SequenceNode bridges can trust tick evidence.

```txt
scheduler-world-mutation-isolation-harness
|-- scheduler-topology-domain
|   |-- scheduler-active-run-policy-kit
|   |-- scheduler-phase-topology-kit
|   `-- scheduler-failure-lifetime-kit
|-- system-iteration-domain
|   |-- runsystem-membership-snapshot-kit
|   |-- accepted-mutation-kit
|   `-- state-snapshot-isolation-kit
|-- event-queue-domain
|   |-- event-queue-payload-isolation-kit
|   |-- event-handoff-kit
|   `-- surface-snapshot-isolation-kit
`-- proof-domain
    |-- scheduler-world-mutation-proof-kit
    |-- runtime-failure-boundary-proof-kit
    `-- proof-coverage-matrix-kit
```

## 36. Procedural Navigation State Ownership Harness

Domain: `procedural-navigation-state-ownership`

Intent: a reusable validation composition for generated space and navigation APIs where queued command payloads, path snapshots, procedural snapshots, and regenerate return values must be isolated before traversal proof, editor tooling, render adapters, or DSK promotion can trust generated-world evidence.

```txt
procedural-navigation-state-ownership-harness
|-- navigation-command-domain
|   |-- navigation-command-payload-ownership-kit
|   |-- accepted-mutation-kit
|   `-- event-queue-payload-isolation-kit
|-- navigation-read-domain
|   |-- navigation-proof-snapshot-isolation-kit
|   |-- query-snapshot-isolation-kit
|   `-- navigation-cost-policy-kit
|-- procedural-read-domain
|   |-- procedural-proof-snapshot-isolation-kit
|   |-- procedural-signature-taxonomy-kit
|   `-- authored-source-isolation-kit
|-- procedural-command-domain
|   |-- procedural-command-return-state-kit
|   |-- config-normalization-kit
|   `-- state-snapshot-isolation-kit
`-- proof-domain
    |-- procedural-navigation-ownership-proof-kit
    |-- traversal-proof-integrity-kit
    `-- proof-coverage-matrix-kit
```

## 37. Telemetry Command Evidence Ownership Harness

Domain: `telemetry-command-evidence-ownership`

Intent: a reusable validation composition for telemetry, service commands, and input submissions where selected proof values, nested path reads, submitted metadata, returned command state, and current input frames must be isolated before operations proof, replay, automation, or DSK promotion can trust evidence.

```txt
telemetry-command-evidence-ownership-harness
|-- telemetry-snapshot-domain
|   |-- telemetry-selected-value-snapshot-kit
|   |-- telemetry-path-selector-isolation-kit
|   `-- proof-signal-integrity-kit
|-- service-command-domain
|   |-- service-command-payload-ownership-kit
|   |-- accepted-mutation-kit
|   `-- event-queue-payload-isolation-kit
|-- input-frame-domain
|   |-- input-frame-ownership-kit
|   |-- input-edge-semantics-kit
|   `-- state-snapshot-isolation-kit
`-- proof-domain
    |-- telemetry-command-evidence-proof-kit
    |-- query-read-model-isolation-proof-kit
    `-- proof-coverage-matrix-kit
```

## 38. Domain Command Config Ownership Harness

Domain: `domain-command-config-ownership`

Intent: a reusable validation composition for domain command, add/config, active-read, and returned-state APIs where nested host-authored payloads must be captured before economy, timing, pressure, lifecycle, or facility proof can be trusted.

```txt
domain-command-config-ownership-harness
|-- economy-command-domain
|   |-- economy-transaction-metadata-ownership-kit
|   |-- service-command-payload-ownership-kit
|   `-- event-queue-payload-isolation-kit
|-- timing-read-domain
|   |-- timing-action-read-ownership-kit
|   |-- state-snapshot-isolation-kit
|   `-- proof-signal-integrity-kit
|-- pressure-command-domain
|   |-- pressure-resource-command-ownership-kit
|   |-- resource-bound-normalization-kit
|   `-- state-snapshot-isolation-kit
|-- lifecycle-facility-domain
|   |-- lifecycle-facility-add-payload-ownership-kit
|   |-- authored-source-isolation-kit
|   `-- economy-transaction-metadata-ownership-kit
`-- proof-domain
    |-- domain-command-config-ownership-proof-kit
    |-- telemetry-command-evidence-proof-kit
    `-- proof-coverage-matrix-kit
```
