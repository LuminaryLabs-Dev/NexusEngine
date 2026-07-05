# ProtoKit Boundaries

This document defines the hard repo boundaries for the ProtoKit-first experiment loop.

## Core Boundary

```txt
NexusEngine = read-only runtime dependency
NexusEngine-ProtoKits = reusable domain logic
NexusEngine-Experiments = playable/browser proof
```

## NexusEngine Is Read-Only In This Loop

Do not edit NexusEngine when the goal is to build a game, experiment, or reusable gameplay/domain kit.

Read from NexusEngine:

```txt
docs/how-to-protokit.md
docs/how-to-experiment.md
docs/described_examples.md
docs/domain_ideas.md
docs/kits_ideas.md
state/automation/
src/domain-service-kit.js
src/runtime-kit.js
src/game-kit-composer.js
```

Do not edit in this loop:

```txt
NexusEngine/src/
NexusEngine/tests/
NexusEngine/package.json
NexusEngine/README.md
NexusEngine/memory.md
```

## ProtoKits Own Reusable Behavior

Put reusable domain behavior here:

```txt
/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits/
```

ProtoKits may own:

```txt
domain state
resources
events
systems
service APIs
engine.n.* bridges
snapshot/reset behavior
headless tests
DSM docs/catalog entries
package export entries
```

ProtoKits must not own:

```txt
browser DOM listeners
Canvas/WebGL/Three scene mutation
game-specific story copy
one-off level scripts
product-specific UI
authored art direction
requestAnimationFrame loops
```

## Experiments Own Proof

Put playable proof here:

```txt
/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/
```

Experiments may own:

```txt
browser route
index.html
import maps
input mapping
renderer wiring
UI/HUD
authored content
scene presets
game-specific copy
static smoke tests
```

Experiments must not permanently own:

```txt
reusable domain algorithms
generic service contracts
kit resources/events/systems
renderer-independent simulation logic
DSK token families
```

If an Experiment starts owning reusable architecture, extract that behavior to ProtoKits.

## Routing Rule

```txt
new reusable behavior -> NexusEngine-ProtoKits
new playable scene -> NexusEngine-Experiments
new target composition idea -> NexusEngine docs
NexusEngine core -> no edits in this loop
```

