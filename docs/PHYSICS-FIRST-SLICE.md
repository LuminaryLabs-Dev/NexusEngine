# Physics first-slice Core changes

This development milestone keeps package version `0.0.4`. It supplies the small
missing Core connections required by the external Physics-to-render candidate;
it does not complete the original 0.0.5 matrix.

```text
engine.tick(1/60)
  -> existing Simulation transaction
  -> explicitly registered external Physics participant
  -> physicsBodyRegistry.commitStep(...)
  -> Spatial physicsTransform descriptors
  -> physicsStep.commitFrame(...)
  -> successful tick receipt
  -> external host renders the committed transforms
```

## Existing owners, extended APIs

`engine.n.physicsBodyRegistry.commitStep({stepId, updates})` validates an output
batch before one registry write. Each update identifies `bodyId`, its
`expectedRevision`, complete `pose` and `velocity`, explicit `sleeping` and
`idleSeconds`, and `consumeImpulses`. The only retained streaming retry is the
latest request and receipt. An identical latest retry is a no-op; conflicting,
stale or out-of-order steps fail. Existing authored operation receipts are not
removed. Snapshots retain the streaming sequence and current bodies.

`engine.n.physicsStep.commitFrame(command)` accepts the existing typed
completion fields only for the installed, ready provider and exact next step.
It retains the current frame and identical-retry receipt without growing a
per-tick command history. It rejects a pending separate step request.

`engine.registerTickCheckpoint({id,capture,restore})` explicitly enlists a
synchronous external state owner. When checkpoints are installed, the existing
ECS `world.atomic` transaction covers setter-based tick changes. On failure,
registered closures/providers, clock/revision/last-commit identity, and query
membership restore together. Register and unregister only while idle. No new
simulation loop or renderer is installed by this API.

`engine.getTickSnapshot()` and `engine.loadTickSnapshot(snapshot)` expose
validated idle-only clock/commit state for host snapshot composition. They do
not claim to snapshot arbitrary game state. Realtime exposes the same methods.

## Repairs

The body sleep normalizer now accepts valid static bodies while continuing to
reject a dynamic sleeping body whose `allowSleep` is false. ECS movement uses
component setters, collision pairs reread state changed by prior responses, and
large journal rollback no longer exceeds a function argument limit.

## Proof

Run `npm run test:physics:streaming` for 24 Core/ECS regression checks and
`npm run core:contracts` for installed manifest parity. The complete real
provider tests and browser proof live in `LuminaryLabs-Dev/NexusEngine-Kits` at
`tests/physics/` and `examples/physics-runtime/`. They consume a packed Core
package through public imports, not a sibling-source alias.

The external candidate proves falling, friction, restitution, sensors, raycasts,
a hinge, repeated 1,200-tick traces, snapshot/reset/replay, and injected failures
through actual `engine.tick()`. The browser uses Three r180 SVGRenderer for
real visible frames when explicitly selected. WebGL context creation was not
available in this sandbox; SVG proof does not establish GPU rendering.

## Limits and remaining gates

Tick transactions cover setters and explicitly enlisted owners, not arbitrary
in-place mutations, unregistered closures, active sequence internals, already
observed external effects, network calls, or pixels. Render after a successful
tick and provide explicit checkpoint policies for other mutable owners.

The supported Rapier snapshot includes separately labeled backend-native state;
that section is not a portable Core snapshot. Direct provider calls require the
host transaction contract. The first view consumes Spatial plus the existing
Render frame schema; it does not claim all unfinished Render execution packages.

The unchanged baseline failed strict `n:authoring:create` proof and the
IndexedDB provider Core ownership boundary. These failures remain recorded and
are not waived. The existing development `--allow-pending` catalog generation
was used to refresh affected manifests; strict release checks still fail.
Advanced Physics, full canonical provider migration, GPU/XR, The Open Above,
MCP release proof, full generated documentation reconciliation and remaining
0.0.5 packages are not completed by this milestone.
