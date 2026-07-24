# NexusEngine

NexusEngine is the reusable Core runtime for deterministic games and
simulations.

## Ownership Rule

```txt
NexusEngine
  atomic, idempotent, fully reusable Core behavior

@luminarylabs/nexusengine-kits
  reusable optional, niche, genre, or platform behavior

Experiment and game repositories
  complete games, presets, authored content, and product behavior

NexusEngine tests
  isolated scenarios that prove generic Core invariants
```

Core is a contract, not a catalog of every useful feature. A production module
remains here only when it is:

- atomic, with one clear responsibility
- safe to install or apply repeatedly
- reusable without product, genre, or platform assumptions
- independently testable
- part of an intentional public Core contract

Unknown or unproven ownership fails closed: move it out of Core until evidence
supports promotion.

## Start Here

1. Read [Documentation](docs/README.md).
2. Read [Kit Ownership](docs/KIT-OWNERSHIP.md) before changing production code.
3. Read [Current Architecture](docs/CURRENT-ARCHITECTURE.md) for runtime shape.
4. Follow [AGENTS.md](AGENTS.md) and the active `.agent/target.md` for repository
   work.

## Runtime

The public package provides deterministic ECS state, scheduler phases, events,
resources, queries, surfaces, runtime-kit and domain-service-kit contracts,
Core domains, composition, snapshots, reset, replay, and validation.

```js
import { createEngine } from "nexusengine";

const engine = createEngine({ kits: [] });
engine.tick(1 / 60);
```

Optional behavior is installed from a trusted registry package:

```js
import { createFishingKit } from "@luminarylabs/nexusengine-kits/fishing-kit";
import { createEngine } from "nexusengine";

const engine = createEngine({ kits: [createFishingKit()] });
```

Complete games consume Core and optional kits. They are not exported by either
package.

## Public API

The root export intentionally excludes optional and game-specific symbols.
Removed APIs have no compatibility forwarding exports. See the
[0.0.3 non-Core migration guide](docs/migrations/0.0.3-non-core-apis.md).

The machine-readable ownership ledger is
[`docs/KIT-OWNERSHIP.json`](docs/KIT-OWNERSHIP.json).

## Validation

```bash
npm test
npm run ownership:generate
npm run docs:check
```

Tests may use niche names or data only when they are isolated, synthetic,
unexported fixtures proving a generic Core invariant.
