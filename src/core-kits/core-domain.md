# Core Capability Domains

`src/core-kits/` is the home for NexusEngine core capability domains.

A core capability domain is not a narrow one-off helper and it is not a locked monolith. It is a stable, configurable domain bubble that gives other kits a trusted base to compose from.

```txt
Core capability domain
  = stable domain contract
  + data-driven configuration
  + event-driven behavior
  + override points
  + adapter boundaries
  + snapshot/reset expectations
```

The goal is to make NexusEngine useful out of the gate while still keeping niche, genre-specific, app-specific, and experimental kits in `NexusEngine-ProtoKits`.

---

## Meaning of domain in this folder

In this folder, `domain` means **capability domain**.

Examples:

```txt
core-data-kit
core-input-kit
core-graphics-kit
core-audio-kit
core-spatial-kit
core-interaction-kit
core-simulation-kit
core-diagnostics-kit
```

These domains are intentionally broader than tiny atomic kits. They are allowed to contain smaller internal modules, adapters, descriptors, policies, and data contracts.

A capability domain should answer:

```txt
What capability does this provide?
What data config drives it?
What events does it emit and consume?
What state does it own?
What APIs does it expose?
What can callers override?
What must stay outside this domain?
```

---

## Why this exists

The core should be robust enough that a user or agent can build a useful realtime app without immediately importing dozens of niche ProtoKits.

But the core should not become a dumping ground for every game, genre, renderer, or product idea.

The intended split is:

```txt
NexusEngine kernel
  ECS, scheduler, engine, surfaces

NexusEngine contracts
  runtime-kit, domain-service-kit, composer, token rules

NexusEngine core-kits
  broad configurable capability domains

NexusEngine-ProtoKits
  niche, genre, platform, app, and composite kits

NexusEngine-Experiments
  playable proof routes and compositions
```

---

## Core domain rule

A core capability domain should be promoted only when it is:

```txt
[ ] broadly reusable across many apps, games, or experiments
[ ] configurable through data
[ ] observable through events
[ ] deterministic in headless mode
[ ] snapshot/reset friendly
[ ] renderer agnostic unless it is explicitly an adapter boundary
[ ] small enough at the public API layer
[ ] broad enough to be useful out of the gate
[ ] extendable by ProtoKits without copying internal logic
```

A core capability domain should not be promoted when it is:

```txt
[ ] tied to one game
[ ] tied to one genre
[ ] tied to one renderer implementation
[ ] tied to one platform device
[ ] mostly authored content
[ ] a temporary compatibility bridge
[ ] a large composite game loop that belongs in ProtoKits
```

---

## Data-driven behavior

Core domains should be configurable through plain data.

Example shape:

```js
createCoreInputKit({
  actions: ["jump", "grab", "confirm"],
  contexts: ["gameplay", "menu", "xr-authoring"],
  bindings: {
    keyboard: { jump: "Space", confirm: "Enter" },
    gamepad: { jump: "ButtonA", grab: "RightTrigger" },
    xr: { grab: "Grip", confirm: "Trigger" }
  }
});
```

The data should describe intent, bindings, descriptors, resources, policies, and defaults.

The domain should provide the deterministic runtime behavior around that data.

---

## Event-driven behavior

Core domains should communicate through resources, events, and small APIs.

A kit should prefer:

```txt
input event -> domain state update -> domain event -> descriptor/snapshot
```

Instead of:

```txt
input callback -> renderer mutation -> hidden side effect
```

This keeps kits replayable, testable, and composable.

Example event flow:

```txt
core-input-kit
  emits action.pressed

core-interaction-kit
  consumes action.pressed
  updates affordance state
  emits interaction.completed

core-data-kit
  records completion in a ledger

core-graphics-kit
  exposes updated render descriptors
```

---

## Override model

Core capability domains must be configurable and oversteppable.

They should expose multiple override layers:

### 1. Data configuration

Use this for normal projects.

```js
createCoreSimulationKit({
  resources: [{ id: "stamina", min: 0, max: 100, initial: 75 }],
  pressureChannels: [{ id: "heat", warningAt: 70, failAt: 100 }],
  timers: [{ id: "repair", durationSeconds: 3 }]
});
```

### 2. Policy override

Use this when a project needs custom decision rules.

```js
createCoreInteractionKit({
  policies: {
    canUseAffordance({ actor, target, state }) {
      return target.enabled && !state.completed[target.id];
    }
  }
});
```

### 3. Adapter override

Use this when a renderer, device, storage layer, or host needs custom integration.

```js
createCoreGraphicsKit({
  rendererAdapter: customRendererAdapter,
  materialAdapter: customMaterialAdapter
});
```

### 4. Domain extension

Use this when a ProtoKit needs to build a larger domain bubble on top of a core domain.

```js
extendDomainServiceKit(coreInputKit, {
  id: "flight-input-extension",
  domain: "flight-input",
  requires: ["n:core-input"],
  services: ["flight-actions"]
});
```

---

## Composition model

Core domains are meant to compose.

A larger kit should use core capability domains instead of reimplementing their internals.

Example:

```txt
generic-route-cargo-extraction-kit
  uses core-data-kit
  uses core-input-kit
  uses core-graphics-kit
  uses core-simulation-kit
  adds route/cargo/extraction rules
```

Another example:

```txt
generic-defense-kit
  uses core-data-kit
  uses core-input-kit
  uses core-interaction-kit
  uses core-simulation-kit
  uses core-graphics-kit
  adds defense/session/wave/build rules
```

The larger kit owns the composition and domain-specific rules. The core domains own the stable reusable primitives.

---

## Suggested core capability domains

### core-data-kit

Owns durable state patterns.

```txt
snapshot
loadSnapshot
reset
schemas
selectors
completion ledger
idempotency ledger
data migrations
serializable state helpers
```

### core-input-kit

Owns semantic input.

```txt
actions
axes
bindings
contexts
rebinding
dead zones
pressed / held / released state
device adapter boundaries
```

### core-graphics-kit

Owns renderer-agnostic presentation data.

```txt
render descriptors
material descriptors
camera descriptors
lighting descriptors
VFX descriptors
LOD descriptors
quality profiles
visibility hints
renderer adapter contracts
```

### core-interaction-kit

Owns general interaction state.

```txt
targets
affordances
locked / blocked / usable / completed state
activation progress
interaction prompts
semantic action requirements
interaction result events
```

### core-simulation-kit

Owns common deterministic simulation primitives.

```txt
resource meters
pressure channels
timers
cooldowns
progress windows
objectives
routes
checkpoints
hazards
```

### core-diagnostics-kit

Owns validation and runtime evidence.

```txt
telemetry
runtime snapshots
replay fixtures
determinism guards
promotion evidence
performance counters
kit health reports
```

---

## Public API expectation

Each core capability domain should eventually expose an umbrella factory.

```txt
createCoreDataKit()
createCoreInputKit()
createCoreGraphicsKit()
createCoreInteractionKit()
createCoreSimulationKit()
createCoreDiagnosticsKit()
```

Each umbrella factory may compose smaller internal kits.

The umbrella API should stay small, but the domain should remain configurable.

---

## Testing expectation

Each core capability domain should prove:

```txt
[ ] default config works
[ ] custom data config works
[ ] policy override works where applicable
[ ] adapter override works where applicable
[ ] snapshot/reset behavior works
[ ] events are deterministic
[ ] state is serializable
[ ] headless execution works
[ ] no hidden DOM/WebGL/browser dependency leaks into the core domain
```

---

## Final rule

Core capability domains provide trusted defaults.

ProtoKits compose and override them.

Experiments prove the composition.

```txt
Core capability domains are the stable bubbles.
ProtoKits build bigger bubbles from them.
Experiments show the bubbles working together.
```
