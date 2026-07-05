# NexusEngine Core Kits Rebuild Masterplan

This is the execution plan for rebuilding `LuminaryLabs-Dev/NexusEngine` around broad, configurable **core capability domains**.

It reviews the documentation stack part by part, explains each document in simple terms, and turns each document into implementation work.

This plan is intentionally scoped to the main NexusEngine repository only.

```txt
Repository: LuminaryLabs-Dev/NexusEngine
Branch: main
Plan type: breaking rebuild plan
Compatibility goal: document migration, not preserve old imports forever
Satellite repos: do not change yet
```

Do not change these repos in this rebuild pass:

```txt
LuminaryLabs-Agents/NexusEngine-ProtoKits
LuminaryLabs-Agents/NexusEngine-Experiments
LuminaryLabs-Agents/NexusEngine-Sandbox
LuminaryLabs-Agents/NexusEngine-KitBuilder01
LuminaryLabs-Agents/NexusEngine-KitBuilder02
LuminaryLabs-Agents/NexusEngine-KitBuilder03
```

---

## Simple summary

```txt
We are rebuilding NexusEngine so the main package becomes:

kernel
  + contracts
  + foundation primitives
  + core capability domains
  + adapters
  + diagnostics
  + migration docs
```

Core capability domains are the stable bubbles.

ProtoKits will later compose bigger bubbles from them.

Experiments will later prove the bigger bubbles.

This plan does not patch those repos yet.

---

## Source documents reviewed

### 1. `src/core-kits/core-domain.md`

Simple meaning:

```txt
This file defines what a core capability domain is.
```

Important rule from it:

```txt
A core capability domain is not a tiny helper.
A core capability domain is not a locked monolith.
It is a stable, configurable, data-driven, event-driven domain bubble.
```

What we need to do from it:

```txt
[ ] Keep every core kit data-driven.
[ ] Keep every core kit event-driven.
[ ] Give every core kit override points.
[ ] Give every core kit adapter boundaries when needed.
[ ] Give every core kit snapshot/reset expectations.
[ ] Make every core kit useful out of the gate.
[ ] Keep niche, genre, platform, and composite kits outside this repo for now.
```

### 2. `docs/0.0.3/CORE-KITS-MASSIVE-DOCS-PLAN.md`

Simple meaning:

```txt
This file lists the whole documentation and implementation spine.
```

Important rule from it:

```txt
No boundary doc, no core.
No how-to-use doc, no core.
No snapshot/reset, no core.
No deterministic headless proof, no core.
No migration note for breaking imports, no main-branch break.
```

What we need to do from it:

```txt
[ ] Create every architecture doc.
[ ] Create every per-kit doc.
[ ] Create every how-to-use doc.
[ ] Create every source-domain doc.
[ ] Create examples.
[ ] Create breaking change docs.
[ ] Create app migration docs.
[ ] Then rebuild source folders and factories.
```

---

## Final architecture map

```txt
NexusEngine/
|
|-- src/
|   |
|   |-- kernel/
|   |   |-- ecs.js
|   |   |-- engine.js
|   |   |-- scheduler.js
|   |   |-- surfaces.js
|   |   `-- host.js
|   |
|   |-- contracts/
|   |   |-- runtime-kit.js
|   |   |-- domain-service-kit.js
|   |   |-- game-kit-composer.js
|   |   |-- token-registry.js
|   |   `-- composition-contract.js
|   |
|   |-- foundation/
|   |   |-- seeded-random.js
|   |   |-- snapshot.js
|   |   |-- serializable-state.js
|   |   |-- completion-ledger.js
|   |   |-- idempotency-ledger.js
|   |   |-- progress-timer.js
|   |   |-- deterministic-replay.js
|   |   `-- promotion-guard.js
|   |
|   |-- core-kits/
|   |   |-- core-domain.md
|   |   |-- core-data-kit/
|   |   |-- core-persistence-kit/
|   |   |-- core-assets-kit/
|   |   |-- core-platform-kit/
|   |   |-- core-input-kit/
|   |   |-- core-spatial-kit/
|   |   |-- core-scene-kit/
|   |   |-- core-physics-kit/
|   |   |-- core-motion-kit/
|   |   |-- core-simulation-kit/
|   |   |-- core-interaction-kit/
|   |   |-- core-graphics-kit/
|   |   |-- core-camera-kit/
|   |   |-- core-animation-kit/
|   |   |-- core-audio-kit/
|   |   |-- core-ui-kit/
|   |   |-- core-network-kit/
|   |   |-- core-diagnostics-kit/
|   |   |-- core-policy-kit/
|   |   |-- core-composition-kit/
|   |   |-- core-mlnn-kit/
|   |   `-- core-agent-kit/
|   |
|   |-- adapters/
|   |   |-- headless/
|   |   |-- browser/
|   |   |-- canvas2d/
|   |   |-- webgl/
|   |   |-- three/
|   |   |-- xr/
|   |   |-- storage/
|   |   `-- network/
|   |
|   |-- legacy-kits/
|   |   `-- old broad or flat kits waiting to be moved, replaced, or removed
|   |
|   `-- index.js
|
|-- tests/
|   |-- kernel/
|   |-- contracts/
|   |-- foundation/
|   |-- core-kits/
|   `-- promotion/
|
`-- docs/
    |-- 0.0.3/
    |-- core-kits/
    `-- examples/
```

---

# Documentation rebuild plan, part by part

## Phase A: Architecture docs

These docs explain the rebuild before code moves.

### A1. `docs/0.0.3/START-HERE.md`

Simple meaning:

```txt
The front door for the rebuild.
```

Must explain:

```txt
[ ] What the rebuild is.
[ ] Why core-kits exist.
[ ] What breaks.
[ ] What does not change yet.
[ ] Which docs to read next.
```

Implementation tasks:

```txt
[ ] Create the file.
[ ] Link to every major 0.0.3 doc.
[ ] Add a short decision tree for contributors.
[ ] Add a warning that satellite repos are not patched yet.
```

Done when:

```txt
A new contributor can open one file and understand the rebuild path in under five minutes.
```

### A2. `docs/0.0.3/CORE-CAPABILITY-KITS.md`

Simple meaning:

```txt
The canonical list of all core capability domains.
```

Must explain:

```txt
[ ] What a capability domain is.
[ ] The 22 final domains.
[ ] What each domain owns.
[ ] What each domain does not own.
[ ] Which existing flat files seed each domain.
[ ] Which domains are Batch 1 and Batch 2.
```

Implementation tasks:

```txt
[ ] Write the canonical domain table.
[ ] Include simple one-line purpose for each domain.
[ ] Include source folder path for each domain.
[ ] Include docs path for each domain.
```

Done when:

```txt
There is one authoritative domain map for NexusEngine core-kits.
```

### A3. `docs/0.0.3/CORE-KIT-OVERRIDE-MODEL.md`

Simple meaning:

```txt
How projects customize core kits without forking them.
```

Must explain four override levels:

```txt
1. data config
2. policy override
3. adapter override
4. domain extension
```

Implementation tasks:

```txt
[ ] Show one example per override level.
[ ] Explain what is safe to override.
[ ] Explain what should not be overridden.
[ ] Explain how ProtoKits later extend core domains.
```

Done when:

```txt
A future ProtoKit author knows how to overstep or specialize a core kit without copying internals.
```

### A4. `docs/0.0.3/EXISTING-FILE-TO-CORE-KIT-MAP.md`

Simple meaning:

```txt
The inventory that says where old flat source files go.
```

Must map:

```txt
src/input-intent-kit.js       -> core-input-kit
src/render-descriptor-kit.js  -> core-graphics-kit
src/interaction-target-kit.js -> core-interaction-kit
src/timing-window-kit.js      -> core-simulation-kit
src/resource-pressure-kit.js  -> core-simulation-kit
src/objective-flow-kit.js     -> core-simulation-kit
src/telemetry-kit.js          -> core-diagnostics-kit
```

Implementation tasks:

```txt
[ ] Identify every current src/*.js kit.
[ ] Classify each as kernel, contract, foundation, core-kit seed, adapter, or legacy.
[ ] Mark whether it is moved, wrapped, split, replaced, or removed.
[ ] Mark whether old import compatibility remains temporarily or is removed in the breaking commit.
```

Done when:

```txt
Every existing source file has a target category.
```

### A5. `docs/0.0.3/PROTOKIT-BOUNDARIES.md`

Simple meaning:

```txt
The wall between main core and ProtoKits.
```

Must explain:

```txt
[ ] Core owns capability domains.
[ ] ProtoKits own niche, genre, platform, app, and composite kits.
[ ] Experiments own playable proof.
[ ] This rebuild does not modify ProtoKits yet.
```

Implementation tasks:

```txt
[ ] List examples that stay in ProtoKits.
[ ] List examples that can later consume core domains.
[ ] Define what cannot be promoted into core.
[ ] Define the later migration packet for ProtoKits.
```

Done when:

```txt
Nobody can confuse core rebuild work with a ProtoKits patch.
```

### A6. `docs/0.0.3/PROMOTION-GATES.md`

Simple meaning:

```txt
The checklist a domain must pass before it becomes core.
```

Must include:

```txt
[ ] boundary doc
[ ] how-to-use doc
[ ] deterministic headless smoke
[ ] snapshot/reset proof
[ ] serializable state proof
[ ] no forbidden browser dependency
[ ] adapter boundary proof where relevant
[ ] migration note if an old API changes
```

Implementation tasks:

```txt
[ ] Write the gate checklist.
[ ] Add examples of pass/fail.
[ ] Add commands that verify gates.
[ ] Link to tests/core-kits/ and tests/promotion/.
```

Done when:

```txt
No one can add a core domain without the same evidence format.
```

### A7. `docs/0.0.3/RELEASE-CHECKLIST.md`

Simple meaning:

```txt
The release checklist for the breaking rebuild.
```

Must include:

```txt
[ ] docs complete
[ ] source folders created
[ ] barrel exports pass
[ ] factories implemented
[ ] tests pass
[ ] migration packet complete
[ ] old import removals documented
[ ] downstream apps have update path
```

Implementation tasks:

```txt
[ ] Create release checklist.
[ ] Add signoff sections.
[ ] Add final commands.
[ ] Add links to breaking docs.
```

Done when:

```txt
The main branch can intentionally break old imports with migration guidance in place.
```

---

## Phase B: Per-kit docs

These docs explain each core capability domain.

Every domain gets two docs:

```txt
docs/core-kits/<core-kit>.md
docs/core-kits/how-to-use-<core-kit>.md
```

### Common `<core-kit>.md` structure

Simple meaning:

```txt
This explains what the domain is.
```

Must include:

```txt
[ ] Purpose
[ ] Owns
[ ] Does Not Own
[ ] Public Factory
[ ] Resources
[ ] Events
[ ] State Shape
[ ] Descriptor Shape
[ ] Configuration
[ ] Override Points
[ ] Composition
[ ] ProtoKit Usage
[ ] Tests
[ ] Breaking Changes
```

### Common `how-to-use-<core-kit>.md` structure

Simple meaning:

```txt
This shows how to actually use the domain.
```

Must include:

```txt
[ ] Install/import
[ ] Basic example
[ ] Data-driven example
[ ] Event-driven example
[ ] Override example
[ ] Composition example
[ ] Downstream app notes
[ ] Common mistakes
```

---

## Phase B domain execution table

```txt
Domain                  Main doc                                How-to doc
----------------------  --------------------------------------  -------------------------------------------
core-data-kit           docs/core-kits/core-data-kit.md          docs/core-kits/how-to-use-core-data-kit.md
core-persistence-kit    docs/core-kits/core-persistence-kit.md   docs/core-kits/how-to-use-core-persistence-kit.md
core-assets-kit         docs/core-kits/core-assets-kit.md        docs/core-kits/how-to-use-core-assets-kit.md
core-platform-kit       docs/core-kits/core-platform-kit.md      docs/core-kits/how-to-use-core-platform-kit.md
core-input-kit          docs/core-kits/core-input-kit.md         docs/core-kits/how-to-use-core-input-kit.md
core-spatial-kit        docs/core-kits/core-spatial-kit.md       docs/core-kits/how-to-use-core-spatial-kit.md
core-scene-kit          docs/core-kits/core-scene-kit.md         docs/core-kits/how-to-use-core-scene-kit.md
core-physics-kit        docs/core-kits/core-physics-kit.md       docs/core-kits/how-to-use-core-physics-kit.md
core-motion-kit         docs/core-kits/core-motion-kit.md        docs/core-kits/how-to-use-core-motion-kit.md
core-simulation-kit     docs/core-kits/core-simulation-kit.md    docs/core-kits/how-to-use-core-simulation-kit.md
core-interaction-kit    docs/core-kits/core-interaction-kit.md   docs/core-kits/how-to-use-core-interaction-kit.md
core-graphics-kit       docs/core-kits/core-graphics-kit.md      docs/core-kits/how-to-use-core-graphics-kit.md
core-camera-kit         docs/core-kits/core-camera-kit.md        docs/core-kits/how-to-use-core-camera-kit.md
core-animation-kit      docs/core-kits/core-animation-kit.md     docs/core-kits/how-to-use-core-animation-kit.md
core-audio-kit          docs/core-kits/core-audio-kit.md         docs/core-kits/how-to-use-core-audio-kit.md
core-ui-kit             docs/core-kits/core-ui-kit.md            docs/core-kits/how-to-use-core-ui-kit.md
core-network-kit        docs/core-kits/core-network-kit.md       docs/core-kits/how-to-use-core-network-kit.md
core-diagnostics-kit    docs/core-kits/core-diagnostics-kit.md   docs/core-kits/how-to-use-core-diagnostics-kit.md
core-policy-kit         docs/core-kits/core-policy-kit.md        docs/core-kits/how-to-use-core-policy-kit.md
core-composition-kit    docs/core-kits/core-composition-kit.md   docs/core-kits/how-to-use-core-composition-kit.md
core-mlnn-kit           docs/core-kits/core-mlnn-kit.md          docs/core-kits/how-to-use-core-mlnn-kit.md
core-agent-kit          docs/core-kits/core-agent-kit.md         docs/core-kits/how-to-use-core-agent-kit.md
```

---

## Phase B simple domain notes

### core-data-kit

Simple meaning:

```txt
The state and snapshot domain.
```

Build:

```txt
[ ] schemas
[ ] serializable state helpers
[ ] snapshot/loadSnapshot/reset helpers
[ ] selectors
[ ] completion ledger
[ ] idempotency ledger
[ ] migration helpers
```

### core-persistence-kit

Simple meaning:

```txt
The save/load location domain.
```

Build:

```txt
[ ] save slots
[ ] memory adapter
[ ] file adapter boundary
[ ] local storage adapter boundary
[ ] cloud adapter boundary
[ ] migration record storage
```

### core-assets-kit

Simple meaning:

```txt
The asset identity and readiness domain.
```

Build:

```txt
[ ] asset manifests
[ ] asset IDs
[ ] asset groups
[ ] fallback assets
[ ] readiness state
[ ] loading descriptors
```

### core-platform-kit

Simple meaning:

```txt
The host capability domain.
```

Build:

```txt
[ ] headless/browser/native/XR descriptors
[ ] device class descriptor
[ ] render/input/storage/network capability checks
[ ] permission descriptors
[ ] fallback mode selection
```

### core-input-kit

Simple meaning:

```txt
The semantic action and input mapping domain.
```

Build:

```txt
[ ] actions
[ ] axes
[ ] contexts
[ ] bindings
[ ] rebinding
[ ] pressed/held/released state
[ ] adapters for keyboard, mouse, gamepad, XR boundaries
```

### core-spatial-kit

Simple meaning:

```txt
The where-things-are domain.
```

Build:

```txt
[ ] transforms
[ ] bounds
[ ] zones
[ ] distance queries
[ ] ray/volume descriptors
[ ] coordinate spaces
```

### core-scene-kit

Simple meaning:

```txt
The what-things-exist domain.
```

Build:

```txt
[ ] scene graph
[ ] object identity
[ ] spawn/despawn events
[ ] layers
[ ] tags
[ ] prefab-style recipes
```

### core-physics-kit

Simple meaning:

```txt
The collision and physical constraint contract domain.
```

Build:

```txt
[ ] collider descriptors
[ ] contact events
[ ] grounding
[ ] constraint descriptors
[ ] collision queries
[ ] physics adapter boundary
```

### core-motion-kit

Simple meaning:

```txt
The input-to-movement domain.
```

Build:

```txt
[ ] movement modes
[ ] velocity descriptors
[ ] acceleration/deceleration policy
[ ] jump/dash/fly/swim descriptors
[ ] compose input + spatial + physics
```

### core-simulation-kit

Simple meaning:

```txt
The deterministic gameplay/app simulation primitives domain.
```

Build:

```txt
[ ] resource meters
[ ] pressure channels
[ ] timers
[ ] cooldowns
[ ] objectives
[ ] routes
[ ] checkpoints
[ ] hazard descriptors
```

### core-interaction-kit

Simple meaning:

```txt
The target, affordance, and activation domain.
```

Build:

```txt
[ ] targets
[ ] affordances
[ ] usable/locked/blocked/completed state
[ ] activation progress
[ ] prompt descriptors
[ ] interaction result events
```

### core-graphics-kit

Simple meaning:

```txt
The renderer-agnostic visual descriptor domain.
```

Build:

```txt
[ ] render descriptors
[ ] material descriptors
[ ] lighting descriptors
[ ] VFX descriptors
[ ] LOD descriptors
[ ] quality profiles
[ ] renderer adapter contracts
```

### core-camera-kit

Simple meaning:

```txt
The camera intent and camera feel domain.
```

Build:

```txt
[ ] camera targets
[ ] follow modes
[ ] shake descriptors
[ ] FOV policy
[ ] camera volumes
[ ] occlusion policy
[ ] XR/head camera boundary
```

### core-animation-kit

Simple meaning:

```txt
The animation descriptor and state domain.
```

Build:

```txt
[ ] clips
[ ] blends
[ ] poses
[ ] transition rules
[ ] procedural hooks
[ ] timeline events
```

### core-audio-kit

Simple meaning:

```txt
The audio descriptor domain.
```

Build:

```txt
[ ] audio cues
[ ] music state
[ ] ambient zones
[ ] mix groups
[ ] volume policy
[ ] spatial audio descriptors
[ ] audio adapter boundary
```

### core-ui-kit

Simple meaning:

```txt
The UI descriptor domain.
```

Build:

```txt
[ ] HUD descriptors
[ ] menu descriptors
[ ] prompt descriptors
[ ] notification descriptors
[ ] panels
[ ] focus state
[ ] selection state
[ ] accessibility descriptors
```

### core-network-kit

Simple meaning:

```txt
The session, peer, and message contract domain.
```

Build:

```txt
[ ] session descriptors
[ ] peer descriptors
[ ] message envelopes
[ ] event sync policy
[ ] state sync policy
[ ] authority model
[ ] reconnect state
[ ] collaboration channels
```

### core-diagnostics-kit

Simple meaning:

```txt
The proof, telemetry, replay, and health domain.
```

Build:

```txt
[ ] telemetry
[ ] runtime snapshots
[ ] replay fixtures
[ ] determinism guards
[ ] performance counters
[ ] kit health reports
[ ] promotion evidence
```

### core-policy-kit

Simple meaning:

```txt
The permission and guardrail domain.
```

Build:

```txt
[ ] allowed action rules
[ ] blocked action rules
[ ] permission gates
[ ] sandbox rules
[ ] tool/action policies
[ ] runtime safety checks
[ ] promotion restrictions
```

### core-composition-kit

Simple meaning:

```txt
The visible kit graph domain.
```

Build:

```txt
[ ] kit manifests
[ ] dependency graph
[ ] requires/provides map
[ ] composition plans
[ ] domain graph snapshots
[ ] promotion metadata
[ ] kit health state
```

### core-mlnn-kit

Simple meaning:

```txt
The model and neural-network capability domain.
```

Build:

```txt
[ ] model registry
[ ] model descriptors
[ ] inference request/result format
[ ] embedding descriptors
[ ] classification descriptors
[ ] perception descriptors
[ ] generation descriptors
[ ] deterministic mock model adapter
[ ] optional backend adapter boundaries
```

Boundary:

```txt
MLNN sees, predicts, embeds, classifies, or generates descriptors.
MLNN does not decide actions.
```

### core-agent-kit

Simple meaning:

```txt
The agent observation, planning, and action proposal domain.
```

Build:

```txt
[ ] agent identity
[ ] goals
[ ] observations
[ ] memory handles
[ ] decision cycles
[ ] action proposals
[ ] tool/action registry
[ ] execution ledger
[ ] agent telemetry
[ ] replay fixtures
```

Boundary:

```txt
Agent observes, decides, proposes, and acts through policy.
Agent does not own raw model backend loading.
```

---

## Phase C: Source-domain docs

Each source domain folder gets:

```txt
src/core-kits/<core-kit>/core-domain.md
```

Simple meaning:

```txt
This is the source-local contract for the kit.
```

Each one must include:

```txt
[ ] domain purpose
[ ] files in this folder
[ ] resources owned
[ ] events owned
[ ] public API
[ ] config shape
[ ] override points
[ ] adapters
[ ] composition dependencies
[ ] tests that prove this folder
```

Done when:

```txt
Every source folder documents itself before implementation expands.
```

---

## Phase D: Example docs

### D1. `docs/examples/core-kits/default-runtime-stack.md`

Simple meaning:

```txt
The basic app stack without agents.
```

Must show:

```txt
createRealtimeGame({
  kits: [
    createCoreDataKit(),
    createCorePlatformKit(),
    createCoreInputKit(),
    createCoreSceneKit(),
    createCoreSpatialKit(),
    createCoreSimulationKit(),
    createCoreInteractionKit(),
    createCoreGraphicsKit(),
    createCoreAudioKit(),
    createCoreDiagnosticsKit()
  ]
})
```

### D2. `docs/examples/core-kits/agent-enabled-stack.md`

Simple meaning:

```txt
The same stack with MLNN and Agent.
```

Must show:

```txt
createCoreMLNNKit({ adapters: { mock: true } })
createCoreAgentKit({ agents: [{ id: "builder-agent" }] })
createCorePolicyKit()
createCoreDiagnosticsKit()
```

### D3. `docs/examples/core-kits/graphics-descriptor-stack.md`

Simple meaning:

```txt
How graphics descriptors work without locking to one renderer.
```

Must show:

```txt
core-assets-kit -> core-scene-kit -> core-graphics-kit -> renderer adapter
```

### D4. `docs/examples/core-kits/simulation-interaction-stack.md`

Simple meaning:

```txt
How input, simulation, and interaction compose.
```

Must show:

```txt
core-input-kit -> core-interaction-kit -> core-simulation-kit -> core-data-kit -> core-diagnostics-kit
```

### D5. `docs/examples/core-kits/downstream-app-migration-example.md`

Simple meaning:

```txt
A before/after migration example for apps using main.
```

Must show:

```txt
old flat import
new core domain import
old engine namespace
new engine namespace
old config shape
new config shape
```

---

## Phase E: Breaking update docs

These docs are required because this rebuild can break old imports.

### E1. `docs/0.0.3/BREAKING-CHANGES.md`

Simple meaning:

```txt
Everything that broke, written down clearly.
```

Must include:

```txt
[ ] removed exports
[ ] renamed exports
[ ] changed config shapes
[ ] changed event names
[ ] changed resource names
[ ] changed package export paths
[ ] changed engine namespace paths
[ ] old example
[ ] new example
[ ] commit marker
```

### E2. `docs/0.0.3/APP-MIGRATION-GUIDE.md`

Simple meaning:

```txt
How an app updates after pulling main.
```

Must include:

```txt
[ ] who needs to migrate
[ ] minimum migration path
[ ] full migration path
[ ] import update examples
[ ] config update examples
[ ] event/resource update examples
[ ] common failure messages
[ ] smoke test command
```

### E3. `docs/0.0.3/IMPORT-MIGRATION-MAP.md`

Simple meaning:

```txt
Old import to new import.
```

Must include this shape:

```txt
Old factory -> new factory
Old resource/event -> new resource/event
Old engine namespace -> new engine namespace
Old path -> new path
```

Example:

```txt
createInputIntentKit
  old: import { createInputIntentKit } from "nexusengine"
  new: import { createCoreInputKit } from "nexusengine"

createRenderDescriptorKit
  old: import { createRenderDescriptorKit } from "nexusengine"
  new: import { createCoreGraphicsKit } from "nexusengine"

createTelemetryKit
  old: import { createTelemetryKit } from "nexusengine"
  new: import { createCoreDiagnosticsKit } from "nexusengine"
```

### E4. `docs/0.0.3/BUILD-AND-VERIFY.md`

Simple meaning:

```txt
How to prove the rebuild and downstream migration work.
```

Must include:

```txt
[ ] npm install
[ ] npm test
[ ] syntax check
[ ] package export check
[ ] downstream app smoke command
[ ] expected passing output
[ ] common migration failures
[ ] grep command for old imports
```

---

# Code implementation plan

## Step 1: Create source folders

```txt
[ ] src/kernel/
[ ] src/contracts/
[ ] src/foundation/
[ ] src/core-kits/<22 domains>/
[ ] src/adapters/
[ ] src/legacy-kits/
```

## Step 2: Add barrel exports before moving code

Simple meaning:

```txt
Make the new paths exist before deleting old paths.
```

First barrels:

```txt
src/core-kits/core-input-kit/index.js
src/core-kits/core-graphics-kit/index.js
src/core-kits/core-interaction-kit/index.js
src/core-kits/core-simulation-kit/index.js
src/core-kits/core-diagnostics-kit/index.js
```

Seed with existing flat files:

```txt
core-input-kit         -> ../../input-intent-kit.js
core-graphics-kit      -> ../../render-descriptor-kit.js
core-interaction-kit   -> ../../interaction-target-kit.js
core-simulation-kit    -> ../../timing-window-kit.js
                       -> ../../resource-pressure-kit.js
                       -> ../../objective-flow-kit.js
core-diagnostics-kit   -> ../../telemetry-kit.js
```

## Step 3: Create foundation primitives

```txt
[ ] src/foundation/seeded-random.js
[ ] src/foundation/snapshot.js
[ ] src/foundation/serializable-state.js
[ ] src/foundation/completion-ledger.js
[ ] src/foundation/idempotency-ledger.js
[ ] src/foundation/progress-timer.js
[ ] src/foundation/deterministic-replay.js
[ ] src/foundation/promotion-guard.js
```

## Step 4: Create umbrella factories

```txt
[ ] createCoreDataKit()
[ ] createCorePersistenceKit()
[ ] createCoreAssetsKit()
[ ] createCorePlatformKit()
[ ] createCoreInputKit()
[ ] createCoreSpatialKit()
[ ] createCoreSceneKit()
[ ] createCorePhysicsKit()
[ ] createCoreMotionKit()
[ ] createCoreSimulationKit()
[ ] createCoreInteractionKit()
[ ] createCoreGraphicsKit()
[ ] createCoreCameraKit()
[ ] createCoreAnimationKit()
[ ] createCoreAudioKit()
[ ] createCoreUIKit()
[ ] createCoreNetworkKit()
[ ] createCoreDiagnosticsKit()
[ ] createCorePolicyKit()
[ ] createCoreCompositionKit()
[ ] createCoreMLNNKit()
[ ] createCoreAgentKit()
```

## Step 5: Add mock-first AI

```txt
core-mlnn-kit
  [ ] deterministic mock model adapter
  [ ] inference request descriptor
  [ ] inference result descriptor
  [ ] model registry

core-agent-kit
  [ ] rule-based agent adapter
  [ ] observation descriptor
  [ ] action proposal descriptor
  [ ] execution ledger

core-policy-kit
  [ ] action allow/block validation

core-diagnostics-kit
  [ ] capture agent decision evidence
```

## Step 6: Add tests

Test folders:

```txt
tests/foundation/
tests/core-kits/
tests/promotion/
```

Required test types:

```txt
[ ] barrel export smoke
[ ] default config smoke
[ ] custom config smoke
[ ] policy override smoke
[ ] adapter override smoke
[ ] snapshot/reset smoke
[ ] deterministic event smoke
[ ] serializable state smoke
[ ] no browser dependency smoke
[ ] composition smoke
[ ] import migration smoke
```

## Step 7: Update package exports

Simple meaning:

```txt
The public package should expose the new core domain factories.
```

Tasks:

```txt
[ ] Export every createCore<Name>Kit from src/index.js.
[ ] Add package export paths if package.json needs subpath exports.
[ ] Document every changed export in IMPORT-MIGRATION-MAP.md.
[ ] Remove old flat compatibility only in the final breaking commit.
```

## Step 8: Move or remove old flat files

Simple meaning:

```txt
After docs, tests, and migration guides exist, old flat files can be moved or replaced.
```

Tasks:

```txt
[ ] Move seed files into correct core domain folders or replace them with domain modules.
[ ] Update internal imports.
[ ] Update src/index.js.
[ ] Run tests.
[ ] Update BREAKING-CHANGES.md.
[ ] Update IMPORT-MIGRATION-MAP.md.
```

---

# Full rebuild order

```txt
01 docs: add this masterplan
02 docs: add START-HERE
03 docs: add CORE-CAPABILITY-KITS
04 docs: add CORE-KIT-OVERRIDE-MODEL
05 docs: add EXISTING-FILE-TO-CORE-KIT-MAP
06 docs: add PROTOKIT-BOUNDARIES
07 docs: add PROMOTION-GATES
08 docs: add RELEASE-CHECKLIST
09 docs: add Batch 1 per-kit docs
10 docs: add Batch 1 how-to-use docs
11 docs: add Batch 1 source-domain docs
12 refactor: add source folder shells
13 refactor: add barrel exports for seed domains
14 test: add core barrel smoke
15 feat: add foundation primitives
16 test: add foundation smoke tests
17 feat: add first umbrella factories
18 test: add core capability smoke tests
19 feat: add mock-first MLNN and Agent domains
20 test: add mock AI replay smoke
21 docs: add examples
22 docs: add breaking migration packet
23 refactor!: remove old flat import compatibility
24 docs: add final build and verify evidence
```

---

# Definition of done

This rebuild is done when:

```txt
[ ] Every architecture doc exists.
[ ] Every core kit has a main doc.
[ ] Every core kit has a how-to-use doc.
[ ] Every core source folder has a core-domain.md.
[ ] Existing flat files are mapped.
[ ] New core source folders exist.
[ ] Foundation primitives exist.
[ ] Umbrella factories exist.
[ ] src/index.js exports the new public API.
[ ] Tests pass.
[ ] Breaking changes are documented.
[ ] App migration guide exists.
[ ] Import migration map exists.
[ ] Build and verify guide exists.
[ ] No satellite repo has been changed in this phase.
```

---

# Final target public API

```js
import {
  createRealtimeGame,
  createCoreDataKit,
  createCorePersistenceKit,
  createCoreAssetsKit,
  createCorePlatformKit,
  createCoreInputKit,
  createCoreSpatialKit,
  createCoreSceneKit,
  createCorePhysicsKit,
  createCoreMotionKit,
  createCoreSimulationKit,
  createCoreInteractionKit,
  createCoreGraphicsKit,
  createCoreCameraKit,
  createCoreAnimationKit,
  createCoreAudioKit,
  createCoreUIKit,
  createCoreNetworkKit,
  createCoreDiagnosticsKit,
  createCorePolicyKit,
  createCoreCompositionKit,
  createCoreMLNNKit,
  createCoreAgentKit
} from "nexusengine";
```

Example stack:

```js
const engine = createRealtimeGame({
  kits: [
    createCoreDataKit(),
    createCorePlatformKit(),
    createCoreInputKit(),
    createCoreSceneKit(),
    createCoreSpatialKit(),
    createCoreSimulationKit(),
    createCoreInteractionKit(),
    createCoreGraphicsKit(),
    createCoreAudioKit(),
    createCoreDiagnosticsKit(),
    createCorePolicyKit(),
    createCoreMLNNKit({ adapters: { mock: true } }),
    createCoreAgentKit({ agents: [{ id: "builder-agent" }] })
  ]
});
```

---

# Final warning

This is a breaking rebuild plan.

Backward compatibility is not the goal.

Documented migration is the goal.

```txt
Do not silently break apps.
Do not touch ProtoKits yet.
Do not touch Experiments yet.
Do not touch Sandbox yet.
Do not touch KitBuilder repos yet.
Do rebuild NexusEngine main with clear docs, tests, and migration packets.
```
