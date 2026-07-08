# AGENTS.md

This file defines how agents must work inside NexusEngine.

NexusEngine is a realtime-first, kit-first operating system for agents and humans to compose boundless game and simulation domains through reusable, idempotent kits.

## Prime Directive

Do not treat this repository as a pile of files.

Treat it as a kit-composed operating system.

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

This repository is the promoted NexusEngine engine substrate.

That means this repo owns:

- realtime ECS state
- scheduler phases
- events, resources, queries, and surfaces
- runtime kit contracts
- domain service kit contracts
- promoted reusable engine kits
- deterministic ticks
- reset and snapshot expectations
- renderer-agnostic descriptors
- validation paths for promoted behavior

ProtoKits are the proving ground. NexusEngine core is the promotion target. Do not promote unstable behavior into core just because it works in one demo.

## Agent Work Loop

Every agent task must follow this loop:

1. Read `README.md` for the mental model.
2. Inspect the existing kit and domain structure before editing.
3. Identify the domain that owns the requested behavior.
4. Check whether a kit already provides the capability.
5. Extend the nearest existing kit before creating a new one.
6. Create a new kit only when no existing domain owns the behavior.
7. Make the change idempotent.
8. Add or update reset, snapshot, and validation behavior when state matters.
9. Run the smallest meaningful validation available.
10. Reconcile exports, docs, package surfaces, and examples.
11. Report the exact domain, kit, files, validation, and remaining risk.

Do not skip the loop because the change looks small. Small scattered changes are how the engine loses its operating-system shape.

## Kit-First Rules

Use these rules repeatedly:

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

Examples:

- terrain
- physics
- locomotion
- camera
- interaction
- navigation
- rendering descriptors
- AR session
- XR stereo view
- economy
- lifecycle progression
- schedule
- telemetry
- world patch streaming

Before editing code, classify the work:

```txt
atomic mechanic
scoped domain
composite domain
promoted engine kit
renderer adapter
host application
proof harness
test fixture
documentation
```

If the request changes reusable behavior, it belongs in a kit or domain service kit. If the request only wires a host, demo, route, or renderer, keep it out of reusable domain logic.

## Idempotency Rules

Kits should be idempotent.

An idempotent kit can be installed, extended, repaired, or reapplied without duplicating systems, corrupting state, or creating hidden side effects.

Agents retry. Agents repair. Agents revisit the same domain from different scopes. Idempotency is what makes that safe.

For every kit change, check:

- repeated installation does not duplicate systems
- repeated initialization does not corrupt resources
- defaults are stable
- events are emitted intentionally
- snapshots are serializable
- reset returns the domain to a known state
- validation can run without a renderer when possible

## Validation Rules

Realtime state is the proof layer.

Do not only say the code looks correct. Prove the behavior through the smallest meaningful validation path.

Prefer, in order:

1. headless unit tests
2. smoke tests
3. deterministic snapshots
4. reset and replay checks
5. package export checks
6. syntax checks
7. documented manual verification when no automated path exists

When state matters, snapshots matter.

When scheduling matters, ticks matter.

When composition matters, install the composed kit list and inspect the result.

## Reconciliation Rules

After modifying behavior, reconcile the surrounding structure.

Check whether the change requires updates to:

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

A change is not complete if the code changed but the kit graph became harder to understand.

## Promotion Rules

Promotion means a capability has become engine language.

Do not promote a capability into NexusEngine core unless it is:

- generic beyond one game
- named as a domain
- stable enough to reuse
- deterministic where required
- snapshot-capable when stateful
- reset-capable when stateful
- tested or smoke-validated
- documented for humans
- readable for agents

ProtoKits can move fast. NexusEngine core must stay reconcilable.

## Kit Anatomy

Every kit should aim for this structure when applicable:

```txt
kit-name/
├─ README.md
├─ kit.json
├─ package.json
├─ index.ts or index.js
└─ kits/
   └─ nested-domain-kit/
      ├─ README.md
      ├─ kit.json
      └─ index.ts or index.js
```

## Headless Editor Interactive Router

The `core-headless-editor-kit` owns the evidence-first agent editing loop and the interactive router surface.

Use it when an agent needs to inspect, plan, validate, apply, verify, or compare changes through a reusable harness instead of ad-hoc scripts.

The canonical loop is:

```txt
read -> capture-before -> plan -> validate -> submit -> observe -> verify -> capture-after -> observed-differences
```

The router makes this loop interactive. It tells the agent what state exists, what evidence is missing, what kit owns the next step, what command to run, and what workspace file to inspect next.

### Router-first agent flow

Prefer this flow for agentic editing and temporary CDN/domain-kit use:

```js
import {
  createHeadlessEditorHarness,
  createHeadlessEditorRouter
} from "nexusengine";

const harness = createHeadlessEditorHarness({
  workspace: "memory",
  adapter,
  goal: "Describe the goal here"
});

const router = createHeadlessEditorRouter({ harness });

await router.dispatch("status");
await router.dispatch("next");
await router.dispatch("run read");
await router.dispatch("inspect read/packet.json");
await router.dispatch("run-until validate");
await router.dispatch("report");
```

Use `workspace: "memory"` for disposable temporary runs.
Use `workspace: "text"` when a run must be portable as a single snapshot bundle.
Use `workspace: { kind: "file", root: ".agent/headless-editor-runs/<run-id>" }` only when a CLI/CI run needs durable artifacts.

### Router commands

The router supports this command surface:

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

Required behavior:

- Always run `status` or `next` before choosing a manual stage.
- Inspect the relevant evidence files before `plan`, `validate`, or `submit`.
- Never bypass `validate` before `submit`.
- Do not claim completion until `observed-differences` has run or the remaining manual verification is documented.
- Prefer router commands over directly calling lifecycle kits when working interactively.

### Workspace files agents should inspect

The router and lifecycle kits communicate through canonical virtual paths:

```txt
run.json
goal.md
router/status.json
router/routes.json
router/next.json
router/instructions.md
router/transcript.md
read/packet.json
capture-before/manifest.json
plan/plan.json
plan/commands.json
validate/validation.json
validate/issues.json
submit/submit.json
observe/results.json
verify/verification.json
capture-after/manifest.json
observed-differences/difference.json
observed-differences/summary.md
report.md
```

These are workspace paths, not guaranteed OS paths. They may be backed by memory, a real folder, or a text snapshot. Lifecycle kits must use the workspace API instead of assuming a filesystem.

### Router ownership boundary

The router owns:

- agent-facing command routing
- stage availability checks
- next-route recommendation
- router status files
- router instructions
- router transcript
- workspace inspection commands

The router does not own:

- Unity JSON-RPC execution
- Playwright browser rendering
- Three.js/WebGL object mutation
- GitHub writes
- package installation
- long-running servers

Those capabilities must enter through adapters or separate lifecycle kits.

### Disposable CDN/domain-kit rule

A domain kit should be importable, installable, runnable, exportable, and disposable.

For Headless Editor work, that means:

```txt
import from CDN
create memory workspace
create harness
create router
run one command at a time
export snapshot/report if needed
drop references to dispose
```

Do not require a clone, filesystem, `.agent` folder, or Playwright just to use the core router.

### Reporting requirements

When reporting Headless Editor work, include:

- the goal
- the router command sequence used
- the key workspace files inspected
- the final `observed-differences` result, or why it could not run
- validation that was actually performed
- any remaining host-specific risk
