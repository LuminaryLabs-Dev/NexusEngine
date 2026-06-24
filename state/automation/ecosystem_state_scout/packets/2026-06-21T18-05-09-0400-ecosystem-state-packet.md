# Ecosystem State Packet: 2026-06-21T18-05-09-0400

## Scope
- Automation: Nexus Realtime: Ecosystem State Packet
- Workspace: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime`
- Repos checked: NexusRealtime core, NexusRealtime-ProtoKits, NexusRealtime-Experiments
- Result: partial; core and sibling `origin/0.0.2` refs are aligned and core smoke tests now pass 9 tests, but the ecosystem proof remains red across dirty core host-surface changes, sibling `origin/main` drift, ProtoKits targeted package resolution, Experiments aggregate route validation, Experiments targeted DSK API installation, npm metadata, and public browser module loading.

## Lane Goal
- Audit NexusRealtime ecosystem state, drift, and proof readiness across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, public links, and proof paths.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-root-031`.
- Latest ecosystem state packet `2026-06-21T06-05-46-0400` reported core `main` commit parity with `origin/0.0.2`, ProtoKits and Experiments `main` ahead of release refs, ProtoKits targeted package failure, Experiments aggregate route failure, Experiments targeted `engine.n.zoneField` failure, npm 404, and public browser module 404s.
- Latest DSK architecture packet `2026-06-21T06-19-09-0400` kept branch-name drift as release-proof policy and telemetry/command evidence ownership as hardening inventory, not distribution proof.
- Latest ecosystem proof packet `2026-06-21T06-36-07-0400` kept branch-name policy, package resolution, aggregate-route validation, DSK API installation, npm publication, and browser import deployment as separate gates.
- Latest deep bug packet `2026-06-21T06-48-34-0400` added Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations command/config ownership bugs.
- Latest domain idea packet `2026-06-21T07-02-40-0400` added Domain Command Config Ownership planning inventory from that deep-bug evidence.
- State packets were context only. Live source, docs, tests, git refs, public URLs, preflight, disposable release checks, and Playwright launch state were authority.

## Agent Workspace State
- Read `agent-it`, Playwright, and Human View Orchestrator instructions.
- Read `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, and `memory.md`.
- Agent rules require preflight branch resolution, public-link checks, lane-local evidence, and no source/docs/package/canonical-memory edits from this scout lane.
- Human-view validation question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Yes; the public DSK proof route is user-visible, so Playwright launch-state inspection was used.
- Transient Playwright CLI artifacts were removed after evidence capture.
- Pre-existing core worktree changes were present before lane writes and were treated as evidence only: `src/index.js`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`, untracked `docs/ideal/ideal-hosts.md`, `examples/three-host/`, `src/host.js`, and `tests/host-smoke.mjs`.

## Latest Branch Preflight
- `npm run automation:preflight` passed at `2026-06-21T22:01:22.635Z`.
- Latest remote release branch: `0.0.2`.
- Compare target: `0.0.2`.
- Current core branch: `main`.
- Branch status: `current-differs-from-latest-release-branch`.
- Required core public links: pass.
- Optional npm metadata: 404.
- Core `HEAD`: `6c450b3073825ddd495979474f57342556658972`.
- Core `origin/main`: `6c450b3073825ddd495979474f57342556658972`.
- Core `origin/0.0.2`: `6c450b3073825ddd495979474f57342556658972`.
- Core ahead/behind vs `origin/0.0.2`: `0 0`.
- Core package metadata: `nexusrealtime@0.1.0`.
- Core `npm test`: passed 9 smoke tests.

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
- `state/automation/README.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/ecosystem_state_scout/PROMPT.md`, `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- Latest current-lane ecosystem packet/node through `2026-06-21T06-05-46-0400`
- Latest neighboring DSK architecture, ecosystem proof, deep bug, and domain idea packets/nodes through `2026-06-21T07-02-40-0400`
- Sibling ProtoKits `package.json`, `docs/DSK-FIRST-WAVE-LEDGER.md`, `tests/dsk-first-wave.test.mjs`, `protokits/domain-foundation/`, `protokits/domain-service-kits/`, `protokits/nexus-dsk-adapter/`, local checkout, and fetched refs
- Sibling Experiments `package.json`, `experiments/dsk-first-wave-proof/index.html`, `experiments/dsk-first-wave-proof/src/proof.js`, `tests/dsk-first-wave-experiment-smoke.mjs`, `tests/canonical-game-routes-smoke.mjs`, local checkout, and fetched refs

## Ecosystem Findings
- Core branch-name drift remains: local core is on `main`, and preflight marks it different from latest release branch `0.0.2`.
- Core commit alignment is stable at the newer commit `6c450b3073825ddd495979474f57342556658972`: `HEAD`, `origin/main`, and `origin/0.0.2` all match; ahead/behind vs `origin/0.0.2` is `0 0`.
- Core worktree is dirty with host-surface changes and new host smoke coverage. `npm test` now passes 9 smoke tests, including `host-smoke ok`, but those worktree changes are not lane-owned and were not edited.
- Required GitHub/raw/jsDelivr links remain reachable.
- Optional npm registry metadata remains unavailable with HTTP 404, so npm-backed consumption is not proven.
- Branch/package policy remains unresolved: release branch `0.0.2` serves package metadata version `0.1.0`.
- ProtoKits local checkout is on `main`, clean, and equals fetched `origin/0.0.2` at `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`; ahead/behind vs `origin/0.0.2` is `0 0`.
- ProtoKits `origin/main` is ahead at `b67fb126844c78c6bdc38ed05990a637673a382f`; local `main...origin/main` is behind 35.
- ProtoKits package metadata is `@luminarylabs/nexusrealtime-protokits@0.0.2`.
- ProtoKits local `docs/DSK-FIRST-WAVE-LEDGER.md` still lists seven promoted-candidate first-wave kits and says no first-wave kit is half migrated.
- ProtoKits local `npm run check` passed after syntax-checking 411 JavaScript modules and running the current test script.
- ProtoKits local targeted DSK smoke failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime` from `tests/dsk-first-wave.test.mjs`.
- Disposable `origin/0.0.2` ProtoKits aggregate check passed after syntax-checking 411 JavaScript modules; disposable targeted DSK smoke failed with the same missing package `nexusrealtime`.
- Experiments local checkout is on `main`, clean, and equals fetched `origin/0.0.2` at `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; ahead/behind vs `origin/0.0.2` is `0 0`.
- Experiments `origin/main` advanced to `6d047bb11806e3430084ddca0fb49a28f0f17a3e`; local `main...origin/main` is behind 4.
- Experiments package metadata is `@luminarylabs/nexusrealtime-experiments@0.0.2`.
- Experiments disposable `origin/0.0.2` aggregate `npm run check` generated 100 promoted application route wrappers and gallery data for 124 routes in `/tmp`, then failed at `tests/canonical-game-routes-smoke.mjs` because `the-open-above-v2 route should not be versioned`.
- Experiments local and disposable targeted DSK smoke both fail after module resolution reaches the proof body: `engine.n.zoneField` is undefined at `experiments/dsk-first-wave-proof/src/proof.js:23`.
- Experiments aggregate validation remains separate from DSK first-wave targeted proof; `npm run check` still does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
- Public DSK proof remains HTTP-visible but not browser-complete: Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console output showed 404s for deployed NexusRealtime and ProtoKits module paths.

## Domain And Kit Expansion Signals
- Core/ProtoKits/Experiments ownership remains stable: core owns runtime/DSK/composer primitives and invariants, ProtoKits owns reusable implementations, and Experiments owns playable/browser proof.
- New core host-surface work is visible in the dirty checkout and passing smoke tests, but this lane cannot claim it as released, promoted, or public-proofed.
- Fresh sibling state replaces the prior main-ahead finding: both sibling release refs now match local checkout, while `origin/main` is ahead of both local `main` branches.
- Domain Command Config Ownership is new hardening inventory from neighboring lanes; it does not address module-source resolution, public imports, npm metadata, package-version policy, aggregate route failure, or targeted DSK API installation.

## Evidence
- `npm run automation:preflight` passed and resolved latest branch `0.0.2`, while reporting current branch `main` and status `current-differs-from-latest-release-branch`.
- Core `git rev-parse HEAD origin/main origin/0.0.2` returned `6c450b3073825ddd495979474f57342556658972` for all refs.
- Core `git rev-list --left-right --count HEAD...origin/0.0.2` returned `0 0`.
- Core `npm test` passed 9 smoke tests.
- ProtoKits `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed local clean `main` equals `origin/0.0.2` but is behind `origin/main` by 35.
- ProtoKits local `npm run check` passed; local targeted `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- Disposable release layout with core, ProtoKits, and Experiments extracted at `origin/0.0.2` reproduced ProtoKits aggregate pass and targeted package failure.
- Experiments `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed local clean `main` equals `origin/0.0.2` but is behind `origin/main` by 4.
- Experiments disposable `npm run check` failed at `tests/canonical-game-routes-smoke.mjs` on `the-open-above-v2 route should not be versioned`.
- Experiments local and disposable targeted DSK smoke failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
- Fetch checks confirmed proof route/raw/CDN files remain public, while runtime dependency paths used by the public page remain 404.
- Playwright opened the public DSK proof route; snapshot showed `Booting...`; console output showed 404s for `NexusRealtime/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.

## Suggested Canonical Updates
- Decide whether automation/release proof should require checking out the latest release branch name or whether commit equality with `origin/0.0.2` is sufficient for core and siblings.
- Decide how the new dirty core host-surface work should be separated from release-proof claims before later public/package claims reference it.
- Pick one module-source strategy for release proof: package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps.
- Make ProtoKits declare or model `nexusrealtime` resolution explicitly before treating targeted first-wave DSK validation as release evidence.
- Investigate why first-wave DSK kits do not install `zoneField` under `engine.n` in Experiments targeted proof after module resolution succeeds.
- Fix or route the Experiments canonical route assertion for `the-open-above-v2` before using aggregate `npm run check` as green release evidence.
- Wire `tests/dsk-first-wave-experiment-smoke.mjs` into aggregate Experiments validation or document it as required targeted evidence.
- Update public consumption wording or release policy so docs distinguish GitHub/jsDelivr branch consumption from unavailable npm registry metadata.
- Decide whether core branch `0.0.2` serving package version `0.1.0` is intentional policy or stale metadata.

## Knowledge Nodes
- Wrote `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-21T18-05-09-0400-ecosystem-state-node.md`.
- New root lesson: core and sibling release refs are aligned again, but dirty core host-surface work and sibling `origin/main` drift add freshness risk while targeted/package, aggregate-route, targeted-DSK API, npm, and public-browser proof gates remain red.

## Master Tracker Updates
- Added `ecosystem-root-032`.
- Marked `ecosystem-root-031` as superseded by `ecosystem-root-032`.
- Added child branches for core dirty host-surface evidence, sibling release-ref alignment with `origin/main` drift, ProtoKits targeted package resolution, Experiments aggregate canonical route failure, Experiments targeted DSK API installation failure, public browser module 404s, npm/package-version policy, and command/config hardening inventory separation.

## Not Claimed
- This packet does not edit source, tests, README, package metadata, public claims, release branches, deployments, `.agent`, canonical memory, ProtoKits, or Experiments.
- This packet does not pull, merge, rebase, reset, fast-forward, or publish sibling repos.
- This packet does not claim dirty core host-surface changes are release-ready or public-consumption-ready.
- This packet does not publish npm metadata or prove npm installability.
- This packet does not claim local branch names match latest release branch names.
- This packet does not claim ProtoKits targeted first-wave DSK validation passed.
- This packet does not claim Experiments aggregate validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation includes DSK first-wave proof coverage.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not fix GitHub Pages module paths, module-source resolution, canonical route naming, or DSK API installation.
- This packet does not promote ProtoKits into core.
- This packet does not claim domain command/config ownership, telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
