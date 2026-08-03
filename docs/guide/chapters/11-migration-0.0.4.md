# Migrating To 0.0.4

`0.0.4` is a hard semantic cutover. Old paths and root symbols are removed in the same change as their replacements. There are no runtime forwarding exports.

## Import Strategy

Keep root imports for bootstrap and runtime contracts. Import Domain factories and atoms from generated semantic subpaths.

```js
import { createEngine } from "nexusengine";
import { createMotionKit } from "nexusengine/domains/simulation/motion";
import { createPhysicsKit } from "nexusengine/domains/simulation/physics";
```

Do not use `n:core-*`, `nexusengine/core-kits/*`, or private source paths.

## Runtime Paths

Use semantic paths such as `n:object`, `n:runtime:transaction`, and `n:presentation:graphics`. Immediate parent relationships are validated by manifests.

## Removed Implementations

Concrete hosts, renderers, shaders, platform storage, model mocks, speech
engines, authored sky presets, genre rules, and complete games moved outside
Core or became caller-owned data. Universal behavior from 26 removed modules is
restored through 27 corrected semantic atoms. The Restored Behavior Migration
appendix lists every old export, configuration change, snapshot change, event
change, optional adapter, and proof.

## Physics Name Collision

The historical `createPhysicsKit` from `src/world-physics-kit.js` and the
current provider-neutral `createPhysicsKit` do not provide the same behavior.
Migrate the historical behavior to `createWorldContactKit` plus
`createSoftRespawnKit`. Use the current factory only for Physics contracts and
providers. There is no alias or legacy snapshot coercion between them.

## Consumer Migration Order

1. Replace old imports with generated semantic package subpaths.
2. Replace old runtime paths with semantic paths.
3. Install explicit atoms that were formerly implicit defaults.
4. Move platform implementations into the host or an external Kit.
5. Replace compatibility aliases with the owning Domain API.
6. Run from a packed Engine artifact in a clean directory.

Consumer changes are intentionally separate from the Engine-local restoration
wave. A migration row marked `outside-restoration-wave` does not mean the Core
replacement is missing; it means the consumer has not yet been changed.

## Changelog Contract

The changelog and migration map explain replacements. They are not compatibility code. A removed symbol stays removed.
