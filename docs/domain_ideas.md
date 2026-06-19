# Domain Ideas

This file is an expansion inventory for NexusRealtime DSK planning. It is not an implementation ledger. Add domain ideas here when a composition suggests a reusable ownership boundary that could become a Domain Service Kit.

Implementation target: when a domain idea becomes a real reusable kit, create or refine it in `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/`. NexusRealtime core should only receive contract, runtime, composer, or validation changes that make domain kits safer to compose.

## Domain Idea Rules

- A domain owns a state boundary, lifecycle, and service contract.
- A domain can be any scale: fish tank, room, route, city, open world, AR session, or replicated simulation slice.
- A domain should expose bridge services through `engine.n.*`, not by sharing private resources.
- A domain should be reusable across multiple products through config, datasets, and composition.
- A domain should declare likely `provides`, `requires`, snapshot/reset expectations, and path ownership.
- Treat domain ideas as ProtoKit candidates by default, not core kit requests.

## 1. World Space Domain

Purpose: defines the spatial container for a game slice.

Possible services:

- `n:world`
- `n:world:space`
- `n:world:bounds`
- `n:world:scale`

Fits:

- fish tank volume
- small open world clearing
- AR tabletop scene
- city block
- streaming continent

Owned paths:

```txt
world.space.bounds
world.space.scale
world.space.origin
world.space.partitions
```

## 2. Terrain Domain

Purpose: owns terrain data, height queries, chunks, terrain semantics, and optional streaming policy.

Possible services:

- `n:terrain`
- `n:terrain:data`
- `n:terrain:streaming`
- `n:terrain:renderer`

Fits:

- fish tank gravel floor
- island clearing
- shoreline game
- large streamed world
- traversal training course

Owned paths:

```txt
world.terrain.height
world.terrain.chunks
world.terrain.materials
world.terrain.streaming
```

## 3. Boundary Domain

Purpose: owns collision limits, edge policy, glass walls, invisible bounds, transfer gates, and allowed escape paths.

Possible services:

- `n:boundary`
- `n:boundary:collider`
- `n:boundary:glass`
- `n:boundary:transfer`

Fits:

- fish tank glass
- small world edge ring
- room walls
- facility doors
- route transfer zones

Owned paths:

```txt
world.boundary.colliders
world.boundary.gates
world.boundary.escapePolicy
```

## 4. Water Domain

Purpose: owns water volume, water surface, buoyancy/sampling bridges, wetness, and contained or open water state.

Possible services:

- `n:water`
- `n:water:volume`
- `n:water:surface`
- `n:water:sample`

Fits:

- aquarium water
- rescue patrol water
- shoreline fishing water
- flood simulation
- boat traversal

Owned paths:

```txt
world.water.volume
world.water.surface
world.water.current
world.water.depth
```

## 5. Object Inspection Domain

Purpose: owns inspectable targets, look rays, focus state, hover/tap/selection bridges, and object metadata.

Possible services:

- `n:object`
- `n:object:inspection`
- `n:object:focus`
- `n:interaction:target`

Fits:

- small open world look objects
- fish tank object labels
- puzzle shrine props
- AR training objects
- social simulation objects

Owned paths:

```txt
world.objects.inspectable
world.objects.focus
world.objects.metadata
```

## 6. Mobility Domain

Purpose: owns route fields, navigation, vehicle movement, locomotion, and movement validation.

Possible services:

- `n:mobility`
- `n:route:field`
- `n:pathfinding`
- `n:vehicle:dynamics`
- `n:locomotion`

Fits:

- courier route slice
- rescue patrol
- open world traversal
- facility occupant flow
- runner lanes

Owned paths:

```txt
world.mobility.routes
world.mobility.agents
world.mobility.pathRequests
world.mobility.vehicles
```

## 7. Operations Domain

Purpose: owns schedules, requests, queues, facility state, resource pressure, and service-flow simulation.

Possible services:

- `n:operations`
- `n:schedule`
- `n:request:queue`
- `n:facility:operations`
- `n:resource:pressure`

Fits:

- city operations
- hospital flow
- factory management
- transit hub
- logistics platform

Owned paths:

```txt
world.operations.schedule
world.operations.queue
world.operations.facilities
world.operations.resources
```

## 8. Objective Domain

Purpose: owns objective flow, progress, completion, validation events, and scenario criteria.

Possible services:

- `n:objective`
- `n:objective:flow`
- `n:scenario:driver`
- `n:scenario:duration`

Fits:

- AR training
- rescue missions
- puzzle rooms
- runner progression
- open world guidance

Owned paths:

```txt
world.objectives.active
world.objectives.completed
world.scenario.state
world.scenario.duration
```

## 9. Presentation Domain

Purpose: owns render descriptors, camera services, debug overlays, visual snapshots, and presentation-safe state.

Possible services:

- `n:presentation`
- `n:camera`
- `n:render:descriptor`
- `n:debug:overlay`

Fits:

- fish tank viewing
- open world camera
- AR renderer bridge
- puzzle room inspection
- audit/debug surfaces

Owned paths:

```txt
world.presentation.camera
world.presentation.renderDescriptors
world.presentation.debugOverlay
```

## 10. Replicated State Domain

Purpose: future-facing ownership boundary for snapshot, reset, restore, deterministic replay, and eventual async/network partitioning.

Possible services:

- `n:state:snapshot`
- `n:state:reset`
- `n:state:restore`
- `n:state:replication`

Fits:

- multiplayer-ready slices
- save/load
- long-running simulations
- streaming domains
- worker/async execution later

Owned paths:

```txt
world.state.snapshot
world.state.resetPolicy
world.state.restorePolicy
world.state.replication
```

## 11. Composition Governance Domain

Purpose: owns service graph validity, provider lookup, install preflight, namespace safety, path ownership, and rollback expectations for composed DSK graphs.

Possible services:

- `n:composition`
- `n:composition:registry`
- `n:composition:install`
- `n:composition:path-ownership`

Fits:

- described-example audit harnesses
- large DSK dependency graphs
- promoted kit readiness reviews
- public proof route checks
- future async or worker partition reviews

Owned paths:

```txt
world.composition.serviceGraph
world.composition.providers
world.composition.installPlan
world.composition.pathOwnership
```

## 12. Event Handoff Domain

Purpose: owns cross-domain event delivery policy, deferred event queues, phase handoff rules, and install-order-independent service messages.

Possible services:

- `n:event:handoff`
- `n:event:phase-policy`
- `n:event:deferred-queue`
- `n:event:delivery-report`

Fits:

- request-to-economy transactions
- scenario-to-telemetry markers
- sequence-to-ECS objective events
- hazard-to-resource pressure events
- cleanup and lifecycle event boundaries

Owned paths:

```txt
world.events.handoffPolicy
world.events.deferredQueue
world.events.deliveryReport
world.events.phaseContracts
```

## 13. Proof Surface Domain

Purpose: owns validation-facing proof surfaces, public module-source selection, browser proof status, and evidence snapshots without becoming product UI.

Possible services:

- `n:proof`
- `n:proof:surface`
- `n:proof:module-source`
- `n:proof:status`

Fits:

- local smoke proof routes
- public GitHub Pages proof routes
- CDN/raw import-map validation
- DSK coverage matrices
- headless or browser-visible evidence capture

Owned paths:

```txt
world.proof.moduleSources
world.proof.surfaceState
world.proof.coverage
world.proof.status
```

## 14. State Transition Policy Domain

Purpose: owns terminal, recoverable, mutually exclusive, and aggregate-count state rules for composed domains.

Possible services:

- `n:state:transition`
- `n:state:terminal-policy`
- `n:state:counter-policy`
- `n:state:restored-progress`

Fits:

- rescue targets that can be lost, recovered, or completed
- transfer flows with active, completed, rejected, or expired payloads
- objective and scenario domains with terminal pass/fail states
- authored or restored progress in training and puzzle scenes
- validation snapshots that need internally consistent counts

Owned paths:

```txt
world.state.transitionPolicy
world.state.terminalStates
world.state.aggregateCounters
world.state.restoredProgress
```

## 15. Transfer Constraint Domain

Purpose: owns transfer acceptance, capacity, dwell, active-transfer lifecycle, and completion policy for service, logistics, evacuation, and recovery flows.

Possible services:

- `n:transfer`
- `n:transfer:constraint`
- `n:transfer:dwell`
- `n:transfer:capacity`

Fits:

- cargo loading and unloading
- passenger evacuation
- rescue extraction
- facility intake and discharge
- route handoff checkpoints

Owned paths:

```txt
world.transfer.constraints
world.transfer.active
world.transfer.capacity
world.transfer.completions
```

## 16. Input Semantics Domain

Purpose: owns normalized action input state, edge events, held state, release events, and one-shot action policy.

Possible services:

- `n:input`
- `n:input:edge`
- `n:input:held`
- `n:input:action-policy`

Fits:

- interaction prompts
- transfer confirmation
- traversal actions
- puzzle activation
- scenario reset or completion controls

Owned paths:

```txt
world.input.actions
world.input.edges
world.input.held
world.input.sequence
```

## 17. Accepted Mutation Domain

Purpose: owns validate-before-mutate policy, accepted/rejected mutation receipts, side-effect ordering, and rollback or reservation boundaries for service APIs that can change multiple domains.

Possible services:

- `n:mutation`
- `n:mutation:acceptance`
- `n:mutation:receipt`
- `n:mutation:rollback-policy`

Fits:

- lifecycle starts that may spend currency
- objective completions that should emit once
- transfer attempts that may be rejected
- request fulfillment and reward side effects
- facility, economy, and progression flows with prerequisites

Owned paths:

```txt
world.mutation.acceptance
world.mutation.receipts
world.mutation.rejections
world.mutation.rollbackPolicy
```

## 18. Simulation Time Policy Domain

Purpose: owns elapsed-time consumption, large-delta catch-up, leftover progress, fixed-step policy, schedule scale rules, and non-finite time normalization across composed domains.

Possible services:

- `n:time`
- `n:time:step-policy`
- `n:time:catchup`
- `n:time:scale-policy`

Fits:

- transport routes that must traverse multiple stops during fast-forward ticks
- schedules that emit repeated cycles
- lifecycle progression and objective timers
- scenario duration and replay validation
- resource pressure or hazard systems driven by scaled time

Owned paths:

```txt
world.time.stepPolicy
world.time.catchup
world.time.leftoverProgress
world.time.scalePolicy
```

## 19. Config Normalization Domain

Purpose: owns reusable validation and normalization policy for numeric, enum, and dataset config before values enter deterministic simulation state.

Possible services:

- `n:config`
- `n:config:normalize`
- `n:config:finite-number`
- `n:config:validation-report`

Fits:

- schedule scales and intervals
- transport speeds and carrier capacity
- objective targets and duration values
- economy costs and rewards
- authored/restored datasets imported by experiments

Owned paths:

```txt
world.config.normalized
world.config.validationReport
world.config.rejectedValues
world.config.defaults
```

## 20. Operations Data Integrity Domain

Purpose: owns immutable authored-data boundaries, generated identity policy, finite transaction gates, and restored-state consistency for data-heavy operations domains.

Possible services:

- `n:operations:data-integrity`
- `n:identity:allocation`
- `n:config:immutable-source`
- `n:ledger:finite-transaction`
- `n:state:restored-consistency`

Fits:

- occupant spawn schedules that must reset from authored timing
- generated occupants, riders, requests, or cargo that need collision-free ids
- facility output and upkeep values before they mutate economy ledgers
- resource pressure values restored from authored or saved data
- service-flow harnesses that must replay deterministically

Owned paths:

```txt
world.operations.authoredConfig
world.operations.generatedIdentity
world.operations.finiteTransactions
world.operations.restoredConsistency
```
