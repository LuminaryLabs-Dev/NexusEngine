# NexusEngine

![NexusEngine runtime composition](docs/assets/brand/social-card.png)

NexusEngine is the deterministic Core runtime for composing games and
simulations from reusable Domain Service Kits. It provides ECS state,
scheduler phases, events, resources, queries, surfaces, composition,
snapshots, reset, replay, validation, and agent-readable Core domains.

## Start Here

1. Read the [documentation router](docs/README.md).
2. Read [Kit Ownership](docs/KIT-OWNERSHIP.md) before changing production
   behavior.
3. Read [Current Architecture](docs/CURRENT-ARCHITECTURE.md) for the live
   runtime shape.
4. Follow [AGENTS.md](AGENTS.md), `.agent/target.md`, and `.agent/tracker.md`
   for repository work.

## Quick Start

```js
import { createEngine } from "nexusengine";

const engine = createEngine();
engine.tick(1 / 60);
```

`createEngine()` creates the world, deterministic scheduler, clock, surfaces,
sequence runtimes, and default Realtime and Sequence Core Kits. Additional
trusted Kits can be installed during construction:

```js
import { createEngine, defineRuntimeKit } from "nexusengine";

const telemetryKit = defineRuntimeKit({
  id: "example-telemetry-kit",
  install({ engine }) {
    engine.exampleTelemetryReady = true;
  }
});

const engine = createEngine({ kits: [telemetryKit] });
```

## Ownership Boundary

```text
NexusEngine
  atomic, idempotent, fully reusable Core behavior

NexusEngine-Kits or another trusted registry
  reusable optional, niche, genre, or platform behavior

Experiment and game repositories
  complete games, presets, authored content, and product behavior
```

Core behavior must have one clear responsibility, remain product-neutral, be
safe to install or apply repeatedly, and have focused proof for its direct and
composed paths. Unknown or unproven ownership stays outside Core.

## Domain-Owned Core

- `defineRuntimeKit()` defines the low-level installation contract.
- `defineDomainServiceKit()` adds stable domain identity and addressability.
- `createGameKitComposer()` performs additive, dependency-ordered composition.
- `src/core-domains/` owns migrated domain contracts, state, Kits, providers,
  adapters, and tests.
- `src/core-kits/` is the transitional home of unmigrated Core capabilities.

Core MCP is opt-in. Installing NexusEngine does not expose MCP capabilities. An
application must install the Core MCP Domain, register an application-owned
provider, and connect an explicit transport.

```js
import { createEngine } from "nexusengine";
import {
  createCoreMcpDomain,
  defineMcpProvider
} from "nexusengine/core-domains/core-mcp-domain";

const engine = createEngine({ kits: createCoreMcpDomain() });

engine.n.coreMcp.registerProvider(defineMcpProvider({
  id: "example-application",
  tools: []
}));
```

## Public API

The package root and documented subpaths expose Core runtime contracts and
domain-owned capabilities. Removed Composition and Object aliases have no
forwarding exports. See the
[0.0.4 Domain Cutover](docs/migrations/0.0.4-domain-cutover.md) for replacements
and [`KIT-OWNERSHIP.json`](docs/KIT-OWNERSHIP.json) for the machine-readable
ownership ledger.

The `nexus-editor` CLI provides the repository's target-driven Headless Editor
workflow.

## Validation

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run test:release
npm run ownership:generate
npm run release:manifest
npm run docs:check
npm run boundaries:check
```

See [Operations](docs/OPERATIONS.md) for the purpose and expected evidence of
each command.

## Project Status

- Package metadata version: `0.0.4`
- Runtime: ESM on Node.js 18 or later
- API status: stable candidate
- MCP SDK: optional peer dependency, loaded only by an explicit Node transport
- Publication: no npm publication, Git tag, or GitHub release was verified for
  `0.0.4` during this documentation review
- License metadata: `package.json` declares MIT, but this repository does not
  currently contain a license file

See [CHANGELOG.md](CHANGELOG.md), [RELEASE_0.0.4.md](RELEASE_0.0.4.md), and
[Security](SECURITY.md) for current documented boundaries.
