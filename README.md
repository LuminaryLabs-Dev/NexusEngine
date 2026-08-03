# NexusEngine

![NexusEngine runtime composition](docs/assets/brand/social-card.png)

NexusEngine is the reusable deterministic Core runtime and isolated build system
for games and simulations. Runtime Core contains only atomic, idempotent,
product-neutral behavior; `n:build` owns build-time compilers, toolchains,
targets, artifacts, and proof without entering the application runtime graph.

## Start Here

1. Read the [NexusEngine Guide](docs/NexusEngine-Guide.md), or use the generated
   [PDF](docs/NexusEngine-Guide.pdf).
2. Use the [documentation router](docs/README.md) for contracts and migrations.
3. Read [Kit Ownership](docs/KIT-OWNERSHIP.md) before changing production code.
4. Read [Current Architecture](docs/CURRENT-ARCHITECTURE.md) and
   [Operations](docs/OPERATIONS.md) before release work.
5. Follow [AGENTS.md](AGENTS.md), `.agent/target.md`, and `.agent/tracker.md` for
   repository work.

## Ownership

```text
NexusEngine
  universal contracts, atomic Core behavior, and build-time n:build tooling

NexusEngine-Kits or another trusted registry
  reusable optional, niche, genre, provider, and runtime-platform behavior

Experiment and game repositories
  complete games, recipes, presets, authored content, UI, and product behavior
```

Unknown or unproven behavior stays outside Core. Tests may use minimal niche
fixtures only to prove named generic Core invariants.

## Runtime

`createEngine()` installs only the manifest-backed Runtime Lifecycle, Realtime,
and Sequence atoms by default.

```js
import { createEngine } from "nexusengine";

const engine = createEngine();
engine.tick(1 / 60);
```

Install additional Core behavior from semantic package subpaths:

```js
import { createEngine } from "nexusengine";
import { createObjectDomain } from "nexusengine/domains/object";

const engine = createEngine({ kits: createObjectDomain() });
engine.n.object.register({
  id: "crate",
  objectType: "prop",
  bounds: { min: [-1, 0, -1], max: [1, 2, 1] }
});
```

Universal behavior is installed explicitly from Core semantic subpaths.
Optional niche, genre, provider, and platform behavior comes from an approved
external registry package. Complete games consume Core and optional Kits;
neither package exports games.

## Build

Projects remain read-only. Build staging, caches, toolchains, receipts, and
default artifacts live under `~/.nexusengine`.

```bash
nexusengine inspect ./my-project
nexusengine plan ./my-project --target web-live --target web-static
nexusengine build ./my-project --target web-static --approve-plan <plan-hash>
```

Repeated `--target` flags form one sorted target set. Dependencies are retrieved
from exact verified upstream records only when selected. Native package proof
requires the real selected toolchain and target validator; runtime and headset
execution are reported separately.

## Semantic Core

Every Core implementation belongs to one manifest under
`src/core-domains/<semantic-domain>/`. The generated catalog, package exports,
ownership ledger, API reference, guide indexes, and MCP records derive from
those manifests. There is no transitional Core Kit source tree or hardcoded
Core catalog.

## Restored Core Behaviors

`0.0.4` restores the reusable semantics from 26 removed source modules as 27
manifest-owned atoms. The historical World Physics module is intentionally
split into World Contact and Soft Respawn. Navigation, terrain, water, spatial
scale, motion, economy, operations, requests, hazards, progression, and the
other restored behaviors are available only through generated semantic
subpaths; none return as root exports.

Nine optional adapter Kits connect otherwise independent atoms, and six
composition recipes describe useful combinations without creating hidden state
owners. See the [restored behavior migration](docs/migrations/0.0.4-restored-behaviors.md)
for exact old exports, corrected defects, new imports, adapters, and proof.

## Composition And MCP

Core Composition inspects Domains and atoms and produces deterministic plans:

```js
import { createEngine } from "nexusengine";
import { createCompositionDomain } from "nexusengine/domains/composition";

const engine = createEngine({ kits: createCompositionDomain() });
const result = engine.n.composition.planning.validate({
  kits: ["object-placement-kit"]
});
```

MCP is opt-in. A host installs `nexusengine/domains/mcp`, registers approved
providers, resolves immutable trusted sources, supplies transactional
snapshot/restore behavior, and requires exact-plan approval for mutation. An
applied runtime continues when MCP disconnects.

## Breaking Cutover

`0.0.4` removes old root symbols, `n:core-*` identifiers, Core Kit subpaths,
concrete runtime hosts/providers, authored game behavior, and forwarding
exports. Reusable historical primitives return only as corrected semantic
atoms. Use the [Domain migration](docs/migrations/0.0.4-domain-cutover.md),
[restored behavior migration](docs/migrations/0.0.4-restored-behaviors.md), and
[Build migration](docs/migrations/0.0.4-build-domain.md).

## Validation

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run core:check
npm run core:contracts
npm run ownership:generate
npm run protokits:check
npm run migrations:check
npm run release:manifest
npm test
npm run test:release
npm run boundaries:check
npm run docs:check
npm pack --dry-run --json
```

See [Operations](docs/OPERATIONS.md) for expected evidence.

## Project Status

- Package metadata version: `0.0.4`
- Runtime: ESM on Node.js 18 or later
- API status: release candidate under active proof
- License: MIT
- Publication: no npm publication, Git tag, GitHub Release, deployment, or
  immutable `0.0.4` branch is implied by local validation

See [CHANGELOG.md](CHANGELOG.md), [RELEASE_0.0.4.md](RELEASE_0.0.4.md), and
[Security](SECURITY.md) for current boundaries.
