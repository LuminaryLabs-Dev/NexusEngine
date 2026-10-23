# AGENTS.md

This file defines how agents must work inside NexusEngine.

## Mandatory Development Bootstrap

For every planning, implementation, repair, promotion or validation task:

1. Read this file and `.agent/development.md`.
2. Read the current user request and the applicable target. Preserve `.agent/target.md` when it belongs to another task; record this task's goal under `.agent/runs/<run-id>/goal.md` instead.
3. Resume the applicable Engine Agent task/session using the workspace and IDs recorded in the run's `run.json`, or create them through the existing Engine workflow APIs.
4. Read the associated validation reports and evidence before claiming completion.
5. Record plans, changes, failures, repairs, commands, results and remaining work in the run folder. Keep large artifacts outside Agent working context and reference them by path/hash.
6. Run checks appropriate to the actual changes. Mark work complete only when the required evidence passes; record failures, missing evidence and blockers explicitly.

Engine task/session state is the execution resume point. Validation reports establish correctness. The agent selects work within the user's authority; optional hosts execute filesystem, terminal and browser actions. No Editor application, `nexus-editor` executable or separate guided-development controller is required.

The former completion tracker is retired. `.agent/tracker.md` is a historical pointer only; it must not be used as current completion authority.

## Development Interfaces

The former Editor controller commands are retired as repository prerequisites. Use the existing Engine Agent workflow APIs and optional production host, MCP or CLI surfaces for task/session state; discover supported operations before invoking them. See `.agent/development.md` for the active procedure.

No replacement controller, tracker generator or new top-level domain is introduced. Historical instructions and the original tracker are preserved under `.agent/archive/2026-10-23-editor-controller/`.

## Prime Directive

NexusEngine is a realtime-first, kit-first operating system for agents and humans to compose boundless game and simulation domains through reusable, idempotent kits.

Do not treat this repository as a pile of files. Treat it as a kit-composed operating system.

Repeat this before every change:

```txt
Find the domain.
Find the kit.
Reuse before creating.
Compose before rewriting.
Validate before claiming.
Reconcile before moving on.
Document what changed.
```

The app is not the architecture. The kit graph is the architecture.

## Repository Role

This repository is the NexusEngine Core substrate.

This repository owns:

- realtime ECS state
- scheduler phases
- events, resources, queries, and surfaces
- runtime kit contracts
- domain service kit contracts
- atomic, idempotent, fully reusable Core domains
- deterministic ticks
- reset and snapshot expectations
- renderer-agnostic descriptors
- provider-neutral Render execution contracts and portable transport records
- validation paths for promoted behavior
- transport-neutral host, policy, MCP, and composition contracts
- manifest-owned universal navigation, world, motion, economy, operations,
  interaction, and progression atoms
- the isolated `n:build` build-time domain, including concrete compilers,
  toolchains, target hosts, packaging, artifacts, and build proof

Reusable optional, niche, genre, and runtime-platform behavior belongs in
NexusEngine-Kits or another trusted registry. `n:build` is the sole physical
platform-specific exception: it never enters an application runtime graph, and
runtime Domains cannot import it. Complete games and presets belong in
experiment or game repositories. The retired ProtoKit workflow is not an
implementation destination.

`n:material` owns appearance and portable material bindings. `n:lighting` owns
lighting and reflection requirements. `n:camera` owns camera control, framing,
views and projections. `n:presentation` owns output arrangement and presentation
requests. `n:render` owns the backend-neutral execution boundary, render graphs
and instance batches. `n:host` owns platform surface capability
contracts, and concrete renderer providers remain external. Do not put GPU
handles, Three.js objects, WebGL calls, shader compilation, or frame submission
inside Core contracts. Applications compose these services and select their rendering pipeline.

The requested bundled Graphics Language Kit lives in `kits/render/graphics-language-kit`,
outside Core production sources. It may contain NexusGL, native/WASM runtime artifacts
and concrete presentation adapters. Core imports must not initialize this optional kit.

`n:render:lifecycle` owns portable selected-provider composition, generation and
handover status, not executable provider lifecycle. Runtime still owns engine ticking
and generic Kit installation. Render recovery must either prove a ready resume
or return to installed state for a fresh startup; coordinated failure must
restore every affected lifecycle atom.

`n:render:device` owns only portable device identity, feature and limit
negotiation, capability profiles, semantic memory and queue accounting, device
lifecycle, loss facts, and read-only diagnostics. Concrete providers own GPU
handles, real allocation, command encoding, queue execution, and repair. Keep
Render Lifecycle and Device Lifecycle separate: the former owns the selected
provider composition; the latter owns the returned device's portable state.

`n:render:buffer` owns portable logical Buffer descriptors, explicit field
layouts, semantic typed views, bounded update requests, and portable provider
receipts. It references exact Render Resource identities and Device queue
submissions. Resource owns residency, Device owns queue completion, Asset owns
source bytes and content identity, Geometry and Texture own higher-level
meaning, and providers own GPU handles, allocation, mapping, byte transfer,
submission, and repair. Do not copy those responsibilities into Buffer.

`n:render:texture` owns portable Texture formats, exact logical Texture
records, typed subresource views, explicit mip plans, Buffer-backed stream
requests, and proven subresource residency. It references public Resource,
Buffer, and Device queue capabilities. Asset owns source content and decoding;
Material owns surface appearance; Lighting owns illumination and shadow meaning;
Pipeline and Frame own attachment execution; providers own GPU handles,
allocation, upload, mip generation, eviction, repair, and backend format
mapping. Do not hide those responsibilities inside Texture.

`n:render:shader` owns portable Shader stage and language contracts, immutable
source and include lineage, module and program topology, variants, bounded
permutations, logical compile state, normalized provider reflection, and
semantic cache links to resident `shader-program` Resources. Reuse the single
`shader-schema-kit` under `n:render:contracts`; never create another owner.
Core may validate explicit compile requests and receipts, but providers own
preprocessing, parsing, compilation, linking, binary artifacts, GPU program
handles, backend reflection execution, and repair. Material owns parameter
binding, Pipeline owns execution state, and Material and Lighting own visual meaning.

`n:material` owns exact portable Shader-slot association, Material
parameters, Texture and sampler bindings, instances, variants, validation, and
semantic cache lineage. Material slot visibility must exactly match its Shader
binding. Current Material resolution must recheck required Texture resource and
subresource residency; an eviction invalidates dependent Material validation
and cache use without mutating Material state. Providers still own GPU binding
objects and execution, while Material owns authored surface meaning.

The `0.0.4` restoration ledger is an active ownership contract. Its 26
historical modules map to 27 corrected atoms, nine optional integration
adapters, and six data recipes. Do not reintroduce old root exports, historical
aliases, implicit adapter effects, or legacy snapshot coercion. Do not classify
those exact universal restorations as external Kits unless a new ownership
decision updates source, manifests, migration evidence, tests, and docs in the
same change.

## Agent Work Loop

Every task must follow this loop within its Engine-backed task/session:

1. Bootstrap from `AGENTS.md`, `.agent/development.md` and the applicable run goal.
2. Inspect the existing kit and domain structure before editing.
3. Identify the domain that owns the requested behavior.
4. Check whether a kit already provides the capability.
5. Inspect the installed composition path, not only direct helper functions.
6. Extend the nearest existing kit before creating a new one.
7. Create a new kit only when no existing domain owns the behavior.
8. Make the change idempotent.
9. Add or update reset, snapshot, replay, and validation behavior when state matters.
10. Run the smallest meaningful validation available.
11. Select and run reliability checks justified by the changed contracts and risk.
12. Reconcile exports, docs, package surfaces, examples, manifests, and fixtures.
13. Verify and compare before and after evidence.
14. Report the exact domain, kit, files, validation, evidence, and remaining risk.

Do not skip the loop because a change appears small. Small scattered changes are how the engine loses its operating-system shape.

## Evidence-Based Development Loop

Use the existing development sequence:

```text
inspect -> find domain/kit -> plan -> apply -> validate -> compare -> report
```

Engine Agent task graphs record dependencies, pending work, failures and revisions. Answer sessions record intent, outstanding requests, results and handoffs. Runtime commits persist progress and reclaim delivered transient state without advancing gameplay.

On failure, preserve the evidence, revise affected work and repair it before repeating relevant checks. If evidence is insufficient, keep the task unfinished and identify the next check. If an external blocker or product decision prevents progress, record it explicitly. A successful tool receipt or a completed task alone does not prove repository correctness or visual quality.

## `.agent` Ownership

| Path/state | Owner and purpose |
| --- | --- |
| `AGENTS.md`, `.agent/development.md` | Active repository development contract |
| `.agent/target.md` | Applicable task input; preserve unrelated targets |
| `.agent/runs/<id>/goal.md` | Task-specific goal and acceptance criteria |
| `.agent/runs/<id>/run.json` | Workspace, Engine task/session IDs and evidence locations; a resume pointer, not a completion tracker |
| Engine Agent task/session state | Durable progress and handoff state, persisted by the selected host |
| `.agent/runs/<id>/` reports and evidence | Actual commands, results, hashes, failures and remaining work |
| `.agent/tracker.md` | Retired historical pointer; no active completion authority |
| `.agent/archive/2026-10-23-editor-controller/` | Original instructions/tracker and preservation hashes |

Do not rewrite old run state, historical completion claims or unrelated targets. Infer validation requirements from the current goal, changed files and contracts; do not add a global profile or a replacement controller.

## Reliability Inference

The agent should select applicable checks such as:

```txt
repository-integrity
kit-composition
installed-api-parity
descriptor-integrity
snapshot-reset-replay
public-export-integrity
browser-startup
deterministic-replay
runtime-tick
test-coverage
```

Heuristics select likely checks. Deterministic test and harness evidence decides correctness.

A heuristic must never mark a change correct. It can only explain risk, select fixtures, and identify missing evidence.

## Kit-First Rules

- Do not scatter behavior.
- Do not create random utilities when the boundary should be a kit.
- Do not hide domain logic in app shells, examples, renderers, or demos.
- Do not duplicate a kit because finding the existing one takes effort.
- Do not promote unstable behavior.
- Do not claim success without validation.
- Do not break the kit graph.
- Do not bypass snapshots when state matters.
- Do not rewrite when composition solves the problem.
- Do not turn a reusable domain into one giant source file.

When the engine needs a capability, ask:

```txt
What domain owns this?
What kit should express it?
What state does it own?
What does it publish?
What does it depend on?
What proves it works?
How can it be reapplied safely?
```

## Domain Ownership Rules

A domain is a named area of engine meaning.

Examples include data, deterministic scheduling, physics contracts, motion
contracts, composition, diagnostics, persistence, and snapshot/replay.

Before editing code, classify the work:

```txt
atomic mechanic
scoped domain
composite domain
Core domain candidate
renderer adapter
host application
proof harness
test fixture
documentation
```

Classify reusable behavior again: only universal behavior may enter Core.
Optional reusable behavior belongs in a trusted registry kit. Host, game, demo,
route, and renderer wiring stays outside Core production logic.

## Idempotency Rules

Kits should be idempotent.

An idempotent kit can be installed, extended, repaired, or reapplied without duplicating systems, corrupting state, or creating hidden side effects.

For every kit change, check:

- repeated installation does not duplicate systems
- repeated initialization does not corrupt resources
- defaults are stable
- events are emitted intentionally
- snapshots are serializable
- reset returns the domain to a known state
- validation can run without a renderer when possible
- direct and installed APIs produce equivalent contracts when both exist

## Validation Rules

Realtime state is the proof layer. Do not only say the code looks correct.

Prefer, in order:

1. headless unit tests
2. installed-composition fixtures
3. smoke tests
4. deterministic snapshots
5. reset and replay checks
6. package and public export checks
7. browser startup and console checks when browser-facing
8. syntax checks
9. documented manual verification when no automated path exists

When state matters, snapshots matter.

When scheduling matters, ticks matter.

When composition matters, install the composed kit list and inspect the result.

When an API can be called directly and through `engine.n`, test both paths.

Completion is prohibited while required evidence is missing or failed.

## Reconciliation Rules

After modifying behavior, reconcile:

- `src/index.js`
- kit exports
- package exports
- README examples
- domain docs
- tests
- smoke fixtures
- snapshots
- promotion notes
- API lists
- kit and domain manifests
- applicable `.agent` goal, Engine task/session references, run reports and evidence

A change is not complete if the code changed but the kit graph or development evidence became harder to understand.

## Promotion Rules

Do not promote a capability into NexusEngine core unless it is:

- generic beyond one game
- atomic, with one clear responsibility
- idempotent under install, reset, and reapplication
- fully reusable without genre, product, or platform assumptions
- named as a domain
- stable enough to reuse
- deterministic where required
- snapshot-capable when stateful
- reset-capable when stateful
- tested or smoke-validated
- documented for humans
- readable for agents
- represented in the public and installed composition paths

Unknown or unproven ownership fails closed: keep the capability outside Core.
Consult `docs/KIT-OWNERSHIP.md` before implementation.

The platform-neutral requirement applies to application runtime behavior.
Build-time behavior may be platform-specific only inside `n:build`, where it
must remain atomic, project-immutable, source-verifiable, approval-gated, and
absent from runtime composition.

## Kit Anatomy

Every Core Domain uses the manifest-owned structure:

```txt
src/core-domains/<semantic-domain>/
├─ domain.manifest.js
├─ README.md
├─ contracts/
├─ state/
├─ kits/
├─ <child-domain>/
├─ providers/
└─ adapters/
```

Nested Build domains additionally use one `subdomain.manifest.js` and one
`kit.manifest.js` per atomic Kit. The root Build entry composes those Kits and
does not own hidden compiler, target, or artifact behavior.

The manifest is the ownership and public-surface contract. Do not add legacy
Kit metadata or an unmanifested public Kit factory.

## Development Evidence Lifecycle

Preserve the useful evidence sequence without requiring an Editor controller:

```text
read -> capture-before -> plan -> validate -> apply -> observe -> verify -> capture-after -> compare
```

Store actual observations and test results in the run folder. Inspect visual output when applicable. Missing evidence remains missing; no task state, report heading or confidence score can convert an unexecuted check into a pass.

## Resume and Completion State

A resumable run records the goal, workspace, Engine task/session IDs, pending work, evidence locations, failures and next action. Keep only compact references in Agent context. Read actual reports to determine whether acceptance criteria pass.

The archived tracker is historical evidence. Do not resume its old controller routes or treat its completed release run as evidence for current changes.

## Router and Adapter Boundary

- Engine Agent owns workflow definitions, task graphs, answer sessions and compact progress records.
- Runtime owns execution lifecycle and commit; domain owners retain their authoritative source and validation contracts.
- Agents select actions and interpret evidence within the user's authorization.
- Optional hosts/providers execute filesystem, terminal, browser, renderer and platform actions.
- Nexus Engine Kit is a thin Codex adapter and modeling guide. NexusEngine-Editor is an optional consumer, not a repository-development prerequisite.

Do not move concrete host execution into portable Core or create another mandatory controller to replace the retired one.

## Disposable Use

A domain kit should remain importable, installable, runnable, exportable, and disposable.

Repository development uses run folders and an explicitly recorded Engine host workspace so progress and validation evidence can be resumed and audited.

## Reporting Requirements

Every final report must include:

- the target goal
- the active run id
- the route sequence used
- the owning domain and kit
- files changed
- required checks inferred
- validation actually executed
- verification and observed differences
- completion confidence
- remaining risk or exact external blocker

Never report success based only on source review, syntax checks, task completion flags or historical tracker prose.
