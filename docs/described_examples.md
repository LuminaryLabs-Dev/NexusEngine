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
