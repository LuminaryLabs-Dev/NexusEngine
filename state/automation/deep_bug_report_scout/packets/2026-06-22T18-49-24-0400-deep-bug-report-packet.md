# Deep Bug Report Packet: 2026-06-22T18:49:24-04:00

Timestamp: 2026-06-22T18:49:24-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for `Nexus.Host` public state mutation and mount transaction boundaries

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-22-dsk-extension-install-contract`.
- Recent deep packets already cover DSK extension service ownership, Host Graph Lifecycle Ownership, domain command/config ownership, telemetry/command ownership, procedural/navigation state ownership, scheduler/world mutation isolation, query read-model leaks, runtime identity/lifecycle, DSK install failure boundaries, and duplicate runtime binding/provider diagnostics.
- Latest ecosystem state/proof packets report core commit alignment with `origin/main` and `origin/0.0.2`, green local smoke tests, dirty core host/docs/source/test work, ProtoKits local-vs-release drift, unresolved targeted package/API proof, npm 404, package-version split, and public browser module loading failures.
- Latest DSK architecture packet keeps DSK Extension Service Ownership and Host Graph Lifecycle Ownership as separate hardening rows, and treats dirty host-surface work as local evidence until release policy decides otherwise.
- Latest domain idea packet maps DSK Extension Service Ownership into planning inventory and preserves Host Graph Lifecycle Ownership as a separate family.
- State packets were context only. Live source, tests, preflight, duplicate scans, and focused probes were authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-differs-from-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404
- Current `HEAD`, `origin/main`, and `origin/0.0.2`: `6c450b3073825ddd495979474f57342556658972`
- Ahead/behind against `origin/0.0.2`: `0 0`

## Current branch
- `main`, tracking `origin/main`
- Worktree had pre-existing dirty docs/source/test and neighboring lane artifacts before this run, including `src/index.js`, untracked `src/host.js`, host tests/examples/docs, ideal docs, and newer automation artifacts.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/host.js`, `src/index.js`, `src/runtime-kit.js`, `src/domain-service-kit.js`, `src/engine.js`, `src/ecs.js`
- `tests/host-smoke.mjs`, `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404; current branch `main` differs from latest release branch name.
- `npm test`
  - Result: passed 9 smoke tests.
- `git status --short --branch`
  - Result: branch `main...origin/main`; pre-existing source/docs/test/state and untracked host/lane files were present.
- `git rev-parse HEAD origin/main origin/0.0.2`
  - Result: all three refs resolve to `6c450b3073825ddd495979474f57342556658972`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing packet duplicate scan for `host.provides`, `adapterRecords`, `record state`, `mount failure`, `mount callback`, `Host Graph Lifecycle`, `host-adapter`, `mountAdapter`, and unvalidated host records.
- Inline Node probe: mutate host root `provides` after creation, then mount an adapter requiring the forged token.
  - Result: adapter mounted and graph edge showed host-provided `forged.root` satisfied.
- Inline Node probe: push a forged record directly into `host.adapterRecords`.
  - Result: snapshot rendered `injected-unvalidated` as a ready adapter with an unsatisfied missing requirement while lifecycle still reported one mounted adapter.
- Inline Node probe: mutate `host.adapterRecords[0].state` after mount.
  - Result: graph reported `failed-without-api` while host lifecycle still reported `ready` and one mounted adapter.
- Inline Node probe: throwing mount callback that mutates host state before throwing.
  - Result: no adapter record was added, but `host.provides` and diagnostics retained mutations from the failed mount.

## Existing bug packets checked
- Prior deep packets through `2026-06-22T06-49-01-0400` were scanned to avoid repeating known findings.
- Earlier host packet already covers mutable adapter token arrays, duplicate adapter ids/domains collapsing graph snapshots, non-atomic unmount callbacks, and snapshot callback side effects.
- This packet does not duplicate those rows. It isolates public host state mutation and mount transaction gaps: root host capabilities, public adapter record arrays, record state mutation, and mount callback failure side effects.

## Executive summary
- Current smoke tests pass, but `Nexus.Host` exposes mutable proof-critical arrays and records directly.
- `host.provides` can be mutated after host creation, and `mountAdapter()` uses the mutated list as authority for dependency validation.
- `host.adapterRecords` can be edited outside `mountAdapter()`/`unmountAdapter()`, letting callers inject unvalidated adapters or rewrite record state visible in graph snapshots.
- `mountAdapter()` runs adapter `mount()` before creating a record or transaction guard, so a throwing mount callback can mutate host state and leave no failed record for retry or diagnostics.
- The current `tests/host-smoke.mjs` happy path does not cover host root capability immutability, external record mutation, record/lifecycle parity, or mount failure transaction behavior.

## Deep bug reports

### 1. Host root capabilities are mutable after dependency validation starts
- Severity: high
- Owner: host root capability ownership
- Evidence files and line references:
  - `src/host.js:35-39` reads `host.provides` directly when building the provider index.
  - `src/host.js:166-176` stores `provides` as a mutable array on the returned host object.
  - `src/host.js:181-189` validates adapter requirements against that live provider index.
  - `tests/host-smoke.mjs:40-64` validates a normal root/kit/adapter graph but does not mutate `host.provides`.
- Reproduction path: create a host with `provides:["root.ready"]`, push `forged.root` into `host.provides`, then mount an adapter requiring `forged.root`.
- Probe result: the adapter mounted and `snapshot().edges` reported `from:"probe-host"`, `providerKind:"host"`, `token:"forged.root"`, and `satisfied:true`.
- Expected behavior: root host capability tokens should be captured/frozen at creation or changed only through explicit lifecycle APIs that revalidate dependents.
- Actual behavior: any holder of the host object can forge host capabilities after creation and satisfy later adapter requirements.
- Why it matters: host graph snapshots are supposed to prove composition. Mutable root capability arrays let proof panels and adapters trust tokens that were never part of the authored host contract.
- Validation needed: fixtures for root `provides` immutability, post-creation mutation attempts, explicit capability-edit policy, dependency revalidation, and graph edge stability.
- Suggested fix direction: clone/freeze host capability arrays into private records, expose read-only snapshots, and require explicit remount/revalidate for capability changes.
- Blocks DSK promotion: promotion-adjacent for host graph proof and adapter dependency integrity.

### 2. Public `adapterRecords` lets callers inject unvalidated graph records
- Severity: high
- Owner: host graph record ownership
- Evidence files and line references:
  - `src/host.js:48-52` trusts every entry in `host.adapterRecords` as a provider source.
  - `src/host.js:124-137` renders every public record into graph adapters, domains, and edges.
  - `src/host.js:170-172` exposes `adapterRecords` as a mutable array on the host object.
  - `src/host.js:181-195` is the only validation path, but direct array mutation bypasses it.
- Reproduction path: create a host, then `host.adapterRecords.push({ state:"ready", adapter: defineHostAdapter({ id, domain, requires:["missing.never.validated"] }) })`.
- Probe result: `recordCount` became `2` while `lifecycle.mountedAdapters` stayed `1`; snapshot rendered `injected-unvalidated` as `state:"ready"` with an unsatisfied edge.
- Expected behavior: mounted adapter records should be private lifecycle state, and graph snapshots should include only records produced by validated mount transactions.
- Actual behavior: external code can inject arbitrary adapter records, providers, domains, and states into the proof graph.
- Why it matters: editors, debug panels, render hosts, and release proof tools can accidentally or maliciously bypass host validation and produce graph evidence that no mount lifecycle produced.
- Validation needed: fixtures for external `adapterRecords` mutation, record count/lifecycle parity, direct provider injection, invalid record shapes, and graph snapshot rejection or diagnostics.
- Suggested fix direction: keep records in a private closure, expose a cloned `getAdapterRecords()` or snapshot only, and validate records before graph rendering.
- Blocks DSK promotion: promotion-adjacent for host graph trust and proof surface integrity.

### 3. Adapter record state can be rewritten without lifecycle transition
- Severity: medium
- Owner: host lifecycle state ownership
- Evidence files and line references:
  - `src/host.js:124-137` copies `record.state` directly into graph adapters/domains.
  - `src/host.js:170-175` exposes both `adapterRecords` and `lifecycle` as mutable public objects.
  - `src/host.js:191-194` sets record state only on normal mount, with no state transition API or parity check afterward.
- Reproduction path: mount a normal adapter, then set `host.adapterRecords[0].state = "failed-without-api"` before calling `snapshot()`.
- Probe result: graph state became `failed-without-api`, while lifecycle still reported `state:"ready"` and `mountedAdapters:1`.
- Expected behavior: adapter state changes should flow through explicit host lifecycle APIs with diagnostics and lifecycle parity.
- Actual behavior: public record mutation can make graph adapter state disagree with host lifecycle state.
- Why it matters: human-view host inspectors and automated proof readers may treat adapter graph state as lifecycle evidence. Direct state rewrites make the graph neither authoritative nor internally consistent.
- Validation needed: fixtures for external record state mutation, lifecycle/adapters/domains parity, invalid state names, failed/recovering lifecycle transitions, and graph diagnostics.
- Suggested fix direction: encapsulate record state, validate allowed transitions, and derive lifecycle counters from private records during snapshot creation.
- Blocks DSK promotion: promotion-adjacent for host lifecycle proof.

### 4. Throwing mount callbacks can leak host mutations without a failed record
- Severity: medium
- Owner: host mount transaction boundary
- Evidence files and line references:
  - `src/host.js:181-189` validates requirements before invoking mount.
  - `src/host.js:191-194` calls `adapter.mount` before creating and pushing the adapter record.
  - `src/host.js:191` passes live `{ host, engine, adapter }` to the mount callback.
  - `tests/host-smoke.mjs:67-74` covers missing-requirement failure, not a mount callback that throws after side effects.
- Reproduction path: mount an adapter whose `mount({ host })` mutates `host.provides` and diagnostics, then throws.
- Probe result: error `mount failed`; `adapterRecords.length` stayed `0` and `mountedAdapters` stayed `0`, but `host.provides` retained `leaked.from.failed.mount` and diagnostics retained the callback-written warning.
- Expected behavior: failed mount should either stage and roll back host-visible mutations, record a failed adapter state for retry/diagnostics, or constrain mount callbacks from mutating host proof state directly.
- Actual behavior: mount side effects can survive after a failed mount with no failed record or transaction state.
- Why it matters: render/input/native adapters commonly allocate browser resources, streams, contexts, or event listeners during mount. A failed mount needs a retryable and diagnosable transaction boundary, especially before host graphs become proof surfaces.
- Validation needed: mount failure fixtures for throw-before-record, throw-after-host-mutation, throw-after-engine/resource mutation, retry behavior, diagnostics, and lifecycle counters.
- Suggested fix direction: create a staged `mounting` record before callback execution, use rollback/failure-state policy, and pass a constrained mount context or private host mutation API.
- Blocks DSK promotion: yes if host adapters become production lifecycle shells for DSK proof/runtime hosts.

## Domain and kit expansion risks
- Host graph hardening is broader than adapter token immutability. Root host capabilities and adapter records also need ownership boundaries before graph snapshots can support proof, editors, or public release claims.
- Public mutable host fields make it unclear which state is authoritative: authored host options, lifecycle APIs, graph snapshots, adapter callbacks, or external object mutation.
- Mount transaction policy should be aligned with DSK install transaction policy so host shells and promoted domain services fail consistently.

## Cross-cutting risks
- Passing smoke tests prove only happy-path host graph construction, a missing-requirement throw, and normal unmount.
- These findings extend but do not duplicate the previous host row. The previous row targets mutable adapter definitions, duplicate mounted identities, unmount failure, and snapshot callback purity; this row targets host-owned public state and mount callback transaction boundaries.
- These findings do not change package/public proof status. Fixing host state ownership would not resolve ProtoKits package resolution, Experiments route/API failures, npm 404, package-version split, or public browser imports.

## Missing validation
- Host root `provides` clone/freeze fixtures and explicit capability edit policy.
- Private adapter record fixtures that prevent direct array mutation and validate graph record shape.
- Lifecycle/record/domain parity fixtures under external mutation attempts.
- Mount failure transaction fixtures for callback throws after host, engine, resource, and diagnostics side effects.
- Host graph snapshot diagnostics for any record/lifecycle mismatch.

## DSK promotion blockers
- Do not treat `Nexus.Host` graph snapshots as authoritative proof while root host capabilities can be forged after creation.
- Do not expose host graph records as public mutable arrays if graph snapshots will count as release or human-view proof.
- Do not use host adapters as production lifecycle shells until mount failure behavior is transactional and diagnosable.
- Keep Host Graph Lifecycle Ownership separate from DSK Extension Service Ownership and public proof blockers; all remain open.

## Suggested next review item
- In a non-scout lane, add a compact host state ownership fixture set covering root `provides` immutability, private adapter records, lifecycle/record parity, and mount failure transactions alongside the previously identified adapter-token, duplicate-id, unmount, and snapshot-purity cases.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim dirty host-surface work is release-ready or public-consumption-ready.
- This packet does not claim public browser proof, npm publication, DSK hardening, host hardening, extension hardening, command/config ownership hardening, query read-model hardening, or any prior bug root is fixed.
- Playwright/Human View validation was not run because this deep bug scout had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current browser-visible proof status and still report the public proof route stuck at `Booting...`.
