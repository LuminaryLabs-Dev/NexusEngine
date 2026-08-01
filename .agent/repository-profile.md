# Repository Profile

## Identity

- Repository: `LuminaryLabs-Dev/NexusEngine`
- Package: `nexusengine`
- Package metadata version: `0.0.4`
- Runtime: ESM, Node.js 18 or later
- Default branch: `main`
- Visibility: public
- Purpose: deterministic Core runtime and composition substrate for games and
  simulations

## Owned Capabilities

NexusEngine owns ECS state, deterministic scheduler phases, events, resources,
queries, lifecycle surfaces, runtime-kit and Domain Service Kit contracts,
Core domain composition, snapshots, reset, replay, validation, generic hosts,
and the Core Headless Editor control plane.

Reusable optional, niche, genre, or platform behavior belongs in
NexusEngine-Kits or another trusted registry. Complete applications, authored
content, presets, UI, and product tuning belong in their own repositories.

## Architecture

```text
createEngine()
  -> world and deterministic scheduler
  -> default Realtime and Sequence Core Kits
  -> configured runtime and Domain Service Kits
  -> addressable APIs under engine.n
  -> host, renderer, surfaces, snapshots, and validation
```

`src/core-domains/` is the preferred domain-owned structure. Migrated Domains
keep their contracts, state, Kits, providers, adapters, and tests together.
`src/core-kits/` remains transitional for capabilities not yet migrated.

Core MCP is included but inactive by default. The consuming application must
install the Domain, register its own provider, and connect a transport.

## Public Interfaces

- Root and subpath package exports declared in `package.json`
- `createEngine()`, ECS primitives, surfaces, sequence runtimes, and Kit
  contracts
- Domain factories and domain-owned subpaths
- `nexus-editor` CLI for target-driven repository development
- Machine-readable DSK and Kit ownership manifests under `docs/`

Consumers should use declared package entrypoints and must not import private
source paths.

## Repository Workflow

1. Read `AGENTS.md`, `.agent/target.md`, and `.agent/tracker.md`.
2. Resume the active Core Headless Editor run.
3. Find the owning Domain and existing Kit.
4. Reuse and compose before creating a boundary.
5. Validate direct and installed paths.
6. Reconcile exports, manifests, docs, fixtures, and evidence.

Do not overwrite `.agent/target.md` or `.agent/tracker.md` as part of generic
repository documentation. They belong to the active controller workflow.

## Validation Surface

```bash
npm test
npm run test:release
npm run ownership:generate
npm run release:manifest
npm run docs:check
npm run boundaries:check
```

The ownership and release commands generate tracked contract files. Review the
worktree after running them.

## Verified Documentation Review State

At the 2026-08-01 review baseline:

- the exact remote `main` source was clean in an isolated worktree
- the Core smoke and release-candidate suites passed
- ownership, release-manifest, active-doc, and boundary checks passed without
  tracked source changes
- the package had no verified npm publication, Git tag, or GitHub release
- `package.json` declared MIT but no license file existed
- GitHub private vulnerability reporting was disabled

These are review-time observations, not permanent release or support promises.
Reverify volatile repository and publication state before relying on them.
