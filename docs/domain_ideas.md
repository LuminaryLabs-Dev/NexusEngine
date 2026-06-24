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

## 21. Spatial Mobility Invariant Domain

Purpose: owns transition-state, immediate-threshold, generated-identity, and resource-bound normalization policy for spatial, hazard, scenario-time, and mobility services.

Possible services:

- `n:spatial:transition`
- `n:time:immediate-threshold`
- `n:hazard:identity`
- `n:mobility:resource-bound`
- `n:proof:spatial-mobility-invariants`

Fits:

- spatial guidance where nearest, inside, entered, exited, reached, and completed state must stay distinct
- zero-duration scenarios and zero-time checkpoints that must settle deterministically
- hazard fields with authored, restored, and spawned ids
- vehicle or mobility resources such as boost, stamina, fuel, and recovery capacity
- proof harnesses that need transition and capacity rows before spatial or mobility DSK promotion

Owned paths:

```txt
world.spatial.transitionState
world.time.immediateThresholds
world.hazards.generatedIdentity
world.mobility.resourceBounds
world.proof.spatialMobilityInvariants
```

## 22. Receipt Integrity Domain

Purpose: owns stable result receipt identity, transition-only event emission, duplicate-claim policy, and generated request identity across action, interaction, reward, and logistics services.

Possible services:

- `n:receipt`
- `n:receipt:identity`
- `n:event:idempotency`
- `n:reward:claim-policy`
- `n:request:identity`

Fits:

- timing actions where result ids must stay separate from window ids
- interaction targets that should emit completion only on incomplete-to-complete transitions
- collectible and reward services that need stored-state idempotency to match event idempotency
- request/logistics services with authored, restored, and manually generated ids
- proof harnesses that need replayable action, reward, and request attribution rows

Owned paths:

```txt
world.receipts.identity
world.events.idempotency
world.rewards.claimReceipts
world.requests.generatedIdentity
world.proof.receiptIntegrity
```

## 23. Bridge State Ownership Domain

Purpose: owns phase-safe event bridges, direct-service versus event-relay policy, step transition receipts, delegated-action reconciliation, and truthful wrapper-owned state for composed domains.

Possible services:

- `n:bridge:phase`
- `n:receipt:step-transition`
- `n:adapter:state-contract`
- `n:action:delegation`
- `n:proof:bridge-state`

Fits:

- AR placement flows where raw anchor placement must advance objective state or explicitly stay AR-only
- objective and AR lesson flows that need step-completion receipts exactly once
- puzzle and platformer wrapper kits that delegate to interaction services but expose their own snapshots
- SequenceNode, telemetry, proof, and tutorial bridges that depend on same-tick or next-tick event delivery
- composition audits that must prove advertised state ownership matches real mutation paths

Owned paths:

```txt
world.bridges.phasePolicy
world.receipts.stepTransitions
world.adapters.stateContracts
world.actions.delegationReconciliation
world.proof.bridgeState
```

## 24. Source State Integrity Domain

Purpose: owns authored-source isolation, reset-from-source guarantees, retention-limit normalization, and initial terminal-state receipt policy across dataset-heavy, ledger, pressure, and proof services.

Possible services:

- `n:state:source-integrity`
- `n:config:authored-isolation`
- `n:state:retention-limit`
- `n:state:initial-terminal`
- `n:proof:source-state`

Fits:

- water, route, render descriptor, and other dataset services where nested runtime mutation must not mutate caller-owned config
- economy, telemetry, and proof-history ledgers where zero, negative, and non-finite retention limits need shared semantics
- pursuit, pressure, recovery, and scenario domains where initial terminal bands must match boolean state and receipts
- reset/replay harnesses that need to prove reset output is rebuilt from immutable source data
- public or local proof rows that distinguish retained evidence from pruned history intentionally

Owned paths:

```txt
world.state.authoredSources
world.state.resetSources
world.state.retentionLimits
world.state.initialTerminals
world.proof.sourceStateIntegrity
```

## 25. State Signal Contract Domain

Purpose: owns descriptor invalidation, edge/held/repeat action semantics, small state-machine transition receipts, coordinate-axis policy, and source-versus-derived state ownership across placement, interaction, validation, and presentation services.

Possible services:

- `n:signal:contract`
- `n:signal:invalidation`
- `n:action:repeat-policy`
- `n:coordinate:axis-policy`
- `n:state:derived-boundary`
- `n:proof:signal-contract`

Fits:

- route-aware placement services where output changes depend on route contents, filters, terrain query behavior, or descriptor config rather than only counts
- interaction, puzzle, and combat services where held booleans, one-shot actions, transition receipts, and initial terminal state must be explicit
- scenario validation helpers that need a shared `{ x, y }` versus `{ x, z }` coordinate contract before proving route, terrain, camera, or mobility behavior
- camera and presentation safety services where source authored state must stay separate from derived occlusion, framing, or render adjustment output
- proof harnesses that need to explain why a service rebuilt, accepted, repeated, ignored, or derived state from another source

Owned paths:

```txt
world.signals.invalidation
world.actions.repeatPolicy
world.stateMachines.transitionReceipts
world.coordinates.axisPolicy
world.state.derivedBoundaries
world.proof.signalContracts
```

## 26. Service Lifecycle And Config Domain

Purpose: owns reusable service lifecycle, elapsed-time progression, canonical descriptor normalization, finite generated-geometry bounds, and proof rows for small reusable kits that can otherwise pass public API shape while locking, drifting, leaking source data, or publishing invalid state.

Possible services:

- `n:service:lifecycle-config`
- `n:command:lifecycle`
- `n:time:elapsed-rate`
- `n:descriptor:normalization`
- `n:geometry:finite-bounds`
- `n:proof:lifecycle-config`

Fits:

- companion, guide, assistance, and training services that must accept, reject, retarget, arrive, reset, or receipt multiple commands
- world-state and progression services where equal elapsed time must produce deterministic terminal state across tick rates
- room, building, AR, and descriptor services where normalization must preserve canonical numeric fields and isolate caller-owned nested data
- runner, traversal, procedural, and generated-world services where invalid counts, lanes, spacing, or bounds must fail early or normalize before snapshots
- DSK hardening fixtures that need lifecycle and config rows alongside install, source-state, signal, receipt, bridge, and spatial gates

Owned paths:

```txt
world.services.commandLifecycle
world.time.elapsedRates
world.descriptors.normalizedSource
world.geometry.finiteGeneration
world.proof.lifecycleConfig
```

## 27. Traversal Proof Integrity Domain

Purpose: owns navigation cost policy, navmesh identity, procedural signature taxonomy, recovery receipt/state consistency, and proof rows for traversal surfaces that can otherwise pass smoke tests while publishing invalid path costs, duplicate graph ids, stale signatures, or duplicate recovery events.

Possible services:

- `n:traversal:proof-integrity`
- `n:navigation:cost-policy`
- `n:navmesh:identity-policy`
- `n:procedural:signature-taxonomy`
- `n:recovery:state-consistency`
- `n:proof:traversal-integrity`

Fits:

- pathfinding, terrain, route, and navigation adapters where traversal costs must be finite and non-negative before A* or proof uses them
- walkability, navmesh, and graph services where source keys, coordinates, cell ids, waypoint ids, portal ids, and link ids must stay unique
- procedural and generated-world services where content, topology, algorithm/config, and proof signatures must distinguish meaningful generation changes
- physics, traversal, and recovery services where a fall or boundary recovery should emit one receipt and publish final state that matches the recovered player
- DSK hardening fixtures that need cost, identity, signature, and recovery-state rows alongside lifecycle/config and state-signal gates

Owned paths:

```txt
world.navigation.costPolicy
world.navmesh.identityPolicy
world.procedural.signatureTaxonomy
world.recovery.stateConsistency
world.proof.traversalIntegrity
```

## 28. Runtime Failure Boundary Domain

Purpose: owns DSK namespace safety, failed-install transaction boundaries, dependency-policy parity, scheduler failure event lifetime, and proof rows for runtime surfaces that can otherwise appear installed or valid after a failed mutation.

Possible services:

- `n:runtime:failure-boundary`
- `n:dsk:namespace-policy`
- `n:dsk:install-rollback`
- `n:dsk:dependency-parity`
- `n:scheduler:failure-lifetime`
- `n:proof:failure-boundary`

Fits:

- DSK graphs where service APIs must be own properties, never inherited through reserved keys or prototype mutation
- runtime install flows where failed API collisions, init hooks, registries, schedulers, sequence runtimes, or install hooks must roll back or remain retryable
- dependency-bearing DSKs where direct install and composer install must share a documented requirement policy
- scheduler, event, lifecycle, SequenceNode, telemetry, replay, and proof surfaces where thrown systems must not replay failed-tick events as normal success evidence
- DSK hardening fixtures that need namespace, install, dependency, and failed-tick rows alongside traversal, lifecycle/config, source-state, signal, receipt, bridge, operations, and spatial gates

Owned paths:

```txt
world.runtime.failureBoundary
world.dsk.namespacePolicy
world.dsk.installRollback
world.dsk.dependencyParity
world.scheduler.failureLifetime
world.proof.failureBoundary
```

## 29. Experience Edge Contract Domain

Purpose: owns edge-case contracts for user-facing domain kits where receipts, launch fallback, presentation profiles, authored content, and proof rows must stay explicit before a composition can be treated as reliable.

Possible services:

- `n:experience:edge-contract`
- `n:control:recovery-receipts`
- `n:launch:fallback-chain`
- `n:presentation:quality-profile`
- `n:content:dataset-contract`
- `n:proof:experience-edge`

Fits:

- character-control and recovery services where a persistent ready state must not emit unbounded one-shot receipts
- AR launch flows where a supported preferred mode can fail at start time and must either fall back or publish an explicit no-fallback diagnostic
- presentation services where custom quality/profile objects must be accepted, normalized, registered, or rejected instead of silently replaced
- content-driven kits where empty or malformed authored datasets must disable behavior or fail before placeholder entities reach snapshots
- proof harnesses that need receipt, fallback, presentation, and content edge rows separate from DSK runtime hardening and public module loading

Owned paths:

```txt
world.control.recoveryReceipts
world.launch.fallbackChain
world.presentation.qualityProfiles
world.content.datasetContracts
world.proof.experienceEdgeContracts
```

## 30. Lifecycle Parity And Cleanup Domain

Purpose: owns lifecycle parity for movement receipts, streamed terrain output, partial-start cleanup, stopped-session state, and proof rows where runtime state can disagree with visible or queryable behavior.

Possible services:

- `n:lifecycle:parity-cleanup`
- `n:movement:receipt-transition`
- `n:terrain:query-chunk-parity`
- `n:startup:partial-cleanup`
- `n:session:stop-state`
- `n:proof:lifecycle-parity`

Fits:

- movement, locomotion, and character-control services where held inputs must not emit repeated start receipts unless explicitly modeled as held-state signals
- terrain, route, shoreline, road, river, and world-streaming services where query fallback and baked chunk samples must include the same authored long-form layers
- camera, AR, capture, audio, and device services where a failed partial start after acquiring resources must release them before retry or fallback
- session, launch, overlay, and lifecycle services where stop/end actions must publish state that no longer reports the old session as running
- proof harnesses that need receipt-transition, query/chunk parity, cleanup, and stopped-state rows separate from public module loading and base DSK install hardening

Owned paths:

```txt
world.movement.receiptTransitions
world.terrain.queryChunkParity
world.startup.partialCleanup
world.sessions.stopState
world.proof.lifecycleParity
```

## 31. Query Command Semantics Domain

Purpose: owns public query side effects, terminal command guards, rejected-command state, read snapshot isolation, and proof rows where query or command APIs can mutate state in ways callers do not expect.

Possible services:

- `n:query-command:semantics`
- `n:guidance:terminal-receipts`
- `n:proximity:query-transition`
- `n:command:rejected-state`
- `n:query:snapshot-isolation`
- `n:proof:query-command-semantics`

Fits:

- landmark, waypoint, objective, and guidance services where inactive or completed targets must not emit normal transition receipts again
- affordance, proximity, inspection, and spatial interaction services where passive reads must stay separate from entered/exited transition producers
- command-driven services where missing, inactive, completed, duplicate, zero, or negative requests must not corrupt active target state
- route, water, landmark, affordance, and nearest/nearby APIs where returned query objects must be snapshots instead of live mutable state handles
- proof harnesses that need query/command semantics separate from public module loading, base DSK install hardening, lifecycle parity, and source-state isolation

Owned paths:

```txt
world.guidance.terminalReceipts
world.proximity.queryTransitions
world.commands.rejectedState
world.queries.snapshotIsolation
world.proof.queryCommandSemantics
```

## 32. Proof Readiness Queue Domain

Purpose: owns proof-readiness ordering, claim taxonomy, module-source gate decisions, aggregate-versus-targeted proof parity, and release evidence bundles so runtime hardening, lifecycle parity, query/command semantics, experience edges, fetched-ref validation, browser proof, npm metadata, and package-version policy stay separate until each has direct evidence.

Possible services:

- `n:proof:readiness-queue`
- `n:proof:fixture-tranche`
- `n:proof:claim-taxonomy`
- `n:proof:module-source-gate`
- `n:proof:aggregate-targeted-parity`
- `n:proof:release-evidence`

Fits:

- DSK promotion reviews where base runtime failure-boundary fixtures must start before lifecycle, query/command, and experience-edge rows are treated as readiness proof
- ecosystem proof lanes where local available-checkout success, fetched-ref success, public browser completion, aggregate command proof, targeted DSK proof, npm availability, and package-version policy must not collapse into one claim
- public proof route work where module-source strategy needs a single declared model before fetched-ref and browser proof can converge
- release review packets that need an explicit "not claimed" table for every hardening and distribution category
- future proof harnesses that need to explain why a category is blocked, deferred, complete, or out of lane

Owned paths:

```txt
world.proof.readinessQueue
world.proof.fixtureTranches
world.proof.claimTaxonomy
world.proof.moduleSourceGate
world.proof.aggregateTargetedParity
world.proof.releaseEvidence
```

## 33. Read Model Orchestration Isolation Domain

Purpose: owns registry descriptor isolation, engine surface snapshot read-models, SequenceNode sibling cleanup, `any` receipt semantics, and proof rows where inspection, rendering, analytics, or orchestration can mutate or overcount runtime state through read surfaces.

Possible services:

- `n:read-model:orchestration-isolation`
- `n:registry:descriptor-isolation`
- `n:surface:snapshot-isolation`
- `n:sequence:race-cleanup`
- `n:sequence:any-receipt-policy`
- `n:proof:read-model-orchestration`

Fits:

- shader, material, renderer, and descriptor registries where `get()`, `list()`, `register()`, or program setup must not share nested descriptor objects with callers or mutable registry state
- event, resource, query, and lifecycle surfaces where snapshots should be read models and not live mutation handles into ECS resources, event payloads, or proof batches
- SequenceNode race flows where a failed or winning child must settle active siblings before the parent becomes terminal
- SequenceNode `any` flows where skipped or cancelled losers must not emit duplicate child-finished receipts for one actual winner
- proof harnesses that need read-model isolation and orchestration receipt counts separate from public module loading, query/command semantics, lifecycle parity, and base DSK install hardening

Owned paths:

```txt
world.registries.descriptorIsolation
world.surfaces.snapshotIsolation
world.sequence.raceCleanup
world.sequence.anyReceiptPolicy
world.proof.readModelOrchestration
```

## 34. Legacy Sequence And AR Content Compatibility Domain

Purpose: owns legacy sequence replay/reset, `AnyChild` sibling cleanup, sequence owning-kit lookup, AR default text safety, and proof rows where exported compatibility surfaces or browser render defaults can mislead composed DSK, tutorial, replay, or public proof flows.

Possible services:

- `n:compat:legacy-sequence-ar`
- `n:sequence:legacy-replay-reset`
- `n:sequence:legacy-any-cleanup`
- `n:sequence:owning-kit-context`
- `n:ar:default-text-safety`
- `n:proof:compatibility-content-safety`

Fits:

- legacy `createSequenceRuntime()` replay flows where restarting a completed root must reset descendants or reject implicit replay before proof can claim behavior reran
- legacy `AnyChild` flows where active losers must be skipped, cancelled, or unloaded before the parent becomes terminal
- multi-kit compositions where legacy UI/entity controller sequences must resolve resources and invokes from the owning kit or a deterministic kit lookup instead of the most recently installed kit
- AR DOM renderer defaults where authored labels, prompts, titles, and instructions must be treated as text unless a trusted render callback explicitly returns HTML
- proof harnesses that need legacy compatibility and AR content-safety rows separate from public module-source loading, modern SequenceNode isolation, and base DSK install hardening

Owned paths:

```txt
world.sequence.legacyReplayReset
world.sequence.legacyAnyCleanup
world.sequence.owningKitContext
world.ar.defaultTextSafety
world.proof.compatibilityContentSafety
```

## 35. AR Launch And Spatial Read Model Domain

Purpose: owns AR launch composition preconditions, explicit preferred-mode fallback policy, launcher state read models, SpatialRoom getter isolation, and proof rows where AR/spatial browser flows can appear available while mutating live state or silently degrading capability claims.

Possible services:

- `n:ar-spatial:launch-read-model`
- `n:ar:launch-precondition`
- `n:ar:mode-selection-policy`
- `n:ar:launch-state-isolation`
- `n:spatial-room:getter-isolation`
- `n:proof:ar-spatial-read-model`

Fits:

- AR launch runtimes where a host must have installed required AR resources before mode startup can call `engine.ar`
- capability selectors where explicit preferred modes should either be honored, rejected, or labeled as fallback instead of silently becoming preview proof
- AR launch render/update callbacks where support, placement, objective, interaction, collectible, or render descriptor state must be snapshots instead of live mutation handles
- SpatialRoom and building descriptor services where read-named getters must not expose mutable building, room, or anchor objects to renderers and proof panels
- proof harnesses that need AR/spatial capability and read-model rows separate from public module-source loading, AR DOM text safety, and general query snapshot isolation

Owned paths:

```txt
world.ar.launchPreconditions
world.ar.modeSelectionPolicy
world.ar.launchStateIsolation
world.spatialRoom.getterIsolation
world.proof.arSpatialReadModel
```

## 36. Proof Signal Integrity Domain

Purpose: owns receipt idempotency, nullable device helper failure policy, monotonic tick time, finite spatial config, and proof rows where runtime proof signals must be one-shot, forward-time, non-throwing, and finite before telemetry, tutorials, AR flows, or DSK reviews can trust them.

Possible services:

- `n:proof-signal:integrity`
- `n:experience:terminal-receipts`
- `n:webxr:hit-test-failure`
- `n:time:monotonic-tick`
- `n:spatial:finite-scale`
- `n:proof:signal-integrity`

Fits:

- AR experience services where terminal completion events should be edge-triggered receipts instead of persistent-state emissions on every later tick
- browser/device helpers where unavailable or denied hit-test setup should return nullable or structured unsupported results instead of escaping through mode startup
- engine, scheduler, sequence, duration, and telemetry services where normal ticks must not publish negative elapsed time unless a separate replay API owns rewind semantics
- greybox, SpatialRoom, AR anchor, and render descriptor services where scale and geometry inputs must become finite, bounded values before proof panels or renderers consume them
- proof harnesses that need receipt counts, device degraded states, time policy, and finite geometry rows separate from public module-source proof and AR launch read-model proof

Owned paths:

```txt
world.experience.terminalReceipts
world.webxr.hitTestFailurePolicy
world.time.monotonicTickPolicy
world.spatial.finiteScalePolicy
world.proof.signalIntegrity
```

## 37. Composition Proof Ownership Domain

Purpose: owns capability provider ownership, SequenceNode type registration policy, event-history read-model isolation, AR runtime-source consistency, and proof rows where composed DSK graphs can appear valid while provider, orchestration, history, or device-source ownership is ambiguous.

Possible services:

- `n:composition-proof:ownership`
- `n:composition:provider-ownership`
- `n:composition:composer-read-model`
- `n:composition:composer-handoff-contract`
- `n:composition:proof-metadata-parity`
- `n:sequence:type-registry-policy`
- `n:sequence:event-history-isolation`
- `n:ar:runtime-source-consistency`
- `n:proof:composition-ownership`

Fits:

- composer and DSK graphs where duplicate capability providers must reject, namespace, or declare intentional override ownership before capability presence counts as proof
- resolved composer objects where nested kit arrays, install-order arrays, provider lists, and binding maps must be frozen, cloned, or revalidated before a prior dependency check counts as proof
- `createRealtimeGame({ composer })` handoffs where caller-supplied composer state must not install kits or publish metadata that the composer never resolved
- proof dashboards, inspectors, and host tools where `engine.game.installOrder` and `engine.game.bindings` must match actual installed kits rather than live caller-mutated composer metadata
- SequenceNode-backed kits where duplicate type names must reject or explicitly override before runtime plans can trust type semantics
- SequenceNode event buses, diagnostics, telemetry, and proof panels where history snapshots must not expose mutable event objects
- AR launch and browser/device proof harnesses where support classification and selected mode startup must use one runtime source or reconcile failed startup state
- proof harnesses that need provider ownership, composer handoff, type registry, event history, and AR runtime-source rows separate from distribution proof, proof-signal integrity, and base runtime failure-boundary work

Owned paths:

```txt
world.composition.providerOwnership
world.composition.composerReadModel
world.composition.composerHandoffContract
world.composition.proofMetadataParity
world.sequence.typeRegistryPolicy
world.sequence.eventHistoryIsolation
world.ar.runtimeSourceConsistency
world.proof.compositionOwnership
```

## 38. Runtime Identity And Lifecycle Ownership Domain

Purpose: owns runtime kit definition immutability, provider-token parity, installed-definition parity, runtime binding ownership, ECS definition identity, SequenceNode install-only kit idempotency, event-bus disposed parity, and proof rows where composed graphs can silently share names, mutate validated definitions, replay side effects, or mutate listener state after teardown.

Possible services:

- `n:runtime-identity:lifecycle-ownership`
- `n:runtime-kit:definition-immutability`
- `n:runtime-kit:provider-token-parity`
- `n:runtime-kit:install-definition-parity`
- `n:runtime:binding-ownership`
- `n:ecs:definition-identity`
- `n:sequence:install-only-idempotency`
- `n:sequence:event-bus-disposed-parity`
- `n:proof:runtime-identity-lifecycle`

Fits:

- runtime kit definitions where `systems`, `requires`, `provides`, components, resources, events, registry lists, sequences, or subscriptions must be frozen, cloned, or normalized before kit objects count as proof artifacts
- composer graphs where provider tokens should come from immutable RuntimeKit snapshots instead of caller-mutated `kit.provides` arrays
- direct runtime installs where `engine.kits` and installed scheduler/world/registry state must not diverge after a kit object mutates or same-object reinstall is skipped
- runtime kit and composer graphs where duplicate binding names must reject, namespace, or declare intentional override ownership before bindings count as service proof
- ECS-backed domain kits where same-named components, resources, and events must be intentionally shared or diagnosed before state isolation claims are trusted
- SequenceNode-backed proof graphs where raw install-only adapters must be recorded or normalized so repeated deployments do not replay global side effects
- SequenceNode event buses where every listener API must share disposed-state policy before lifecycle cleanup proof can trust listener counts
- proof harnesses that need RuntimeKit definition immutability, provider-token parity, binding, definition identity, install idempotency, and disposed-listener rows separate from composer read-model handoff, public module-source proof, and base runtime failure-boundary work

Owned paths:

```txt
world.runtimeKit.definitionImmutability
world.runtimeKit.providerTokenParity
world.runtimeKit.installDefinitionParity
world.runtime.bindingOwnership
world.ecs.definitionIdentity
world.sequence.installOnlyIdempotency
world.sequence.eventBusDisposedParity
world.proof.runtimeIdentityLifecycle
```

## 39. Content Boundary And Objective Contract Domain

Purpose: owns public API product-boundary checks, preset/runtime identity policy, objective threshold semantics, content dataset validation, and proof rows where content-driven kits can appear complete or reusable while leaking themed presets, sharing ids, or accepting invalid authored criteria.

Possible services:

- `n:content-boundary:objective-contract`
- `n:public-api:product-boundary`
- `n:kit:preset-identity`
- `n:objective:threshold-policy`
- `n:content:dataset-validation`
- `n:proof:content-boundary-objective`

Fits:

- public core exports where authored product/theme presets should be absent, deprecated, or explicitly marked compatibility-only before core boundary claims are trusted
- content kit factories where caller-provided ids, preset ids, and installed metadata must be honored, rejected, or diagnosed before multiple variants compose
- objective and scenario services where zero, negative, missing, malformed, or disabled targets must have explicit semantics instead of completing proof state by accident
- content-driven domains where species, lures, objectives, duplicate ids, unknown ids, disabled content, and generated entities need one validation/diagnostic path
- proof harnesses that need public API boundary, kit identity, objective policy, and dataset contract rows separate from generic runtime identity, content-dataset placeholders, and public module-source proof

Owned paths:

```txt
world.publicApi.productBoundary
world.kit.presetIdentity
world.objectives.thresholdPolicy
world.content.datasetValidation
world.proof.contentBoundaryObjective
```

## 40. Query Read Model Isolation Domain

Purpose: owns public query helper outputs, engine read-method snapshots, nested metadata isolation, stored query snapshots, and proof rows where read-only APIs can mutate runtime or caller-owned state through returned objects.

Possible services:

- `n:query-read-model:isolation`
- `n:query:helper-contract`
- `n:engine-read:snapshot-contract`
- `n:metadata:read-isolation`
- `n:stored-query:proof-snapshot`
- `n:proof:query-read-model-isolation`

Fits:

- request, cargo, route, guidance, affordance, hazard, water, and inspection services where `query*`, `nearest*`, `available*`, or collision APIs must return isolated read models
- metadata-heavy authored datasets where shallow top-level clones still expose nested mutable metadata or hazard descriptors
- runtime states with `lastQuery`, `lastCollision`, or similar audit fields that must store proof snapshots rather than aliases to returned objects
- renderers, telemetry, AI adapters, dashboards, and proof harnesses that should inspect query output without becoming mutation paths
- DSK hardening fixtures that need query read-model isolation separate from command rejection, proximity transition side effects, source-config isolation, surface snapshots, and public module-source proof

Owned paths:

```txt
world.query.helperContracts
world.engineRead.snapshotContracts
world.metadata.readIsolation
world.query.storedProofSnapshots
world.proof.queryReadModelIsolation
```

## 41. Scheduler World Mutation Isolation Domain

Purpose: owns scheduler active-run topology policy, phase mutation boundaries, ECS system iteration membership semantics, low-level event queue payload isolation, and proof rows where one tick can change execution shape or mutate queued evidence while appearing deterministic.

Possible services:

- `n:scheduler-world:mutation-isolation`
- `n:scheduler:active-run-policy`
- `n:scheduler:phase-topology`
- `n:runsystem:membership-snapshot`
- `n:event-queue:payload-isolation`
- `n:proof:scheduler-world-mutation`

Fits:

- ECS scheduler runs where systems or phases added during an active pass must reject, defer to the next pass, or be explicitly documented as immediate
- DSK installers, runtime kits, and proof adapters that attach systems during runtime and need deterministic same-tick ordering
- cleanup, despawn, transfer, collision, and objective systems where `runSystem()` must either skip removed entities or provide stable component snapshots
- SequenceNode bridges, diagnostics, telemetry, and proof probes that inspect queued events without mutating payloads before later systems read them
- DSK hardening fixtures that need scheduler/world mutation isolation below query read models, surface snapshots, runtime identity, and public module-source proof

Owned paths:

```txt
world.scheduler.activeRunPolicy
world.scheduler.phaseTopology
world.ecs.runSystemMembership
world.events.queuePayloadIsolation
world.proof.schedulerWorldMutation
```

## 42. Procedural Navigation State Ownership Domain

Purpose: owns navigation command payload isolation, navigation proof snapshot isolation, procedural proof snapshot isolation, procedural command return-state policy, and proof rows where generated space and pathfinding can appear deterministic while callers mutate queued requests or live snapshots.

Possible services:

- `n:procedural-navigation:state-ownership`
- `n:navigation:command-payload-ownership`
- `n:navigation:proof-snapshot-isolation`
- `n:procedural:proof-snapshot-isolation`
- `n:procedural:command-return-state`
- `n:proof:procedural-navigation-ownership`

Fits:

- navigation command APIs where caller-owned `start` or `goal` objects must be cloned, frozen, or explicitly treated as mutable handles before queued path work can count as replay-safe
- navigation read APIs where path history, `lastPath`, request queues, debug graphs, and agent path arrays must return proof snapshots instead of live runtime resources
- procedural generation services where cells, walkability, regions, render descriptors, objective markers, and world positions must not be mutable through read-only snapshot calls
- procedural regeneration commands where returned state must be an isolated summary or documented handle so callers cannot cancel, retarget, or dirty pending generation by mutating a return value
- DSK hardening fixtures that need procedural/navigation ownership rows separate from traversal cost policy, procedural signature taxonomy, query read-model isolation, scheduler/world mutation, and public module-source proof

Owned paths:

```txt
world.navigation.commandPayloadOwnership
world.navigation.proofSnapshotIsolation
world.procedural.proofSnapshotIsolation
world.procedural.commandReturnState
world.proof.proceduralNavigationOwnership
```

## 43. Telemetry Command Evidence Ownership Domain

Purpose: owns telemetry selected-value snapshots, telemetry path selector isolation, service command payload ownership, submitted input frame ownership, and returned command state policy where proof records or command APIs can retain caller-owned objects while looking like replay-safe evidence.

Possible services:

- `n:telemetry-command:evidence-ownership`
- `n:telemetry:selected-value-snapshot`
- `n:telemetry:path-selector-isolation`
- `n:service-command:payload-ownership`
- `n:input-frame:ownership`
- `n:proof:telemetry-command-evidence`

Fits:

- telemetry services where selected resources, nested selector paths, manual snapshots, cleanup snapshots, and history entries must be cloned or frozen before they count as proof
- queue, transport, request, operations, and service-flow commands where caller-owned metadata, reward, penalty, or payload objects must not mutate queued work after submission
- input and replay services where submitted input metadata must become an immutable frame rather than a live host object or returned mutable state
- command methods that return state summaries and need explicit snapshot versus mutable-handle semantics before automation, SequenceNode, or dashboards inspect them
- DSK hardening fixtures that need telemetry and command evidence ownership separate from public query read models, procedural/navigation ownership, low-level event queue isolation, and public module-source proof

Owned paths:

```txt
world.telemetry.selectedValueSnapshots
world.telemetry.pathSelectorIsolation
world.serviceCommands.payloadOwnership
world.inputFrames.ownership
world.proof.telemetryCommandEvidence
```

## 44. Domain Command Config Ownership Domain

Purpose: owns cross-domain command, add/config, active-read, returned-state, and proof-record ownership where economy, timing, pressure, lifecycle, and facility services can retain caller-owned nested payloads or expose live handles while appearing replay-safe.

Possible services:

- `n:domain-command-config:ownership`
- `n:economy:transaction-metadata-ownership`
- `n:timing:action-read-ownership`
- `n:pressure:resource-command-ownership`
- `n:lifecycle-facility:add-payload-ownership`
- `n:proof:domain-command-config-ownership`

Fits:

- economy ledgers where submitted transaction metadata and returned state must become immutable proof records instead of mutable host objects
- timing/action services where window metadata, action metadata, active reads, results, and event payloads need snapshot or explicit mutable-handle semantics
- resource-pressure services where resource metadata, adjustment metadata, depletion payloads, and `get()`/`adjust()` return values must be isolated before replay or validation
- lifecycle and facility authoring APIs where nested `effects`, `cost`, `output`, `upkeep`, and metadata must be captured before host/editor mutations can change future simulation output
- DSK hardening fixtures that need command/config/read ownership separate from telemetry selectors, query read models, source reset leakage, procedural/navigation ownership, and public module-source proof

Owned paths:

```txt
world.economy.transactionMetadataOwnership
world.timing.actionReadOwnership
world.pressure.resourceCommandOwnership
world.lifecycleFacility.addPayloadOwnership
world.proof.domainCommandConfigOwnership
```

## 45. Host Graph Lifecycle Ownership Domain

Purpose: owns host adapter capability ownership, root host capability ownership, private adapter records, host graph identity policy, adapter lifecycle failure boundaries, snapshot purity, and proof rows where `Nexus.Host` composition graphs can look valid while mounted adapters mutate capability tokens, public records are rewritten, identities collapse, retry state is lost, or host state changes during reads.

Possible services:

- `n:host-graph:lifecycle-ownership`
- `n:host-adapter:capability-ownership`
- `n:host-root:capability-ownership`
- `n:host-adapter-record:ownership`
- `n:host-record:lifecycle-parity`
- `n:host-graph:identity-policy`
- `n:host-lifecycle:failure-boundary`
- `n:host-mount:transaction-boundary`
- `n:host-snapshot:purity`
- `n:proof:host-graph-lifecycle-ownership`

Fits:

- host adapter definitions where `provides`, `requires`, metadata, or returned adapter objects must be cloned or frozen before dependency validation can count as proof
- root host capability lists where post-creation mutation must not forge dependencies or change provider edges without explicit revalidation
- host adapter records where direct public array mutation must not inject unvalidated adapters, provider tokens, domains, or lifecycle states into graph snapshots
- host graph snapshots where duplicate adapter ids, duplicate domains, or duplicate providers need explicit reject, override, or diagnostic policy instead of silently collapsing live records
- mount/unmount flows where throwing adapter callbacks or leaked side effects must leave lifecycle counts, retry records, diagnostics, and graph state consistent
- adapter snapshot callbacks where polling a proof graph must be passive or explicitly capture side effects in the returned snapshot
- DSK and public proof hardening fixtures that need host graph lifecycle ownership separate from runtime kit provider ownership, generic query read models, surface snapshots, and module-source proof

Owned paths:

```txt
world.host.adapterCapabilityOwnership
world.host.rootCapabilityOwnership
world.host.adapterRecordOwnership
world.host.recordLifecycleParity
world.host.graphIdentityPolicy
world.host.lifecycleFailureBoundary
world.host.mountTransactionBoundary
world.host.snapshotPurity
world.proof.hostGraphLifecycleOwnership
```

## 46. DSK Extension Service Ownership Domain

Purpose: owns extension service token/API parity, base-plus-extension install transactions, extension definition identity, and proof rows where `extendDomainServiceKit()` can advertise promoted services while the installed `engine.n.*` surface, kit record, or ECS state boundary is missing or partially installed.

Possible services:

- `n:dsk-extension:service-ownership`
- `n:dsk-extension:api-token-parity`
- `n:dsk-extension:install-atomicity`
- `n:dsk-extension:definition-identity`
- `n:proof:dsk-extension-service-ownership`

Fits:

- DSK extensions where a distinct `apiName`, `services`, or `provides` entry must correspond to an installed API or an explicitly base-API-only contract
- base and extension install flows where installing after the base must be idempotent, transactional, and retryable rather than leaving partial extension APIs or metadata
- extension merges where component, resource, and event identity must be checked by ECS definition name as well as config key
- ProtoKit service-expansion paths that add services to existing domains without rewriting the base domain kit
- DSK hardening fixtures that need extension API/token parity separate from generic install rollback, duplicate runtime binding ownership, and public module-source proof

Owned paths:

```txt
world.dskExtension.apiTokenParity
world.dskExtension.installAtomicity
world.dskExtension.definitionIdentity
world.proof.dskExtensionServiceOwnership
```
