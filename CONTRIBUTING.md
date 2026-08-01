# Contributing to NexusEngine

NexusEngine accepts atomic, idempotent, product-neutral Core behavior. Read
[Kit Ownership](docs/KIT-OWNERSHIP.md) before proposing production changes.

## Prerequisites

- Node.js 18 or later
- npm with lockfile support
- A branch or worktree that preserves unrelated work

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
```

## Choose the Owner First

A capability belongs in NexusEngine Core only when evidence shows that it:

- has one atomic responsibility
- can be installed, reset, and reapplied without duplicate effects
- has no product, genre, or platform assumption
- is deterministic and serializable when it owns state
- has focused proof for direct and composed paths
- has an intentional public contract

Reusable optional behavior belongs in NexusEngine-Kits or another trusted
registry. Complete games, authored content, presets, UI, and product tuning
belong in their application repositories. Unknown ownership fails closed.

The ProtoKit workflow is historical and is not an active implementation path.

## Development Workflow

1. Read [AGENTS.md](AGENTS.md), `.agent/target.md`, and `.agent/tracker.md`.
2. Resume or create the bounded Core Headless Editor run required by
   `AGENTS.md`.
3. Find the owning domain and nearest existing Kit before creating a boundary.
4. Inspect the installed composition path, not only direct helpers.
5. Keep stateful behavior deterministic, resettable, snapshot-capable, and
   replayable where its contract requires those properties.
6. Reconcile public exports, manifests, examples, documentation, and fixtures.
7. Run every validation selected by the guided run and inspect its evidence.
8. Submit the bounded change for review with its owner, checks, evidence, and
   remaining risk stated explicitly.

Do not claim completion from source review alone. Do not push, release, deploy,
or destructively clean repository state without the required authorization.

## Validation

Start with the smallest focused proof, then run the broader checks affected by
the change:

```bash
npm test
npm run test:release
npm run ownership:generate
npm run release:manifest
npm run docs:check
npm run boundaries:check
```

Generated ownership and release manifests must remain aligned with source. If
a generator changes a tracked file, review that change as part of the same
contract update.

## Tests and Fixtures

Prefer headless tests, installed-composition fixtures, deterministic snapshots,
reset and replay checks, and public-export checks. A niche scenario may appear
in tests only as minimal, unexported data proving a named generic invariant.
Production source must not import or register test fixtures.

## Handoff

A contribution handoff should state:

- owning domain and Kit
- files and public contracts changed
- validation commands and evidence produced
- observed before/after differences
- remaining risk, blocker, or unsupported surface

The repository does not currently document contributor response times or a
maintainer review schedule.
