# Deep Bug Report Packet: 2026-06-22T06:49:01-04:00

Timestamp: 2026-06-22T06:49:01-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for `extendDomainServiceKit()` install and definition boundaries

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-21-host-graph-lifecycle-ownership`.
- Recent deep packets already cover host graph lifecycle ownership, domain command/config ownership, telemetry/command payload ownership, procedural/navigation state ownership, scheduler/world mutation isolation, query read-model leaks, runtime identity/lifecycle, DSK install failure boundaries, and duplicate runtime binding/provider diagnostics.
- Latest ecosystem state/proof packets report core commit alignment with `origin/main` and `origin/0.0.2`, green local smoke tests, dirty core host/docs/source/test work, ProtoKits local-vs-release drift, unresolved targeted package/API proof, npm 404, and public browser module loading failures.
- Latest DSK architecture packet keeps dirty host-surface work and Host Graph Lifecycle Ownership separate from DSK hardening, and repeatedly lists end-to-end `extendDomainServiceKit()` install behavior as unproven beyond definition-time duplicate checks.
- Latest domain idea packet maps Host Graph Lifecycle Ownership into planning inventory.
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
- Worktree had pre-existing dirty docs/source/test and neighboring lane artifacts before this run, including `src/index.js`, `src/host.js`, host docs/examples/tests, multiple `docs/ideal/*` files, and newer automation artifacts.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `src/index.js`
- `tests/domain-service-kit-smoke.mjs`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404; current branch `main` differs from latest release branch name.
- `npm test`
  - Result: passed 9 smoke tests.
- `git status --short --branch`
  - Result: branch `main...origin/main`; pre-existing dirty source/docs/test and neighboring lane changes were present.
- `git rev-parse HEAD origin/0.0.2 origin/main`
  - Result: all three refs resolve to `6c450b3073825ddd495979474f57342556658972`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing packet duplicate scan for `extendDomainServiceKit`, extension install, `scanSurveyExtra`, duplicate extension resources, DSK install atomicity, and runtime definition aliasing.
- Inline Node probe: install an extension created without `createApi`.
  - Result: `engine.n` contained only `baseProbe`; extension metadata promised `apiName:"baseProbeExtra"` and `provides:["n:base-probe:extra"]`, but `engine.n.baseProbeExtra` was missing.
- Inline Node probe: install an extension with `createApi` after the base kit was already installed.
  - Result: install threw `Domain service kit n-base-probe-kit cannot overwrite engine.n.baseProbe`, but `engine.n.baseProbeWithApi` remained installed and `engine.kits`/`engine.domainServiceKits` retained `n-base-probe-with-api-kit`.
- Inline Node probe: extend with a resource under a different object key but the same definition name.
  - Result: extension definition succeeded with resource keys `BaseSame` and `DifferentKey`, both named `probe.sameResource`.

## Existing bug packets checked
- Prior deep packets through `2026-06-21T18-48-04-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover failed DSK API collision rollback, missing non-`n:` direct install parity, duplicate ECS definition names across separate kits, duplicate bindings/providers, and host graph lifecycle ownership.
- This packet does not duplicate those rows. It isolates the untested DSK extension surface: promised extension APIs, base-plus-extension install order, and definition-name duplicate checks inside `extendDomainServiceKit()` output.

## Executive summary
- Current smoke tests pass, but `extendDomainServiceKit()` is only covered for definition-time metadata and duplicate key checks.
- Installing an extension without its own `createApi` can provide extension service tokens and carry a distinct `apiName` while exposing no `engine.n.<extensionApi>` surface.
- Installing an extension with its own API after the base kit is already installed can partially install the extension API and kit record before the wrapped base install throws on the base API collision.
- Extension duplicate checks compare object keys, not ECS definition names, so an extension can add a resource/component/event under a different key that aliases the same world store or event queue.

## Deep bug reports

### 1. Extension kits can promise a service API but install only the base API
- Severity: high
- Owner: DSK extension API contract
- Evidence files and line references:
  - `src/domain-service-kit.js:210-244` builds the extension config and preserves `apiName`, `services`, and merged `provides`, but does not preserve the base `createApi`.
  - `src/domain-service-kit.js:143-162` installs `engine.n[apiName]` only when `config.createApi` returns an API or `config.install` returns a value.
  - `tests/domain-service-kit-smoke.mjs:79-92` validates extension metadata and duplicate checks but never installs the `extended` kit.
- Reproduction path: create a base DSK with `createApi`, extend it with `apiName:"baseProbeExtra"` and `services:["extra"]` but no extension `createApi`, then create an engine with only the extension kit.
- Probe result: `engine.n` keys were `["baseProbe"]`; `engine.n.baseProbeExtra` was missing even though the extension provides `n:base-probe:extra`.
- Expected behavior: an extension that declares a distinct `apiName` and service token should either install that API, compose/return an extension API, or reject the definition as API-less.
- Actual behavior: the extension advertises capability and metadata that no `engine.n.*` API fulfills.
- Why it matters: ProtoKits may use extension kits to add command/snapshot/reset services. A proof graph can show a service token while consumers fail at runtime because the matching API surface was never installed.
- Validation needed: install the smoke-test extension end to end and assert expected `engine.n` keys, service token/API parity, and no API-less extension service promises.
- Suggested fix direction: require `createApi` or an install return for extensions with a distinct `apiName`, or explicitly model extensions as base-API augmenters without new `apiName`/service promises.
- Blocks DSK promotion: yes; extension services cannot be trusted as promoted `engine.n.*` APIs until token/API parity is enforced.

### 2. Extension install after base install is non-atomic and leaves partial extension state
- Severity: high
- Owner: DSK extension install atomicity
- Evidence files and line references:
  - `src/runtime-kit.js:147-157` records DSK metadata, bindings, and kit identity before later install work can throw.
  - `src/runtime-kit.js:214-215` runs `kit.install()` after the kit is already in `engine.kits`.
  - `src/domain-service-kit.js:143-162` sets the extension API before calling the custom extension install wrapper.
  - `src/domain-service-kit.js:240-242` makes the custom extension install call `baseKit.install?.(context)` before extension install work.
- Reproduction path: install the base DSK, then install an extension DSK that defines its own `createApi`.
- Probe result: extension install threw because `baseKit.install` tried to overwrite existing `engine.n.baseProbe`, but `engine.n.baseProbeWithApi` remained present and `engine.kits` plus `engine.domainServiceKits` retained `n-base-probe-with-api-kit`.
- Expected behavior: failed extension install should leave no extension API, kit record, or DSK metadata, or should support a clean idempotent base-already-installed path.
- Actual behavior: the engine advertises the failed extension as installed and exposes the extension API even though install returned an error.
- Why it matters: extension promotion will often happen after a base service is already present. A partial extension can make proof panels, host graphs, and downstream kits believe a service is available after a failed transaction.
- Validation needed: extension install fixtures for base-not-installed, base-already-installed, extension API collision, extension install throw, and same-object retry after failure.
- Suggested fix direction: make extension install base-aware, install base only when missing, and stage extension API/metadata/kit records until all install callbacks succeed.
- Blocks DSK promotion: yes; extension install must be transactional before promoted service graphs rely on it.

### 3. Extension duplicate checks miss same-name ECS definitions under different keys
- Severity: medium
- Owner: DSK extension definition identity
- Evidence files and line references:
  - `src/domain-service-kit.js:54-59` detects duplicates by object key overlap only.
  - `src/domain-service-kit.js:204-207` applies that key-based duplicate check to components, resources, events, and bindings.
  - `src/ecs.js:17-26` stores components/resources/events by definition `name`, not by the object key used in kit config.
- Reproduction path: define a base kit with `resources:{BaseSame: defineResource("probe.sameResource")}` and extend it with `resources:{DifferentKey: defineResource("probe.sameResource")}`.
- Probe result: extension succeeded with two resource keys, while both definitions had the same `name:"probe.sameResource"`.
- Expected behavior: extension duplicate validation should reject same-name ECS definitions even when config keys differ.
- Actual behavior: the extension validates, but both resources alias the same underlying world resource store.
- Why it matters: extension authors can accidentally shadow base state through a different object key, making reset/snapshot contracts look independent while reading and writing the same ECS resource or event queue.
- Validation needed: duplicate definition-name fixtures for components, resources, and events inside `extendDomainServiceKit()`, including same key/different name and different key/same name cases.
- Suggested fix direction: check both config keys and definition `.name` values when merging components/resources/events, and make intentional aliasing explicit if supported.
- Blocks DSK promotion: promotion-adjacent; extension state boundaries need definition-name identity checks before service resets/snapshots are trustworthy.

## Domain and kit expansion risks
- DSK extension kits are the natural path for ProtoKits to add services without rewriting base domains. Missing extension APIs and partial extension installs make that path unsafe for first-wave service expansion.
- Service token/API parity should be a hard invariant: if a DSK provides `n:<domain>:<service>`, the expected `engine.n.*` surface must either expose that service or the token should be proof-only and documented as such.
- Extension duplicate checks need to match ECS storage identity, not object-shape identity, because the world stores state by definition name.

## Cross-cutting risks
- Passing smoke tests do not install the `extended` kit created in `tests/domain-service-kit-smoke.mjs`, so the extension API contract is currently unproven.
- These findings extend but do not duplicate earlier DSK install rollback bugs. The earlier row targets clean API collision and missing non-`n:` requirements; this row targets base-plus-extension install composition and extension API/token parity.
- These findings also extend but do not duplicate generic ECS same-name aliasing. The affected path is `extendDomainServiceKit()` duplicate validation, where users expect base/extension merge checks to guard the boundary.

## Missing validation
- End-to-end extension installation fixtures for the existing smoke-test `extended` kit.
- Token/API parity checks for extension `services`, `provides`, `apiName`, and installed `engine.n.*` surface.
- Extension install atomicity fixtures for base preinstalled, extension preinstalled, collision, thrown install, and retry.
- Duplicate ECS definition-name checks across base and extension components/resources/events.
- Proof graph fixtures that distinguish base APIs, extension APIs, and API-less extension service tokens.

## DSK promotion blockers
- Do not use `extendDomainServiceKit()` as a promoted service-expansion path until installing an extension proves the promised API is present.
- Do not install extension kits after base kits in production proof without transactional rollback or base-already-installed handling.
- Do not trust extension reset/snapshot/service boundaries until duplicate definition names are rejected or intentionally modeled.

## Suggested next review item
- In a non-scout lane, add an end-to-end `extendDomainServiceKit()` smoke fixture that installs the existing `extended` kit and asserts service token/API parity, base-already-installed behavior, rollback on failed extension install, and same-name ECS definition rejection.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, DSK hardening, extension hardening, host hardening, command/config ownership hardening, query read-model hardening, or any prior bug root is fixed.
- Playwright/Human View validation was not run because this deep bug scout had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current browser-visible proof status.
