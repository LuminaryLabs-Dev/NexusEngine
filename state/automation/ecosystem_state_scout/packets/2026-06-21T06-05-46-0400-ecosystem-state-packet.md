# Ecosystem State Packet: 2026-06-21T06-05-46-0400

## Scope
- Automation: Nexus Realtime: Ecosystem State Packet
- Workspace: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime`
- Repos checked: NexusRealtime core, NexusRealtime-ProtoKits, NexusRealtime-Experiments
- Result: partial; core commit remains aligned with the preflight-resolved release ref and tests pass, but branch-name drift, sibling main-ahead state, Experiments aggregate failure, targeted DSK failures, npm 404, and public browser import 404s keep ecosystem proof red.

## Lane Goal
- Audit NexusRealtime ecosystem state, drift, and proof readiness across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, public links, and proof paths.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-root-030`.
- Latest ecosystem state node `2026-06-20T18-11-35-0400` kept the active blocker on module-source strategy: ProtoKits validation, Experiments targeted proof, public browser proof, npm metadata, and package-version policy stayed separate from hardening inventory.
- Latest DSK architecture node `2026-06-20T18-23-40-0400` adds telemetry/command evidence ownership to the hardening queue.
- Latest ecosystem proof packet `2026-06-20T18-41-30-0400` introduced fresh sibling proof drift: available ProtoKits and Experiments checkout state could differ from the release ref while public proof remained `Booting...`.
- Latest deep bug packet `2026-06-20T17-54-14-0400` and domain idea packet `2026-06-20T19-02-02-0400` keep telemetry/command ownership as hardening inventory, not distribution proof.
- State packets were context only. Live source, docs, tests, git refs, public URLs, preflight, detached release checks, and Playwright launch state were authority for this run.

## Agent Workspace State
- Read `agent-it`, Playwright, and Human View Orchestrator instructions.
- Read `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, and `memory.md`.
- Agent rules require preflight branch resolution, public-link checks, lane-local evidence, and no source/docs/package/canonical-memory edits from this scout lane.
- Human-view validation question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Yes; the public DSK proof route is user-visible, so Playwright launch-state inspection was used.
- Transient Playwright CLI artifacts were removed after evidence capture.
- Running `npm run check` in Experiments generated route/gallery artifacts; the Experiments checkout was clean before the command, and those generated artifacts were restored/removed after validation.

## Latest Branch Preflight
- `npm run automation:preflight` passed at `2026-06-21T10:02:25.064Z`.
- Latest remote release branch: `0.0.2`.
- Compare target: `0.0.2`.
- Current core branch: `main`.
- Branch status: `current-differs-from-latest-release-branch`.
- Required core public links: pass.
- Optional npm metadata: 404.
- Core `HEAD`: `ff97ba47af4197952eca0aded593d66e1a0e4887`.
- Core `origin/main`: `ff97ba47af4197952eca0aded593d66e1a0e4887`.
- Core `origin/0.0.2`: `ff97ba47af4197952eca0aded593d66e1a0e4887`.
- Core ahead/behind vs `origin/0.0.2`: `0 0`.
- Core package metadata: `nexusrealtime@0.1.0`.
- Core `npm test`: passed 8 smoke tests.

## Public Links Checked
- `https://github.com/LuminaryLabs-Dev/NexusRealtime` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusRealtime/0.0.2/package.json` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@0.0.2/src/index.js` -> 200.
- `https://registry.npmjs.org/nexusrealtime` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/` -> 200 by fetch and Playwright navigation, but visible state stayed `Booting...`.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200.
- Public module dependency paths remain 404:
  - `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`

## Files Inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`, `docs/how-to-experiment.md`
- `src/index.js`, `src/domain-service-kit.js`, `tests/`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/ecosystem_state_scout/PROMPT.md`, `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- Latest current-lane ecosystem packet/node through `2026-06-20T18-11-35-0400`
- Latest neighboring DSK architecture, ecosystem proof, deep bug, and domain idea packets through `2026-06-20T19-02-02-0400`
- Sibling ProtoKits `package.json`, `docs/DSK-FIRST-WAVE-LEDGER.md`, `tests/dsk-first-wave.test.mjs`, local checkout, and fetched `origin/0.0.2`
- Sibling Experiments `package.json`, `experiments/dsk-first-wave-proof/index.html`, `experiments/dsk-first-wave-proof/src/proof.js`, `tests/dsk-first-wave-experiment-smoke.mjs`, local checkout, and fetched `origin/0.0.2`

## Ecosystem Findings
- Core branch name drift is now explicit: local core is on `main`, and preflight marks it different from latest release branch `0.0.2`.
- Core commit alignment is still stable: `HEAD`, `origin/main`, and `origin/0.0.2` all resolve to `ff97ba47af4197952eca0aded593d66e1a0e4887`; ahead/behind vs `origin/0.0.2` is `0 0`.
- Core `npm test` passed all 8 smoke tests.
- Required GitHub/raw/jsDelivr links remain reachable.
- Optional npm registry metadata remains unavailable with HTTP 404, so npm-backed consumption is not proven.
- Branch/package policy remains unresolved: release branch `0.0.2` serves package metadata version `0.1.0`.
- ProtoKits local checkout is on `main`, not `0.0.2`; local `HEAD` is `d94b43889dd0eb22df041e49b4efda30e7db375`, fetched `origin/0.0.2` is `264d4b6e53035ef4507b43bed72351a006cb0c20`, ahead/behind `21 0`.
- ProtoKits local package metadata is `@luminarylabs/nexusrealtime-protokits@0.0.2`.
- ProtoKits local `docs/DSK-FIRST-WAVE-LEDGER.md` still lists seven promoted-candidate first-wave kits and says no first-wave kit is half migrated.
- ProtoKits local aggregate `npm run check` passed after syntax-checking 398 JavaScript modules and running the current test script.
- ProtoKits local targeted DSK smoke failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime` from `tests/dsk-first-wave.test.mjs`.
- ProtoKits detached `origin/0.0.2` aggregate `npm run check` passed after syntax-checking 385 JavaScript modules, but detached targeted DSK smoke failed with the same missing package `nexusrealtime`.
- Experiments local checkout is on `main`, not `0.0.2`; local `HEAD` is `0e8ccf63a2383edbd55d15f3d81d4b802f6771c8`, fetched `origin/0.0.2` is `b845d402b5933bd2f0491483f2287661e9256c52`, ahead/behind `9 0`.
- Experiments local package metadata is `@luminarylabs/nexusrealtime-experiments@0.0.2`.
- Experiments local aggregate `npm run check` now fails at `tests/canonical-game-routes-smoke.mjs` because `the-open-above-v2` route should not be versioned.
- Experiments local targeted DSK smoke fails after module resolution reaches the proof body: `engine.n.zoneField` is undefined.
- Experiments detached `origin/0.0.2` aggregate `npm run check` fails at the same canonical route assertion, and detached targeted DSK smoke fails with the same `engine.n.zoneField` undefined error when sibling core/ProtoKits release extractions are present.
- Experiments aggregate validation remains separate from DSK first-wave targeted proof; `npm run check` still does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
- Public DSK proof remains HTTP-visible but not browser-complete: Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console/request output showed 404s for deployed NexusRealtime and ProtoKits module paths.

## Domain And Kit Expansion Signals
- Core/ProtoKits/Experiments ownership remains stable: core owns runtime/DSK/composer primitives and invariants, ProtoKits owns reusable implementations, and Experiments owns playable/browser proof.
- Fresh live drift adds two proof-readiness rows, not new kit ideas: branch-name-vs-ref alignment and Experiments aggregate canonical-route failure.
- Telemetry Command Evidence Ownership and Procedural Navigation State Ownership remain hardening inventory; they do not address module-source resolution, public imports, npm metadata, package-version policy, or aggregate-vs-targeted proof.
- The active ecosystem blocker is now sharper than the prior packet: module-source strategy still matters, but local/fetched Experiments aggregate failure and DSK API installation failure are separate red proof gates.

## Evidence
- `npm run automation:preflight` passed and resolved latest branch `0.0.2`, while reporting current branch `main` and status `current-differs-from-latest-release-branch`.
- Core `git rev-parse HEAD origin/main origin/0.0.2` returned `ff97ba47af4197952eca0aded593d66e1a0e4887` for all refs.
- Core `git rev-list --left-right --count HEAD...origin/0.0.2` returned `0 0`.
- Core `npm test` passed 8 smoke tests.
- ProtoKits `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed local `main` ahead of fetched `origin/0.0.2` by 21 commits.
- ProtoKits local `npm run check` passed; local targeted `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- ProtoKits detached `origin/0.0.2` `npm run check` passed; detached targeted DSK smoke failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- Experiments `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed local `main` ahead of fetched `origin/0.0.2` by 9 commits.
- Experiments local and detached `npm run check` failed at `tests/canonical-game-routes-smoke.mjs` on `the-open-above-v2 route should not be versioned`.
- Experiments local and detached targeted DSK smoke failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
- Fetch checks confirmed proof route/raw/CDN files remain public, while runtime dependency paths used by the public page remain 404.
- Playwright opened the public DSK proof route; snapshot showed `Booting...`; console/request history showed 404s for `NexusRealtime/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.

## Suggested Canonical Updates
- Decide whether automation/release proof should require checking out the latest release branch name or whether commit equality with `origin/0.0.2` is sufficient for core.
- Pick one module-source strategy for release proof: package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps.
- Make ProtoKits declare or model `nexusrealtime` resolution explicitly before treating targeted first-wave DSK validation as release evidence.
- Investigate why first-wave DSK kits do not install `zoneField` under `engine.n` in Experiments targeted proof after module resolution succeeds.
- Fix or route the Experiments canonical route assertion for `the-open-above-v2` before using aggregate `npm run check` as green release evidence.
- Wire `tests/dsk-first-wave-experiment-smoke.mjs` into aggregate Experiments validation or document it as required targeted evidence.
- Update public consumption wording or release policy so docs distinguish GitHub/jsDelivr branch consumption from unavailable npm registry metadata.
- Decide whether core branch `0.0.2` serving package version `0.1.0` is intentional policy or stale metadata.

## Knowledge Nodes
- Wrote `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-21T06-05-46-0400-ecosystem-state-node.md`.
- New root lesson: core commit alignment is stable despite local branch-name drift, but sibling proof readiness regressed/sharpened around main-ahead release refs, Experiments aggregate failure, targeted DSK API installation failure, unresolved ProtoKits package imports, npm 404, and public browser module 404s.

## Master Tracker Updates
- Added `ecosystem-root-031`.
- Marked `ecosystem-root-030` as superseded by `ecosystem-root-031`.
- Added child branches for branch-name vs ref alignment, ProtoKits targeted package resolution, Experiments aggregate canonical route failure, Experiments targeted DSK API installation failure, public browser module 404s, and npm/package-version policy.

## Not Claimed
- This packet does not edit source, tests, README, package metadata, public claims, release branches, deployments, `.agent`, canonical memory, ProtoKits, or Experiments.
- This packet does not pull, merge, rebase, reset, fast-forward, or publish sibling repos.
- This packet does not publish npm metadata or prove npm installability.
- This packet does not claim local branch names match latest release branch names.
- This packet does not claim ProtoKits targeted first-wave DSK validation passed.
- This packet does not claim Experiments aggregate validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation includes DSK first-wave proof coverage.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not fix GitHub Pages module paths, module-source resolution, canonical route naming, or DSK API installation.
- This packet does not promote ProtoKits into core.
- This packet does not claim procedural/navigation ownership, telemetry/command evidence ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
