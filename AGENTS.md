# AGENTS.md

This file defines how agents must work inside NexusEngine.

## Mandatory Development Bootstrap

For every planning, implementation, repair, promotion, or validation task:

1. Read this file completely.
2. Read `.agent/target.md` as the current goal and acceptance contract.
3. Read `.agent/tracker.md` as the generated controller state and resume point.
4. Resume the active guided-development run when one exists.
5. Otherwise create a new run under `.agent/runs/<run-id>/`.
6. Initialize the NexusEngine-Editor guided-development controller using that
   run folder as its workspace.
7. Set `.agent/target.md` as the run goal.
8. Run `status`, then follow `next` or `continue` through the guided development loop.
9. Inspect every evidence file named by the tracker before planning, applying, validating, or claiming completion.
10. Write plans, risks, changes, tests, failures, repairs, verification, differences, and reports into the active run folder.
11. Let the Headless Editor update `.agent/tracker.md`; do not manually substitute tracker prose for controller state.
12. Continue until the target is proven complete, an exact external blocker is recorded, or a product decision requires user input.

There is no static development profile. The target is the input, the tracker is the operating memory, and the Headless Editor is the execution layer.

The minimum instruction required to begin work is:

```txt
Read and follow AGENTS.md to implement the target in .agent/target.md.
```

## Guided Development Commands

From the repository root:

```txt
nexus-editor target
nexus-editor start
nexus-editor resume
nexus-editor status
nexus-editor next
nexus-editor continue
nexus-editor report
```

The `nexus-editor` executable is owned and supplied by NexusEngine-Editor. This
Core package does not ship repository, terminal, or guided-development tooling.

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

`n:presentation` owns renderer-neutral visual meaning. `n:render` owns the
backend-neutral execution boundary. `n:host` owns platform surface capability
contracts, and concrete renderer providers remain external. Do not put GPU
handles, Three.js objects, WebGL calls, shader compilation, or frame submission
inside Core contracts. Do not make Render reinterpret or own Presentation
graphs.

`n:render:lifecycle` owns portable selected-provider composition state and
receipts, not executable provider lifecycle. Runtime still owns engine ticking
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
Presentation owns material, image, lighting, and authored shadow meaning;
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
binding, Pipeline owns execution state, and Presentation owns visual meaning.

`n:render:material` owns exact portable Shader-slot association, Material
parameters, Texture and sampler bindings, instances, variants, validation, and
semantic cache lineage. Material slot visibility must exactly match its Shader
binding. Current Material resolution must recheck required Texture resource and
subresource residency; an eviction invalidates dependent Material validation
and cache use without mutating Material state. Providers still own GPU binding
objects and execution, while Presentation owns authored visual meaning.

The `0.0.4` restoration ledger is an active ownership contract. Its 26
historical modules map to 27 corrected atoms, nine optional integration
adapters, and six data recipes. Do not reintroduce old root exports, historical
aliases, implicit adapter effects, or legacy snapshot coercion. Do not classify
those exact universal restorations as external Kits unless a new ownership
decision updates source, manifests, migration evidence, tests, and docs in the
same change.

## Agent Work Loop

Every task must follow this loop inside the active guided-development run:

1. Bootstrap from `AGENTS.md`, `.agent/target.md`, and `.agent/tracker.md`.
2. Inspect the existing kit and domain structure before editing.
3. Identify the domain that owns the requested behavior.
4. Check whether a kit already provides the capability.
5. Inspect the installed composition path, not only direct helper functions.
6. Extend the nearest existing kit before creating a new one.
7. Create a new kit only when no existing domain owns the behavior.
8. Make the change idempotent.
9. Add or update reset, snapshot, replay, and validation behavior when state matters.
10. Run the smallest meaningful validation available.
11. Run every reliability check inferred by the Headless Editor.
12. Reconcile exports, docs, package surfaces, examples, manifests, and fixtures.
13. Verify and compare before and after evidence.
14. Report the exact domain, kit, files, validation, evidence, and remaining risk.

Do not skip the loop because a change appears small. Small scattered changes are how the engine loses its operating-system shape.

## Guided Development Loop

The NexusEngine-Editor controller wraps the finite evidence lifecycle in a
persistent development loop:

```txt
BOOTSTRAP
→ READ TARGET
→ INSPECT REPOSITORY
→ FIND DOMAIN
→ FIND KIT
→ INSPECT COMPOSITION
→ CLASSIFY RISK
→ PLAN
→ VALIDATE PLAN
→ APPLY
→ RELOAD
→ RUN FIXTURES
→ VERIFY
→ COMPARE
→ DECIDE
```

Decision routing is mandatory:

```txt
complete
→ generate report
→ close run
→ update tracker

failed
→ write failure evidence
→ diagnose
→ increment the repair iteration
→ replan

insufficient evidence
→ identify the missing evidence
→ run or create the required fixture
→ return to verification

external blocker
→ record the exact blocker
→ pause the run

product decision required
→ record the question
→ ask the user
```

The agent reasons and edits code. The harness owns sequence, routing, evidence requirements, validation gates, iteration state, resumption, and completion criteria.

## `.agent` Ownership

```txt
AGENTS.md
→ mandatory repository development protocol

.agent/target.md
→ only task-specific input and acceptance contract

.agent/tracker.md
→ generated active-run summary and resume point

.agent/runs/<run-id>/
→ generated state, goal, inspection, risks, plan, ledger, validation, verification, differences, and report

.agent/evidence/<run-id>/
→ machine-readable repository, module, kit, runtime, test, and snapshot evidence
```

Ownership rules:

| Path | Owner |
| --- | --- |
| `.agent/target.md` | User or agent translating the user request |
| `.agent/tracker.md` | NexusEngine-Editor guided-development controller |
| `.agent/runs/<id>/state.json` | Guided development controller |
| `.agent/runs/<id>/plan.md` | Headless Editor and agent |
| `.agent/runs/<id>/ledger.md` | Headless Editor |
| `.agent/runs/<id>/validation.md` | Test and reliability kits |
| `.agent/runs/<id>/report.md` | Headless Editor |
| `.agent/evidence/<id>/...` | Harness and environment adapters |

Do not add a global development profile. Reliability requirements must be inferred from the target, repository, changed files, module graph, kit graph, contracts, state ownership, renderer or host involvement, and existing tests.

## Reliability Inference

The Headless Editor should infer checks such as:

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
- `.agent` target, tracker, run, and evidence state

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

## Headless Editor Evidence Lifecycle

The finite evidence harness remains:

```txt
read -> capture-before -> plan -> validate -> submit -> observe -> verify -> capture-after -> observed-differences
```

Use it for bounded evidence collection inside the persistent guided-development loop.

The interactive lifecycle router supports:

```txt
status
routes
next
instructions
run <stage>
run-until <stage>
inspect <path>
list [prefix]
report
help
```

Always run `status` or `next` before choosing a manual stage. Never bypass validation before submit. Do not claim completion until observed differences have run or the remaining host-specific verification is explicitly recorded.

## Guided Development Router State

Guided-development status must explain:

```txt
mode
goal
run id
iteration
phase
current route
route reason
required checks
required evidence
missing evidence
failed evidence
next command
completion confidence
whether completion can be claimed
whether agent or user action is required
```

The tracker must expose the same information in human-readable form so another agent can resume without reconstructing the workflow.

## Router and Adapter Boundary

The Headless Editor owns:

- agent-facing command routing
- stage and route availability
- next-route recommendation
- target loading
- run creation and resumption
- tracker generation
- reliability inference
- evidence scoring
- completion gates
- workspace inspection
- run and evidence reports

It does not own:

- Unity JSON-RPC execution
- Playwright or browser implementation
- Three.js or WebGL mutation
- GitHub writes
- package installation
- long-running servers
- project-specific gameplay logic

Those capabilities enter through environments, adapters, lifecycle kits, test kits, or harness kits.

## Disposable Use

A domain kit should remain importable, installable, runnable, exportable, and disposable.

The external controller may use memory or text workspaces. Repository
development uses file workspaces under `.agent/runs/<run-id>/` so work can be
resumed and audited.

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

Never report success based only on source review, syntax checks, or generated tracker prose.
