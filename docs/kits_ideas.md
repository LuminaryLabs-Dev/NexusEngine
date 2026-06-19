# Kit Ideas

This file is an expansion inventory for possible NexusRealtime kits. It is not a promise that every kit should be implemented. Use it to collect reusable kit candidates, decide ownership boundaries, and feed audit automations with concrete DSK expansion targets.

Implementation target: new reusable kits should be built in `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/`, not directly in NexusRealtime core. NexusRealtime core should only change when the kit idea exposes a missing runtime primitive, DSK invariant, composer rule, or validation surface.

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
|-- likely target repo: NexusRealtime-ProtoKits

stable-id-allocation-kit
|-- owns: generated id namespaces, collision checks, sequence restore policy
|-- provides: n:identity:allocation
|-- requires: n:state:snapshot
|-- used by: occupant-flow, request-queue, cargo-manifest, transport-route, telemetry
|-- likely target repo: NexusRealtime-ProtoKits

finite-transaction-policy-kit
|-- owns: finite amount validation, rejection receipts, ledger-safe transaction requests
|-- provides: n:ledger:finite-transaction
|-- requires: n:economy:ledger, n:mutation:acceptance
|-- used by: facility-operations, lifecycle-progression, request-queue, economy
|-- likely target repo: NexusRealtime-ProtoKits

restored-resource-state-kit
|-- owns: initial/restored value normalization, aggregate flag derivation, reset consistency
|-- provides: n:state:restored-consistency
|-- requires: n:state:snapshot, n:config:normalize
|-- used by: resource-pressure, scenario-driver, telemetry, proof harnesses
|-- likely target repo: NexusRealtime-ProtoKits

operations-invariant-proof-kit
|-- owns: operations invariant rows, replay/reset proof snapshots, data-integrity coverage reports
|-- provides: n:proof:operations-invariants
|-- requires: n:proof:coverage, n:operations:data-integrity
|-- used by: city operations, logistics, social simulation, service-flow proof harnesses
|-- likely target repo: NexusRealtime-ProtoKits
```
