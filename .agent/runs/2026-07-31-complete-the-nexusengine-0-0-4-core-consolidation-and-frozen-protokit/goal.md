# Development Target

## Goal

Complete the NexusEngine `0.0.4` Core consolidation and frozen ProtoKit
extraction: one explicit semantic domain catalog, no transitional
`src/core-kits/` architecture, and one evidence-backed disposition for every
historical ProtoKit export.

## Mode

Implementation

## Source Baseline

- NexusEngine source: `origin/main` at
  `a9adca5b3620f996f00860358c4864dd4bdfa6d9`.
- Frozen ProtoKit evidence: `origin/main` at
  `0d1026496f5fa436fc19c6b8e90563e12804c4b7`.
- Treat existing Engine, Kits, Experiments, and KitUniverse worktrees as
  independent work; do not stash, reset, discard, or absorb them.

## Scope

- Build manifest v2, strict validation, and manifest-only generated catalogs.
- Freeze, inventory, and disposition every exported ProtoKit surface.
- Migrate all retained Core behavior into semantic Domain-owned folders.
- Remove transitional paths, hardcoded catalogs, aliases, and old identifiers.
- Complete registry, MCP, guide, PDF, consumer, and release-gate proof.

## Required outcome

- ProtoKit export disposition coverage is exactly 100 percent.
- Every universal atom is implemented and evidence-backed.
- Every public Core module has exactly one manifest owner.
- No transitional Core Kit folder, old identifier, old import, or forwarding export remains.
- Engine, Kits, Editor, Simulator, clean-install, MCP, registry, docs, PDF, Playwright, and Human View gates pass.
- No external publication or mutation occurs without its separate human approval.

## Constraints

- Do not modify the frozen ProtoKit worktree.
- Do not touch or absorb unrelated dirty worktrees.
- Do not stash, reset, discard, force, or delete preservation assets.
- Do not push, release, archive, mutate Google Drive, or create a numeric release branch.
- Unknown or unproven behavior fails closed outside Core.
- Do not add compatibility forwarding exports.

## Required Architecture

- Core production behavior is atomic, idempotent, deterministic where
  required, fully reusable, and product-neutral.
- Every public implementation is owned by exactly one semantic Domain manifest.
- Domain identifiers and public subpaths are semantic and contain no
  `n:core-*` or `nexusengine/core-kits/*` compatibility surfaces.
- The package root exposes only bootstrap/runtime contracts, DSK definition,
  composition entrypoints, and registry loading.
- Host, renderer, SDK, storage, transport, authored preset, complete game, and
  product implementations remain outside Core.
- Unknown or unproven production behavior fails closed outside Core.

## Required Extraction

- Inventory every folder and exported surface in the frozen ProtoKit source.
- Assign exactly one disposition to every source export:
  `core-reuse`, `core-composition`, `core-new-atom`, `external-kit`,
  `recipe-data`, `game-owned`, `duplicate`, or `rejected-unproven`.
- Record source lineage, behavior, lifecycle/state, semantic fingerprint,
  duplicate group, owner, required Core atoms, reconstruction recipe, and proof.
- Implement and prove every universal atom marked `core-new-atom` before
  declaring `0.0.4` ready.
- Do not modify or archive ProtoKits during this run; archival requires separate
  approval after 100 percent disposition coverage.

## Required Contracts

- Introduce Domain manifest v2 with explicit ownership, forbidden
  responsibilities, state, input/system/output/lifecycle contracts,
  dependencies, kits, providers, adapters, settings, and proof references.
- Generate the Core catalog, package exports, ownership ledger, API reference,
  and guide indexes exclusively from manifests in separate generate/check modes.
- Fail generation when evidence is missing; never infer compliance booleans.
- Use SHA-256 for integrity/security decisions.
- Registry metadata must be non-executable and reference exact package,
  version/subpath/export, immutable commit, integrity, environment,
  requirements, status, and settings schema.
- Composition application requires explicit human approval, is transactional
  and idempotent, and never installs missing packages at runtime.

## Migration Waves

1. Manifest/generator foundation and frozen extraction ledger.
2. Runtime and policy.
3. Composition and MCP.
4. Spatial, Object, World, Scene, Weather, and Asset.
5. Simulation, Physics, Motion, Compute, and model contracts.
6. Actor, Creature, Character, Player, Agent, Input, and Interaction.
7. Renderer-neutral Presentation capabilities.
8. Network, Diagnostics, and contract-only Host.
9. Missing universal atoms and final structural cutover.

Each wave must move source, update imports/exports/manifests/docs/tests, prove
parity and lifecycle behavior, and remove the replaced old path in the same
green change. Do not add forwarding aliases.

## Documentation And Consumer Outcome

- Repository Markdown is the canonical modular `NexusEngine-Guide` source.
- Generate `docs/NexusEngine-Guide.pdf` and validate nonblank, unclipped pages.
- A Google Doc may be used only as a review mirror after separate mutation
  approval; never reverse-import the whole document.
- MCP exposes paginated domain, atom, recipe, registry, validation, planning,
  and approval-required apply surfaces plus chapter/record resources.
- Engine, Kits, Editor, and Simulator consume committed exact package sources,
  not local symlink assumptions.

## Completion Criteria

- Frozen ProtoKit export disposition coverage is exactly 100 percent.
- Every required universal atom is implemented, manifested, documented, and
  proven by two semantically distinct consumers or an approved synthetic proof.
- Every current Core module has explicit evidence-backed ownership.
- `src/core-kits/`, hardcoded legacy catalogs, old imports, old identifiers,
  and forwarding exports are absent.
- Catalog, exports, ownership ledger, guide, PDF, and MCP expose one registry
  hash and generated-file checks are clean.
- Engine, Kits, Editor, Simulator, clean-install, composition, registry
  security, documentation, PDF, Playwright, and Human View gates pass from
  committed sources.
- No push, archive action, Google Drive mutation, release, or numeric branch
  creation occurs without the corresponding separate human approval.
