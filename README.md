# NexusEngine

NexusEngine is the reusable Core runtime and isolated build system for
deterministic games and simulations. Runtime Core contains only atomic,
idempotent, product-neutral behavior.

## Ownership

```txt
NexusEngine
  universal contracts, atomic Core behavior, and build-time n:build tooling

@luminarylabs/nexusengine-kits
  reusable optional, niche, genre, provider, and runtime-platform behavior

Experiments and game repositories
  complete games, recipes, presets, authored content, and product behavior
```

Unknown or unproven behavior stays outside Core. Tests may use niche synthetic
fixtures only to prove generic Core invariants.

## Start Here

1. Read the [NexusEngine Guide](docs/NexusEngine-Guide.md), or use the generated
   [PDF](docs/NexusEngine-Guide.pdf).
2. Use the [documentation router](docs/README.md) for contracts and migrations.
3. Read [Kit Ownership](docs/KIT-OWNERSHIP.md) before changing production code.
4. Follow [AGENTS.md](AGENTS.md) and the active `.agent/target.md` for repository
   work.

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

Optional behavior is installed from an approved external registry package.
Complete games consume Core and optional Kits; neither package exports games.

## Build

`n:build` is an isolated build-time Domain. It may own concrete target and
toolchain implementations, but it is never installed into an application
runtime graph. Projects remain read-only; staging, caches, receipts, and
default artifacts live under `~/.nexusengine`.

```bash
nexusengine plan ./my-project --target web-live --target web-static
nexusengine build ./my-project --target web-static --approve-plan <plan-hash>
```

Repeated `--target` flags form one sorted target set. Native targets retrieve
exact verified upstream dependencies only when selected and fail closed when a
required toolchain, license, runtime, or hardware proof is unavailable.

## Semantic Core

Every Core implementation belongs to one manifest under:

```txt
src/core-domains/<semantic-domain>/
├── domain.manifest.js
├── README.md
├── contracts/
├── state/
├── kits/
├── subdomains/
├── providers/
└── adapters/
```

The generated catalog, package exports, ownership ledger, API reference, guide
indexes, and MCP records all derive from those manifests. There is no
transitional Core Kit catalog or filesystem discovery.

## Composition And MCP

Core Composition can inspect Domains and atoms and produce deterministic plans:

```js
import { createEngine } from "nexusengine";
import { createCompositionDomain } from "nexusengine/domains/composition";

const engine = createEngine({ kits: createCompositionDomain() });
const result = engine.n.composition.planning.validate({
  kits: ["object-placement-kit"]
});
```

MCP is opt-in. A host must install `nexusengine/domains/mcp`, register the
Composition provider, resolve immutable trusted sources, provide transactional
snapshot/restore behavior, and require explicit approval for
`composition_apply`. MCP disconnect does not stop an applied runtime.

## Breaking Cutover

`0.0.4` removes old root symbols, `n:core-*` identifiers, Core Kit subpaths,
concrete hosts/renderers/providers, and game behavior. No forwarding exports
remain. Use the [0.0.4 migration guide](docs/migrations/0.0.4-domain-cutover.md)
and [Build Domain migration](docs/migrations/0.0.4-build-domain.md).

## Validation

```bash
npm run core:check
npm run ownership:generate
npm run protokits:check
npm run docs:check
npm test
npm run test:release
```
