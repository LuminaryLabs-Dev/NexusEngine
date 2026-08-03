# NexusEngine Guide

Core architecture, composition, integration, and migration reference

Version: `0.0.4`<br>
Core registry SHA-256: `c8cfad63537117f9464ebbb502fed5daa1034c8226da1e9c0fce4513ab8104a2`<br>
Guide content SHA-256: `cd8b03ea3bf3f1921233a1161cca5bee269e425cd1fa16139bbbc02be532711d`

This combined file is generated from `docs/guide/book.json` and modular Markdown chapters. Edit the chapter sources, not this file.

## Contents

1. [Start Here](#start-here)
2. [The NexusEngine Mental Model](#mental-model)
3. [Build A First Runtime](#first-runtime)
4. [Domains And Atomic Kits](#domains-atoms)
5. [State, Lifecycle, And Idempotence](#lifecycle)
6. [Composition And Recipes](#composition)
7. [MCP Agent Workflow](#mcp)
8. [Registries And Security](#registry-security)
9. [Hosts, Providers, And Adapters](#integration-boundaries)
10. [Build Projects And Targets](#build-domain)
11. [Testing And Proof](#testing)
12. [Migrating To 0.0.4](#migration)
13. [ProtoKit Extraction](#protokit-extraction)
14. [Release And Operating Model](#release-operation)
15. [Generated Domain Index](#domain-index)
16. [Generated Dependency Table](#dependency-table)
17. [Generated Atomic API Reference](#api-reference)
18. [Generated Ownership Ledger](#ownership-ledger)
19. [Generated Root Migration Map](#root-migration-map)
20. [Generated ProtoKit Extraction Summary](#extraction-summary)

---

<a id="start-here"></a>

# Start Here

NexusEngine is the reusable Core beneath games, simulations, editors, and agents. It supplies deterministic runtime primitives and universal semantic capabilities. It does not supply every useful feature.

The shortest correct rule is:

```txt
NexusEngine                  universal Core behavior
NexusEngine-Kits             reusable optional behavior
Experiments and games        authored product behavior
Hosts and adapters           platform and vendor implementations
```

## Who This Guide Is For

- Application developers who need to assemble a runtime.
- Kit authors who need to choose an owner and dependency contract.
- Host authors who connect browsers, renderers, storage, networks, or SDKs.
- Agents that inspect and plan compositions through MCP.
- Maintainers migrating code to the `0.0.4` semantic Domain model.

## Reading Paths

**Build something:** read First Runtime, Domains And Atomic Kits, then Composition And Recipes.

**Integrate a platform:** read Registries And Security, then Hosts, Providers, And Adapters.

**Use an agent:** read Composition And Recipes, then MCP Agent Workflow.

**Maintain Core:** read State, Lifecycle, And Idempotence, Testing And Proof, and Migrating To 0.0.4.

## The Non-Negotiable Boundary

A Core atom has one responsibility, is product-neutral, installs idempotently, owns explicit state, supports snapshot and reset, isolates nondeterminism, and has direct proof. If any requirement is unknown, the behavior remains outside Core until proved.

This fail-closed rule keeps Core small enough to understand and flexible enough to compose.

## Sources Of Truth

1. Domain manifest v2 records and the source they reference.
2. Generated catalog, package exports, ownership ledger, and registry hash.
3. This modular guide.
4. Migration and extraction ledgers.

Historical plans, generated run packets, and the retired ProtoKit repository are evidence. They do not override the active manifest catalog.

---

<a id="mental-model"></a>

# The NexusEngine Mental Model

NexusEngine separates meaning from implementation. A Domain names a semantic owner. An atomic Kit installs one capability. A provider performs work behind a contract. An adapter translates between boundaries. A recipe selects and configures atoms without becoming a new runtime owner.

## The Vocabulary

| Term | Meaning | Example |
| --- | --- | --- |
| Engine | Runtime container for state, systems, events, resources, and installed Kits | `createEngine()` |
| Domain | Semantic ownership boundary | `n:object`, `n:simulation:motion` |
| Atomic Kit | One installable, idempotent responsibility | Object registry or placement |
| Provider | Replaceable implementation of a Domain contract | Physics backend or speech synthesis |
| Adapter | Translation across two public contracts | Motion plan to physics drive request |
| Recipe | Data selecting Domains, Kits, and settings | Object plus Placement composition |
| Registry | Non-executable metadata describing exact sources | Package, version, commit, integrity |
| Host | Application-owned lifecycle and platform boundary | Editor, browser application, server |

## State Has One Owner

Every durable concept has one state owner. Other Domains refer to that state through descriptors, identifiers, commands, events, or public APIs. They do not keep shadow copies that can drift.

For example, Object owns object identity and intrinsic geometry meaning. Placement owns where an object is placed. A renderer may project both into a scene, but renderer objects are not Core state.

## Composition Is Additive

Atoms declare `requires` and `provides` tokens. Composition resolves those edges into an ordered plan. Local idempotence makes repeated installation safe; the composition receipt makes the complete accepted plan exactly-once across process restarts.

## Core Does Not Mean Default

A capability may be universal and still opt-in. Core means the behavior satisfies the ownership contract. It does not mean every engine instance installs it automatically.

## Data Is Not A Runtime Owner

Authored presets, balance values, levels, quests, materials, and complete game loops remain recipe or product data. Core can define the schema and deterministic evaluator while the product owns the authored values.

---

<a id="first-runtime"></a>

# Build A First Runtime

Install the package, import only the semantic surfaces you need, construct the Engine, then advance it with explicit time.

## Minimal Engine

The runnable source for this example is `examples/guide/basic-engine.mjs`.

```js
import { createEngine } from "nexusengine";

const engine = createEngine({ kits: [] });
engine.tick(1 / 60);
console.log(engine.clock.frame);
```

The root API is intentionally small. Domain factories and atoms are imported from generated semantic subpaths.

## Add Object And Placement

The runnable source is `examples/guide/object-placement.mjs`.

```js
import { createEngine } from "nexusengine";
import { createObjectRegistryKit } from "nexusengine/domains/object/registry";
import { createObjectPlacementKit } from "nexusengine/domains/object/placement";

const engine = createEngine({
  kits: [createObjectRegistryKit(), createObjectPlacementKit()]
});
```

Placement requires the Object descriptor contract. Composition can resolve that provider automatically; direct construction requires you to install both.

## Inspect Installed Surfaces

Domain Service Kits register semantic paths and named APIs. Use the engine's addressability APIs instead of reaching into private state.

```js
engine.n.path("n:object");
engine.n.path("n:object:placement");
engine.n.ownerOf("n:object");
engine.n.paths();
engine.n.apis();
```

## Keep Time Explicit

Pass elapsed time into `tick`. Do not read wall-clock time inside deterministic Core systems. A host may sample a clock, but it converts that sample into explicit runtime input before Core processes it.

## Save And Restore

Each stateful atom exposes its manifest-declared snapshot and reset behavior. Applications should persist the complete host composition receipt beside application state so the accepted runtime can be reconstructed after restart.

---

<a id="domains-atoms"></a>

# Domains And Atomic Kits

The semantic path tells you where a responsibility belongs. The manifest tells tools and humans what that owner may and may not do.

## Domain Manifest V2

Every top-level semantic Domain declares:

- stable identity, path, immediate parent, label, version status
- one responsibility and explicit owned meaning
- forbidden responsibilities
- owned state and schema
- inputs, systems, outputs, and lifecycle
- required and optional dependencies
- public atomic Kits, providers, and adapters
- settings schema and proof references

Generation fails when a public atom lacks source or proof. Compliance is never inferred from a folder name.

## Semantic Families

| Family | Main paths |
| --- | --- |
| Runtime | `n:runtime`, realtime, data, transaction, persistence, sequence, startup |
| Composition | `n:composition`, `n:mcp`, `n:policy` |
| World | `n:spatial`, `n:object`, `n:world`, scene, weather, asset |
| Simulation | `n:simulation`, physics, motion, `n:compute`, model |
| Actors | `n:actor`, creature, character, player, `n:agent` |
| Interaction | `n:interaction`, input |
| Presentation | output, graphics, camera, animation, audio, UI, speech, capture, sky |
| Infrastructure | `n:network`, `n:diagnostics`, contract-only `n:host` |

The generated Domain Index appendix contains every active path.

## Atomicity Test

An atom should have one reason to change. If a module owns inventory, combat, rendering, and progression together, it is a composition or product feature, not an atom.

Splitting is semantic, not file-count driven. Several source files may implement one indivisible lifecycle. Conversely, one legacy file may contain several owners and must be separated.

## Dependency Tokens

Use capability tokens for behavior dependencies and Domain paths for semantic presence. Requirements must describe what the atom consumes; providers list what they supply. Composition rejects missing providers, cycles, identity collisions, and changed content.

## Public Imports

Only generated package exports are public. Production code does not import private files from sibling Domains. Cross-Domain collaboration goes through a public subpath or an explicit adapter.

---

<a id="lifecycle"></a>

# State, Lifecycle, And Idempotence

Idempotence means repeating an accepted operation does not create a second effect. It is enforced locally by each atom and globally by the composition controller.

## Install

An atomic Kit has a stable identity and manifest fingerprint. Installing matching content again returns the installed API without adding state, systems, or subscriptions. Reusing the same identity with different content is a hard conflict.

## Commands

State-changing commands need a stable idempotency key when they may be retried. The state owner records the accepted key and result. Repeating the same command returns the original result. Reusing the key with changed content fails before mutation.

## Snapshot

A snapshot contains portable semantic state. It excludes renderer objects, functions, sockets, file handles, GPU resources, and vendor SDK instances. Providers snapshot their own implementation state behind their contract when necessary.

## Reset

Reset restores the configured baseline. Calling reset twice returns the same snapshot and must not duplicate resources or lifecycle hooks.

## Replay

Deterministic replay starts from an accepted snapshot and applies the same ordered inputs. Any nondeterministic source is injected by the host and recorded as input. Random behavior uses explicit seeds or provider receipts.

## Composition-Level Exactly-Once

The controller hashes the normalized request, dependency plan, exact Kit source descriptors, configuration, and resolved executable fingerprints. The resulting plan ID is reviewed by a human. After apply, its receipt is persisted. Repeating the same plan returns that receipt without invoking the host again.

## Transactional Failure

Before apply, the host supplies a snapshot. If host mutation or receipt persistence fails, the controller restores both host and controller state. A failed plan has no success receipt.

---

<a id="composition"></a>

# Composition And Recipes

Composition turns semantic intent into a deterministic, reviewable installation order.

## Registry First

Core discovery starts from merged registry metadata generated from manifests. It never scans the filesystem at runtime. Imported registries may add identities but may not replace Core records or collide with an existing Domain path.

## Selection Inputs

A request may select:

- individual atomic Kit IDs
- Domain IDs, which select the Domain's public atoms
- recipe IDs, which select declared Domains and Kits
- a scoped composition tree
- per-Kit configuration and allowed statuses

The retired `bundles` request key is rejected. Use recipes for declarative composition.

## Validate Before Plan

Validation checks identity, dependencies, provider availability, status policy, cycles, and ordering without resolving executable code.

The runnable inspection example is `examples/guide/composition-inspection.mjs`.

```js
const validation = engine.n.composition.planning.validate({
  kits: ["object-placement-kit"]
});

if (!validation.ok) throw new Error("Composition is invalid");
```

## Plan

Planning adds required providers and returns a stable dependency order. MCP planning also asks the application host to preflight exact executable sources. Preflight is read-only.

## Recipe Ownership

A recipe is data. It can express a useful combination without creating a new state owner. Reusable optional recipes belong in a trusted Kit registry. Complete game recipes belong with the game.

## Apply

Apply requires the exact reviewed plan ID and explicit authorization. The controller resolves the same metadata, rejects drift, applies through the host, persists a receipt, and returns the original receipt on replay.

---

<a id="mcp"></a>

# MCP Agent Workflow

MCP makes the semantic catalog inspectable by an agent. It does not make the agent the runtime owner and does not authorize mutation by itself.

## Opt-In Boundary

An application installs the MCP registry Domain, registers the Composition provider, supplies a transactional host, and chooses a transport. Without those steps, the package exposes no live MCP server.

## Read Tools

| Tool | Purpose |
| --- | --- |
| `domains_list`, `domain_get` | Discover semantic ownership |
| `kits_list`, `kit_explain` | Preserve the existing Kit-oriented inspection surface |
| `atoms_list`, `atom_get` | Page through atomic capabilities and dependency evidence |
| `recipes_list`, `recipe_get` | Inspect declarative compositions |
| `registry_sources_list` | Review package, version, commit, integrity, environment, permissions, and status |
| `composition_validate` | Check a request without resolving code |
| `composition_plan` | Resolve exact sources and produce a stable plan ID |

## Mutation Tool

`composition_apply` is the only mutation tool in the provider. It requires explicit authorization for the exact plan ID. A transport or application may impose additional policy.

## Review Sequence

```txt
inspect relevant Domains and atoms
-> validate the request
-> plan exact sources
-> show commit, integrity, permissions, and capability changes
-> human approves the exact plan ID
-> apply once
-> persist receipt
-> runtime continues after MCP disconnects
```

## Prompts

The provider exposes exactly two short prompts: `inspect-and-plan` and `review-and-apply`. They route the workflow; they do not embed the full guide.

## Resources

Registry records and guide chapters are individual MCP resources. An agent reads only the records and chapters relevant to its current decision. The complete PDF is for humans, not prompt context.

---

<a id="registry-security"></a>

# Registries And Security

A registry record is metadata. Reading, searching, merging, or validating it must not execute package code.

## Exact Source Identity

An executable Kit record includes:

- package name and exact version
- canonical package subpath and export name
- immutable 40-character source commit
- SHA-256 integrity
- environments and requested permissions
- requires and provides tokens
- status and settings schema

Moving branches, tags, and unpinned URLs are not executable identities.

## Resolution Rules

The host verifies that paths stay inside the resolved package root, imports the declared export only, compares integrity, and computes an executable fingerprint. Browser modules require immutable commit URLs. Local and package paths cannot escape their package root.

## No Runtime Installation

Core never runs a package manager during composition. When required code is absent, planning returns a structured installation receipt with the exact package and version. Installation is a separate human-controlled operation; planning is repeated afterward.

## Collision Rules

- An imported registry cannot replace a Core identity.
- Two Domains cannot claim the same semantic path.
- One Kit ID cannot refer to changed content.
- A repeated accepted plan returns its original receipt.
- Integrity mismatch, wrong export, path escape, or missing source fails before mutation.

## Trust Boundary

Integrity proves identity, not benevolence. Approved JavaScript still runs with the permissions of its host. Review source ownership, commit, permissions, and environment before approval. Use process or platform isolation when untrusted code must run.

---

<a id="integration-boundaries"></a>

# Hosts, Providers, And Adapters

Core owns semantic contracts. Concrete platform work belongs at a leaf boundary.

## Host

The host owns application lifecycle, package availability, executable resolution, runtime construction, persistence, and rollback. Core retains only portable host capability contracts under `n:host`.

Browser, Node, native, editor, terminal, repository, filesystem, storage, transport, and vendor SDK implementations are outside Core.

## Provider

A provider implements one Domain contract. Examples include physics solving, model inference, speech synthesis, asset retrieval, or capture rendering. Core can own request and result schemas while the provider owns vendor handles, caches, and external effects.

## Adapter

An adapter translates two public contracts without becoming the state owner of either. Its manifest names both requirements and the capability it provides. Adapters import public semantic subpaths, never private sibling files.

## Presentation Boundary

Presentation Core contains renderer-neutral descriptors and policies. Three.js objects, WebGL resources, browser audio, native widgets, and authored presets belong in renderer, host, Kit, or product repositories.

## Example Ownership Decisions

- Generic sky descriptors: `n:presentation:sky`.
- Authored sunset preset: recipe or product data.
- Speech request lifecycle: `n:presentation:speech`.
- PocketTTS implementation: external provider Kit.
- Motion trajectory: `n:simulation:motion`.
- Animation clip descriptor: `n:presentation:animation`.
- Two-bone pose solving: `n:simulation:motion`.

---

<a id="build-domain"></a>

# Build Projects And Targets

`n:build` is NexusEngine's isolated build-time Domain. It is physically shipped
with the Engine so projects do not own compiler, toolchain, platform host,
packaging, artifact, or receipt logic. It is not installed by `createEngine()`
and cannot be imported by runtime Domains.

## Boundary

```txt
project (read only)              ~/.nexusengine (Build owned)
├── src                          ├── sources/<sha256>
├── content                      ├── toolchains/<identity>
├── assets                       ├── builds/<plan-hash>/<target>
├── tests                        ├── artifacts/<project>/<plan-hash>
└── package.json                 └── receipts/<plan-hash>.json
```

Build fingerprints every project file before planning and immediately before
execution. It fingerprints the project again after every aggregate run. Any
changed, added, or removed source path fails project immutability proof.

Large repositories may declare exact target entrypoints and an analysis include
set in `package.json`. Paths are literal repository-relative paths, not globs.
Excluded files remain part of the whole-project immutability fingerprint but do
not enter target compilation graphs.

```json
{
  "nexusengineBuild": {
    "include": ["index.html", "src"],
    "entries": {
      "web-static": "src/main.js",
      "android-xr": "src/native-main.js",
      "pcvr": "src/native-main.js"
    }
  }
}
```

## Commands

```bash
nexusengine inspect ./project

nexusengine plan ./project \
  --profile native-preferred \
  --target web-live \
  --target web-static \
  --target android-xr \
  --target pcvr

nexusengine build ./project \
  --profile native-preferred \
  --out /absolute/artifact/root \
  --approve-plan sha256:<exact-plan-hash> \
  --target web-static
```

At least one repeated `--target` is required. Order and duplicates normalize to
one sorted target set, so they do not change the plan hash. An interactive
terminal may confirm the displayed exact plan. Noninteractive execution always
requires `--approve-plan`.

## Pipeline

```txt
read-only project inventory
-> SHA-256 source fingerprint
-> TypeScript compiler AST and typed diagnostics
-> AST-derived module, effect, and dependency analysis
-> Kit IR
-> deterministic Execution IR
-> whole-Kit portability classification
-> target capability and fallback selection
-> exact plan approval
-> isolated target stages
-> artifact integrity and project immutability proof
-> persistent receipt
```

The four whole-Kit execution modes are `native`, `native-adapter`,
`javascript`, and `unsupported`. JavaScript is not silently translated into
native behavior. A module must explicitly declare portable-native intent and
pass semantic parity before native lowering can be accepted.

## Targets

- `web-live` copies the local immutable module closure and generates a service
  worker that verifies every SHA-256 before populating a content cache.
- `web-static` emits a self-contained local directory and rejects unresolved
  external browser packages.
- `android-xr` shares OpenXR runtime, action, view, and submission contracts,
  then creates an external Android ARM64 Gradle/NDK stage and validates the APK
  closure without installing it on a device.
- `pcvr` shares the same OpenXR contracts, then adds Windows x64 host,
  generated-runtime linking, PE packaging, and no-runtime validation.

Native planning is not native proof. Supported numeric Kit IR lowers into
deterministic Rust; other whole Kits may use the QuickJS-NG sandbox only when
their requested capabilities are supported. OpenXR and QuickJS-NG source comes
from exact commits with verified archive SHA-256 values. A native target is
`package-proven` only after its target compiler and package validator succeed.
The release requires Linux Android XR and Windows PCVR package jobs; runtime and
headset execution remain separate `hardware: false` evidence for `0.0.4`.
Every Web artifact also contains `nexusengine-build-diagnostics.json` with its
exact plan, registry, target, closure, source, Engine dependency, and linker
identity for a product diagnostic view.

## Source Security

Build accepts npm registry integrity, crates.io checksums, exact Git commits,
versioned vendor installers, and immutable HTTPS ESM URLs. Metadata discovery
does not execute source. Moving references, absent licenses, integrity
mismatches, path escapes, incomplete dependency closure, and duplicate source
identities fail before target execution.

Exact `git+https` lock entries stay on their canonical HTTPS transport inside
isolated npm stages. Build adds deterministic SSH-to-HTTPS Git rewrites for the
recorded host while retaining any caller-provided rewrites used by a controlled
local source mirror.

The base npm install performs no Build downloads. Network provisioning is a
separate approved operation and caches verified bytes by content hash.

## MCP

The opt-in Build provider exposes:

```txt
build_targets_list
build_inspect
build_plan
build_apply
build_receipt_get
```

`build_apply` requires MCP authorization and the exact reviewed plan hash.
Repeated successful apply returns the existing receipt without rebuilding.
During a partial failure, successful target stages remain cached while blocked
or failed targets remain visible in the aggregate failed receipt.

---

<a id="testing"></a>

# Testing And Proof

Tests prove contracts at the level where failure would matter. A green unit test is not enough when a change affects package exports, composition, consumers, or rendered output.

## Manifest Proof

Validate unique IDs, normalized paths, immediate parents, one owner per public module, source paths, export names, schemas, lifecycle declarations, dependencies, and proof references.

## Atomic Lifecycle Proof

For each stateful atom:

1. Install twice and prove no duplicate state or systems.
2. Apply the same command twice and compare state and result.
3. Reuse an idempotency key with changed content and require failure.
4. Snapshot, load, and compare equality.
5. Reset twice and compare equality.
6. Replay ordered inputs from the same snapshot.

## Composition Proof

Test missing providers, cycles, collisions, status rejection, stable ordering, repeated apply, process restart, receipt persistence, host rollback, and continued runtime operation after MCP disconnect.

## Combination Coverage

Test each atom alone, every declared dependency edge, pairwise cross-Domain combinations, official recipes, high-risk three-way stacks, and installation-order permutations. Do not attempt every mathematical combination.

## Registry Security Proof

Prove that metadata reads cannot execute code. Reject moving refs, integrity mismatch, path escape, wrong export, missing package, duplicate identity, and changed-content replay before mutation.

## Consumer Proof

Install the packed Engine tarball in clean temporary directories. Then prove Kits, Editor, and Simulator against that exact artifact without local symlinks. Browser-facing workflows require Playwright and human-view inspection in addition to DOM assertions.

## Documentation Proof

Regenerate all derived files, run drift checks, execute guide examples, resolve links, render the PDF, verify every page contains content, and visually inspect rendered page images for clipping or overlap.

---

<a id="migration"></a>

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

Concrete hosts, renderers, shaders, platform storage, model mocks, speech engines, authored sky presets, gameplay systems, and complete games moved outside Core or became caller-owned data. The Root Migration Map appendix lists every retired source and its owner.

## Consumer Migration Order

1. Replace old imports with generated semantic package subpaths.
2. Replace old runtime paths with semantic paths.
3. Install explicit atoms that were formerly implicit defaults.
4. Move platform implementations into the host or an external Kit.
5. Replace compatibility aliases with the owning Domain API.
6. Run from a packed Engine artifact in a clean directory.

## Changelog Contract

The changelog and migration map explain replacements. They are not compatibility code. A removed symbol stays removed.

---

<a id="protokit-extraction"></a>

# ProtoKit Extraction

ProtoKits is retired as an active development destination. Its history remains evidence for reconstructing useful behavior with Core atoms, external Kits, recipes, and game-owned code.

## Frozen Source

Extraction uses a clean read-only worktree at one immutable remote default-branch commit. The inventory records the remote, commit, file count, and source snapshot SHA-256. A stale or dirty local checkout is never canonical evidence.

## Unit Of Classification

Folder count is not capability count. The extractor records folders, files, exports, factories, manifests, tests, dependencies, state, lifecycle signals, commands, events, providers, adapters, and consumers. Every discovered source surface receives exactly one disposition.

## Dispositions

| Disposition | Meaning |
| --- | --- |
| `core-reuse` | Existing Core atom already owns the behavior |
| `core-composition` | Existing atoms reproduce it through composition |
| `core-new-atom` | A missing universal atom passed every promotion gate |
| `external-kit` | Reusable but optional, niche, platform, or vendor behavior |
| `recipe-data` | Authored data or declarative composition |
| `game-owned` | Complete product or gameplay behavior |
| `duplicate` | Semantically identical to a named canonical owner |
| `rejected-unproven` | Insufficient evidence for a safe owner |

## New Atom Gate

A candidate must have one indivisible responsibility, deterministic behavior or isolated nondeterminism, product neutrality, snapshot and reset support, no concrete presentation ownership, and two semantically different consumers. Failure of one condition keeps it outside Core.

## Reconstruction

Useful behavior is preserved as a recipe: source lineage, required Core atoms, external owner, data, policy, and proof status. Preserving behavior does not require preserving the old package shape.

## Archive Boundary

Writers and automations remain disabled. Archiving the remote repository is a separate external mutation that requires explicit approval after extraction coverage is complete.

---

<a id="release-operation"></a>

# Release And Operating Model

Release proof is performed against committed, reproducible sources. Local-green evidence is necessary but is not the same as a release.

## Generated Truth

The Core catalog, package exports, ownership ledger, API reference, guide indexes, MCP chapter resources, and guide identify the same registry SHA-256. Generate mode writes them; check mode rejects drift.

## Required Gates

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run core:check
npm run ownership:generate
npm run migrations:check
npm run protokits:check
npm run guide:check
npm run guide:examples
npm test
npm run test:release
npm run boundaries:check
npm run docs:check
npm pack --dry-run --json
```

Consumer repositories must install the exact packed or committed Engine source. Local symlinks and sibling private imports invalidate clean-consumer proof.

## Human Approval

After every local and hosted gate passes, present the repository identity, previous numeric branch, derived next version, exact default-branch SHA, checks, and warnings. Approval applies only to that tuple.

Immediately before branch creation, refetch the remote and confirm the default branch still points to the approved SHA. Create the immutable numeric branch with a non-force exact-SHA push, then read the remote ref back and compare it byte for byte.

## Outside This Guide Build

This documentation build does not push, publish, archive ProtoKits, mutate Google Drive, create a GitHub Release, publish npm, or create the numeric version branch. Each action has its own approval gate.

---

<a id="domain-index"></a>

# Domain Index

Registry SHA-256: `c8cfad63537117f9464ebbb502fed5daa1034c8226da1e9c0fce4513ab8104a2`

- `n:actor`: Own neutral embodied actor identity and shared actor references.
- `n:actor:creature`: Own neutral creature embodiment definitions and references.
- `n:actor:character`: Own active embodied character identity and neutral runtime bindings.
- `n:actor:player`: Own neutral player identity, possession, control authority, and spawn generations.
- `n:agent`: Own product-neutral observation, proposal, decision-cycle, execution receipt, and replay evidence contracts.
- `n:asset`: Own asset identity, manifests, bundles, content-addressed jobs, readiness, and provider contracts.
- `n:build`: Own isolated build-time source analysis, compilation, toolchains, targets, artifacts, receipts, and proof without entering application runtime composition.
- `n:build:source`: Own read-only project source, immutable dependency identities, content caches, fingerprints, and module graphs.
- `n:build:analysis`: Own real syntax, type, effect, and dependency analysis for build inputs.
- `n:build:ir`: Own serializable Kit IR, Execution IR, validation, and source lineage maps.
- `n:build:classification`: Own whole-Kit portability, capability resolution, and fallback selection.
- `n:build:orchestration`: Own normalized requests, target sets, deterministic plans, approvals, execution, and receipts.
- `n:build:compile`: Own deterministic Rust lowering, JavaScript fallback descriptors, runtime ABI, and native link plans.
- `n:build:toolchain`: Own immutable toolchain sources, discovery, approved provisioning, isolated stages, and process execution.
- `n:build:target`: Own target registration and target-specific build providers.
- `n:build:artifact`: Own content-addressed artifact caches, manifests, integrity, and external output.
- `n:build:proof`: Own project immutability, runtime parity, and target validation evidence.
- `n:build:target:web-live`: Own verified live ESM loading and content-hash browser caching.
- `n:build:target:web-static`: Own self-contained static Web artifact materialization.
- `n:build:target:openxr`: Own shared native OpenXR session, input, frame, view, swapchain, and submission contracts.
- `n:build:target:android-xr`: Own Android ARM64 OpenXR host generation, Gradle packaging, and APK validation.
- `n:build:target:pcvr`: Own Windows x64 OpenXR host generation, executable packaging, and validation.
- `n:composition`: Own deterministic Domain and Kit discovery, dependency planning, plan identity, and exactly-once apply receipts.
- `n:compute`: Own parallel compute descriptors, dependency graphs, dispatch plans, and provider contracts.
- `n:compute:model`: Own model descriptors, registries, inference requests/results, and model provider contracts.
- `n:diagnostics`: Own renderer-neutral telemetry, health, determinism, performance, replay, and debug evidence descriptors.
- `n:host`: Own host capability descriptors and fallback contracts without platform implementation.
- `n:interaction`: Own targets, affordances, activation progress, semantic requirements, prompts, and completion results.
- `n:interaction:input`: Own semantic input actions, axes, contexts, bindings, dead zones, and adapter contracts.
- `n:interaction:assistance-target`: Own assistance target urgency, attachment, completion, loss, and deterministic selection.
- `n:interaction:environmental-affordance`: Own portable affordance proximity and activation state.
- `n:interaction:request`: Own portable request queue and fulfillment boundaries.
- `n:interaction:request:queue`: Own queued request patience, fulfillment, expiry, and effect descriptors.
- `n:interaction:request:fulfillment`: Own spatial request destination, deadline, completion, expiry, and reward state.
- `n:interaction:transfer-zone`: Own portable transfer-zone acceptance, dwell, capacity, occupancy, and completion state.
- `n:mcp`: Own opt-in transport-neutral MCP contracts, provider registration, authorization, and protocol dispatch.
- `n:network`: Own session, peer, message, synchronization, authority, latency, reconnect, and collaboration contracts.
- `n:object`: Own renderer-neutral object identity, intrinsic geometry meaning, fidelity, vegetation identity, and placement.
- `n:object:shape`: Own source and derived geometric shapes, provider jobs, qualification, and fallback.
- `n:object:fidelity`: Own valid object forms, fidelity packages, readiness, and contextual adaptation.
- `n:object:vegetation`: Own rooted plant species, instances, lifecycle, and deterministic variation.
- `n:object:vegetation:tree`: Own deterministic tree structure, canopy, growth, and fidelity descriptors.
- `n:object:vegetation:foliage`: Own deterministic foliage structure and descriptors.
- `n:object:vegetation:ecology`: Own deterministic vegetation suitability scoring and species selection.
- `n:object:placement`: Own deterministic placement transforms, grounding, alignment, fit, and validation receipts.
- `n:policy`: Own product-neutral permission, guard, sandbox, and runtime safety decisions.
- `n:presentation`: Own renderer-neutral presentation descriptors and output policy contracts.
- `n:presentation:output`: Own surface, safe-area, viewport, aspect, bar, and render-resolution policy.
- `n:presentation:graphics`: Own renderer-neutral material, lighting, VFX, reflection, quality, batch, and render graph descriptors.
- `n:presentation:camera`: Own renderer-neutral camera targets, modes, smoothing, framing, and occlusion policy.
- `n:presentation:animation`: Own animation, pose, blend, rig, and timeline descriptors.
- `n:presentation:audio`: Own audio cue, music, ambience, mix, volume, and spatial audio descriptors.
- `n:presentation:ui`: Own renderer-neutral HUD, menu, prompt, notification, focus, selection, accessibility, and scale descriptors.
- `n:presentation:speech`: Own provider-neutral speech requests, voices, utterance lifecycle, and synthesis result contracts.
- `n:presentation:capture`: Own observation requests, view sets, framing, capture jobs, progress, and result contracts.
- `n:presentation:sky`: Own generic sky, atmosphere, cloud, horizon, and celestial descriptors.
- `n:presentation:camera:third-person`: Own renderer-neutral third-person camera follow descriptors.
- `n:runtime`: Own deterministic engine lifecycle, ticks, state mutation contracts, and runtime service installation.
- `n:runtime:realtime`: Own deterministic frame context and realtime phase execution.
- `n:runtime:data`: Own schemas, snapshots, selectors, migrations, deterministic random streams, and portable data envelopes.
- `n:runtime:transaction`: Own portable repeat-safe operation and transaction receipts.
- `n:runtime:persistence`: Own save/load targets, save slots, recovery records, and adapter contracts.
- `n:runtime:sequence`: Own deterministic sequence nodes, ordered execution, and frame-driven sequence state.
- `n:runtime:startup`: Own launch truth, preparation facts, continuation choice, structured failure, and readiness receipts.
- `n:runtime:sequence:schedule`: Own deterministic elapsed-time schedules and occurrence records.
- `n:simulation`: Own deterministic simulation objectives, resources, hazards, pressure, checkpoints, timers, and resolution contracts.
- `n:simulation:physics`: Own backend-neutral physical bodies, colliders, contacts, constraints, queries, and provider contracts.
- `n:simulation:physics:articulated`: Own articulated body topology, joint dynamics inputs, and backend-neutral articulation state.
- `n:simulation:motion`: Own intent-to-motion descriptors, movement modes, trajectories, velocity state, movement policies, and deterministic pose solving.
- `n:simulation:motion:articulated`: Own target poses, joint limits, articulation motion plans, and drive requests.
- `n:simulation:motion:locomotion`: Own deterministic action-to-motion intent and locomotion frame calculation.
- `n:simulation:motion:vehicle`: Own deterministic vehicle movement, boost, bounds, and impact frames.
- `n:simulation:physics:world-contact`: Own portable world-contact resolution and correction records.
- `n:simulation:recovery`: Own portable subject recovery records and deterministic recovery state.
- `n:simulation:recovery:soft-respawn`: Own exact-once portable subject recovery records.
- `n:simulation:economy`: Own portable economic account and cargo state primitives.
- `n:simulation:economy:accounts`: Own finite account balances and economy transaction records.
- `n:simulation:economy:cargo`: Own portable cargo inventory, carrying, condition, deposits, and quota state.
- `n:simulation:operations`: Own portable facility, occupant, and transport operation primitives.
- `n:simulation:operations:facility`: Own deterministic facility capacity, condition, status, cycles, and operation receipts.
- `n:simulation:operations:occupant-flow`: Own deterministic occupant spawning, patience, service, and abandonment state.
- `n:simulation:operations:transport-route`: Own deterministic transport stops, carriers, capacity, travel, and arrival receipts.
- `n:simulation:hazard-field`: Own deterministic bounded hazard state, spawning, motion, and collision queries.
- `n:simulation:pursuit-pressure`: Own coherent pursuit distance, warning bands, caught state, recovery, and transition history.
- `n:simulation:progression`: Own portable progression capability and lifecycle ownership boundaries.
- `n:simulation:progression:lifecycle`: Own prerequisite-gated lifecycle timing, completion, and portable effect descriptors.
- `n:spatial`: Own renderer-neutral transforms, coordinate spaces, bounds, zones, distance queries, and deterministic spatial math.
- `n:spatial:scale`: Own subject scale, scale anchors, proximity bands, and deterministic scale queries.
- `n:world`: Own world identity, cells, partitions, surfaces, deterministic assembly, and world state receipts.
- `n:world:scene`: Own host-neutral scene identity, lifecycle, transition, binding descriptors, and scene snapshots.
- `n:world:weather`: Own weather conditions, tendencies, regions, layers, sampling, and deterministic evolution.
- `n:world:foundation`: Own deterministic foundation contributions, composition, sampling, and cell resolution.
- `n:world:feature`: Own semantic world feature definitions, registries, lifecycle, queries, and composition.
- `n:world:feature:landform`: Own semantic elevation and landform feature descriptors.
- `n:world:feature:hydrology`: Own semantic watershed, water path, water body, and wetland feature descriptors.
- `n:world:feature:ecology`: Own semantic biome, habitat, vegetation-region, and ecotone feature descriptors.
- `n:world:feature:settlement`: Own semantic settlement, route, structure, and infrastructure feature descriptors.
- `n:world:feature:atmosphere`: Own semantic cloud, fog, wind, thermal, precipitation, and visibility feature descriptors.
- `n:world:navigation`: Own renderer-neutral navigation graphs, path queries, route fields, and landmark guidance.
- `n:world:navigation:navmesh`: Own deterministic 2D navigation cells, portals, and 3D waypoint graphs derived from walkability.
- `n:world:navigation:pathfinding`: Own deterministic path requests, A* resolution, results, and graph adapters.
- `n:world:navigation:route-field`: Own generic route marker and corridor descriptors plus deterministic proximity queries.
- `n:world:navigation:landmark-guidance`: Own reusable landmark discovery, reach, completion, priority, and proximity state.
- `n:world:generation`: Own deterministic generic region, connector, point, graph, and walkability generation.
- `n:world:terrain`: Own deterministic terrain layer evaluation, sampling, cell preparation, streaming state, and portable cell evidence.
- `n:world:water-surface`: Own renderer-neutral water zones, currents, drag, depth, wave phase, hazards, and spatial queries.

---

<a id="dependency-table"></a>

# Core Dependency Table

Registry SHA-256: `c8cfad63537117f9464ebbb502fed5daa1034c8226da1e9c0fce4513ab8104a2`

| Owner | Requires | Optional |
| --- | --- | --- |
| `n:actor` | - | - |
| `n:actor:creature` | `n:actor` | - |
| `n:actor:character` | `n:actor` | - |
| `n:actor:player` | `n:actor:character` | - |
| `n:agent` | - | - |
| `n:asset` | - | - |
| `n:build` | - | - |
| `n:build:source` | `n:build` | - |
| `n:build:analysis` | `n:build` | - |
| `n:build:ir` | `n:build` | - |
| `n:build:classification` | `n:build` | - |
| `n:build:orchestration` | `n:build` | - |
| `n:build:compile` | `n:build` | - |
| `n:build:toolchain` | `n:build` | - |
| `n:build:target` | `n:build` | - |
| `n:build:artifact` | `n:build` | - |
| `n:build:proof` | `n:build` | - |
| `n:build:target:web-live` | `n:build:target` | - |
| `n:build:target:web-static` | `n:build:target` | - |
| `n:build:target:openxr` | `n:build:target` | - |
| `n:build:target:android-xr` | `n:build:target` | - |
| `n:build:target:pcvr` | `n:build:target` | - |
| `n:composition` | - | `n:mcp` |
| `n:compute` | - | - |
| `n:compute:model` | `n:compute` | - |
| `n:diagnostics` | - | - |
| `n:host` | - | - |
| `n:interaction` | - | - |
| `n:interaction:input` | - | - |
| `n:interaction:assistance-target` | `n:interaction` | - |
| `n:interaction:environmental-affordance` | `n:interaction` | - |
| `n:interaction:request` | `n:interaction` | - |
| `n:interaction:request:queue` | `n:interaction` | - |
| `n:interaction:request:fulfillment` | `n:interaction` | - |
| `n:interaction:transfer-zone` | `n:interaction` | - |
| `n:mcp` | - | `n:composition` |
| `n:network` | - | - |
| `n:object` | - | `n:asset`, `n:simulation:physics` |
| `n:object:shape` | `object:descriptor-contract` | - |
| `n:object:fidelity` | `object:descriptor-contract` | - |
| `n:object:vegetation` | `n:object` | - |
| `n:object:vegetation:tree` | `n:object:vegetation` | - |
| `n:object:vegetation:foliage` | `n:object:vegetation` | - |
| `n:object:vegetation:ecology` | `n:object:vegetation` | - |
| `n:object:placement` | `object:descriptor-contract` | - |
| `n:policy` | - | - |
| `n:presentation` | - | - |
| `n:presentation:output` | `n:presentation` | - |
| `n:presentation:graphics` | `n:presentation` | - |
| `n:presentation:camera` | `n:presentation` | - |
| `n:presentation:animation` | `n:presentation` | - |
| `n:presentation:audio` | `n:presentation` | - |
| `n:presentation:ui` | `n:presentation` | - |
| `n:presentation:speech` | `n:presentation` | - |
| `n:presentation:capture` | `n:presentation` | - |
| `n:presentation:sky` | `n:presentation` | - |
| `n:presentation:camera:third-person` | `character:resolution`, `motion:velocity`, `n:presentation:camera` | - |
| `n:runtime` | - | - |
| `n:runtime:realtime` | `n:runtime` | - |
| `n:runtime:data` | `n:runtime` | - |
| `n:runtime:transaction` | `n:runtime` | - |
| `n:runtime:persistence` | `n:runtime:data` | - |
| `n:runtime:sequence` | `n:runtime` | - |
| `n:runtime:startup` | `n:runtime` | `n:asset` |
| `n:runtime:sequence:schedule` | `n:runtime:sequence` | - |
| `n:simulation` | `n:runtime:realtime` | - |
| `n:simulation:physics` | `n:simulation` | - |
| `n:simulation:physics:articulated` | `n:simulation:physics` | - |
| `n:simulation:motion` | `n:simulation` | - |
| `n:simulation:motion:articulated` | `n:simulation:motion` | - |
| `n:simulation:motion:locomotion` | `n:simulation:motion` | - |
| `n:simulation:motion:vehicle` | `n:simulation:motion` | - |
| `n:simulation:physics:world-contact` | `n:simulation:physics` | - |
| `n:simulation:recovery` | `n:simulation` | - |
| `n:simulation:recovery:soft-respawn` | `n:simulation` | - |
| `n:simulation:economy` | `n:simulation` | - |
| `n:simulation:economy:accounts` | `n:simulation`, `transaction:idempotency` | - |
| `n:simulation:economy:cargo` | `n:simulation` | - |
| `n:simulation:operations` | `n:simulation` | - |
| `n:simulation:operations:facility` | `n:simulation` | - |
| `n:simulation:operations:occupant-flow` | `n:simulation` | - |
| `n:simulation:operations:transport-route` | `n:simulation` | - |
| `n:simulation:hazard-field` | `n:simulation` | - |
| `n:simulation:pursuit-pressure` | `n:simulation` | - |
| `n:simulation:progression` | `n:simulation` | - |
| `n:simulation:progression:lifecycle` | `n:simulation` | - |
| `n:spatial` | - | - |
| `n:spatial:scale` | `n:spatial` | - |
| `n:world` | `n:spatial` | - |
| `n:world:scene` | `n:world` | - |
| `n:world:weather` | `n:world` | - |
| `n:world:foundation` | `n:world` | - |
| `n:world:feature` | `n:world` | - |
| `n:world:feature:landform` | `n:world:feature` | - |
| `n:world:feature:hydrology` | `n:world:feature` | - |
| `n:world:feature:ecology` | `n:world:feature` | - |
| `n:world:feature:settlement` | `n:world:feature` | - |
| `n:world:feature:atmosphere` | `n:world:feature` | - |
| `n:world:navigation` | `n:world` | - |
| `n:world:navigation:navmesh` | `navigation:walkability-source` | - |
| `n:world:navigation:pathfinding` | `navigation:navmesh` | - |
| `n:world:navigation:route-field` | `n:world` | - |
| `n:world:navigation:landmark-guidance` | `n:world` | - |
| `n:world:generation` | `n:world` | - |
| `n:world:terrain` | `n:world` | - |
| `n:world:water-surface` | `n:world` | - |

---

<a id="api-reference"></a>

# Generated Core API Reference

This file is generated from Domain manifest v2 records. Do not edit it directly.

Registry SHA-256: `c8cfad63537117f9464ebbb502fed5daa1034c8226da1e9c0fce4513ab8104a2`

## Domains

| Domain | Parent | Responsibility | Status |
| --- | --- | --- | --- |
| `n:actor` | - | Own neutral embodied actor identity and shared actor references. | stable-candidate |
| `n:actor:creature` | `n:actor` | Own neutral creature embodiment definitions and references. | stable-candidate |
| `n:actor:character` | `n:actor` | Own active embodied character identity and neutral runtime bindings. | stable-candidate |
| `n:actor:player` | `n:actor` | Own neutral player identity, possession, control authority, and spawn generations. | stable-candidate |
| `n:agent` | - | Own product-neutral observation, proposal, decision-cycle, execution receipt, and replay evidence contracts. | stable-candidate |
| `n:asset` | - | Own asset identity, manifests, bundles, content-addressed jobs, readiness, and provider contracts. | stable-candidate |
| `n:build` | - | Own isolated build-time source analysis, compilation, toolchains, targets, artifacts, receipts, and proof without entering application runtime composition. | stable-candidate |
| `n:build:source` | `n:build` | Own read-only project source, immutable dependency identities, content caches, fingerprints, and module graphs. | stable-candidate |
| `n:build:analysis` | `n:build` | Own real syntax, type, effect, and dependency analysis for build inputs. | stable-candidate |
| `n:build:ir` | `n:build` | Own serializable Kit IR, Execution IR, validation, and source lineage maps. | stable-candidate |
| `n:build:classification` | `n:build` | Own whole-Kit portability, capability resolution, and fallback selection. | stable-candidate |
| `n:build:orchestration` | `n:build` | Own normalized requests, target sets, deterministic plans, approvals, execution, and receipts. | stable-candidate |
| `n:build:compile` | `n:build` | Own deterministic Rust lowering, JavaScript fallback descriptors, runtime ABI, and native link plans. | stable-candidate |
| `n:build:toolchain` | `n:build` | Own immutable toolchain sources, discovery, approved provisioning, isolated stages, and process execution. | stable-candidate |
| `n:build:target` | `n:build` | Own target registration and target-specific build providers. | stable-candidate |
| `n:build:artifact` | `n:build` | Own content-addressed artifact caches, manifests, integrity, and external output. | stable-candidate |
| `n:build:proof` | `n:build` | Own project immutability, runtime parity, and target validation evidence. | stable-candidate |
| `n:build:target:web-live` | `n:build:target` | Own verified live ESM loading and content-hash browser caching. | stable-candidate |
| `n:build:target:web-static` | `n:build:target` | Own self-contained static Web artifact materialization. | stable-candidate |
| `n:build:target:openxr` | `n:build:target` | Own shared native OpenXR session, input, frame, view, swapchain, and submission contracts. | stable-candidate |
| `n:build:target:android-xr` | `n:build:target` | Own Android ARM64 OpenXR host generation, Gradle packaging, and APK validation. | stable-candidate |
| `n:build:target:pcvr` | `n:build:target` | Own Windows x64 OpenXR host generation, executable packaging, and validation. | stable-candidate |
| `n:composition` | - | Own deterministic Domain and Kit discovery, dependency planning, plan identity, and exactly-once apply receipts. | stable-candidate |
| `n:compute` | - | Own parallel compute descriptors, dependency graphs, dispatch plans, and provider contracts. | stable-candidate |
| `n:compute:model` | `n:compute` | Own model descriptors, registries, inference requests/results, and model provider contracts. | stable-candidate |
| `n:diagnostics` | - | Own renderer-neutral telemetry, health, determinism, performance, replay, and debug evidence descriptors. | stable-candidate |
| `n:host` | - | Own host capability descriptors and fallback contracts without platform implementation. | stable-candidate |
| `n:interaction` | - | Own targets, affordances, activation progress, semantic requirements, prompts, and completion results. | stable-candidate |
| `n:interaction:input` | `n:interaction` | Own semantic input actions, axes, contexts, bindings, dead zones, and adapter contracts. | stable-candidate |
| `n:interaction:assistance-target` | `n:interaction` | Own assistance target urgency, attachment, completion, loss, and deterministic selection. | stable-candidate |
| `n:interaction:environmental-affordance` | `n:interaction` | Own portable affordance proximity and activation state. | stable-candidate |
| `n:interaction:request` | `n:interaction` | Own portable request queue and fulfillment boundaries. | stable-candidate |
| `n:interaction:request:queue` | `n:interaction:request` | Own queued request patience, fulfillment, expiry, and effect descriptors. | stable-candidate |
| `n:interaction:request:fulfillment` | `n:interaction:request` | Own spatial request destination, deadline, completion, expiry, and reward state. | stable-candidate |
| `n:interaction:transfer-zone` | `n:interaction` | Own portable transfer-zone acceptance, dwell, capacity, occupancy, and completion state. | stable-candidate |
| `n:mcp` | - | Own opt-in transport-neutral MCP contracts, provider registration, authorization, and protocol dispatch. | stable-candidate |
| `n:network` | - | Own session, peer, message, synchronization, authority, latency, reconnect, and collaboration contracts. | stable-candidate |
| `n:object` | - | Own renderer-neutral object identity, intrinsic geometry meaning, fidelity, vegetation identity, and placement. | stable-candidate |
| `n:object:shape` | `n:object` | Own source and derived geometric shapes, provider jobs, qualification, and fallback. | stable-candidate |
| `n:object:fidelity` | `n:object` | Own valid object forms, fidelity packages, readiness, and contextual adaptation. | stable-candidate |
| `n:object:vegetation` | `n:object` | Own rooted plant species, instances, lifecycle, and deterministic variation. | stable-candidate |
| `n:object:vegetation:tree` | `n:object:vegetation` | Own deterministic tree structure, canopy, growth, and fidelity descriptors. | stable-candidate |
| `n:object:vegetation:foliage` | `n:object:vegetation` | Own deterministic foliage structure and descriptors. | stable-candidate |
| `n:object:vegetation:ecology` | `n:object:vegetation` | Own deterministic vegetation suitability scoring and species selection. | stable-candidate |
| `n:object:placement` | `n:object` | Own deterministic placement transforms, grounding, alignment, fit, and validation receipts. | stable-candidate |
| `n:policy` | - | Own product-neutral permission, guard, sandbox, and runtime safety decisions. | stable-candidate |
| `n:presentation` | - | Own renderer-neutral presentation descriptors and output policy contracts. | stable-candidate |
| `n:presentation:output` | `n:presentation` | Own surface, safe-area, viewport, aspect, bar, and render-resolution policy. | stable-candidate |
| `n:presentation:graphics` | `n:presentation` | Own renderer-neutral material, lighting, VFX, reflection, quality, batch, and render graph descriptors. | stable-candidate |
| `n:presentation:camera` | `n:presentation` | Own renderer-neutral camera targets, modes, smoothing, framing, and occlusion policy. | stable-candidate |
| `n:presentation:animation` | `n:presentation` | Own animation, pose, blend, rig, and timeline descriptors. | stable-candidate |
| `n:presentation:audio` | `n:presentation` | Own audio cue, music, ambience, mix, volume, and spatial audio descriptors. | stable-candidate |
| `n:presentation:ui` | `n:presentation` | Own renderer-neutral HUD, menu, prompt, notification, focus, selection, accessibility, and scale descriptors. | stable-candidate |
| `n:presentation:speech` | `n:presentation` | Own provider-neutral speech requests, voices, utterance lifecycle, and synthesis result contracts. | stable-candidate |
| `n:presentation:capture` | `n:presentation` | Own observation requests, view sets, framing, capture jobs, progress, and result contracts. | stable-candidate |
| `n:presentation:sky` | `n:presentation` | Own generic sky, atmosphere, cloud, horizon, and celestial descriptors. | stable-candidate |
| `n:presentation:camera:third-person` | `n:presentation:camera` | Own renderer-neutral third-person camera follow descriptors. | stable-candidate |
| `n:runtime` | - | Own deterministic engine lifecycle, ticks, state mutation contracts, and runtime service installation. | stable-candidate |
| `n:runtime:realtime` | `n:runtime` | Own deterministic frame context and realtime phase execution. | stable-candidate |
| `n:runtime:data` | `n:runtime` | Own schemas, snapshots, selectors, migrations, deterministic random streams, and portable data envelopes. | stable-candidate |
| `n:runtime:transaction` | `n:runtime` | Own portable repeat-safe operation and transaction receipts. | stable-candidate |
| `n:runtime:persistence` | `n:runtime` | Own save/load targets, save slots, recovery records, and adapter contracts. | stable-candidate |
| `n:runtime:sequence` | `n:runtime` | Own deterministic sequence nodes, ordered execution, and frame-driven sequence state. | stable-candidate |
| `n:runtime:startup` | `n:runtime` | Own launch truth, preparation facts, continuation choice, structured failure, and readiness receipts. | stable-candidate |
| `n:runtime:sequence:schedule` | `n:runtime:sequence` | Own deterministic elapsed-time schedules and occurrence records. | stable-candidate |
| `n:simulation` | - | Own deterministic simulation objectives, resources, hazards, pressure, checkpoints, timers, and resolution contracts. | stable-candidate |
| `n:simulation:physics` | `n:simulation` | Own backend-neutral physical bodies, colliders, contacts, constraints, queries, and provider contracts. | stable-candidate |
| `n:simulation:physics:articulated` | `n:simulation:physics` | Own articulated body topology, joint dynamics inputs, and backend-neutral articulation state. | stable-candidate |
| `n:simulation:motion` | `n:simulation` | Own intent-to-motion descriptors, movement modes, trajectories, velocity state, movement policies, and deterministic pose solving. | stable-candidate |
| `n:simulation:motion:articulated` | `n:simulation:motion` | Own target poses, joint limits, articulation motion plans, and drive requests. | stable-candidate |
| `n:simulation:motion:locomotion` | `n:simulation:motion` | Own deterministic action-to-motion intent and locomotion frame calculation. | stable-candidate |
| `n:simulation:motion:vehicle` | `n:simulation:motion` | Own deterministic vehicle movement, boost, bounds, and impact frames. | stable-candidate |
| `n:simulation:physics:world-contact` | `n:simulation:physics` | Own portable world-contact resolution and correction records. | stable-candidate |
| `n:simulation:recovery` | `n:simulation` | Own portable subject recovery records and deterministic recovery state. | stable-candidate |
| `n:simulation:recovery:soft-respawn` | `n:simulation:recovery` | Own exact-once portable subject recovery records. | stable-candidate |
| `n:simulation:economy` | `n:simulation` | Own portable economic account and cargo state primitives. | stable-candidate |
| `n:simulation:economy:accounts` | `n:simulation:economy` | Own finite account balances and economy transaction records. | stable-candidate |
| `n:simulation:economy:cargo` | `n:simulation:economy` | Own portable cargo inventory, carrying, condition, deposits, and quota state. | stable-candidate |
| `n:simulation:operations` | `n:simulation` | Own portable facility, occupant, and transport operation primitives. | stable-candidate |
| `n:simulation:operations:facility` | `n:simulation:operations` | Own deterministic facility capacity, condition, status, cycles, and operation receipts. | stable-candidate |
| `n:simulation:operations:occupant-flow` | `n:simulation:operations` | Own deterministic occupant spawning, patience, service, and abandonment state. | stable-candidate |
| `n:simulation:operations:transport-route` | `n:simulation:operations` | Own deterministic transport stops, carriers, capacity, travel, and arrival receipts. | stable-candidate |
| `n:simulation:hazard-field` | `n:simulation` | Own deterministic bounded hazard state, spawning, motion, and collision queries. | stable-candidate |
| `n:simulation:pursuit-pressure` | `n:simulation` | Own coherent pursuit distance, warning bands, caught state, recovery, and transition history. | stable-candidate |
| `n:simulation:progression` | `n:simulation` | Own portable progression capability and lifecycle ownership boundaries. | stable-candidate |
| `n:simulation:progression:lifecycle` | `n:simulation:progression` | Own prerequisite-gated lifecycle timing, completion, and portable effect descriptors. | stable-candidate |
| `n:spatial` | - | Own renderer-neutral transforms, coordinate spaces, bounds, zones, distance queries, and deterministic spatial math. | stable-candidate |
| `n:spatial:scale` | `n:spatial` | Own subject scale, scale anchors, proximity bands, and deterministic scale queries. | stable-candidate |
| `n:world` | - | Own world identity, cells, partitions, surfaces, deterministic assembly, and world state receipts. | stable-candidate |
| `n:world:scene` | `n:world` | Own host-neutral scene identity, lifecycle, transition, binding descriptors, and scene snapshots. | stable-candidate |
| `n:world:weather` | `n:world` | Own weather conditions, tendencies, regions, layers, sampling, and deterministic evolution. | stable-candidate |
| `n:world:foundation` | `n:world` | Own deterministic foundation contributions, composition, sampling, and cell resolution. | stable-candidate |
| `n:world:feature` | `n:world` | Own semantic world feature definitions, registries, lifecycle, queries, and composition. | stable-candidate |
| `n:world:feature:landform` | `n:world:feature` | Own semantic elevation and landform feature descriptors. | stable-candidate |
| `n:world:feature:hydrology` | `n:world:feature` | Own semantic watershed, water path, water body, and wetland feature descriptors. | stable-candidate |
| `n:world:feature:ecology` | `n:world:feature` | Own semantic biome, habitat, vegetation-region, and ecotone feature descriptors. | stable-candidate |
| `n:world:feature:settlement` | `n:world:feature` | Own semantic settlement, route, structure, and infrastructure feature descriptors. | stable-candidate |
| `n:world:feature:atmosphere` | `n:world:feature` | Own semantic cloud, fog, wind, thermal, precipitation, and visibility feature descriptors. | stable-candidate |
| `n:world:navigation` | `n:world` | Own renderer-neutral navigation graphs, path queries, route fields, and landmark guidance. | stable-candidate |
| `n:world:navigation:navmesh` | `n:world:navigation` | Own deterministic 2D navigation cells, portals, and 3D waypoint graphs derived from walkability. | stable-candidate |
| `n:world:navigation:pathfinding` | `n:world:navigation` | Own deterministic path requests, A* resolution, results, and graph adapters. | stable-candidate |
| `n:world:navigation:route-field` | `n:world:navigation` | Own generic route marker and corridor descriptors plus deterministic proximity queries. | stable-candidate |
| `n:world:navigation:landmark-guidance` | `n:world:navigation` | Own reusable landmark discovery, reach, completion, priority, and proximity state. | stable-candidate |
| `n:world:generation` | `n:world` | Own deterministic generic region, connector, point, graph, and walkability generation. | stable-candidate |
| `n:world:terrain` | `n:world` | Own deterministic terrain layer evaluation, sampling, cell preparation, streaming state, and portable cell evidence. | stable-candidate |
| `n:world:water-surface` | `n:world` | Own renderer-neutral water zones, currents, drag, depth, wave phase, hazards, and spatial queries. | stable-candidate |

## Atomic Kits

| Kit | Domain | Public subpath | Responsibility |
| --- | --- | --- | --- |
| `actor-registry-kit` | `n:actor` | `nexusengine/domains/actor/registry` | Own neutral actor identities and embodiment references. |
| `creature-registry-kit` | `n:actor:creature` | `nexusengine/domains/actor/creature` | Register and resolve neutral creature embodiment definitions. |
| `character-registry-kit` | `n:actor:character` | `nexusengine/domains/actor/character` | Register and resolve active embodied character descriptors. |
| `player-authority-kit` | `n:actor:player` | `nexusengine/domains/actor/player` | Track player identity, possession, control authority, and spawn generations. |
| `agent-cycle-kit` | `n:agent` | `nexusengine/domains/agent/cycle` | Record observations, action proposals, decision cycles, and execution receipts. |
| `asset-registry-kit` | `n:asset` | `nexusengine/domains/asset/registry` | Resolve asset manifests and bundles through content-addressed provider jobs. |
| `project-source-kit` | `n:build:source` | `nexusengine/domains/build/source/project-source` | Read a deterministic project inventory without following links or mutating source. |
| `source-fingerprint-kit` | `n:build:source` | `nexusengine/domains/build/source/source-fingerprint` | Create the canonical SHA-256 project fingerprint. |
| `dependency-source-kit` | `n:build:source` | `nexusengine/domains/build/source/dependency-source` | Resolve exact dependency source identities and recursive lockfile closure. |
| `source-cache-kit` | `n:build:source` | `nexusengine/domains/build/source/source-cache` | Store and verify immutable source bytes by SHA-256. |
| `module-graph-kit` | `n:build:source` | `nexusengine/domains/build/source/module-graph` | Build a deterministic AST-derived module graph. |
| `javascript-ast-kit` | `n:build:analysis` | `nexusengine/domains/build/analysis/javascript-ast` | Parse JavaScript and TypeScript with a real compiler AST. |
| `type-analysis-kit` | `n:build:analysis` | `nexusengine/domains/build/analysis/type-analysis` | Run typed compiler diagnostics without emitting or mutating source. |
| `effect-analysis-kit` | `n:build:analysis` | `nexusengine/domains/build/analysis/effect-analysis` | Classify ambient capabilities and unsupported dynamic effects from AST nodes. |
| `dependency-analysis-kit` | `n:build:analysis` | `nexusengine/domains/build/analysis/dependency-analysis` | Prove relative and external dependency closure. |
| `kit-ir-kit` | `n:build:ir` | `nexusengine/domains/build/ir/kit-ir` | Create serializable high-level Kit IR with source lineage. |
| `execution-ir-kit` | `n:build:ir` | `nexusengine/domains/build/ir/execution-ir` | Create deterministic dependency-ordered Execution IR. |
| `ir-validation-kit` | `n:build:ir` | `nexusengine/domains/build/ir/ir-validation` | Reject invalid, cyclic, unsupported, or incomplete IR. |
| `source-map-kit` | `n:build:ir` | `nexusengine/domains/build/ir/source-map` | Map generated execution operations to source AST identities. |
| `portability-classifier-kit` | `n:build:classification` | `nexusengine/domains/build/classification/portability-classifier` | Classify each whole module and composition as native, native-adapter, JavaScript, or unsupported. |
| `capability-resolution-kit` | `n:build:classification` | `nexusengine/domains/build/classification/capability-resolution` | Resolve target capabilities and exact reviewed substitutions. |
| `fallback-selection-kit` | `n:build:classification` | `nexusengine/domains/build/classification/fallback-selection` | Select fail-closed whole-Kit fallback per target and profile. |
| `build-request-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-request` | Normalize one project, profile, options, and target set. |
| `target-set-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/target-set` | Normalize repeated target flags into one sorted unique set. |
| `build-plan-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-plan` | Create the immutable deterministic multi-target plan hash. |
| `build-approval-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-approval` | Require approval for the exact unchanged plan hash. |
| `build-execution-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-execution` | Execute shared stages once and isolated target stages with project immutability proof. |
| `build-receipt-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-receipt` | Persist aggregate and per-target exactly-once Build receipts. |
| `rust-lowering-kit` | `n:build:compile` | `nexusengine/domains/build/compile/rust-lowering` | Lower supported Execution IR into deterministic Rust source. |
| `javascript-fallback-kit` | `n:build:compile` | `nexusengine/domains/build/compile/javascript-fallback` | Execute capability-restricted whole-Kit QuickJS-NG fallback. |
| `runtime-abi-kit` | `n:build:compile` | `nexusengine/domains/build/compile/runtime-abi` | Define the stable native runtime handle and batch-operation ABI. |
| `native-runtime-link-kit` | `n:build:compile` | `nexusengine/domains/build/compile/native-runtime-link` | Create exact generated-runtime and native-library link plans. |
| `toolchain-source-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/toolchain-source` | Own immutable official toolchain and native dependency source records. |
| `toolchain-discovery-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/toolchain-discovery` | Discover installed toolchains without shell evaluation. |
| `toolchain-provision-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/toolchain-provision` | Provision approved exact official sources on demand after integrity and license checks. |
| `isolated-stage-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/isolated-stage` | Create content-addressed build stages outside projects. |
| `process-execution-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/process-execution` | Run argument-array commands inside an allowed Build stage. |
| `target-registry-kit` | `n:build:target` | `nexusengine/domains/build/target/target-registry` | Register explicit target providers and reject collisions. |
| `web-live-target-kit` | `n:build:target:web-live` | `nexusengine/domains/build/target/web-live/web-live-target` | Emit verified live ESM source, loader, service worker, and cache policy. |
| `web-static-target-kit` | `n:build:target:web-static` | `nexusengine/domains/build/target/web-static/web-static-target` | Emit a self-contained static Web directory. |
| `openxr-runtime-kit` | `n:build:target:openxr` | `nexusengine/domains/build/target/openxr/openxr-runtime` | Own OpenXR loader, session, spaces, frame timing, and lifecycle contracts. |
| `openxr-input-kit` | `n:build:target:openxr` | `nexusengine/domains/build/target/openxr/openxr-input` | Own OpenXR action sets, bindings, haptics, and input snapshots. |
| `openxr-render-kit` | `n:build:target:openxr` | `nexusengine/domains/build/target/openxr/openxr-render` | Own OpenXR views, swapchains, blend modes, and per-eye submission descriptors. |
| `android-xr-target-kit` | `n:build:target:android-xr` | `nexusengine/domains/build/target/android-xr/android-xr-target` | Own Android ARM64 lifecycle, SDK/NDK, Gradle, APK, and OpenXR binding stages. |
| `pcvr-target-kit` | `n:build:target:pcvr` | `nexusengine/domains/build/target/pcvr/pcvr-target` | Own Windows x64 host, OpenXR loader, executable package, and runtime validation stages. |
| `artifact-cache-kit` | `n:build:artifact` | `nexusengine/domains/build/artifact/artifact-cache` | Reuse successful immutable target artifacts by plan identity. |
| `artifact-manifest-kit` | `n:build:artifact` | `nexusengine/domains/build/artifact/artifact-manifest` | Create canonical per-target artifact manifests. |
| `artifact-integrity-kit` | `n:build:artifact` | `nexusengine/domains/build/artifact/artifact-integrity` | Verify every artifact file against SHA-256. |
| `artifact-output-kit` | `n:build:artifact` | `nexusengine/domains/build/artifact/artifact-output` | Publish immutable artifacts only outside source projects. |
| `project-immutability-kit` | `n:build:proof` | `nexusengine/domains/build/proof/project-immutability` | Compare before and after project fingerprints byte-for-byte. |
| `cross-runtime-parity-kit` | `n:build:proof` | `nexusengine/domains/build/proof/cross-runtime-parity` | Compare canonical replay outputs across target runtimes. |
| `target-validation-kit` | `n:build:proof` | `nexusengine/domains/build/proof/target-validation` | Require target-specific executable artifact validation. |
| `web-module-linker-kit` | `n:build:compile` | `nexusengine/domains/build/compile/web-module-linker` | Materialize a verified, content-addressed browser module closure from immutable project sources. |
| `composition-registry-kit` | `n:composition` | `nexusengine/domains/composition/registry` | Maintain normalized composition metadata and produce deterministic plans and receipts. |
| `compute-graph-kit` | `n:compute` | `nexusengine/domains/compute/graph` | Validate compute descriptors and create deterministic dependency-ordered dispatch plans. |
| `model-registry-kit` | `n:compute:model` | `nexusengine/domains/compute/model` | Register model descriptors and normalize provider-neutral inference requests and results. |
| `diagnostics-kit` | `n:diagnostics` | `nexusengine/domains/diagnostics/runtime` | Collect serializable telemetry, runtime health, determinism, and performance evidence. |
| `debug-descriptor-kit` | `n:diagnostics` | `nexusengine/domains/diagnostics/debug` | Record renderer-neutral rays, markers, scalars, and capture packets for diagnostics. |
| `debug-draw-descriptor-kit` | `n:diagnostics` | `nexusengine/domains/diagnostics/debug-draw` | Create stateless renderer-neutral debug draw descriptors. |
| `host-capability-kit` | `n:host` | `nexusengine/domains/host/capabilities` | Describe available host capabilities and select declarative fallback modes. |
| `interaction-kit` | `n:interaction` | `nexusengine/domains/interaction/runtime` | Manage interaction targets, affordances, activation, and results. |
| `input-contract-kit` | `n:interaction:input` | `nexusengine/domains/interaction/input` | Normalize semantic input actions, axes, contexts, and bindings. |
| `assistance-target-kit` | `n:interaction:assistance-target` | `nexusengine/domains/interaction/assistance-target` | Own assistance target urgency, attachment, terminal completion, loss, and deterministic selection. |
| `environmental-affordance-kit` | `n:interaction:environmental-affordance` | `nexusengine/domains/interaction/environmental-affordance` | Own read-only affordance proximity queries and exact-once activation progress. |
| `request-queue-kit` | `n:interaction:request:queue` | `nexusengine/domains/interaction/request/queue` | Own deterministic queued requests, patience, fulfillment, expiry, and portable effect descriptors. |
| `request-fulfillment-kit` | `n:interaction:request:fulfillment` | `nexusengine/domains/interaction/request/fulfillment` | Own spatial request destinations, deadlines, completion, expiry, and reward totals. |
| `transfer-zone-kit` | `n:interaction:transfer-zone` | `nexusengine/domains/interaction/transfer-zone` | Own accepted types, dwell, capacity, occupancy, and exact-once transfer completions. |
| `occupant-request-adapter-kit` | `n:interaction:request:queue` | `nexusengine/domains/interaction/adapters/occupant-request` | Translate Occupant Flow need records into exact-once Request Queue entries. |
| `transport-request-adapter-kit` | `n:interaction:request:queue` | `nexusengine/domains/interaction/adapters/transport-request` | Translate Transport Route arrivals into exact-once Request Queue fulfillment commands. |
| `request-economy-adapter-kit` | `n:interaction:request:queue` | `nexusengine/domains/interaction/adapters/request-economy` | Translate fulfilled or expired Request Queue outcomes into exact-once Economy transactions. |
| `mcp-registry-kit` | `n:mcp` | `nexusengine/domains/mcp/registry` | Register and dispatch schema-valid MCP providers through an explicit authorization boundary. |
| `network-contract-kit` | `n:network` | `nexusengine/domains/network/contracts` | Describe network sessions, messages, authority, and synchronization without owning transport. |
| `object-registry-kit` | `n:object` | `nexusengine/domains/object/registry` | Own object identity and renderer-neutral lifecycle records. |
| `object-shape-kit` | `n:object:shape` | `nexusengine/domains/object/shape` | Derive and qualify renderer-neutral geometric shape candidates. |
| `object-fidelity-kit` | `n:object:fidelity` | `nexusengine/domains/object/fidelity` | Package and select valid object fidelity forms. |
| `object-vegetation-kit` | `n:object:vegetation` | `nexusengine/domains/object/vegetation` | Own deterministic plant species, instances, and lifecycle state. |
| `object-tree-kit` | `n:object:vegetation:tree` | `nexusengine/domains/object/vegetation/tree` | Produce deterministic tree structure, canopy, growth, and fidelity descriptors. |
| `object-foliage-kit` | `n:object:vegetation:foliage` | `nexusengine/domains/object/vegetation/foliage` | Produce deterministic foliage structures and descriptors. |
| `object-vegetation-ecology-kit` | `n:object:vegetation:ecology` | `nexusengine/domains/object/vegetation/ecology` | Score vegetation suitability and select species deterministically. |
| `object-placement-kit` | `n:object:placement` | `nexusengine/domains/object/placement` | Create, validate, and replay deterministic object placement receipts. |
| `object-meshoptimizer-shape-provider-kit` | `n:object:shape` | `nexusengine/domains/object/shape/meshoptimizer-provider` | Resolve object shape jobs through an explicitly registered meshoptimizer-compatible provider. |
| `object-shape-fidelity-adapter-kit` | `n:object:fidelity` | `nexusengine/domains/object/adapters/shape-fidelity` | Translate qualified shape records into Object Fidelity form requests. |
| `object-vegetation-bridge-kit` | `n:object:vegetation` | `nexusengine/domains/object/adapters/vegetation-object` | Project vegetation identities into canonical Object descriptors without owning either state. |
| `policy-kit` | `n:policy` | `nexusengine/domains/policy/guard` | Evaluate declarative runtime safety and permission rules. |
| `presentation-registry-kit` | `n:presentation` | `nexusengine/domains/presentation/registry` | Register renderer-neutral presentation capabilities and descriptors. |
| `presentation-output-kit` | `n:presentation:output` | `nexusengine/domains/presentation/output` | Calculate renderer-neutral surfaces, safe areas, viewports, aspect policy, and render resolution. |
| `graphics-descriptor-kit` | `n:presentation:graphics` | `nexusengine/domains/presentation/graphics` | Create renderer-neutral material, lighting, VFX, quality, batch, and terrain LOD descriptors. |
| `render-layer-graph-kit` | `n:presentation:graphics` | `nexusengine/domains/presentation/graphics/render-graph` | Validate renderer-neutral render layers, dependencies, and pass ordering. |
| `reflection-descriptor-kit` | `n:presentation:graphics` | `nexusengine/domains/presentation/graphics/reflection` | Describe renderer-neutral reflection probes, plans, and update policy. |
| `camera-descriptor-kit` | `n:presentation:camera` | `nexusengine/domains/presentation/camera` | Manage camera targets, modes, smoothing, and renderer-neutral camera policy. |
| `camera-framing-kit` | `n:presentation:camera` | `nexusengine/domains/presentation/camera/framing` | Calculate perspective and orthographic subject framing for a viewport. |
| `camera-control-math-kit` | `n:presentation:camera` | `nexusengine/domains/presentation/camera/control-math` | Calculate camera-relative yaw, orbit limits, and root handoff state. |
| `animation-descriptor-kit` | `n:presentation:animation` | `nexusengine/domains/presentation/animation` | Manage animation clips, poses, blends, transitions, and timeline descriptors. |
| `rig-transform-kit` | `n:presentation:animation` | `nexusengine/domains/presentation/animation/rig` | Create neutral joint, limb, and rig transform descriptors. |
| `audio-descriptor-kit` | `n:presentation:audio` | `nexusengine/domains/presentation/audio` | Manage renderer-neutral audio cues, mix groups, volume policy, and spatial audio descriptors. |
| `ui-descriptor-kit` | `n:presentation:ui` | `nexusengine/domains/presentation/ui` | Manage renderer-neutral UI, focus, selection, prompt, notification, and accessibility descriptors. |
| `ui-scale-kit` | `n:presentation:ui` | `nexusengine/domains/presentation/ui/scale` | Calculate deterministic reference-resolution and UI scale policy. |
| `speech-contract-kit` | `n:presentation:speech` | `nexusengine/domains/presentation/speech` | Manage provider-neutral speech requests, voices, utterance lifecycle, and synthesis results. |
| `capture-contract-kit` | `n:presentation:capture` | `nexusengine/domains/presentation/capture` | Manage observation requests, view sets, framing, capture jobs, progress, and result contracts. |
| `sky-descriptor-kit` | `n:presentation:sky` | `nexusengine/domains/presentation/sky` | Create generic sky, horizon, atmosphere, cloud, and celestial descriptors. |
| `third-person-camera-kit` | `n:presentation:camera:third-person` | `nexusengine/domains/presentation/camera/third-person` | Produce deterministic renderer-neutral third-person camera descriptors from public Character and Motion bindings. |
| `camera-world-occlusion-adapter-kit` | `n:presentation:camera:third-person` | `nexusengine/domains/presentation/adapters/camera-world-occlusion` | Constrain Third-Person Camera descriptors with public terrain and physics query results without owning camera or world state. |
| `runtime-lifecycle-kit` | `n:runtime` | `nexusengine/domains/runtime/lifecycle` | Own deterministic runtime lifecycle and Kit installation receipts. |
| `realtime-runtime-kit` | `n:runtime:realtime` | `nexusengine/domains/runtime/realtime` | Create deterministic realtime frame context and phase execution. |
| `runtime-data-kit` | `n:runtime:data` | `nexusengine/domains/runtime/data` | Provide deterministic schemas, snapshots, selectors, migrations, and data envelopes. |
| `transaction-ledger-kit` | `n:runtime:transaction` | `nexusengine/domains/runtime/transaction` | Record repeat-safe operation keys and immutable transaction receipts. |
| `persistence-contract-kit` | `n:runtime:persistence` | `nexusengine/domains/runtime/persistence` | Describe save/load targets, slots, recovery records, and persistence adapter contracts. |
| `runtime-sequence-kit` | `n:runtime:sequence` | `nexusengine/domains/runtime/sequence` | Install deterministic sequence node definitions and execution state. |
| `runtime-startup-kit` | `n:runtime:startup` | `nexusengine/domains/runtime/startup` | Coordinate deterministic startup preparation and readiness receipts. |
| `schedule-kit` | `n:runtime:sequence:schedule` | `nexusengine/domains/runtime/sequence/schedule` | Advance deterministic repeatable and one-shot elapsed-time schedules without losing residual time. |
| `simulation-state-kit` | `n:simulation` | `nexusengine/domains/simulation/runtime` | Manage deterministic simulation objectives, resources, hazards, timers, and resolution receipts. |
| `physics-contract-kit` | `n:simulation:physics` | `nexusengine/domains/simulation/physics` | Describe physical bodies, colliders, contacts, constraints, queries, and provider boundaries. |
| `articulated-physics-kit` | `n:simulation:physics:articulated` | `nexusengine/domains/simulation/physics/articulated` | Manage backend-neutral articulated body topology and joint dynamics state. |
| `motion-contract-kit` | `n:simulation:motion` | `nexusengine/domains/simulation/motion` | Manage intent-to-motion descriptors, trajectories, velocity state, and movement policies. |
| `two-bone-ik-kit` | `n:simulation:motion` | `nexusengine/domains/simulation/motion/two-bone-ik` | Solve deterministic two-bone inverse-kinematics poses. |
| `articulated-motion-kit` | `n:simulation:motion:articulated` | `nexusengine/domains/simulation/motion/articulated` | Create target poses, joint limits, articulation plans, and drive requests. |
| `articulated-motion-drive-adapter-kit` | `n:simulation:physics:articulated` | `nexusengine/domains/simulation/adapters/articulated-drive` | Translate articulated motion plans into backend-neutral physics drive requests. |
| `action-locomotion-kit` | `n:simulation:motion:locomotion` | `nexusengine/domains/simulation/motion/locomotion` | Convert action commands into deterministic renderer-neutral Motion intents and locomotion frames. |
| `vehicle-dynamics-kit` | `n:simulation:motion:vehicle` | `nexusengine/domains/simulation/motion/vehicle` | Advance deterministic vehicle motion, boost, bounds, and impact state without owning surface policy. |
| `world-contact-kit` | `n:simulation:physics:world-contact` | `nexusengine/domains/simulation/physics/world-contact` | Resolve portable world contact, slope, impact, stability, and correction records without implementing a physics backend. |
| `soft-respawn-kit` | `n:simulation:recovery:soft-respawn` | `nexusengine/domains/simulation/recovery/soft-respawn` | Produce exact-once coherent subject recovery records at configured portable points. |
| `economy-account-kit` | `n:simulation:economy:accounts` | `nexusengine/domains/simulation/economy/accounts` | Own finite account balances and exact-once portable economy transaction records. |
| `cargo-manifest-kit` | `n:simulation:economy:cargo` | `nexusengine/domains/simulation/economy/cargo` | Own portable cargo inventory, capacity, condition, pickup, deposit, and quota state. |
| `facility-operations-kit` | `n:simulation:operations:facility` | `nexusengine/domains/simulation/operations/facility` | Own deterministic facility capacity, condition, status, cycle, and portable output receipts. |
| `occupant-flow-kit` | `n:simulation:operations:occupant-flow` | `nexusengine/domains/simulation/operations/occupant-flow` | Own deterministic occupant spawning, patience, service, and abandonment state. |
| `transport-route-kit` | `n:simulation:operations:transport-route` | `nexusengine/domains/simulation/operations/transport-route` | Own deterministic stops, carriers, capacity, calls, travel progress, and arrival receipts. |
| `hazard-field-kit` | `n:simulation:hazard-field` | `nexusengine/domains/simulation/hazard-field` | Own deterministic bounded hazards, verified spawn identities, motion, and read-only collision queries. |
| `pursuit-pressure-kit` | `n:simulation:pursuit-pressure` | `nexusengine/domains/simulation/pursuit-pressure` | Own coherent pursuit distance, warning bands, caught state, recovery, and transition history. |
| `lifecycle-progression-kit` | `n:simulation:progression:lifecycle` | `nexusengine/domains/simulation/progression/lifecycle` | Own prerequisite-gated lifecycle start, timing, completion, and portable effect descriptors. |
| `locomotion-contact-response-adapter-kit` | `n:simulation:motion:locomotion` | `nexusengine/domains/simulation/adapters/locomotion-contact-response` | Translate Locomotion frames and World Contact results into corrected Motion frames without owning either state. |
| `vehicle-water-response-adapter-kit` | `n:simulation:motion:vehicle` | `nexusengine/domains/simulation/adapters/vehicle-water-response` | Translate Vehicle state and Water Surface queries into portable drag, current, and buoyancy responses. |
| `lifecycle-economy-adapter-kit` | `n:simulation:progression:lifecycle` | `nexusengine/domains/simulation/adapters/lifecycle-economy` | Translate accepted Lifecycle costs and Economy effects into exact-once Economy transactions. |
| `lifecycle-facility-adapter-kit` | `n:simulation:progression:lifecycle` | `nexusengine/domains/simulation/adapters/lifecycle-facility` | Translate accepted Lifecycle facility effects into exact-once Facility Operations commands. |
| `facility-economy-adapter-kit` | `n:simulation:operations:facility` | `nexusengine/domains/simulation/adapters/facility-economy` | Translate Facility output and upkeep receipts into exact-once Economy transactions. |
| `spatial-contract-kit` | `n:spatial` | `nexusengine/domains/spatial/contracts` | Describe transforms, bounds, zones, spaces, and spatial query requests. |
| `spatial-angle-math-kit` | `n:spatial` | `nexusengine/domains/spatial/angle-math` | Normalize, compare, and interpolate angular values. |
| `spatial-vector-math-kit` | `n:spatial` | `nexusengine/domains/spatial/vector-math` | Create and operate on renderer-neutral vector values. |
| `spatial-transform-math-kit` | `n:spatial` | `nexusengine/domains/spatial/transform-math` | Calculate deterministic transforms, bases, interpolation, and planar projections. |
| `spatial-quaternion-math-kit` | `n:spatial` | `nexusengine/domains/spatial/quaternion-math` | Create, compose, normalize, rotate, and interpolate quaternions. |
| `spatial-scale-kit` | `n:spatial:scale` | `nexusengine/domains/spatial/scale` | Manage deterministic subject scale, scale anchors, proximity bands, and scale transitions. |
| `world-state-kit` | `n:world` | `nexusengine/domains/world/runtime` | Manage world identity, cells, partitions, surfaces, and deterministic assembly state. |
| `scene-lifecycle-kit` | `n:world:scene` | `nexusengine/domains/world/scene` | Manage host-neutral scene identity, lifecycle, transitions, bindings, and snapshots. |
| `weather-state-kit` | `n:world:weather` | `nexusengine/domains/world/weather` | Manage deterministic weather conditions, tendencies, regions, and sampling. |
| `layered-weather-kit` | `n:world:weather` | `nexusengine/domains/world/weather/layers` | Compose and evolve deterministic altitude-aware weather layers. |
| `world-foundation-kit` | `n:world:foundation` | `nexusengine/domains/world/foundation` | Compose deterministic world foundation definitions, contributions, sampling, and cell resolution. |
| `world-feature-kit` | `n:world:feature` | `nexusengine/domains/world/feature` | Manage semantic world feature definitions, registry, lifecycle, queries, and composition. |
| `semantic-world-feature-kit` | `n:world:feature` | `nexusengine/domains/world/feature/semantic` | Create one semantic world feature Domain Service Kit from a bounded feature specification. |
| `landform-feature-kit` | `n:world:feature:landform` | `nexusengine/domains/world/feature/landform` | Create semantic elevation and landform feature descriptors and lifecycle state. |
| `hydrology-feature-kit` | `n:world:feature:hydrology` | `nexusengine/domains/world/feature/hydrology` | Create semantic watershed, water path, water body, and wetland feature descriptors. |
| `ecology-feature-kit` | `n:world:feature:ecology` | `nexusengine/domains/world/feature/ecology` | Create semantic biome, habitat, vegetation-region, and ecotone feature descriptors. |
| `settlement-feature-kit` | `n:world:feature:settlement` | `nexusengine/domains/world/feature/settlement` | Create semantic settlement, route, structure, and infrastructure feature descriptors. |
| `atmosphere-feature-kit` | `n:world:feature:atmosphere` | `nexusengine/domains/world/feature/atmosphere` | Create semantic cloud, fog, wind, thermal, precipitation, and visibility feature descriptors. |
| `navmesh-kit` | `n:world:navigation:navmesh` | `nexusengine/domains/world/navigation/navmesh` | Build deterministic 2D navigation meshes and portable 3D waypoint graphs from walkability. |
| `pathfinding-kit` | `n:world:navigation:pathfinding` | `nexusengine/domains/world/navigation/pathfinding` | Resolve deterministic A* path requests over portable grid and navigation graph adapters. |
| `route-field-kit` | `n:world:navigation:route-field` | `nexusengine/domains/world/navigation/route-field` | Manage reusable route marker and corridor descriptors plus pure proximity queries. |
| `landmark-guidance-kit` | `n:world:navigation:landmark-guidance` | `nexusengine/domains/world/navigation/landmark-guidance` | Manage deterministic landmark discovery, reach, completion, priority, and proximity state. |
| `procedural-generation-kit` | `n:world:generation` | `nexusengine/domains/world/generation` | Generate deterministic generic regions, connectors, points, graphs, and walkability from complete normalized configuration. |
| `terrain-kit` | `n:world:terrain` | `nexusengine/domains/world/terrain` | Evaluate deterministic terrain layers and manage portable sampled terrain cells without rendering ownership. |
| `water-surface-kit` | `n:world:water-surface` | `nexusengine/domains/world/water-surface` | Manage renderer-neutral water zones, currents, drag, wave phase, hazards, and pure queries. |

---

<a id="ownership-ledger"></a>

# Kit Ownership Ledger

Generated from Domain manifest v2 and the production source inventory. Null compliance fields are intentionally unproven; they are never inferred as true.

Registry SHA-256: `c8cfad63537117f9464ebbb502fed5daa1034c8226da1e9c0fce4513ab8104a2`

- Source modules: 831
- Manifest-proven public atoms: 159
- Manifest-owned internal modules: 647
- Root contract modules: 25
- Unreviewed modules: 0
- Violations: 0

| Path | Owner | Review | Destination |
| --- | --- | --- | --- |
| `src/core-domains/actor/domain.manifest.js` | `n:actor` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/actor/index.js` | `n:actor` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/actor/kits/actor-registry-kit/index.js` | `n:actor` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/actor/subdomains/character/index.js` | `n:actor` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/actor/subdomains/character/kits/character-kit/contracts.js` | `n:actor` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/actor/subdomains/character/kits/character-kit/index.js` | `n:actor` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/actor/subdomains/creature/index.js` | `n:actor` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/actor/subdomains/creature/kits/creature-kit/contracts.js` | `n:actor` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/actor/subdomains/creature/kits/creature-kit/index.js` | `n:actor` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/actor/subdomains/player/index.js` | `n:actor` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/actor/subdomains/player/kits/player-kit/contracts.js` | `n:actor` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/actor/subdomains/player/kits/player-kit/index.js` | `n:actor` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/agent/domain.manifest.js` | `n:agent` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/agent/index.js` | `n:agent` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/agent/kits/agent-kit/action-proposals.js` | `n:agent` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/agent/kits/agent-kit/adapters.js` | `n:agent` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/agent/kits/agent-kit/agent-state.js` | `n:agent` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/agent/kits/agent-kit/decision-cycle.js` | `n:agent` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/agent/kits/agent-kit/execution-ledger.js` | `n:agent` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/agent/kits/agent-kit/index.js` | `n:agent` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/agent/kits/agent-kit/observations.js` | `n:agent` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/asset/domain.manifest.js` | `n:asset` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/asset/index.js` | `n:asset` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/asset/kits/asset-kit/cache-provider.js` | `n:asset` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/asset/kits/asset-kit/descriptors.js` | `n:asset` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/asset/kits/asset-kit/index.js` | `n:asset` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/asset/kits/asset-kit/provider.js` | `n:asset` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/adapters/mcp/build-mcp-provider.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/atomic-kit.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/domain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/kit-manifests.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/manifest-input.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomain-manifests.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/dependency-analysis-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/dependency-analysis-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/dependency-analysis-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/dependency-analysis-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/dependency-analysis-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/effect-analysis-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/effect-analysis-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/effect-analysis-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/effect-analysis-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/effect-analysis-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/javascript-ast-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/javascript-ast-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/javascript-ast-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/javascript-ast-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/javascript-ast-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/type-analysis-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/type-analysis-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/type-analysis-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/type-analysis-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/kits/type-analysis-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/analysis/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-cache-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-cache-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-cache-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-cache-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-cache-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-integrity-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-integrity-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-integrity-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-integrity-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-integrity-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-manifest-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-manifest-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-manifest-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-manifest-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-manifest-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-output-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-output-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-output-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-output-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/kits/artifact-output-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/artifact/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/capability-resolution-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/capability-resolution-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/capability-resolution-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/capability-resolution-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/capability-resolution-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/fallback-selection-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/fallback-selection-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/fallback-selection-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/fallback-selection-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/fallback-selection-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/portability-classifier-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/portability-classifier-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/portability-classifier-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/portability-classifier-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/kits/portability-classifier-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/classification/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/javascript-fallback-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/javascript-fallback-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/javascript-fallback-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/javascript-fallback-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/javascript-fallback-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/native-runtime-link-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/native-runtime-link-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/native-runtime-link-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/native-runtime-link-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/native-runtime-link-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/runtime-abi-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/runtime-abi-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/runtime-abi-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/runtime-abi-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/runtime-abi-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/rust-lowering-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/rust-lowering-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/rust-lowering-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/rust-lowering-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/rust-lowering-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/web-module-linker-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/web-module-linker-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/web-module-linker-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/web-module-linker-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/kits/web-module-linker-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/compile/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/execution-ir-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/execution-ir-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/execution-ir-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/execution-ir-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/execution-ir-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/ir-validation-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/ir-validation-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/ir-validation-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/ir-validation-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/ir-validation-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/kit-ir-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/kit-ir-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/kit-ir-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/kit-ir-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/kit-ir-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/source-map-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/source-map-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/source-map-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/source-map-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/kits/source-map-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/ir/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-approval-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-approval-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-approval-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-approval-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-approval-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-execution-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-execution-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-execution-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-execution-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-execution-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-plan-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-plan-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-plan-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-plan-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-plan-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-receipt-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-receipt-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-receipt-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-receipt-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-receipt-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-request-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-request-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-request-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-request-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/build-request-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/target-set-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/target-set-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/target-set-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/target-set-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/kits/target-set-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/orchestration/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/cross-runtime-parity-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/cross-runtime-parity-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/cross-runtime-parity-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/cross-runtime-parity-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/cross-runtime-parity-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/project-immutability-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/project-immutability-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/project-immutability-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/project-immutability-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/project-immutability-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/target-validation-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/target-validation-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/target-validation-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/target-validation-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/kits/target-validation-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/proof/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/dependency-source-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/dependency-source-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/dependency-source-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/dependency-source-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/dependency-source-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/module-graph-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/module-graph-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/module-graph-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/module-graph-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/module-graph-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/project-source-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/project-source-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/project-source-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/project-source-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/project-source-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-cache-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-cache-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-cache-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-cache-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-cache-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-fingerprint-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-fingerprint-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-fingerprint-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-fingerprint-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/kits/source-fingerprint-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/source/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/kits/target-registry-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/kits/target-registry-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/target/kits/target-registry-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/kits/target-registry-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/kits/target-registry-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/native-target-helpers.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/android-xr/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/android-xr/kits/android-xr-target-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/android-xr/kits/android-xr-target-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/android-xr/kits/android-xr-target-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/android-xr/kits/android-xr-target-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/android-xr/kits/android-xr-target-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/android-xr/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-input-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-input-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-input-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-input-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-input-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-render-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-render-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-render-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-render-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-render-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-runtime-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-runtime-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-runtime-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-runtime-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-runtime-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/openxr/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/pcvr/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/pcvr/kits/pcvr-target-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/pcvr/kits/pcvr-target-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/pcvr/kits/pcvr-target-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/pcvr/kits/pcvr-target-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/pcvr/kits/pcvr-target-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/pcvr/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-live/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-live/kits/web-live-target-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-live/kits/web-live-target-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-live/kits/web-live-target-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-live/kits/web-live-target-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-live/kits/web-live-target-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-live/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-static/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-static/kits/web-static-target-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-static/kits/web-static-target-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-static/kits/web-static-target-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-static/kits/web-static-target-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-static/kits/web-static-target-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/subdomains/web-static/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/target/web-target-helpers.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/index.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/isolated-stage-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/isolated-stage-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/isolated-stage-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/isolated-stage-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/isolated-stage-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/process-execution-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/process-execution-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/process-execution-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/process-execution-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/process-execution-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-discovery-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-discovery-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-discovery-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-discovery-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-discovery-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-provision-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-provision-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-provision-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-provision-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-provision-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-source-kit/contracts.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-source-kit/index.js` | `n:build` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-source-kit/kit.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-source-kit/services.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/kits/toolchain-source-kit/state.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/build/subdomains/toolchain/subdomain.manifest.js` | `n:build` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/catalog.js` | `n:composition` | manifest-infrastructure | NexusEngine Core |
| `src/core-domains/composition/adapters/mcp/composition-mcp-provider.js` | `n:composition` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/composition/adapters/mcp/generated-guide-resources.js` | `n:composition` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/composition/domain.manifest.js` | `n:composition` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/composition/index.js` | `n:composition` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/composition/kits/composition-registry-kit/composition-tree.js` | `n:composition` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/composition/kits/composition-registry-kit/index.js` | `n:composition` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/composition/kits/composition-registry-kit/registry.js` | `n:composition` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/composition/kits/composition-registry-kit/services.js` | `n:composition` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/composition/recipes/restored-behavior-recipes.js` | `n:composition` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/composition/services/composition-apply-controller.js` | `n:composition` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/compute/domain.manifest.js` | `n:compute` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/compute/index.js` | `n:compute` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/compute/kits/compute-kit/descriptors.js` | `n:compute` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/compute/kits/compute-kit/index.js` | `n:compute` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/compute/kits/compute-kit/provider.js` | `n:compute` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/compute/subdomains/model/kits/model-kit/adapters.js` | `n:compute` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/compute/subdomains/model/kits/model-kit/index.js` | `n:compute` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/compute/subdomains/model/kits/model-kit/inference-request.js` | `n:compute` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/compute/subdomains/model/kits/model-kit/inference-result.js` | `n:compute` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/compute/subdomains/model/kits/model-kit/model-descriptors.js` | `n:compute` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/compute/subdomains/model/kits/model-kit/model-registry.js` | `n:compute` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/diagnostics/domain.manifest.js` | `n:diagnostics` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/diagnostics/index.js` | `n:diagnostics` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/diagnostics/kits/debug-descriptor-kit/index.js` | `n:diagnostics` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/diagnostics/kits/debug-draw-kit.js` | `n:diagnostics` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/diagnostics/kits/diagnostics-kit/index.js` | `n:diagnostics` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/domain-kit.js` | `n:composition` | manifest-infrastructure | NexusEngine Core |
| `src/core-domains/domain-manifest.js` | `n:composition` | manifest-infrastructure | NexusEngine Core |
| `src/core-domains/host/domain.manifest.js` | `n:host` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/host/index.js` | `n:host` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/host/kits/host-capability-kit/index.js` | `n:host` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/index.js` | `n:composition` | manifest-infrastructure | NexusEngine Core |
| `src/core-domains/interaction/adapters/occupant-request-adapter-kit/contracts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/occupant-request-adapter-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/adapters/occupant-request-adapter-kit/kit.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/occupant-request-adapter-kit/services.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/occupant-request-adapter-kit/state.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/request-economy-adapter-kit/contracts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/request-economy-adapter-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/adapters/request-economy-adapter-kit/kit.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/request-economy-adapter-kit/services.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/request-economy-adapter-kit/state.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/transport-request-adapter-kit/contracts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/transport-request-adapter-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/adapters/transport-request-adapter-kit/kit.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/transport-request-adapter-kit/services.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/adapters/transport-request-adapter-kit/state.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/domain.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/index.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/kits/interaction-kit/activation.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/kits/interaction-kit/affordances.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/kits/interaction-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/kits/interaction-kit/prompts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/kits/interaction-kit/results.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/kits/interaction-kit/targets.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/restored-behavior-manifests.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/assistance-target/index.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/assistance-target/kits/assistance-target-kit/contracts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/assistance-target/kits/assistance-target-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/subdomains/assistance-target/kits/assistance-target-kit/kit.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/assistance-target/kits/assistance-target-kit/services.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/assistance-target/kits/assistance-target-kit/state.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/assistance-target/subdomain.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/environmental-affordance/index.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/environmental-affordance/kits/environmental-affordance-kit/contracts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/environmental-affordance/kits/environmental-affordance-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/subdomains/environmental-affordance/kits/environmental-affordance-kit/kit.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/environmental-affordance/kits/environmental-affordance-kit/services.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/environmental-affordance/kits/environmental-affordance-kit/state.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/environmental-affordance/subdomain.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/input/kits/input-kit/actions.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/input/kits/input-kit/adapters.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/input/kits/input-kit/bindings.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/input/kits/input-kit/contexts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/input/kits/input-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/subdomains/input/kits/input-kit/intent.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/index.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomain.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/fulfillment/index.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/fulfillment/kits/request-fulfillment-kit/contracts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/fulfillment/kits/request-fulfillment-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/fulfillment/kits/request-fulfillment-kit/kit.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/fulfillment/kits/request-fulfillment-kit/services.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/fulfillment/kits/request-fulfillment-kit/state.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/fulfillment/subdomain.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/queue/index.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/queue/kits/request-queue-kit/contracts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/queue/kits/request-queue-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/queue/kits/request-queue-kit/kit.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/queue/kits/request-queue-kit/services.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/queue/kits/request-queue-kit/state.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/request/subdomains/queue/subdomain.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/transfer-zone/index.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/transfer-zone/kits/transfer-zone-kit/contracts.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/transfer-zone/kits/transfer-zone-kit/index.js` | `n:interaction` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/interaction/subdomains/transfer-zone/kits/transfer-zone-kit/kit.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/transfer-zone/kits/transfer-zone-kit/services.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/transfer-zone/kits/transfer-zone-kit/state.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/interaction/subdomains/transfer-zone/subdomain.manifest.js` | `n:interaction` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/manifest-domain-service-kit.js` | `n:composition` | manifest-infrastructure | NexusEngine Core |
| `src/core-domains/manifest-input.js` | `n:composition` | manifest-infrastructure | NexusEngine Core |
| `src/core-domains/manifest-kit-contract.js` | `n:composition` | manifest-infrastructure | NexusEngine Core |
| `src/core-domains/mcp/adapters/node-mcp-sdk-adapter/index.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/contracts/contract-utilities.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/contracts/prompt-contract.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/contracts/provider-contract.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/contracts/resource-contract.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/contracts/result-contract.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/contracts/tool-contract.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/domain.manifest.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/index.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/kits/mcp-registry-kit/authorization.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/kits/mcp-registry-kit/index.js` | `n:mcp` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/mcp/kits/mcp-registry-kit/registry.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/mcp/state/registry-snapshot.js` | `n:mcp` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/network/domain.manifest.js` | `n:network` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/network/index.js` | `n:network` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/network/kits/network-kit/index.js` | `n:network` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/adapters/object-shape-fidelity-adapter-kit/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/contracts/object-descriptor.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/domain.manifest.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/index.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/kits/object-registry-kit/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/state/object-registry-state.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/fidelity/index.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/fidelity/kits/object-fidelity-kit/descriptors.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/fidelity/kits/object-fidelity-kit/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/subdomains/placement/contracts/placement-descriptor.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/placement/index.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/placement/kits/object-placement-kit/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/subdomains/placement/kits/object-placement-kit/placement-math.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/placement/kits/object-placement-kit/placement-operations.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/placement/kits/object-placement-kit/placement-validation.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/index.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/kits/object-shape-kit/descriptors.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/kits/object-shape-kit/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/kits/object-shape-kit/metrics.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/kits/object-shape-kit/profiles.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/kits/object-shape-kit/provider.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/kits/object-shape-kit/qualification.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/providers/meshoptimizer-shape-provider-kit/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/providers/meshoptimizer-shape-provider-kit/meshoptimizer-provider.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/shape/providers/meshoptimizer-shape-provider-kit/reference-provider.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/vegetation/adapters/vegetation-object-bridge-kit/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/subdomains/vegetation/index.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/vegetation/kits/object-vegetation-kit/contracts.js` | `n:object` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/object/subdomains/vegetation/kits/object-vegetation-kit/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/subdomains/vegetation/subdomains/ecology-domain/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/subdomains/vegetation/subdomains/foliage-domain/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/object/subdomains/vegetation/subdomains/tree-domain/index.js` | `n:object` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/policy/domain.manifest.js` | `n:policy` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/policy/index.js` | `n:policy` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/policy/kits/policy-kit/index.js` | `n:policy` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/adapters/camera-world-occlusion-adapter-kit/contracts.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/adapters/camera-world-occlusion-adapter-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/adapters/camera-world-occlusion-adapter-kit/kit.manifest.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/adapters/camera-world-occlusion-adapter-kit/services.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/adapters/camera-world-occlusion-adapter-kit/state.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/contracts.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/domain.manifest.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/index.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/kits/presentation-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/animation/kits/animation-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/animation/kits/rig-transform-kit.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/audio/kits/audio-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/kits/camera-control-kit.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/kits/camera-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/kits/camera-kit/smoothing.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/kits/framing-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/kits/framing-kit/orthographic-fit.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/kits/framing-kit/perspective-fit.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/subdomains/third-person/index.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/subdomains/third-person/kits/third-person-camera-kit/contracts.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/subdomains/third-person/kits/third-person-camera-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/subdomains/third-person/kits/third-person-camera-kit/kit.manifest.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/subdomains/third-person/kits/third-person-camera-kit/services.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/subdomains/third-person/kits/third-person-camera-kit/state.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/camera/subdomains/third-person/subdomain.manifest.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/capture/index.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/capture/kits/capture-kit/descriptors.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/capture/kits/capture-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/capture/kits/capture-kit/provider.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/index.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/adapters.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/instance-batches.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/lighting-descriptors.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/material-descriptors.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/procedural-material-descriptors.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/quality-profiles.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/reflection-kit/contract.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/reflection-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/render-descriptors.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/render-layer-graph-kit/contract.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/render-layer-graph-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/terrain-lod-descriptors.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/graphics/kits/graphics-kit/vfx-descriptors.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/output/kits/output-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/output/kits/output-kit/math.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/sky/kits/sky-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/speech/index.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/presentation/subdomains/speech/kits/speech-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/ui/kits/ui-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/ui/kits/ui-scale-kit/index.js` | `n:presentation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/presentation/subdomains/ui/kits/ui-scale-kit/math.js` | `n:presentation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/domain.manifest.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/index.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/kits/runtime-lifecycle-kit/index.js` | `n:runtime` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/runtime/subdomains/data/kits/data-kit/index.js` | `n:runtime` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/runtime/subdomains/data/kits/data-kit/ledger.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/data/kits/data-kit/migration.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/data/kits/data-kit/package-service.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/data/kits/data-kit/schema.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/data/kits/data-kit/selectors.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/data/kits/data-kit/services.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/data/kits/data-kit/snapshot.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/persistence/kits/persistence-kit/index.js` | `n:runtime` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/runtime/subdomains/realtime/contracts/surfaces.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/realtime/contracts/tick-context-scheduler.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/realtime/kits/realtime-kit/index.js` | `n:runtime` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/kits/sequence-kit/index.js` | `n:runtime` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/runtime/sequence-node-kit.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/runtime/sequence-node-library.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/runtime/sequence-node-runtime.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/runtime/sequence-runtime.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/subdomains/schedule/index.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/subdomains/schedule/kits/schedule-kit/contracts.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/subdomains/schedule/kits/schedule-kit/index.js` | `n:runtime` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/subdomains/schedule/kits/schedule-kit/kit.manifest.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/subdomains/schedule/kits/schedule-kit/services.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/subdomains/schedule/kits/schedule-kit/state.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/sequence/subdomains/schedule/subdomain.manifest.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/startup/core-assets-startup-bridge.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/startup/index.js` | `n:runtime` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/runtime/subdomains/startup/kits/startup-kit/index.js` | `n:runtime` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/runtime/subdomains/transaction/kits/transaction-ledger-kit/index.js` | `n:runtime` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/adapters/facility-economy-adapter-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/facility-economy-adapter-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/adapters/facility-economy-adapter-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/facility-economy-adapter-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/facility-economy-adapter-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-economy-adapter-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-economy-adapter-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-economy-adapter-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-economy-adapter-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-economy-adapter-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-facility-adapter-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-facility-adapter-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-facility-adapter-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-facility-adapter-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/lifecycle-facility-adapter-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/locomotion-contact-response-adapter-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/locomotion-contact-response-adapter-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/adapters/locomotion-contact-response-adapter-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/locomotion-contact-response-adapter-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/locomotion-contact-response-adapter-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/vehicle-water-response-adapter-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/vehicle-water-response-adapter-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/adapters/vehicle-water-response-adapter-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/vehicle-water-response-adapter-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/adapters/vehicle-water-response-adapter-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/domain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/kits/simulation-kit/checkpoints.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/kits/simulation-kit/hazards.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/kits/simulation-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/kits/simulation-kit/objectives.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/kits/simulation-kit/pressure.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/kits/simulation-kit/resolution.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/kits/simulation-kit/resources.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/kits/simulation-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/kits/simulation-kit/timers.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/restored-behavior-manifests.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/accounts/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/accounts/kits/economy-account-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/accounts/kits/economy-account-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/accounts/kits/economy-account-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/accounts/kits/economy-account-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/accounts/kits/economy-account-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/accounts/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/cargo/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/cargo/kits/cargo-manifest-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/cargo/kits/cargo-manifest-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/cargo/kits/cargo-manifest-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/cargo/kits/cargo-manifest-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/cargo/kits/cargo-manifest-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/economy/subdomains/cargo/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/hazard-field/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/hazard-field/kits/hazard-field-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/hazard-field/kits/hazard-field-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/hazard-field/kits/hazard-field-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/hazard-field/kits/hazard-field-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/hazard-field/kits/hazard-field-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/hazard-field/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/kits/motion-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/kits/motion-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/kits/two-bone-ik-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/articulated-motion-domain/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/articulated-motion-domain/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/locomotion/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/locomotion/kits/action-locomotion-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/locomotion/kits/action-locomotion-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/locomotion/kits/action-locomotion-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/locomotion/kits/action-locomotion-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/locomotion/kits/action-locomotion-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/locomotion/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/vehicle/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/vehicle/kits/vehicle-dynamics-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/vehicle/kits/vehicle-dynamics-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/vehicle/kits/vehicle-dynamics-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/vehicle/kits/vehicle-dynamics-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/vehicle/kits/vehicle-dynamics-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/motion/subdomains/vehicle/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/facility/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/facility/kits/facility-operations-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/facility/kits/facility-operations-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/facility/kits/facility-operations-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/facility/kits/facility-operations-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/facility/kits/facility-operations-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/facility/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/occupant-flow/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/occupant-flow/kits/occupant-flow-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/occupant-flow/kits/occupant-flow-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/occupant-flow/kits/occupant-flow-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/occupant-flow/kits/occupant-flow-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/occupant-flow/kits/occupant-flow-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/occupant-flow/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/transport-route/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/transport-route/kits/transport-route-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/transport-route/kits/transport-route-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/transport-route/kits/transport-route-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/transport-route/kits/transport-route-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/transport-route/kits/transport-route-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/operations/subdomains/transport-route/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/adapters/articulated-motion-drive-adapter/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/kits/physics-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/kits/physics-kit/provider.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/subdomains/articulated-dynamics-domain/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/subdomains/articulated-dynamics-domain/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/subdomains/world-contact/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/subdomains/world-contact/kits/world-contact-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/subdomains/world-contact/kits/world-contact-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/subdomains/world-contact/kits/world-contact-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/subdomains/world-contact/kits/world-contact-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/subdomains/world-contact/kits/world-contact-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/physics/subdomains/world-contact/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/progression/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/progression/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/progression/subdomains/lifecycle/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/progression/subdomains/lifecycle/kits/lifecycle-progression-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/progression/subdomains/lifecycle/kits/lifecycle-progression-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/progression/subdomains/lifecycle/kits/lifecycle-progression-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/progression/subdomains/lifecycle/kits/lifecycle-progression-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/progression/subdomains/lifecycle/kits/lifecycle-progression-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/progression/subdomains/lifecycle/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/pursuit-pressure/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/pursuit-pressure/kits/pursuit-pressure-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/pursuit-pressure/kits/pursuit-pressure-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/pursuit-pressure/kits/pursuit-pressure-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/pursuit-pressure/kits/pursuit-pressure-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/pursuit-pressure/kits/pursuit-pressure-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/pursuit-pressure/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/recovery/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/recovery/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/recovery/subdomains/soft-respawn/index.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/recovery/subdomains/soft-respawn/kits/soft-respawn-kit/contracts.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/recovery/subdomains/soft-respawn/kits/soft-respawn-kit/index.js` | `n:simulation` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/simulation/subdomains/recovery/subdomains/soft-respawn/kits/soft-respawn-kit/kit.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/recovery/subdomains/soft-respawn/kits/soft-respawn-kit/services.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/recovery/subdomains/soft-respawn/kits/soft-respawn-kit/state.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/simulation/subdomains/recovery/subdomains/soft-respawn/subdomain.manifest.js` | `n:simulation` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/spatial/domain.manifest.js` | `n:spatial` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/spatial/index.js` | `n:spatial` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/spatial/kits/angle-math-kit.js` | `n:spatial` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/spatial/kits/quaternion-math-kit.js` | `n:spatial` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/spatial/kits/spatial-kit/index.js` | `n:spatial` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/spatial/kits/transform-math-kit.js` | `n:spatial` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/spatial/kits/vector-math-kit.js` | `n:spatial` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/spatial/subdomains/scale/index.js` | `n:spatial` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/spatial/subdomains/scale/kits/spatial-scale-kit/contracts.js` | `n:spatial` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/spatial/subdomains/scale/kits/spatial-scale-kit/index.js` | `n:spatial` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/spatial/subdomains/scale/kits/spatial-scale-kit/kit.manifest.js` | `n:spatial` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/spatial/subdomains/scale/kits/spatial-scale-kit/services.js` | `n:spatial` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/spatial/subdomains/scale/kits/spatial-scale-kit/state.js` | `n:spatial` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/spatial/subdomains/scale/subdomain.manifest.js` | `n:spatial` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/adapters/terrain-provider-adapter/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/domain.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/kits/world-builder-runtime-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/kits/world-cell-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/kits/world-effect-provider-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/kits/world-partition-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/kits/world-surface-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/partitions/quadtree-partition-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/partitions/uniform-grid-partition-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/portable.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/preparation/world-patch-preparation-controller.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/restored-behavior-manifests.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/snapshot.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/generation/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/generation/kits/procedural-generation-kit/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/generation/kits/procedural-generation-kit/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/generation/kits/procedural-generation-kit/kit.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/generation/kits/procedural-generation-kit/services.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/generation/kits/procedural-generation-kit/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/generation/subdomain.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomain.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/landmark-guidance/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/landmark-guidance/kits/landmark-guidance-kit/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/landmark-guidance/kits/landmark-guidance-kit/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/landmark-guidance/kits/landmark-guidance-kit/kit.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/landmark-guidance/kits/landmark-guidance-kit/services.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/landmark-guidance/kits/landmark-guidance-kit/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/landmark-guidance/subdomain.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/navmesh/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/navmesh/kits/navmesh-kit/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/navmesh/kits/navmesh-kit/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/navmesh/kits/navmesh-kit/kit.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/navmesh/kits/navmesh-kit/services.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/navmesh/kits/navmesh-kit/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/navmesh/subdomain.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/pathfinding/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/pathfinding/kits/pathfinding-kit/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/pathfinding/kits/pathfinding-kit/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/pathfinding/kits/pathfinding-kit/kit.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/pathfinding/kits/pathfinding-kit/services.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/pathfinding/kits/pathfinding-kit/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/pathfinding/subdomain.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/route-field/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/route-field/kits/route-field-kit/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/route-field/kits/route-field-kit/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/route-field/kits/route-field-kit/kit.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/route-field/kits/route-field-kit/services.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/route-field/kits/route-field-kit/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/navigation/subdomains/route-field/subdomain.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/constants.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/descriptors.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/host-contract.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/ledgers.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/scene-registry.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/scene-transition-ledger.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/transitions.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/utils.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/terrain/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/terrain/kits/terrain-kit/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/terrain/kits/terrain-kit/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/terrain/kits/terrain-kit/kit.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/terrain/kits/terrain-kit/services.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/terrain/kits/terrain-kit/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/terrain/subdomain.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/water-surface/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/water-surface/kits/water-surface-kit/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/water-surface/kits/water-surface-kit/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/water-surface/kits/water-surface-kit/kit.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/water-surface/kits/water-surface-kit/services.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/water-surface/kits/water-surface-kit/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/water-surface/subdomain.manifest.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/weather/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/weather/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/weather/subdomains/layered-weather-domain/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/weather/weather-domain.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/kits/feature-composition-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/kits/feature-definition-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/kits/feature-lifecycle-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/kits/feature-query-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/kits/feature-registry-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/kits/semantic-feature-kit/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/snapshot.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/atmosphere-feature-domain/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/ecology-feature-domain/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/feature-family-domain-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/hydrology-feature-domain/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/landform-feature-domain/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/landform-feature-domain/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/landform-feature-domain/kits/canyon-feature-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/landform-feature-domain/kits/cliff-feature-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/landform-feature-domain/kits/landform-feature-kits.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/landform-feature-domain/kits/mountain-feature-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/landform-feature-domain/kits/plateau-feature-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/landform-feature-domain/landform-feature-domain.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/subdomains/settlement-feature-domain/index.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/validation.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-feature-domain/world-feature-domain.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/contracts.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/kits/foundation-cell-resolution-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/kits/foundation-composition-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/kits/foundation-definition-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/kits/foundation-sampling-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/snapshot.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/state.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/validation.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/subdomains/world-foundation-domain/world-foundation-domain.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/core-domains/world/surfaces/curved-horizon-surface-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/surfaces/flat-world-surface-kit/index.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/validation.js` | `n:world` | manifest-owned-internal | NexusEngine Core |
| `src/core-domains/world/world-domain.js` | `n:world` | manifest-proven-public-atom | NexusEngine Core |
| `src/domain-api.js` | `engine-root` | root-contract | NexusEngine minimal root |
| `src/domain-path.js` | `engine-root` | root-contract | NexusEngine minimal root |
| `src/domain-service-kit.js` | `engine-root` | root-contract | NexusEngine minimal root |
| `src/ecs.js` | `engine-root` | root-contract | NexusEngine minimal root |
| `src/engine.js` | `engine-root` | root-contract | NexusEngine minimal root |
| `src/foundation/completion-ledger.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/foundation/deterministic-replay.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/foundation/idempotency-ledger.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/foundation/index.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/foundation/progress-timer.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/foundation/promotion-guard.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/foundation/seeded-random.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/foundation/serializable-state.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/foundation/sha256.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/foundation/snapshot.js` | `engine-foundation` | root-contract | NexusEngine foundation |
| `src/index.js` | `engine-root` | root-contract | NexusEngine minimal root |
| `src/release.js` | `engine-root` | root-contract | NexusEngine minimal root |
| `src/runtime-kit.js` | `engine-root` | root-contract | NexusEngine minimal root |

---

<a id="root-migration-map"></a>

# NexusEngine 0.0.4 Root Module Dispositions

Source commit: `a9adca5b3620f996f00860358c4864dd4bdfa6d9`

This is a hard cutover. Removed modules are not forwarded by NexusEngine. Rebuild them from the named Core atoms in the owning package or game.

## Removed Exports From Retained Modules

| Source | Removed exports | Disposition | Replacement |
|---|---|---|---|
| `src/core-domains/compute/subdomains/model/kits/model-kit/index.js` | `createMockModelAdapter` | recipe-data | Inject createModelAdapterBoundary({ infer }) into createModelKit({ adapters }). |
| `src/core-domains/presentation/subdomains/sky/kits/sky-kit/index.js` | `CORE_SKYBOX_PRESETS` | recipe-data | Pass caller-owned preset data to createSkyDescriptorKit({ presets }) or registerPreset(). |
| `src/core-domains/presentation/subdomains/speech/kits/speech-kit/index.js` | `createTinyTTSAssetManifest`, `createTinyTTSProvider`, `registerTinyTTSAssets` | external-kit | Install a model, network, and asset implementation through createSpeechKit().registerProvider(). |
| `src/core-domains/presentation/subdomains/speech/kits/speech-kit/pocket-tts-provider.js` | `createPocketTTSAssetManifest`, `createPocketTTSHttpAssetProvider`, `createPocketTTSProvider`, `registerPocketTTSAssets` | external-kit | Install PocketTTS through createSpeechKit().registerProvider(). |

## Retired Source Modules

| Source | Disposition | Owner | Core requirements |
|---|---|---|---|
| `bin/nexus-editor.mjs` | external-kit | NexusEngine-Editor | `n:composition`, `n:host`, `n:mcp` |
| `src/action-movement-kit.js` | external-kit | NexusEngine-Kits | `n:actor`, `n:interaction:input`, `n:simulation:motion` |
| `src/assistance-target-kit.js` | external-kit | NexusEngine-Kits | `n:actor`, `n:interaction`, `n:object`, `n:simulation` |
| `src/cargo-manifest-kit.js` | external-kit | NexusEngine-Kits | `n:actor`, `n:object`, `n:runtime:data`, `n:runtime:transaction` |
| `src/character-camera-kit.js` | external-kit | NexusEngine-Kits | `n:actor:character`, `n:presentation:camera`, `n:spatial` |
| `src/common-game-definitions.js` | recipe-data | NexusEngine-Kits recipes | `n:actor`, `n:interaction`, `n:simulation` |
| `src/core-domains/compute/subdomains/model/kits/model-kit/mock-model-adapter.js` | recipe-data | NexusEngine tests | `n:compute:model` |
| `src/core-domains/presentation/subdomains/speech/kits/speech-kit/pocket-tts-provider.js` | external-kit | NexusEngine-Kits adapters | `n:asset`, `n:compute:model`, `n:presentation:speech` |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/hosts/headless-scene-host.js` | external-kit | NexusEngine-Editor adapters | `n:host`, `n:world:scene` |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/hosts/native-scene-host.js` | external-kit | NexusEngine-Editor adapters | `n:host`, `n:world:scene` |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/hosts/rust-native-scene-host.js` | external-kit | NexusEngine-Editor adapters | `n:host`, `n:world:scene` |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/hosts/web-html-scene-host.js` | external-kit | NexusEngine-Editor adapters | `n:host`, `n:world:scene` |
| `src/core-domains/world/subdomains/scene/kits/scene-kit/hosts/web-scene-host.js` | external-kit | NexusEngine-Editor adapters | `n:host`, `n:world:scene` |
| `src/economy-kit.js` | external-kit | NexusEngine-Kits | `n:runtime:data`, `n:runtime:transaction`, `n:simulation` |
| `src/environmental-affordance-kit.js` | external-kit | NexusEngine-Kits | `n:interaction`, `n:object`, `n:spatial` |
| `src/facility-operations-kit.js` | external-kit | NexusEngine-Kits | `n:runtime:sequence`, `n:runtime:transaction`, `n:simulation` |
| `src/game-kit-composer.js` | duplicate | n:composition | `n:composition`, `n:policy` |
| `src/hazard-field-kit.js` | external-kit | NexusEngine-Kits | `n:object`, `n:simulation`, `n:spatial` |
| `src/host.js` | external-kit | NexusEngine-Editor | `n:composition`, `n:host`, `n:policy` |
| `src/hosts/browser/browser-indexeddb-asset-cache-adapter.js` | external-kit | NexusEngine-Editor adapters | `n:asset`, `n:host`, `n:presentation` |
| `src/hosts/browser/browser-presentation-surface-adapter.js` | external-kit | NexusEngine-Editor adapters | `n:asset`, `n:host`, `n:presentation` |
| `src/hosts/browser/browser-startup-presentation-adapter.js` | external-kit | NexusEngine-Editor adapters | `n:asset`, `n:host`, `n:presentation` |
| `src/landmark-guidance-kit.js` | external-kit | NexusEngine-Kits | `n:object`, `n:spatial`, `n:world` |
| `src/lifecycle-progression-kit.js` | external-kit | NexusEngine-Kits | `n:runtime:sequence`, `n:runtime:transaction`, `n:simulation` |
| `src/modules/nexus-diffusion/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/nexus-diffusion-domain.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/subdomains/backend/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/subdomains/checkpoint/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/subdomains/dataset/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/subdomains/model/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/subdomains/noise/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/subdomains/preview/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/subdomains/sampling/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/subdomains/tensor/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/subdomains/training/index.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/modules/nexus-diffusion/utils/seeded-random.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:compute:model`, `n:runtime:data` |
| `src/navmesh-kit.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:spatial`, `n:world` |
| `src/occupant-flow-kit.js` | external-kit | NexusEngine-Kits | `n:actor`, `n:runtime:sequence`, `n:simulation` |
| `src/pathfinding-kit.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:spatial`, `n:world` |
| `src/procedural-kit.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:runtime:data`, `n:world` |
| `src/procedural-navigation-extensions.js` | duplicate | NexusEngine-Kits | `n:composition` |
| `src/pursuit-pressure-kit.js` | external-kit | NexusEngine-Kits | `n:actor`, `n:simulation`, `n:spatial` |
| `src/renderers.js` | external-kit | NexusEngine-Kits adapters | `n:host`, `n:presentation:output` |
| `src/renderers/three/three-object-capture-provider.js` | external-kit | NexusEngine-Kits adapters | `n:host`, `n:object`, `n:presentation` |
| `src/renderers/three/three-presentation-output-adapter.js` | external-kit | NexusEngine-Kits adapters | `n:host`, `n:object`, `n:presentation` |
| `src/renderers/three/three-subject-bounds-adapter.js` | external-kit | NexusEngine-Kits adapters | `n:host`, `n:object`, `n:presentation` |
| `src/request-fulfillment-kit.js` | external-kit | NexusEngine-Kits | `n:interaction`, `n:runtime:sequence`, `n:simulation` |
| `src/request-queue-kit.js` | external-kit | NexusEngine-Kits | `n:actor`, `n:runtime:sequence`, `n:runtime:transaction` |
| `src/route-field-kit.js` | external-kit | NexusEngine-Kits | `n:object`, `n:spatial`, `n:world` |
| `src/scenario-driver-kit.js` | game-owned | Experiments or game repository | `n:composition`, `n:runtime:sequence`, `n:simulation` |
| `src/scenario-duration-kit.js` | game-owned | Experiments or game repository | `n:runtime:sequence`, `n:simulation` |
| `src/schedule-kit.js` | external-kit | NexusEngine-Kits | `n:runtime:sequence`, `n:simulation` |
| `src/shaders.js` | external-kit | NexusEngine-Kits adapters | `n:host`, `n:presentation:graphics` |
| `src/spatial-scale-kit.js` | external-kit | NexusEngine-Kits | `n:object`, `n:spatial` |
| `src/terrain-kit.js` | external-kit | NexusEngine-Kits | `n:compute`, `n:world`, `n:world:scene` |
| `src/transfer-zone-kit.js` | external-kit | NexusEngine-Kits | `n:interaction`, `n:object`, `n:spatial` |
| `src/transport-route-kit.js` | external-kit | NexusEngine-Kits | `n:actor`, `n:runtime:sequence`, `n:world` |
| `src/vehicle-dynamics-kit.js` | external-kit | NexusEngine-Kits | `n:interaction:input`, `n:simulation:motion`, `n:simulation:physics` |
| `src/water-surface-kit.js` | external-kit | NexusEngine-Kits | `n:presentation:graphics`, `n:world` |
| `src/world-physics-kit.js` | external-kit | NexusEngine-Kits | `n:simulation:motion`, `n:simulation:physics`, `n:world` |
| `tools/headless-editor/` | external-kit | NexusEngine-Editor | `n:composition`, `n:host`, `n:mcp`, `n:policy` |

---

<a id="extraction-summary"></a>

# Frozen ProtoKit Extraction

Canonical source: `https://github.com/LuminaryLabs-Agents/NexusEngine-ProtoKits.git` at `0d102649267737230d618b30fe6f9465b198d234`

Coverage: **3698/3698 source items (100%)** across **530 ProtoKit folders**. Source code was parsed as text and never executed.

## Dispositions

| Disposition | Source items |
|---|---:|
| core-reuse | 119 |
| core-composition | 115 |
| core-new-atom | 0 |
| external-kit | 3096 |
| recipe-data | 113 |
| game-owned | 236 |
| duplicate | 0 |
| rejected-unproven | 19 |

## Core Gap Set

No historical source item passed every Core-new-atom gate. The frozen Core gap set is empty; unproven generic-looking behavior remains external or rejected rather than being promoted by name.

## Deterministic Batches

| Batch | First folder | Last folder | Folders |
|---|---|---|---:|
| batch-01 | `2d-platformer-domain` | `blackwake-kit-registry` | 50 |
| batch-02 | `blackwake-preset-kit` | `domain-taxonomy-domain-kit` | 50 |
| batch-03 | `downhill-race-kit` | `generic-cargo-kit` | 50 |
| batch-04 | `generic-cargo-transfer-kit` | `generic-replay-test-kit` | 50 |
| batch-05 | `generic-resource-loop-kit` | `ground-contact-kit` | 50 |
| batch-06 | `guard-domain-kit` | `navigation-knowledge-domain-kit` | 50 |
| batch-07 | `negotiation-commitment-domain-kit` | `openxr-hand-adapter-dsk` | 50 |
| batch-08 | `orchard-biome-kit` | `render-layer-kit` | 50 |
| batch-09 | `render-quality-budget-kit` | `stream-backpressure-kit` | 50 |
| batch-10 | `stream-channel-kit` | `water-stream-kit` | 50 |
| batch-11 | `water-surface-kit` | `zone-field-kit` | 30 |

## Artifacts

- `source.json`: immutable source identity and complete snapshot hash.
- `inventory.json`: files, exports, state/lifecycle signals, dependencies, consumers, providers, and adapters by folder.
- `dispositions.json`: canonical export-level ownership and reconstruction ledger.
- `core-gap-set.json`: frozen result of the new-Core-atom gate.

