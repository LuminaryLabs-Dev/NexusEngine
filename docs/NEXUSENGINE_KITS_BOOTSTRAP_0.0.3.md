# NexusEngine-Kits Bootstrap 0.0.3

## Status

No accessible `LuminaryLabs-Dev/NexusEngine-Kits` or `LuminaryLabs-Agents/NexusEngine-Kits` repository was found during this implementation pass.

## Required repository

```txt
NexusEngine-Kits
package: @luminarylabs/nexusengine-kits
version: 0.0.3
runtime peer: nexusengine ^0.0.3
```

## Initial structure

```txt
package.json
README.md
AGENTS.md
KITS.md
PROMOTION_LEDGER.md
src/index.js
src/inventory-management-kit/index.js
src/quest-progression-kit/index.js
src/combat-resolution-kit/index.js
src/movement-control-kit/index.js
src/interaction-domain-kit/index.js
src/save-snapshot-kit/index.js
src/dialogue-orchestration-kit/index.js
src/render-descriptor-domain-kit/index.js
tests/release-0.0.3-stable-kits-smoke.mjs
docs/KIT_STATUS_0.0.3.md
docs/MIGRATION_FROM_PROTOKITS.md
```

## Bootstrap rule

Stable kits must live outside the core runtime substrate and outside the ProtoKits incubation repo. The stable kit package should accept only generic, tested, DSK-shaped domain kits with README, manifest, headless tests, and snapshot/reset policy where stateful.
