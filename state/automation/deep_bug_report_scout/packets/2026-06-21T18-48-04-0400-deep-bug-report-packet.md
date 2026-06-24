# Deep Bug Report Packet: 2026-06-21T18:48:04-04:00

Timestamp: 2026-06-21T18:48:04-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for Nexus.Host graph ownership and lifecycle boundaries

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-21-domain-command-config-ownership`.
- Recent deep packets already cover domain command/config ownership, telemetry/command payload ownership, procedural/navigation state ownership, scheduler/world mutation isolation, query read-model leaks, runtime identity/lifecycle, DSK install failure boundaries, and duplicate runtime binding/provider diagnostics.
- Latest ecosystem state/proof packets report that core `main`, `origin/main`, and `origin/0.0.2` are commit-aligned, smoke tests now include dirty host-surface coverage, and the ecosystem remains red across ProtoKits targeted package resolution, Experiments aggregate route validation, Experiments targeted `engine.n.zoneField`, npm metadata, and public browser module loading.
- Latest DSK architecture packet treats dirty host-surface work as release-proof context, not DSK hardening, and keeps command/config ownership as separate hardening inventory.
- Latest domain idea packet maps command/config ownership into planning inventory but predates this host graph bug family.
- State packets were context only. Live source, docs, tests, preflight, duplicate scans, and focused probes were authority for this run.

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
- Worktree had pre-existing dirty host-surface and neighboring automation changes before this run: `src/index.js`, `src/host.js`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`, `tests/host-smoke.mjs`, `docs/ideal/ideal-hosts.md`, `examples/three-host/`, and newer neighboring lane artifacts.
- This lane wrote only this packet, its knowledge node, and the lane master tracker update.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/ideal/ideal-hosts.md`, `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/host.js`, `src/index.js`
- `tests/host-smoke.mjs`, `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404; current branch `main` differs from latest release branch name.
- `npm test`
  - Result: passed 9 smoke tests, including `host-smoke ok`.
- `git status --short --branch`
  - Result: branch `main...origin/main`; pre-existing source/test/docs/example and neighboring lane changes were present.
- `git rev-parse HEAD origin/main origin/0.0.2`
  - Result: all refs resolve to `6c450b3073825ddd495979474f57342556658972`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing packet duplicate scan for host, Host, adapter, graph snapshot, duplicate adapter, unmount adapter, adapter records, diagnostics, provides, and requires.
- Inline Node probe: mutable adapter `provides` after mount.
  - Result: mutating the returned adapter's `provides` array added `forged.token`; a second adapter requiring that forged token mounted successfully, and graph edge reported the first adapter as provider.
- Inline Node probe: duplicate adapter ids.
  - Result: mounting two adapters with id `duplicate-adapter` left two `adapterRecords`, but `snapshot().adapters` had one key whose snapshot came from the second adapter while lifecycle reported two mounted adapters.
- Inline Node probe: throwing unmount callback.
  - Result: `unmountAdapter()` spliced the record before invoking `unmount`; after the callback threw, `adapterRecords.length` was `0` while `lifecycle.mountedAdapters` stayed `1`.
- Inline Node probe: snapshot callback side effect.
  - Result: calling `host.snapshot()` let an adapter `snapshot()` mutate `host.diagnostics`; returned diagnostics stayed at `0` because diagnostics were copied before adapter snapshots, while host diagnostics became `1`.

## Existing bug packets checked
- Prior deep packets through `2026-06-21T06-48-34-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover duplicate runtime binding/provider diagnostics, duplicate ECS definition identity, event history mutation, command/config ownership, query read-model isolation, scheduler/world mutation, and procedural/navigation ownership.
- This packet does not duplicate those rows. It isolates the new `Nexus.Host` graph and adapter lifecycle surface added in the dirty host work: adapter token mutation, duplicate adapter identity collapse, non-atomic unmount, and read-side snapshot mutation.

## Executive summary
- Current smoke tests pass, but `Nexus.Host` graph state is mutable through public adapter and host objects after dependency validation.
- `defineHostAdapter()` freezes only the top-level object; nested `provides` and `requires` arrays remain mutable, letting mounted adapters forge capabilities after validation.
- `createNexusHost().mountAdapter()` accepts duplicate adapter ids/domains, while `createHostGraphSnapshot()` stores adapters/domains in objects keyed by id/domain, so duplicate mounted adapters collapse in the proof graph.
- `unmountAdapter()` removes the record before calling adapter `unmount()`, so a throwing cleanup loses the adapter record and leaves lifecycle counters stale.
- `createHostGraphSnapshot()` invokes user adapter `snapshot()` callbacks with live `{ host, engine, adapter }`, so a read-only graph snapshot can mutate host state.

## Deep bug reports

### 1. Adapter token arrays stay mutable after dependency validation
- Severity: high
- Owner: host graph dependency ownership
- Evidence files and line references:
  - `src/host.js:86-95` freezes the adapter object but leaves nested `provides` and `requires` arrays mutable.
  - `src/host.js:48-52` trusts current `record.adapter.provides` when building the provider index.
  - `src/host.js:181-195` validates missing requirements once at mount time and returns the same adapter object.
- Reproduction path: mount adapter A, mutate `adapterA.provides.push("forged.token")`, then mount adapter B with `requires:["forged.token"]`.
- Probe result: adapter B mounted and graph edge reported `{"from":"adapter-a","to":"adapter-b","token":"forged.token","providerKind":"adapter","satisfied":true}`.
- Expected behavior: adapter capabilities should be captured/frozen at definition or mount; dependency validation should not be forgeable through a returned nested array.
- Actual behavior: any holder of the mounted adapter object can change graph providers after validation.
- Why it matters: hosts are intended to make composition visible and valid. Mutable capability arrays undermine dependency proof, adapter ordering, and release/runtime graph inspection.
- Validation needed: host fixtures for adapter token array immutability, post-mount mutation attempts, dependency revalidation policy, and snapshot edge stability.
- Suggested fix direction: freeze cloned token arrays or deep-freeze adapter definitions, and treat runtime provider changes as explicit remount/revalidate operations.
- Blocks DSK promotion: promotion-adjacent for host graph proof and adapter dependency integrity.

### 2. Duplicate adapter ids/domains collapse mounted adapters in graph snapshots
- Severity: medium
- Owner: host graph identity
- Evidence files and line references:
  - `src/host.js:181-195` does not reject duplicate adapter ids or duplicate domain owners before pushing records.
  - `src/host.js:124-137` writes `adapters[adapter.id]` and `domains[adapter.domain]`, so later duplicates overwrite earlier graph entries.
  - `src/host.js:197-205` unmounts by first matching adapter id, which is ambiguous after duplicate ids are mounted.
- Reproduction path: mount two adapters with the same `id:"duplicate-adapter"` and same domain, then call `host.snapshot()`.
- Probe result: `adapterRecords.length` was `2`, lifecycle reported `mountedAdapters:2`, but `snapshot().adapters` had one `duplicate-adapter` key and the retained snapshot was from the second adapter.
- Expected behavior: adapter identity should be unique or duplicates should be represented explicitly with diagnostics.
- Actual behavior: the live host has two mounted records, while the graph proof hides one of them.
- Why it matters: graph snapshots will be used by proof panels, host inspectors, editors, and release evidence. Collapsed adapters make a host look simpler and more valid than the live runtime state.
- Validation needed: duplicate adapter id/domain fixtures, duplicate provider diagnostics, unmount-by-id ambiguity fixtures, and graph snapshot parity between record count and rendered graph nodes.
- Suggested fix direction: reject duplicate adapter ids by default, add explicit override policy for domains/providers, and include diagnostics when domain ownership changes.
- Blocks DSK promotion: promotion-adjacent for host/adaptor graph trust.

### 3. Throwing unmount callbacks make host lifecycle non-atomic
- Severity: medium
- Owner: host lifecycle failure boundary
- Evidence files and line references:
  - `src/host.js:197-205` splices the adapter record before calling `record.adapter.unmount?.(...)`.
  - `src/host.js:204` updates `mountedAdapters` only after the callback returns.
- Reproduction path: mount an adapter whose `unmount()` throws, then call `host.unmountAdapter("throwing-unmount")`.
- Probe result: the thrown error left `adapterRecords.length:0` while `lifecycle.mountedAdapters:1`.
- Expected behavior: failed unmount should either leave the adapter mounted, mark it failed, or complete a consistent cleanup transaction.
- Actual behavior: the record is removed but lifecycle state is stale, and the host no longer has the adapter record needed for retry/diagnostics.
- Why it matters: browser/native/render adapters commonly release canvases, streams, audio contexts, or handles during unmount. Cleanup failure must be retryable and diagnosable.
- Validation needed: unmount failure fixtures for throw-before-cleanup, throw-after-partial-cleanup, retry policy, diagnostics, lifecycle counters, and graph state.
- Suggested fix direction: call unmount before removing the record or use a two-phase state transition such as `unmounting`/`failed-unmount` with diagnostics and retry.
- Blocks DSK promotion: yes for host lifecycle reliability if host adapters become part of proof/runtime shells.

### 4. Graph snapshots can mutate host state while presenting as a read API
- Severity: medium
- Owner: host read-model side effects
- Evidence files and line references:
  - `src/host.js:108` copies diagnostics before adapter snapshots run.
  - `src/host.js:126-134` calls `adapter.snapshot({ host, engine: host.engine, adapter })` during graph snapshot creation.
  - `src/host.js:140-149` returns the graph after those callbacks, while any callback mutations remain on the live host.
- Reproduction path: mount an adapter whose `snapshot()` pushes a diagnostic into `host.diagnostics`, then call `host.snapshot()`.
- Probe result: host diagnostics changed from `0` to `1`, while returned snapshot diagnostics remained `0` because diagnostics had already been copied.
- Expected behavior: graph snapshot reads should be passive, or side effects should be explicit and consistently reflected in the returned graph.
- Actual behavior: a read call can mutate host state and return stale diagnostics relative to the post-read host.
- Why it matters: proof panels and human-view tools may poll snapshots; polling should not change runtime diagnostics, lifecycle, adapters, or dependency graph.
- Validation needed: adapter snapshot side-effect fixtures, read-only callback context policy, diagnostics timing, and graph snapshot idempotency under repeated reads.
- Suggested fix direction: pass a read-only context to snapshot callbacks, capture diagnostics after callbacks if side effects are allowed, and document/validate snapshot purity.
- Blocks DSK promotion: promotion-adjacent for proof snapshot trust.

## Domain and kit expansion risks
- The new host surface turns composition into a public graph, so host graph contracts need the same ownership policy already demanded from DSK command/read APIs.
- Host adapters may become render, input, editor, storage, audio, and native bridge boundaries. Mutable capabilities and non-atomic lifecycle cleanup can make those bridges unsafe for proof and runtime reuse.
- Dirty host-surface smoke coverage proves the happy path, not graph immutability, duplicate identity policy, lifecycle failure behavior, or passive snapshot semantics.

## Cross-cutting risks
- Passing smoke tests does not cover malicious or accidental post-mount adapter mutation, duplicate adapter identity, failing cleanup, or polling side effects.
- These findings are separate from package/public proof blockers. Fixing public module paths would not make host graph snapshots trustworthy.
- These findings extend but do not duplicate runtime duplicate binding/provider rows: the affected surface is the new `Nexus.Host` adapter graph, not `engine.kit` bindings.

## Missing validation
- Host adapter token immutability fixtures for `provides`, `requires`, metadata, returned adapter mutation, and graph edge stability.
- Duplicate adapter id/domain/provider fixtures with explicit diagnostics and unmount semantics.
- Host lifecycle failure-boundary fixtures for mount and unmount callbacks that throw before/after side effects.
- Snapshot purity fixtures for adapter snapshot callbacks, live host/engine mutation attempts, diagnostics timing, and repeated polling.
- Host graph record parity fixtures ensuring mounted records, lifecycle counts, `adapters`, `domains`, and edges agree.

## DSK promotion blockers
- Do not treat `Nexus.Host` graph snapshots as release/proof evidence while adapter capability arrays can be mutated after validation.
- Do not rely on host graph snapshots to count or identify adapters until duplicate adapter ids/domains have a policy.
- Do not use host adapters as production lifecycle shells until unmount failure behavior is atomic and diagnosable.
- Do not poll host snapshots as a passive proof surface until adapter snapshot callback side effects are constrained or explicitly captured.

## Suggested next review item
- In a non-scout lane, add a compact host graph hardening fixture set around adapter token immutability, duplicate adapter identity, mount/unmount failure transactions, and snapshot purity before promoting the host surface into public release claims.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim dirty host-surface work is release-ready or public-consumption-ready.
- This packet does not claim public browser proof, npm publication, DSK hardening, host hardening, command/config ownership hardening, query read-model hardening, or any prior bug root is fixed.
- Playwright/Human View validation was not run because this deep bug scout had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current browser-visible proof status.
