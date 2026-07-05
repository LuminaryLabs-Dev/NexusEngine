# Kit Ideas

This file is an expansion inventory for possible NexusEngine kits. It is not a promise that every kit should be implemented. Use it to collect reusable kit candidates, decide ownership boundaries, and feed audit automations with concrete DSK expansion targets.

Implementation target: new reusable kits should be built in `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits/`, not directly in NexusEngine core. NexusEngine core should only change when the kit idea exposes a missing runtime primitive, DSK invariant, composer rule, or validation surface.

## Kit Idea Rules

- Make a kit when it owns state, lifecycle, dependencies, systems, or a public service.
- Keep helpers internal when they do not need lifecycle, service tokens, or snapshot/reset ownership.
- Prefer config and datasets over product-specific logic.
- Every promoted DSK candidate should declare likely `provides`, `requires`, `engine.n.*` API, snapshot/reset expectations, and path ownership.
- Treat this file as planning inventory. Implementation belongs in ProtoKits until a later human-reviewed promotion decision says otherwise.

## World And Space Kits

```txt
world-space-kit
|-- owns: spatial bounds, scale, origin, partitions
|-- provides: n:world, n:world:space
|-- used by: fish tank, open world, AR scene, city, diorama

spatial-scale-kit
|-- owns: unit mapping, subject/world scale, camera-safe scale hints
|-- provides: n:world:scale
|-- requires: n:world:space

boundary-policy-kit
|-- owns: escape policy, edge behavior, world containment rules
|-- provides: n:boundary
|-- requires: n:world:space

glass-boundary-kit
|-- owns: glass wall collision and transparent boundary metadata
|-- provides: n:boundary:glass
|-- requires: n:world:space
```

## Terrain And Habitat Kits

```txt
terrain-data-kit
|-- owns: height, material, chunk, terrain query state
|-- provides: n:terrain, n:terrain:data
|-- requires: n:world:space

terrain-streaming-kit
|-- owns: active/preload/unload policy and loaded chunk lifecycle
|-- provides: n:terrain:streaming
|-- requires: n:terrain:data

terrain-renderer-kit
|-- owns: terrain render snapshots and terrain presentation bridge
|-- provides: n:terrain:renderer
|-- requires: n:terrain:data

biome-field-kit
|-- owns: biome sampling, biome regions, environment tags
|-- provides: n:biome, n:biome:field
|-- requires: n:terrain:data

forest-placement-kit
|-- owns: prop descriptors, scatter placement, route-aware vegetation
|-- provides: n:object:placement
|-- requires: n:terrain:data
```

## Water And Aquarium Kits

```txt
fish-tank-kit
|-- owns: tank profile, contained ecosystem config, orchestration bridge
|-- provides: n:fish-tank
|-- requires: n:world:space

water-volume-kit
|-- owns: contained or open water volume sampling
|-- provides: n:water, n:water:volume
|-- requires: n:world:space

water-surface-kit
|-- owns: surface state, wave descriptors, waterline queries
|-- provides: n:water:surface
|-- requires: n:world:space

fish-school-kit
|-- owns: fish agents, schooling behavior, local water movement
|-- provides: n:fish, n:fish:school
|-- requires: n:world:space, n:water:volume
```

## Movement And Traversal Kits

```txt
locomotion-kit
|-- owns: character movement intent to motion state
|-- provides: n:locomotion
|-- requires: n:world:space

physics-kit
|-- owns: collision/contact/stability state
|-- provides: n:physics
|-- requires: n:world:space

pathfinding-kit
|-- owns: path requests, path results, graph adapters
|-- provides: n:pathfinding
|-- requires: n:world:space

vehicle-dynamics-kit
|-- owns: vehicle acceleration, steering, drag, recovery state
|-- provides: n:vehicle:dynamics
|-- requires: n:world:space

tree-runner-kit
|-- owns: branch generation, runner lane state, fall/catch logic
|-- provides: n:runner:tree
|-- requires: n:world:space
```

## Interaction And Puzzle Kits

```txt
object-inspection-kit
|-- owns: look targets, focus state, inspection metadata
|-- provides: n:object:inspection
|-- requires: n:world:space

interaction-target-kit
|-- owns: targetable objects and interaction readiness
|-- provides: n:interaction:target
|-- requires: n:object:inspection

symbol-alignment-kit
|-- owns: symbol state, alignment checks, solved state
|-- provides: n:puzzle:symbol-alignment
|-- requires: n:world:space

lock-and-socket-kit
|-- owns: socket occupancy, key matching, lock progress
|-- provides: n:puzzle:lock-socket
|-- requires: n:object:inspection

reveal-light-kit
|-- owns: reveal state, light activation, hidden target exposure
|-- provides: n:puzzle:reveal-light
|-- requires: n:world:space
```

## Operations And Logistics Kits

```txt
route-field-kit
|-- owns: route markers, route costs, route progress
|-- provides: n:route:field
|-- requires: n:world:space

cargo-manifest-kit
|-- owns: cargo availability, carried cargo, deposits, quotas
|-- provides: n:cargo:manifest
|-- requires: n:world:space

request-fulfillment-kit
|-- owns: request goals, fulfillment checks, completion state
|-- provides: n:request:fulfillment
|-- requires: n:cargo:manifest

transfer-constraint-kit
|-- owns: accepted payload kinds, active dwell, capacity, completion/rejection policy
|-- provides: n:transfer:constraint
|-- requires: n:world:space

request-queue-kit
|-- owns: queued work, priorities, service order
|-- provides: n:request:queue
|-- requires: n:operations

facility-operations-kit
|-- owns: station state, capacity, service points, throughput
|-- provides: n:facility:operations
|-- requires: n:world:space

economy-ledger-kit
|-- owns: bounded transaction requests, ledger entries, reward/penalty policy
|-- provides: n:economy:ledger
|-- requires: n:operations
```

## Pressure, Hazard, And Scenario Kits

```txt
hazard-field-kit
|-- owns: hazard spawning, movement, collision checks, hazard snapshots
|-- provides: n:hazard:field
|-- requires: n:world:space

hazard-director-kit
|-- owns: terrain-aware or scenario-aware hazard orchestration
|-- provides: n:hazard:director
|-- requires: n:world:space

timing-window-kit
|-- owns: timing windows, quality judgment, repeated action timing
|-- provides: n:timing:window
|-- requires: n:scenario:driver

resource-pressure-kit
|-- owns: draining/recovering resource meters
|-- provides: n:resource:pressure
|-- requires: n:scenario:driver

scenario-driver-kit
|-- owns: scenario start/stop/progress checkpoints
|-- provides: n:scenario:driver
|-- requires: n:world:space
```

## Presentation, Proof, And Audit Kits

```txt
camera-kit
|-- owns: camera rig, follow state, occlusion policy, view snapshot
|-- provides: n:camera
|-- requires: n:world:space

render-descriptor-kit
|-- owns: render-safe descriptors for host renderers
|-- provides: n:render:descriptor
|-- requires: n:world:space

telemetry-kit
|-- owns: selected path snapshots, counters, proof metrics
|-- provides: n:telemetry
|-- requires: n:world:space

debug-overlay-kit
|-- owns: composition inspector and debug surface state
|-- provides: n:debug:overlay
|-- requires: n:world:space

composition-audit-kit
|-- owns: service graph audit, path ownership audit, boundary leak checks
|-- provides: n:audit:composition
|-- requires: n:world:space

service-registry-kit
|-- owns: provider lookup, duplicate-provider diagnostics, reserved API key policy
|-- provides: n:composition:registry
|-- requires: n:world:space

install-transaction-kit
|-- owns: install preflight, mutation staging, failed-install rollback reports
|-- provides: n:composition:install
|-- requires: n:composition:registry

event-handoff-kit
|-- owns: cross-domain event delivery policy, deferred queues, phase contracts
|-- provides: n:event:handoff
|-- requires: n:world:space

retention-policy-kit
|-- owns: bounded history limits, retention normalization, snapshot pruning policy
|-- provides: n:state:retention
|-- requires: n:state:snapshot

proof-surface-kit
|-- owns: proof module sources, browser/local proof status, evidence snapshots
|-- provides: n:proof:surface
|-- requires: n:telemetry

proof-coverage-matrix-kit
|-- owns: idea-to-proof coverage rows, validation command mapping, local/public/browser evidence categories
|-- provides: n:proof:coverage
|-- requires: n:proof:surface
```

## State, Progress, And Input Policy Kits

```txt
terminal-state-policy-kit
|-- owns: terminal/recoverable/mutually-exclusive state rules and transition guards
|-- provides: n:state:terminal-policy
|-- requires: n:state:snapshot

progress-normalization-kit
|-- owns: aggregate counters derived from authored, restored, and mutated progress state
|-- provides: n:state:restored-progress
|-- requires: n:state:snapshot

input-edge-semantics-kit
|-- owns: pressed/released edge detection, held action state, action sequence policy
|-- provides: n:input:edge
|-- requires: n:world:space

accepted-mutation-kit
|-- owns: validate-before-mutate receipts, rejection reasons, side-effect ordering policy
|-- provides: n:mutation:acceptance
|-- requires: n:state:terminal-policy

completion-idempotency-kit
|-- owns: one-shot completion emission, completed-state receipts, reset-safe completion guards
|-- provides: n:mutation:completion-idempotency
|-- requires: n:mutation:acceptance

time-step-catchup-kit
|-- owns: large-delta subdivision, leftover progress, multi-stop or multi-cycle catch-up policy
|-- provides: n:time:catchup
|-- requires: n:time:step-policy

config-normalization-kit
|-- owns: finite number checks, enum/default normalization, validation reports before simulation state writes
|-- provides: n:config:normalize
|-- requires: n:world:space
```

## Operations Data Invariant Kits

```txt
immutable-config-kit
|-- owns: authored dataset cloning, runtime-field separation, reset-from-source policy
|-- provides: n:config:immutable-source
|-- requires: n:config:normalize
|-- used by: occupant-flow, facility-operations, schedule, objective, experiment datasets
|-- likely target repo: NexusEngine-ProtoKits

stable-id-allocation-kit
|-- owns: generated id namespaces, collision checks, sequence restore policy
|-- provides: n:identity:allocation
|-- requires: n:state:snapshot
|-- used by: occupant-flow, request-queue, cargo-manifest, transport-route, telemetry
|-- likely target repo: NexusEngine-ProtoKits

finite-transaction-policy-kit
|-- owns: finite amount validation, rejection receipts, ledger-safe transaction requests
|-- provides: n:ledger:finite-transaction
|-- requires: n:economy:ledger, n:mutation:acceptance
|-- used by: facility-operations, lifecycle-progression, request-queue, economy
|-- likely target repo: NexusEngine-ProtoKits

restored-resource-state-kit
|-- owns: initial/restored value normalization, aggregate flag derivation, reset consistency
|-- provides: n:state:restored-consistency
|-- requires: n:state:snapshot, n:config:normalize
|-- used by: resource-pressure, scenario-driver, telemetry, proof harnesses
|-- likely target repo: NexusEngine-ProtoKits

operations-invariant-proof-kit
|-- owns: operations invariant rows, replay/reset proof snapshots, data-integrity coverage reports
|-- provides: n:proof:operations-invariants
|-- requires: n:proof:coverage, n:operations:data-integrity
|-- used by: city operations, logistics, social simulation, service-flow proof harnesses
|-- likely target repo: NexusEngine-ProtoKits
```

## Spatial, Hazard, And Mobility Invariant Kits

```txt
transition-state-policy-kit
|-- owns: nearest versus inside state, entered/exited transitions, reached/completed transition receipts
|-- provides: n:spatial:transition
|-- requires: n:world:space, n:state:terminal-policy
|-- used by: spatial-scale, landmark-guidance, environmental-affordance, interaction-target, AR training
|-- likely target repo: NexusEngine-ProtoKits

immediate-threshold-policy-kit
|-- owns: zero-duration scenario settlement, zero-time checkpoint policy, reset/init threshold receipts
|-- provides: n:time:immediate-threshold
|-- requires: n:time:step-policy, n:mutation:completion-idempotency
|-- used by: scenario-duration, timing-window, objective-flow, proof harness setup phases
|-- likely target repo: NexusEngine-ProtoKits

hazard-identity-policy-kit
|-- owns: authored/restored/spawned hazard id namespaces, generated id collision checks, hazard attribution ids
|-- provides: n:hazard:identity
|-- requires: n:identity:allocation, n:hazard:field
|-- used by: hazard-field, hazard-director, route-field, telemetry, replay and collision proof rows
|-- likely target repo: NexusEngine-ProtoKits

resource-bound-normalization-kit
|-- owns: min/max capacity normalization, start-value clamping, active-state gates, reset-safe resource bounds
|-- provides: n:resource:bounds
|-- requires: n:config:normalize, n:state:restored-consistency
|-- used by: vehicle-dynamics, resource-pressure, locomotion, timing-window, mobility proof harnesses
|-- likely target repo: NexusEngine-ProtoKits

spatial-mobility-invariant-proof-kit
|-- owns: transition-state, zero-threshold, generated-id, and resource-bound proof rows
|-- provides: n:proof:spatial-mobility-invariants
|-- requires: n:proof:coverage, n:spatial:transition, n:time:immediate-threshold
|-- used by: AR training, rescue mobility, hazard fields, runner scenes, spatial guidance proof harnesses
|-- likely target repo: NexusEngine-ProtoKits
```

## Receipt Identity And Event Idempotency Kits

```txt
receipt-identity-kit
|-- owns: action/result receipt ids, query-snapshot id separation, actor/window/source attribution
|-- provides: n:receipt:identity
|-- requires: n:mutation:acceptance, n:event:handoff
|-- used by: timing-window, interaction-target, reward, telemetry, replay and proof harnesses
|-- likely target repo: NexusEngine-ProtoKits

event-idempotency-kit
|-- owns: transition-only event emission, duplicate event suppression/reporting, already-complete receipts
|-- provides: n:event:idempotency
|-- requires: n:mutation:completion-idempotency, n:event:handoff
|-- used by: interaction-target, objective-flow, collectible, request fulfillment, telemetry
|-- likely target repo: NexusEngine-ProtoKits

claim-receipt-policy-kit
|-- owns: first-claim versus already-claimed receipts, persisted claim reconciliation, reward attribution ids
|-- provides: n:reward:claim-policy
|-- requires: n:event:idempotency, n:state:restored-consistency
|-- used by: collectible, objective-flow, economy-ledger, progression and persistence proof rows
|-- likely target repo: NexusEngine-ProtoKits

request-identity-policy-kit
|-- owns: authored/restored/manual request id namespaces, generated request collision checks, request attribution ids
|-- provides: n:request:identity
|-- requires: n:identity:allocation, n:request:fulfillment
|-- used by: request-fulfillment, request-queue, cargo-manifest, route-field, logistics proof harnesses
|-- likely target repo: NexusEngine-ProtoKits

receipt-integrity-proof-kit
|-- owns: receipt identity, event idempotency, claim policy, and request identity proof rows
|-- provides: n:proof:receipt-integrity
|-- requires: n:proof:coverage, n:receipt:identity, n:event:idempotency
|-- used by: timing/action, interaction/objective, reward, logistics, replay and telemetry proof harnesses
|-- likely target repo: NexusEngine-ProtoKits
```

## Bridge Phase And Wrapper State Kits

```txt
bridge-phase-policy-kit
|-- owns: same-tick versus next-tick event bridge rules, scheduler phase compatibility, direct-service fallback policy
|-- provides: n:bridge:phase
|-- requires: n:event:handoff, n:audit:composition
|-- used by: surface-placement, AR placement, objective-flow, SequenceNode bridges, proof harnesses
|-- likely target repo: NexusEngine-ProtoKits

step-transition-receipt-kit
|-- owns: incomplete-to-complete step receipts, final-step receipts, reset-safe one-shot step emission
|-- provides: n:receipt:step-transition
|-- requires: n:event:idempotency, n:mutation:completion-idempotency
|-- used by: objective-flow, AR-experience, tutorial, onboarding, telemetry, proof rows
|-- likely target repo: NexusEngine-ProtoKits

delegated-action-reconciliation-kit
|-- owns: delegated action outcome mapping, interaction-target completion mirroring, adapter result receipts
|-- provides: n:action:delegation
|-- requires: n:event:idempotency, n:receipt:identity
|-- used by: symbol-alignment, lock-and-socket, reveal-light, sorting, moving-target, micro-platformer wrappers
|-- likely target repo: NexusEngine-ProtoKits

wrapper-state-contract-kit
|-- owns: stateful versus stateless adapter declarations, wrapper-owned snapshot paths, reset/snapshot ownership reports
|-- provides: n:adapter:state-contract
|-- requires: n:state:snapshot, n:audit:composition
|-- used by: puzzle wrappers, platformer wrappers, AR lesson adapters, public API proof harnesses
|-- likely target repo: NexusEngine-ProtoKits

bridge-state-proof-kit
|-- owns: bridge phase, step receipt, delegated action, and wrapper state proof rows
|-- provides: n:proof:bridge-state
|-- requires: n:proof:coverage, n:bridge:phase, n:adapter:state-contract
|-- used by: AR placement proof, objective/lesson proof, puzzle wrapper proof, public DSK hardening reviews
|-- likely target repo: NexusEngine-ProtoKits
```

## Source State Integrity Kits

```txt
authored-source-isolation-kit
|-- owns: nested clone/freeze policy, caller-config isolation, runtime-owned dataset copies
|-- provides: n:config:authored-isolation
|-- requires: n:config:immutable-source, n:config:normalize
|-- used by: water-surface, route-field, render-descriptor, dataset-heavy proof harnesses
|-- likely target repo: NexusEngine-ProtoKits

reset-source-policy-kit
|-- owns: reset-from-source snapshots, runtime-field scrubbing, source-versus-restored reset reports
|-- provides: n:state:reset-source
|-- requires: n:state:snapshot, n:config:authored-isolation
|-- used by: water, route, rendering descriptors, pursuit, scenario-driver, replay proof rows
|-- likely target repo: NexusEngine-ProtoKits

retention-limit-policy-kit
|-- owns: zero/negative/non-finite retention normalization, prune receipts, bounded evidence history
|-- provides: n:state:retention-limit
|-- requires: n:state:retention, n:proof:coverage
|-- used by: economy-ledger, telemetry, proof-surface, replay and audit history
|-- likely target repo: NexusEngine-ProtoKits

initial-terminal-receipt-kit
|-- owns: initial terminal-state derivation, terminal/recovered receipt policy, contradictory-state rejection
|-- provides: n:state:initial-terminal
|-- requires: n:state:terminal-policy, n:event:idempotency
|-- used by: pursuit-pressure, assistance-target, scenario-duration, recovery and pressure proof rows
|-- likely target repo: NexusEngine-ProtoKits

source-state-integrity-proof-kit
|-- owns: authored-isolation, reset-source, retention-limit, and initial-terminal proof rows
|-- provides: n:proof:source-state
|-- requires: n:proof:coverage, n:config:authored-isolation, n:state:retention-limit
|-- used by: reset/replay reviews, dataset-heavy DSK promotion, economy/proof retention audits, scenario pressure proofs
|-- likely target repo: NexusEngine-ProtoKits
```

## State Signal Contract Kits

```txt
descriptor-invalidation-kit
|-- owns: descriptor rebuild signatures, content-versus-count invalidation, rebuild-cause reports
|-- provides: n:signal:invalidation
|-- requires: n:state:snapshot, n:config:authored-isolation
|-- used by: forest-placement, terrain descriptors, route-aware rendering, object streaming, proof snapshots
|-- likely target repo: NexusEngine-ProtoKits

action-repeat-policy-kit
|-- owns: edge, held, repeat, duplicate-attempt, accepted, and ignored action semantics
|-- provides: n:action:repeat-policy
|-- requires: n:input:edge, n:event:idempotency
|-- used by: interaction, character interaction, shrine puzzle, combat, objective actions, telemetry
|-- likely target repo: NexusEngine-ProtoKits

state-machine-transition-kit
|-- owns: false-to-true transition receipts, initial terminal normalization, contradictory-state rejection
|-- provides: n:state-machine:transition
|-- requires: n:state:initial-terminal, n:mutation:completion-idempotency
|-- used by: shrine puzzle, light combat, objective flow, pressure/recovery domains, proof harnesses
|-- likely target repo: NexusEngine-ProtoKits

coordinate-axis-policy-kit
|-- owns: `{ x, y }` versus `{ x, z }` point normalization, axis-contract reports, 2D/3D adapter decisions
|-- provides: n:coordinate:axis-policy
|-- requires: n:world:space, n:config:normalize
|-- used by: scenario-driver, route-field, terrain, camera, mobility, validation helpers
|-- likely target repo: NexusEngine-ProtoKits

derived-state-boundary-kit
|-- owns: source state versus derived adjustment paths, view-safe output state, reset-safe derived reports
|-- provides: n:state:derived-boundary
|-- requires: n:state:snapshot, n:presentation
|-- used by: camera-occlusion, camera safety, render descriptors, debug overlays, replay proof rows
|-- likely target repo: NexusEngine-ProtoKits

state-signal-contract-proof-kit
|-- owns: invalidation, action repeat, state-machine transition, coordinate axis, and derived-state proof rows
|-- provides: n:proof:signal-contract
|-- requires: n:proof:coverage, n:signal:invalidation, n:action:repeat-policy, n:coordinate:axis-policy
|-- used by: placement, interaction, puzzle/combat, validation-driver, camera proof reviews
|-- likely target repo: NexusEngine-ProtoKits
```

## Service Lifecycle And Config Kits

```txt
command-lifecycle-kit
|-- owns: accepted, duplicate, retargeted, arrived, reset, and rejected command receipts
|-- provides: n:command:lifecycle
|-- requires: n:event:idempotency, n:receipt:identity
|-- used by: companion command, assistance, guide, AR training, tutorial, interaction services
|-- likely target repo: NexusEngine-ProtoKits

elapsed-rate-policy-kit
|-- owns: per-second versus per-tick progression policy, elapsed-time terminal settlement, floating threshold receipts
|-- provides: n:time:elapsed-rate
|-- requires: n:time:step-policy, n:time:catchup
|-- used by: corruption/world-state, resource pressure, scenario duration, lifecycle progression, proof harnesses
|-- likely target repo: NexusEngine-ProtoKits

descriptor-normalization-kit
|-- owns: canonical numeric descriptor fields, spread/override ordering policy, nested source clone/freeze reports
|-- provides: n:descriptor:normalization
|-- requires: n:config:normalize, n:config:authored-isolation
|-- used by: spatial-room, greybox-building, render descriptors, AR anchors, room/building proof rows
|-- likely target repo: NexusEngine-ProtoKits

generated-geometry-bounds-kit
|-- owns: positive count/lane/spacing bounds, finite coordinate assertions, invalid generation rejection receipts
|-- provides: n:geometry:finite-bounds
|-- requires: n:config:normalize, n:world:space
|-- used by: tree-runner, procedural generation, route traversal, terrain/object streaming, renderer snapshots
|-- likely target repo: NexusEngine-ProtoKits

service-lifecycle-config-proof-kit
|-- owns: command lifecycle, elapsed-rate, descriptor normalization, and finite generated-geometry proof rows
|-- provides: n:proof:lifecycle-config
|-- requires: n:proof:coverage, n:command:lifecycle, n:time:elapsed-rate, n:descriptor:normalization
|-- used by: DSK hardening fixtures, companion/guide flows, world-state progression, spatial room proof, generated traversal proof
|-- likely target repo: NexusEngine-ProtoKits
```

## Traversal Proof Integrity Kits

```txt
navigation-cost-policy-kit
|-- owns: finite non-negative traversal costs, rejected-cost receipts, route-cost normalization reports
|-- provides: n:navigation:cost-policy
|-- requires: n:pathfinding, n:config:normalize
|-- used by: pathfinding, terrain walkability, route-field, navmesh adapters, traversal proof rows
|-- likely target repo: NexusEngine-ProtoKits

navmesh-identity-policy-kit
|-- owns: unique walkability keys, canonical cell ids, waypoint/portal/link identity assertions
|-- provides: n:navmesh:identity-policy
|-- requires: n:identity:allocation, n:navmesh
|-- used by: navmesh generation, procedural walkability, imported maps, graph telemetry, proof snapshots
|-- likely target repo: NexusEngine-ProtoKits

procedural-signature-taxonomy-kit
|-- owns: content, topology, algorithm/config, and proof signature boundaries
|-- provides: n:procedural:signature-taxonomy
|-- requires: n:procedural, n:signal:invalidation
|-- used by: procedural generation, forest placement, navmesh rebuilds, route generation, proof metadata
|-- likely target repo: NexusEngine-ProtoKits

recovery-receipt-state-kit
|-- owns: one-shot recovery receipts, final recovered-state publication, event/state consistency rows
|-- provides: n:recovery:state-consistency
|-- requires: n:event:idempotency, n:state:snapshot
|-- used by: world physics, action movement, fall recovery, boundary recovery, replay and analytics proof rows
|-- likely target repo: NexusEngine-ProtoKits

traversal-proof-integrity-kit
|-- owns: navigation cost, navmesh identity, procedural signature, and recovery receipt/state proof rows
|-- provides: n:proof:traversal-integrity
|-- requires: n:proof:coverage, n:navigation:cost-policy, n:navmesh:identity-policy, n:procedural:signature-taxonomy
|-- used by: DSK hardening fixtures, navigation/procedural/physics promotion reviews, playable traversal proof routes
|-- likely target repo: NexusEngine-ProtoKits
```

## Runtime Failure Boundary Kits

```txt
dsk-namespace-policy-kit
|-- owns: reserved API name rejection, null-prototype namespace policy, own-property API assertions
|-- provides: n:dsk:namespace-policy
|-- requires: n:service:registry
|-- used by: DSK promotion fixtures, engine.n service registry hardening, proof harness namespace checks
|-- likely target repo: NexusEngine core validation surface

dsk-install-rollback-kit
|-- owns: install mutation staging, late-hook failure rollback, retryability after failed installs
|-- provides: n:dsk:install-rollback
|-- requires: n:install:transaction, n:dsk:namespace-policy
|-- used by: runtime kit install flow, DSK install hooks, registry/scheduler/sequence mutation checks
|-- likely target repo: NexusEngine core validation surface

dsk-dependency-parity-kit
|-- owns: direct-install versus composer dependency policy, missing-token diagnostics, requirement enforcement fixtures
|-- provides: n:dsk:dependency-parity
|-- requires: n:service:registry
|-- used by: dependency-bearing DSKs, GameKitComposer, direct engine.installKit proof rows
|-- likely target repo: NexusEngine core validation surface

scheduler-failure-lifetime-kit
|-- owns: failed-tick clock commit policy, event/journal cleanup, lifecycle failure diagnostics, next-tick replay prevention rows
|-- provides: n:scheduler:failure-lifetime
|-- requires: n:event:handoff, n:proof:coverage
|-- used by: scheduler, ECS events, lifecycle surfaces, SequenceNode bridges, replay, telemetry, proof harnesses
|-- likely target repo: NexusEngine core validation surface

runtime-failure-boundary-proof-kit
|-- owns: DSK namespace, install rollback, dependency parity, and failed scheduler tick proof rows
|-- provides: n:proof:failure-boundary
|-- requires: n:proof:coverage, n:dsk:namespace-policy, n:dsk:install-rollback, n:dsk:dependency-parity, n:scheduler:failure-lifetime
|-- used by: DSK hardening fixtures, runtime promotion reviews, public proof readiness gates
|-- likely target repo: NexusEngine core validation surface
```

## Experience Edge Contract Kits

```txt
control-recovery-receipt-kit
|-- owns: recovery-ready versus staggered receipt policy, repeated settled-state suppression, recover transition receipts
|-- provides: n:control:recovery-receipts
|-- requires: n:event:idempotency, n:recovery:state-consistency
|-- used by: character ragdoll, fall recovery, tutorial prompts, objective bridges, telemetry proof rows
|-- likely target repo: NexusEngine-ProtoKits

launch-fallback-chain-kit
|-- owns: preferred mode try order, support-pass/start-fail diagnostics, fallback selected-mode updates, no-fallback policy
|-- provides: n:launch:fallback-chain
|-- requires: n:bridge:phase, n:proof:surface
|-- used by: AR launch runtime, camera overlay fallback, fallback preview, browser-visible AR proof
|-- likely target repo: NexusEngine core validation surface

quality-profile-contract-kit
|-- owns: custom profile acceptance/rejection, named profile registration, finite quality field normalization, profile diagnostics
|-- provides: n:presentation:quality-profile
|-- requires: n:config:normalize, n:presentation
|-- used by: realism, renderers, presentation proof, accessibility/performance presets
|-- likely target repo: NexusEngine core validation surface

content-dataset-contract-kit
|-- owns: required-field checks, empty-dataset behavior, unknown-id policy, duplicate-id diagnostics, disabled-state reports
|-- provides: n:content:dataset-contract
|-- requires: n:config:authored-isolation, n:config:normalize
|-- used by: fishing, reef rescue, wildlife, collectibles, authored experiment datasets
|-- likely target repo: NexusEngine-ProtoKits

experience-edge-proof-kit
|-- owns: recovery receipt, launch fallback, quality profile, and content dataset edge proof rows
|-- provides: n:proof:experience-edge
|-- requires: n:proof:coverage, n:control:recovery-receipts, n:launch:fallback-chain, n:presentation:quality-profile, n:content:dataset-contract
|-- used by: domain-kit edge fixtures, AR/presentation/content promotion reviews, public proof readiness gates
|-- likely target repo: NexusEngine-ProtoKits
```

## Lifecycle Parity And Cleanup Kits

```txt
movement-receipt-transition-kit
|-- owns: start/end receipt edges, held-state signal separation, repeated-input diagnostics, transition-count proof rows
|-- provides: n:movement:receipt-transition
|-- requires: n:event:idempotency, n:action:repeat-policy
|-- used by: action movement, locomotion, character control, tutorials, objective bridges, telemetry
|-- likely target repo: NexusEngine core validation surface

terrain-query-chunk-parity-kit
|-- owns: query fallback versus baked chunk parity, long-layer influence bounds, chunk-signature inclusion reports
|-- provides: n:terrain:query-chunk-parity
|-- requires: n:terrain, n:procedural:signature-taxonomy
|-- used by: TerrainKit, route/path/shoreline carves, streaming chunks, traversal proof rows
|-- likely target repo: NexusEngine core validation surface

partial-start-cleanup-kit
|-- owns: acquired resource release, failed-start cleanup, retry-safe device state, cleanup diagnostics
|-- provides: n:startup:partial-cleanup
|-- requires: n:launch:fallback-chain, n:session:stop-state
|-- used by: camera overlay, AR modes, capture devices, audio/video startup, retry and fallback proof rows
|-- likely target repo: NexusEngine core validation surface

session-stop-state-kit
|-- owns: stopped/ended session transitions, stale handle clearing, double-stop and restart semantics
|-- provides: n:session:stop-state
|-- requires: n:event:handoff, n:state-machine:transition
|-- used by: AR launch runtime, camera overlay, WebXR/session modes, overlays, lifecycle surfaces
|-- likely target repo: NexusEngine core validation surface

lifecycle-parity-proof-kit
|-- owns: movement receipt, terrain parity, partial-start cleanup, and stopped-session proof rows
|-- provides: n:proof:lifecycle-parity
|-- requires: n:proof:coverage, n:movement:receipt-transition, n:terrain:query-chunk-parity, n:startup:partial-cleanup, n:session:stop-state
|-- used by: domain-kit edge fixtures, terrain/AR/runtime hardening reviews, public proof readiness gates
|-- likely target repo: NexusEngine core validation surface
```

## Query Command Semantics Kits

```txt
terminal-receipt-policy-kit
|-- owns: inactive/completed command guards, duplicate transition receipts, terminal no-op diagnostics
|-- provides: n:guidance:terminal-receipts
|-- requires: n:state:terminal-policy, n:event:idempotency
|-- used by: landmark guidance, objective waypoints, AR training targets, tutorial and telemetry proof rows
|-- likely target repo: NexusEngine core validation surface

proximity-query-transition-kit
|-- owns: side-effect-free query policy, entered/exited transition producers, active target change receipts
|-- provides: n:proximity:query-transition
|-- requires: n:spatial:transition, n:query:snapshot-isolation
|-- used by: environmental affordances, object inspection, spatial guidance, AR/object proximity proof rows
|-- likely target repo: NexusEngine core validation surface

rejected-command-state-kit
|-- owns: missing/inactive/completed/duplicate command rejection, active-state preservation, rejection receipts
|-- provides: n:command:rejected-state
|-- requires: n:command:lifecycle, n:mutation:acceptance
|-- used by: affordance activation, interaction services, guidance services, objective command APIs
|-- likely target repo: NexusEngine core validation surface

query-snapshot-isolation-kit
|-- owns: cloned read-model outputs, immutable query result contracts, last-query snapshot isolation reports
|-- provides: n:query:snapshot-isolation
|-- requires: n:state:snapshot, n:config:authored-isolation
|-- used by: route-field, landmark guidance, environmental affordance, water, nearest/nearby query helpers
|-- likely target repo: NexusEngine core validation surface

query-command-semantics-proof-kit
|-- owns: terminal receipt, query/transition split, rejected command, and query isolation proof rows
|-- provides: n:proof:query-command-semantics
|-- requires: n:proof:coverage, n:guidance:terminal-receipts, n:proximity:query-transition, n:command:rejected-state, n:query:snapshot-isolation
|-- used by: spatial guidance/affordance/route hardening reviews, proof harnesses, DSK promotion gates
|-- likely target repo: NexusEngine core validation surface
```

## Proof Readiness Queue Kits

```txt
hardening-fixture-queue-kit
|-- owns: ordered runtime, lifecycle, query/command, and experience-edge fixture tranches
|-- provides: n:proof:fixture-queue
|-- requires: n:proof:coverage, n:proof:failure-boundary, n:proof:lifecycle-parity, n:proof:query-command-semantics
|-- used by: DSK promotion reviews, automation trackers, non-scout fixture planning, release evidence packets
|-- likely target repo: NexusEngine-ProtoKits proof tooling or NexusEngine core validation surface

proof-claim-taxonomy-kit
|-- owns: local, fetched-ref, aggregate, targeted, browser-complete, npm, package-version, and hardening claim labels
|-- provides: n:proof:claim-taxonomy
|-- requires: n:proof:surface, n:proof:coverage
|-- used by: ecosystem state/proof packets, release checklists, public proof reviews, not-claimed sections
|-- likely target repo: NexusEngine-ProtoKits proof tooling

module-source-gate-kit
|-- owns: package, workspace, CDN branch, same-origin asset, and build-step import-map resolution decisions
|-- provides: n:proof:module-source-gate
|-- requires: n:proof:surface, n:proof:claim-taxonomy
|-- used by: ProtoKits fetched-ref validation, Experiments targeted proof, public browser proof, CDN/raw proof routes
|-- likely target repo: NexusEngine-Experiments proof routing or NexusEngine-ProtoKits proof tooling

aggregate-targeted-proof-parity-kit
|-- owns: aggregate script coverage rows, required targeted commands, omitted proof diagnostics, generated-route write boundaries
|-- provides: n:proof:aggregate-targeted-parity
|-- requires: n:proof:coverage, n:proof:claim-taxonomy
|-- used by: Experiments npm run check reviews, DSK first-wave smoke inclusion, disposable fetched-ref validation
|-- likely target repo: NexusEngine-Experiments proof tooling

release-evidence-checklist-kit
|-- owns: one-row-per-claim release evidence, blockers, deferrals, and explicit not-claimed records
|-- provides: n:proof:release-evidence
|-- requires: n:proof:claim-taxonomy, n:proof:fixture-queue, n:proof:module-source-gate
|-- used by: DSK promotion packets, public proof readiness reviews, release branch decisions, package/public claim audits
|-- likely target repo: NexusEngine-ProtoKits proof tooling or release automation
```

## Read Model Orchestration Isolation Kits

```txt
registry-descriptor-isolation-kit
|-- owns: cloned/frozen registry descriptors, nested uniform/value isolation, get/list/register snapshot policy
|-- provides: n:registry:descriptor-isolation
|-- requires: n:descriptor:normalization, n:state:snapshot
|-- used by: shader registry, material registry, renderer proof fixtures, visual/debug descriptor inspectors
|-- likely target repo: NexusEngine core validation surface

surface-snapshot-isolation-kit
|-- owns: event/resource/query/lifecycle surface read-model cloning, nested payload isolation, snapshot mutation diagnostics
|-- provides: n:surface:snapshot-isolation
|-- requires: n:event:handoff, n:state:snapshot
|-- used by: engine surfaces, SequenceNode bridges, telemetry, analytics, UI/debug panels, proof recorders
|-- likely target repo: NexusEngine core validation surface

sequence-race-cleanup-kit
|-- owns: race child success/failure cleanup, sibling cancel order, terminal parent/sibling consistency rows
|-- provides: n:sequence:race-cleanup
|-- requires: n:event:idempotency, n:scheduler:failure-lifetime
|-- used by: SequenceNode race flows, fallback orchestration, objective races, proof harness orchestration
|-- likely target repo: NexusEngine core validation surface

sequence-any-receipt-policy-kit
|-- owns: any winner/loser receipt separation, skipped/cancelled loser diagnostics, child-finished count policy
|-- provides: n:sequence:any-receipt-policy
|-- requires: n:event:idempotency, n:sequence:race-cleanup
|-- used by: SequenceNode any flows, objective graphs, analytics, telemetry, proof receipt counters
|-- likely target repo: NexusEngine core validation surface

read-model-orchestration-proof-kit
|-- owns: registry descriptor, surface snapshot, race cleanup, and any receipt proof rows
|-- provides: n:proof:read-model-orchestration
|-- requires: n:proof:coverage, n:registry:descriptor-isolation, n:surface:snapshot-isolation, n:sequence:race-cleanup, n:sequence:any-receipt-policy
|-- used by: DSK hardening fixtures, renderer/engine/SequenceNode promotion reviews, public proof readiness gates
|-- likely target repo: NexusEngine core validation surface
```

## Legacy Sequence And AR Content Compatibility Kits

```txt
legacy-sequence-replay-reset-kit
|-- owns: completed-root replay policy, descendant state reset, explicit reset/reject diagnostics, replay proof rows
|-- provides: n:sequence:legacy-replay-reset
|-- requires: n:state:terminal-policy, n:event:handoff
|-- used by: legacy sequence runtime, tutorial replay, retry flows, FishingKit compatibility, proof harness replay checks
|-- likely target repo: NexusEngine core validation surface

legacy-any-sibling-cleanup-kit
|-- owns: AnyChild loser skip/cancel/unload policy, parent terminal ordering, sibling lifecycle diagnostics
|-- provides: n:sequence:legacy-any-cleanup
|-- requires: n:sequence:legacy-replay-reset, n:event:idempotency
|-- used by: legacy sequence runtime, composed objective flows, tutorial alternatives, proof receipt counters
|-- likely target repo: NexusEngine core validation surface

legacy-sequence-owning-kit-context-kit
|-- owns: UI/entity controller owning-kit lookup, multi-kit resource/invoke resolution, install-order conflict diagnostics
|-- provides: n:sequence:owning-kit-context
|-- requires: n:service:registry, n:sequence:legacy-replay-reset
|-- used by: FishingKit legacy sequences, multi-kit DSK compositions, compatibility shims, tutorial/UI proof rows
|-- likely target repo: NexusEngine core validation surface

ar-default-text-safety-kit
|-- owns: default AR label/prompt/instruction escaping, trusted HTML callback boundary, renderer content-safety diagnostics
|-- provides: n:ar:default-text-safety
|-- requires: n:presentation:quality-profile, n:proof:surface
|-- used by: AR DOM renderer, AR training lessons, public proof pages, CMS-authored lesson content
|-- likely target repo: NexusEngine core validation surface

compatibility-content-safety-proof-kit
|-- owns: legacy replay, AnyChild cleanup, owning-kit lookup, and AR text-safety proof rows
|-- provides: n:proof:compatibility-content-safety
|-- requires: n:proof:coverage, n:sequence:legacy-replay-reset, n:sequence:legacy-any-cleanup, n:sequence:owning-kit-context, n:ar:default-text-safety
|-- used by: DSK compatibility reviews, browser/AR proof readiness gates, legacy sequence migration planning, public proof audits
|-- likely target repo: NexusEngine core validation surface
```

## AR Launch And Spatial Read Model Kits

```txt
ar-launch-precondition-kit
|-- owns: required ARKit/resource checks, missing-engine.ar diagnostics, launcher creation/start contract rows
|-- provides: n:ar:launch-precondition
|-- requires: n:proof:surface, n:service:registry
|-- used by: AR launch runtime, fallback preview, camera overlay, page marker, WebXR plane modes, public AR proof setup
|-- likely target repo: NexusEngine core validation surface

ar-mode-selection-policy-kit
|-- owns: preferred-mode validation, strict versus permissive fallback policy, unknown-mode diagnostics, degraded-capability labels
|-- provides: n:ar:mode-selection-policy
|-- requires: n:launch:fallback-chain, n:proof:claim-taxonomy
|-- used by: AR device classification, AR launch runtime, QR/AR browser proof, capability claim reviews
|-- likely target repo: NexusEngine core validation surface

ar-launch-state-isolation-kit
|-- owns: cloned/frozen launch support state, render/update callback snapshots, nested AR state read-model diagnostics
|-- provides: n:ar:launch-state-isolation
|-- requires: n:surface:snapshot-isolation, n:state:snapshot
|-- used by: AR launch render callbacks, proof panels, objective/interactions/collectibles overlays, browser AR diagnostics
|-- likely target repo: NexusEngine core validation surface

spatial-room-getter-isolation-kit
|-- owns: cloned/frozen building and anchor getters, explicit mutable-handle policy, active-building setter return semantics
|-- provides: n:spatial-room:getter-isolation
|-- requires: n:query:snapshot-isolation, n:config:authored-isolation
|-- used by: SpatialRoom, GreyboxBuilding, AR anchors, render descriptors, room/building proof panels
|-- likely target repo: NexusEngine core validation surface

ar-spatial-read-model-proof-kit
|-- owns: AR launch precondition, preferred-mode policy, launch-state isolation, and SpatialRoom getter proof rows
|-- provides: n:proof:ar-spatial-read-model
|-- requires: n:proof:coverage, n:ar:launch-precondition, n:ar:mode-selection-policy, n:ar:launch-state-isolation, n:spatial-room:getter-isolation
|-- used by: AR/spatial hardening reviews, browser proof readiness gates, public capability claim audits
|-- likely target repo: NexusEngine core validation surface
```

## Proof Signal Integrity Kits

```txt
experience-terminal-receipt-kit
|-- owns: edge-triggered final completion receipts, manual complete idempotency, reset-after-complete event counts, duplicate terminal diagnostics
|-- provides: n:experience:terminal-receipts
|-- requires: n:event:idempotency, n:state:terminal-policy
|-- used by: ARExperience, tutorials, objective bridges, reward flows, telemetry, proof receipt counters
|-- likely target repo: NexusEngine core validation surface

webxr-hit-test-failure-policy-kit
|-- owns: requestHitTestSource rejection handling, nullable versus structured unsupported results, permission/runtime diagnostics, degraded-mode proof rows
|-- provides: n:webxr:hit-test-failure
|-- requires: n:launch:fallback-chain, n:proof:claim-taxonomy
|-- used by: WebXR plane mode, AR session helpers, browser AR proof, fallback and capability diagnostics
|-- likely target repo: NexusEngine core validation surface

monotonic-tick-time-kit
|-- owns: negative delta rejection/clamping policy, forward-time lifecycle records, SequenceNode frame-time propagation, replay/rewind boundary diagnostics
|-- provides: n:time:monotonic-tick
|-- requires: n:scheduler:failure-lifetime, n:proof:surface
|-- used by: engine.tick, scheduler, lifecycle surfaces, SequenceNode, duration gates, telemetry, save/replay proof
|-- likely target repo: NexusEngine core validation surface

finite-spatial-scale-kit
|-- owns: finite positive scale normalization, invalid/zero/negative/infinite scale diagnostics, geometry descriptor proof rows
|-- provides: n:spatial:finite-scale
|-- requires: n:config:normalize, n:descriptor:normalization
|-- used by: GreyboxBuilding, SpatialRoom, AR anchors, render descriptors, spatial proof panels
|-- likely target repo: NexusEngine core validation surface

proof-signal-integrity-kit
|-- owns: terminal receipt, hit-test failure, monotonic time, and finite spatial-scale proof rows
|-- provides: n:proof:signal-integrity
|-- requires: n:proof:coverage, n:experience:terminal-receipts, n:webxr:hit-test-failure, n:time:monotonic-tick, n:spatial:finite-scale
|-- used by: DSK hardening fixtures, AR/browser proof readiness, runtime promotion reviews, telemetry/replay validation
|-- likely target repo: NexusEngine core validation surface
```

## Composition Proof Ownership Kits

```txt
capability-provider-ownership-kit
|-- owns: capability token provider registry, duplicate provider diagnostics, intentional override policy, provider owner lookup
|-- provides: n:composition:provider-ownership
|-- requires: n:composition:registry, n:proof:claim-taxonomy
|-- used by: createGameKitComposer, DSK dependency planning, large ProtoKit graphs, proof harness provider checks
|-- likely target repo: NexusEngine core validation surface

sequence-type-registry-policy-kit
|-- owns: duplicate SequenceNode type registration policy, built-in/custom override diagnostics, kit install ordering rows
|-- provides: n:sequence:type-registry-policy
|-- requires: n:service:registry, n:sequence:owning-kit-context
|-- used by: SequenceNode library, kit-provided node types, DSK orchestration graphs, planner/proof tools
|-- likely target repo: NexusEngine core validation surface

sequence-event-history-isolation-kit
|-- owns: cloned/frozen event-bus history entries, payload/meta isolation, returned-event and snapshot immutability diagnostics
|-- provides: n:sequence:event-history-isolation
|-- requires: n:surface:snapshot-isolation, n:event:idempotency
|-- used by: SequenceNode event bus, telemetry, proof recorders, debug panels, replay diagnostics
|-- likely target repo: NexusEngine core validation surface

ar-runtime-source-consistency-kit
|-- owns: classified runtime globals, mode startup source parity, support/session reconciliation after failed startup
|-- provides: n:ar:runtime-source-consistency
|-- requires: n:ar:mode-selection-policy, n:ar:launch-state-isolation
|-- used by: AR launch runtime, camera-overlay mode, WebXR/browser proof, simulator and embedded runtime harnesses
|-- likely target repo: NexusEngine core validation surface

composition-proof-ownership-kit
|-- owns: provider ownership, type registry policy, event-history isolation, and AR runtime-source consistency proof rows
|-- provides: n:proof:composition-ownership
|-- requires: n:proof:coverage, n:composition:provider-ownership, n:sequence:type-registry-policy, n:sequence:event-history-isolation, n:ar:runtime-source-consistency
|-- used by: DSK promotion fixtures, large composition proof reviews, SequenceNode-backed ProtoKit checks, AR/browser proof readiness
|-- likely target repo: NexusEngine core validation surface
```

## Runtime Identity And Lifecycle Ownership Kits

```txt
runtime-binding-ownership-kit
|-- owns: binding owner registry, duplicate binding diagnostics, intentional override policy, composer/direct-install parity rows
|-- provides: n:runtime:binding-ownership
|-- requires: n:composition:provider-ownership, n:service:registry
|-- used by: createGameKitComposer, installRuntimeKit, adapter bindings, host bridges, proof service wiring
|-- likely target repo: NexusEngine core validation surface

ecs-definition-identity-kit
|-- owns: component/resource/event name ownership, explicit shared-definition policy, duplicate definition diagnostics
|-- provides: n:ecs:definition-identity
|-- requires: n:config:authored-isolation, n:state:snapshot
|-- used by: ECS core, runtime kit validation, DSK resources/events/systems, domain state isolation reviews
|-- likely target repo: NexusEngine core validation surface

sequence-install-only-idempotency-kit
|-- owns: raw install-only kit registry, repeated deployment skip checks, install-only side-effect ownership, failure retry rows
|-- provides: n:sequence:install-only-idempotency
|-- requires: n:sequence:type-registry-policy, n:install:transaction
|-- used by: SequenceNode deploy flows, proof adapters, host bridge kits, orchestration graph setup
|-- likely target repo: NexusEngine core validation surface

event-bus-disposed-parity-kit
|-- owns: disposed-state listener policy, subscribe/once/onAny parity, listener count immutability after teardown
|-- provides: n:sequence:event-bus-disposed-parity
|-- requires: n:sequence:event-history-isolation, n:lifecycle:parity-cleanup
|-- used by: SequenceNode event bus, proof harness teardown, telemetry listeners, lifecycle cleanup fixtures
|-- likely target repo: NexusEngine core validation surface

runtime-identity-lifecycle-proof-kit
|-- owns: binding ownership, ECS definition identity, install-only idempotency, and disposed event-bus proof rows
|-- provides: n:proof:runtime-identity-lifecycle
|-- requires: n:proof:coverage, n:runtime:binding-ownership, n:ecs:definition-identity, n:sequence:install-only-idempotency, n:sequence:event-bus-disposed-parity
|-- used by: DSK promotion fixtures, composition ownership reviews, SequenceNode proof hardening, runtime lifecycle audits
|-- likely target repo: NexusEngine core validation surface
```

## Content Boundary And Objective Contract Kits

```txt
public-api-product-boundary-kit
|-- owns: product/themed export detection, compatibility preset labels, core-vs-ProtoKit boundary diagnostics, public API allowlist rows
|-- provides: n:public-api:product-boundary
|-- requires: n:proof:claim-taxonomy, n:proof:release-evidence
|-- used by: public API freeze reviews, core boundary audits, ProtoKit migration planning, release claim checks
|-- likely target repo: NexusEngine core validation surface

preset-runtime-identity-kit
|-- owns: factory option id policy, preset id ownership, duplicate preset diagnostics, installed metadata ownership rows
|-- provides: n:kit:preset-identity
|-- requires: n:runtime:binding-ownership, n:runtime:identity
|-- used by: FishingKit, compatibility presets, ProtoKit preset adapters, multi-variant composition proof
|-- likely target repo: NexusEngine core validation surface for existing exports; NexusEngine-ProtoKits for new presets

objective-threshold-policy-kit
|-- owns: positive target normalization, disabled-objective semantics, malformed objective diagnostics, zero-progress completion guards
|-- provides: n:objective:threshold-policy
|-- requires: n:state:terminal-policy, n:config:normalize
|-- used by: fishing objectives, request fulfillment, scenario duration, tutorials, completion ledgers, proof routes
|-- likely target repo: NexusEngine-ProtoKits by default; NexusEngine core validation surface for existing core objective kits

content-dataset-validation-kit
|-- owns: required content fields, duplicate/unknown ids, placeholder-entity prevention, objective/content cross-validation diagnostics
|-- provides: n:content:dataset-validation
|-- requires: n:content:dataset-contract, n:objective:threshold-policy
|-- used by: fishing content, lure/species datasets, authored scenario packs, generated proof state, import pipelines
|-- likely target repo: NexusEngine-ProtoKits by default

content-boundary-objective-proof-kit
|-- owns: public API boundary, preset identity, objective threshold, and dataset validation proof rows
|-- provides: n:proof:content-boundary-objective
|-- requires: n:proof:coverage, n:public-api:product-boundary, n:kit:preset-identity, n:objective:threshold-policy, n:content:dataset-validation
|-- used by: content-driven kit promotion reviews, FishingKit compatibility decisions, ProtoKit extraction plans, public proof readiness gates
|-- likely target repo: NexusEngine core validation surface plus NexusEngine-ProtoKits proof tooling
```

## Query Read Model Isolation Kits

```txt
public-query-helper-contract-kit
|-- owns: exported query helper return contracts, deep clone/freeze policy, nested record diagnostics
|-- provides: n:query:helper-contract
|-- requires: n:query:snapshot-isolation, n:config:authored-isolation
|-- used by: queryNearestOpenRequest, queryNearestCargo, queryNearestLandmark, queryNearbyAffordances, queryHazardCircle, queryWaterSurface
|-- likely target repo: NexusEngine core validation surface

engine-read-method-snapshot-kit
|-- owns: engine read method snapshot contracts, nearest/available/collision result isolation, read-versus-command mutation boundaries
|-- provides: n:engine-read:snapshot-contract
|-- requires: n:query:helper-contract, n:state:snapshot
|-- used by: requestFulfillment.nearestOpen, cargoManifest.availableItems, cargoManifest.nearestAvailable, landmarkGuidance.nearest, hazardField.checkCircle, waterSurface.query
|-- likely target repo: NexusEngine core validation surface

nested-metadata-read-isolation-kit
|-- owns: nested metadata and hazard descriptor isolation, structured-clone/freeze diagnostics, mutable-handle exceptions
|-- provides: n:metadata:read-isolation
|-- requires: n:config:authored-isolation, n:query:helper-contract
|-- used by: logistics, spatial guidance, affordance, hazard, water, content datasets, AI/proof adapters
|-- likely target repo: NexusEngine core validation surface by default; NexusEngine-ProtoKits for new metadata-heavy kits

stored-query-proof-snapshot-kit
|-- owns: lastQuery/lastCollision snapshot storage, returned-result alias checks, audit-field mutation diagnostics
|-- provides: n:stored-query:proof-snapshot
|-- requires: n:engine-read:snapshot-contract, n:surface:snapshot-isolation
|-- used by: route-field, landmark guidance, hazard field, water surface, telemetry, proof recorders
|-- likely target repo: NexusEngine core validation surface

query-read-model-isolation-proof-kit
|-- owns: public helper, engine read method, nested metadata, and stored query snapshot proof rows
|-- provides: n:proof:query-read-model-isolation
|-- requires: n:proof:coverage, n:query:helper-contract, n:engine-read:snapshot-contract, n:metadata:read-isolation, n:stored-query:proof-snapshot
|-- used by: DSK promotion fixtures, logistics/spatial/hazard/water proof reviews, renderer and AI adapter hardening
|-- likely target repo: NexusEngine core validation surface plus NexusEngine-ProtoKits proof tooling
```

## Scheduler World Mutation Isolation Kits

```txt
scheduler-active-run-policy-kit
|-- owns: active scheduler run mutation policy, same-phase add behavior, deferred system attachment, duplicate/self-add diagnostics
|-- provides: n:scheduler:active-run-policy
|-- requires: n:scheduler:failure-lifetime, n:install:transaction
|-- used by: createScheduler, engine.tick, runtime kit install hooks, DSK adapters, proof harness setup
|-- likely target repo: NexusEngine core validation surface

scheduler-phase-topology-kit
|-- owns: phase add/remove timing, phase snapshot policy, lifecycle ordering diagnostics, same-run topology mutation rows
|-- provides: n:scheduler:phase-topology
|-- requires: n:scheduler:active-run-policy, n:lifecycle:parity-cleanup
|-- used by: scheduler phase graphs, SequenceNode frame hooks, lifecycle surfaces, DSK runtime partitions
|-- likely target repo: NexusEngine core validation surface

runsystem-membership-snapshot-kit
|-- owns: entity/component membership recheck policy, removed-entity skip rules, stable component snapshot options, cleanup iteration diagnostics
|-- provides: n:runsystem:membership-snapshot
|-- requires: n:state:snapshot, n:state:accepted-mutation
|-- used by: ECS world.runSystem, cleanup/despawn systems, collision/transfer/objective systems, deterministic tick fixtures
|-- likely target repo: NexusEngine core validation surface

event-queue-payload-isolation-kit
|-- owns: event payload clone/freeze policy, queued-event read isolation, journal payload alias diagnostics, mutable-handle exceptions
|-- provides: n:event-queue:payload-isolation
|-- requires: n:event:handoff, n:surface:snapshot-isolation
|-- used by: world.emit, world.readEvents, scheduler consumers, SequenceNode bridges, telemetry and proof recorders
|-- likely target repo: NexusEngine core validation surface

scheduler-world-mutation-proof-kit
|-- owns: active-run mutation, phase topology, runSystem membership, and event queue payload proof rows
|-- provides: n:proof:scheduler-world-mutation
|-- requires: n:proof:coverage, n:scheduler:active-run-policy, n:scheduler:phase-topology, n:runsystem:membership-snapshot, n:event-queue:payload-isolation
|-- used by: DSK promotion fixtures, runtime failure-boundary hardening, scheduler/world audit passes, replay and lifecycle proof
|-- likely target repo: NexusEngine core validation surface
```

## Procedural Navigation State Ownership Kits

```txt
navigation-command-payload-ownership-kit
|-- owns: path request endpoint clone/freeze policy, returned request isolation, queued request mutation diagnostics, event payload ownership rows
|-- provides: n:navigation:command-payload-ownership
|-- requires: n:command:accepted-mutation, n:event-queue:payload-isolation
|-- used by: pathfinding requestPath, agent path assignment, replay harnesses, SequenceNode navigation bridges, procedural traversal proofs
|-- likely target repo: NexusEngine core validation surface

navigation-proof-snapshot-isolation-kit
|-- owns: NavigationSnapshot, NavigationState, lastPath, path history, debug graph, and agent path read-model isolation
|-- provides: n:navigation:proof-snapshot-isolation
|-- requires: n:state:snapshot, n:query:snapshot-isolation
|-- used by: pathfinding, navmesh adapters, route proof panels, debug dashboards, traversal telemetry
|-- likely target repo: NexusEngine core validation surface

procedural-proof-snapshot-isolation-kit
|-- owns: generated cell, walkability, region, render descriptor, objective marker, and world-position snapshot clone/freeze policy
|-- provides: n:procedural:proof-snapshot-isolation
|-- requires: n:state:snapshot, n:config:authored-isolation
|-- used by: procedural generation, navmesh input, terrain adapters, route placement, renderer descriptors, generated-world proof
|-- likely target repo: NexusEngine core validation surface

procedural-command-return-state-kit
|-- owns: regenerate return-value isolation, pending state mutation policy, dirty/seed/config ownership, invalidation event payload rows
|-- provides: n:procedural:command-return-state
|-- requires: n:state:accepted-mutation, n:procedural:proof-snapshot-isolation
|-- used by: procedural regenerate APIs, editor tools, generator proof harnesses, same-frame generation checks
|-- likely target repo: NexusEngine core validation surface

procedural-navigation-ownership-proof-kit
|-- owns: navigation command payload, navigation proof snapshot, procedural proof snapshot, and procedural command return-state proof rows
|-- provides: n:proof:procedural-navigation-ownership
|-- requires: n:proof:coverage, n:navigation:command-payload-ownership, n:navigation:proof-snapshot-isolation, n:procedural:proof-snapshot-isolation, n:procedural:command-return-state
|-- used by: DSK promotion fixtures, generated-world hardening, traversal proof reviews, browser/editor proof readiness
|-- likely target repo: NexusEngine core validation surface
```

## Telemetry Command Evidence Ownership Kits

```txt
telemetry-selected-value-snapshot-kit
|-- owns: selected resource clone/freeze policy, manual snapshot isolation, cleanup snapshot history isolation, mutation diagnostics
|-- provides: n:telemetry:selected-value-snapshot
|-- requires: n:state:snapshot, n:proof:signal-integrity
|-- used by: TelemetryKit, proof dashboards, validation history, release evidence recorders, replay diagnostics
|-- likely target repo: NexusEngine core validation surface

telemetry-path-selector-isolation-kit
|-- owns: nested path selector clone/freeze policy, missing path semantics, selected array/object mutation probes
|-- provides: n:telemetry:path-selector-isolation
|-- requires: n:telemetry:selected-value-snapshot, n:metadata:read-isolation
|-- used by: telemetry selectors, nested status dashboards, proof panels, scenario diagnostics
|-- likely target repo: NexusEngine core validation surface

service-command-payload-ownership-kit
|-- owns: submitted command metadata clone/freeze policy, returned state snapshot policy, command event payload ownership rows
|-- provides: n:service-command:payload-ownership
|-- requires: n:command:accepted-mutation, n:event-queue:payload-isolation
|-- used by: request queues, transport routes, operations services, logistics ProtoKits, SequenceNode service bridges
|-- likely target repo: NexusEngine core validation surface for existing core command APIs; NexusEngine-ProtoKits for new service commands

input-frame-ownership-kit
|-- owns: submitted input metadata isolation, current-frame snapshot policy, returned input state summary semantics, replay-frame diagnostics
|-- provides: n:input-frame:ownership
|-- requires: n:input:edge-semantics, n:service-command:payload-ownership
|-- used by: InputIntentKit, replay harnesses, automation input, SequenceNode bridges, browser proof controls
|-- likely target repo: NexusEngine core validation surface

telemetry-command-evidence-proof-kit
|-- owns: telemetry selected values, telemetry path selectors, service command payloads, and input frame ownership proof rows
|-- provides: n:proof:telemetry-command-evidence
|-- requires: n:proof:coverage, n:telemetry:selected-value-snapshot, n:telemetry:path-selector-isolation, n:service-command:payload-ownership, n:input-frame:ownership
|-- used by: DSK promotion fixtures, operations/input hardening, proof history reviews, replay and automation evidence gates
|-- likely target repo: NexusEngine core validation surface plus NexusEngine-ProtoKits proof tooling
```

## Domain Command Config Ownership Kits

```txt
economy-transaction-metadata-ownership-kit
|-- owns: completed/rejected transaction metadata cloning, ledger proof immutability, returned state snapshot policy, economy event payload isolation
|-- provides: n:economy:transaction-metadata-ownership
|-- requires: n:service-command:payload-ownership, n:event-queue:payload-isolation
|-- used by: EconomyKit, operations ledgers, reward/penalty proof, service-flow audit trails, replay validation
|-- likely target repo: NexusEngine core validation surface

timing-action-read-ownership-kit
|-- owns: timing window metadata isolation, action metadata cloning, active-window read snapshots, result/event payload ownership
|-- provides: n:timing:action-read-ownership
|-- requires: n:state:snapshot, n:service-command:payload-ownership
|-- used by: TimingWindowKit, combat/rhythm/training timing, repeated action proof, active timing dashboards
|-- likely target repo: NexusEngine core validation surface

pressure-resource-command-ownership-kit
|-- owns: resource config metadata cloning, adjustment metadata cloning, returned resource/state snapshot policy, depletion payload ownership
|-- provides: n:pressure:resource-command-ownership
|-- requires: n:state:snapshot, n:service-command:payload-ownership
|-- used by: ResourcePressureKit, stamina/oxygen/heat/morale services, pressure proof, scenario replay
|-- likely target repo: NexusEngine core validation surface

lifecycle-facility-add-payload-ownership-kit
|-- owns: lifecycle item and facility add payload capture, nested effects/cost/output/upkeep isolation, returned state snapshot policy, downstream economy side-effect ownership
|-- provides: n:lifecycle-facility:add-payload-ownership
|-- requires: n:config:authored-isolation, n:service-command:payload-ownership, n:economy:transaction-metadata-ownership
|-- used by: LifecycleProgressionKit, FacilityOperationsKit, city/facility authoring, editor-driven operations, economy side-effect proof
|-- likely target repo: NexusEngine core validation surface

domain-command-config-ownership-proof-kit
|-- owns: economy, timing, pressure, lifecycle, and facility command/config/read ownership proof rows
|-- provides: n:proof:domain-command-config-ownership
|-- requires: n:proof:coverage, n:economy:transaction-metadata-ownership, n:timing:action-read-ownership, n:pressure:resource-command-ownership, n:lifecycle-facility:add-payload-ownership
|-- used by: DSK promotion fixtures, operations hardening, replay-safe command validation, editor/config boundary audits
|-- likely target repo: NexusEngine core validation surface plus NexusEngine-ProtoKits proof tooling
```
