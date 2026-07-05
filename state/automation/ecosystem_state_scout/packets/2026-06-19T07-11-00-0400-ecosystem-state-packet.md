# Ecosystem State Packet: 2026-06-19T07-11-00-0400

## Scope
- Automation: Nexus Engine: Ecosystem State Packet
- Local timestamp: 2026-06-19T07-11-00-0400
- UTC timestamp: 2026-06-19T11:11:00Z
- Workspace: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- Repos checked: core NexusEngine, sibling NexusEngine-ProtoKits, sibling NexusEngine-Experiments

## Lane Goal
- Audit NexusEngine ecosystem state, drift, and proof readiness across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, public links, and proof paths.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-root-008`.
- Latest ecosystem state packet `2026-06-19T06-09-33-0400` said core was current and available-checkout proof was green, but ProtoKits and Experiments were clean-yet-behind fetched release refs.
- Latest DSK architecture node `2026-06-19T06-24-24-0400` adds spatial/mobility invariant gates to DSK promotion hardening.
- Latest ecosystem proof node `2026-06-19T06-46-32-0400` keeps local targeted proof green but public browser proof blocked at `Booting...`.
- Latest deep bug node `2026-06-19T06-53-41-0400` adds receipt identity, event idempotency, claim idempotency, and request generated-id gaps.
- Latest domain idea node `2026-06-19T07-01-13-0400` converts those receipt gaps into planning inventory.
- These packets were used for context only. Live source, docs, tests, fetched refs, preflight, public URLs, and Playwright output are authority for this run.

## Agent Workspace State
- Read `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, and `memory.md`.
- `.agent` guidance still requires live checkout evidence, latest release branch resolution, preflight, and lane-local scout outputs.
- Repo `memory.md` still defines NexusEngine core as ECS/runtime/DSK/composer primitives, ProtoKits as reusable kit implementations, and Experiments as browser/playable proof.
- Human-view question answered: yes, public DSK proof has a browser-visible outcome. Playwright inspected the public route and captured screenshot evidence before scratch artifacts were removed.
- No source, tests, public docs, package metadata, `.agent`, deployment, or canonical repo memory files were edited by this lane.

## Latest Branch Preflight
- Command: `npm run automation:preflight`
- Result: pass
- Preflight timestamp: `2026-06-19T11:06:51.407Z`
- Latest remote release branch: `0.0.2`
- Compare target: `0.0.2`
- Current branch: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Remote branches observed by preflight: `0.0.1`, `0.0.2`, `main`
- Core `HEAD`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- Core `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- Core ahead/behind against `origin/0.0.2`: `0 0`
- Core package metadata remains `nexusengine@0.1.0`.
- Core worktree still has pre-existing modified/untracked neighboring automation and planning docs. This lane writes only the new ecosystem-state packet/node and tracker update.

## Public Links Checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200 by preflight
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200 by preflight
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200 by preflight
- `https://registry.npmjs.org/nexusengine` -> 404, optional preflight link
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 200 by curl, but Playwright-visible proof remains `Booting...`
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200
- Public proof runtime dependency paths still fail:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js` -> 404
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js` -> 404
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js` -> 404

## Files Inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `package.json`
- `scripts/automation-preflight.mjs`
- `src/index.js`
- `src/domain-service-kit.js`
- `tests/`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`
- `docs/how-to-experiment.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/ecosystem_state_scout/PROMPT.md`
- `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- Latest current-lane packets and nodes.
- Latest neighboring packets and nodes from `dsk_architecture_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`.
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/docs/DSK-FIRST-WAVE-LEDGER.md`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`

## Ecosystem Findings
- Core remains aligned with the latest remote release branch `0.0.2`; `HEAD` equals `origin/0.0.2`.
- Core validation passed: `npm test` passed all 8 smoke tests.
- Required public core links remain reachable through GitHub, raw GitHub, and jsDelivr.
- Optional npm registry metadata remains unavailable with HTTP 404, so npm-backed public consumption is still not proven.
- ProtoKits is now clean and aligned with fetched `origin/0.0.2`: local and origin both resolve to `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; ahead/behind `0 0`.
- Experiments is now clean and aligned with fetched `origin/0.0.2`: local and origin both resolve to `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f`; ahead/behind `0 0`.
- Sibling validation passed at the latest local release refs:
  - ProtoKits `npm run check`
  - ProtoKits `node tests/dsk-first-wave.test.mjs`
  - Experiments `npm run check`
  - Experiments `node tests/dsk-first-wave-experiment-smoke.mjs`
- Experiments `npm run check` generated route wrappers during validation. Those validation-generated sibling artifacts were cleaned up; Experiments status was clean afterward.
- Experiments aggregate `npm run check` still does not include `tests/dsk-first-wave-experiment-smoke.mjs`; the targeted DSK smoke remains separate evidence.
- Public DSK proof route is still HTTP-visible but not browser-ready: Playwright snapshot showed heading text plus `Booting...`; console errors showed 404s for missing GitHub Pages module paths.
- Fetched Experiments proof files still use sibling relative imports that map to missing GitHub Pages paths.
- ProtoKits ledger still lists seven first-wave `promoted-candidate` kits and intentionally defers core promotion.
- Fetched ProtoKits latest release includes expanded fluid/water/domain surfaces and `tests/fluid-water-kits.test.mjs`; this is now validated by latest local `npm run check`, but it is not public browser proof.
- Branch/version policy risk remains unchanged: release branch `0.0.2` serves package metadata version `0.1.0`.

## Domain And Kit Expansion Signals
- Current DSK core still exports `defineDomainServiceKit()`, `createDomainServiceToken()`, validation helpers, `createRealtimeGame()`, and runtime-kit primitives from `src/index.js`.
- `docs/how-to-protokit.md` and `docs/how-to-experiment.md` keep the ecosystem boundary explicit: core owns runtime/DSK/composer primitives, ProtoKits owns reusable implementation, and Experiments owns playable/browser proof.
- `docs/domain_ideas.md`, `docs/kits_ideas.md`, and `docs/described_examples.md` now include Spatial Mobility Invariant and Receipt Integrity planning inventory.
- Neighboring lanes now separate three classes of readiness:
  - distribution/proof readiness: public proof module loading, aggregate DSK smoke coverage, npm metadata, package-version policy.
  - sibling readiness: core, ProtoKits, and Experiments are aligned and validation-green this run.
  - DSK hardening readiness: namespace safety, install transactions, dependency policy, state contracts, service-call policy, operations data integrity, spatial/mobility invariants, and receipt/event identity.
- Proof coverage should remain separated by category: local command, latest release-ref command, aggregate command, targeted command, raw-public file, CDN import, npm availability, and browser-complete human proof.

## Evidence
- `npm run automation:preflight` passed and resolved latest branch `0.0.2`.
- Core `git status --short --branch` showed `## 0.0.2...origin/0.0.2` plus pre-existing automation/doc dirt.
- Core `git rev-parse HEAD origin/0.0.2` and `git rev-list --left-right --count HEAD...origin/0.0.2` showed `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0` with ahead/behind `0 0`.
- Core `npm test` passed 8 smoke tests.
- ProtoKits `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD origin/0.0.2`, and ahead/behind checks showed clean alignment at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`.
- ProtoKits `npm run check` passed after checking 294 JavaScript modules, importing 236 ProtoKit indexes, and running the listed test chain including fluid/water kit composition.
- ProtoKits `node tests/dsk-first-wave.test.mjs` passed.
- Experiments `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD origin/0.0.2`, and ahead/behind checks showed clean alignment at `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f`.
- Experiments `npm run check` passed with existing static smoke warnings and generated 100 flat route wrappers during validation; generated artifacts were removed and sibling status returned clean.
- Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` passed.
- Direct curl checks confirmed required proof raw files and ProtoKits ledger are public, while runtime dependency paths used by the public page are 404.
- Playwright opened the public DSK proof route; snapshot showed `Booting...`; console log showed 404s for deployed sibling module paths; screenshot confirmed the user-visible stuck proof page. Scratch `.playwright-cli/` artifacts were removed after inspection.

## Suggested Canonical Updates
- Mark sibling latest-ref validation as resolved for this run; keep a low-priority watch because sibling branches can drift again.
- Keep public proof route work focused on module-source resolution: CDN `0.0.2`, deployed same-origin assets, or a build-step import map.
- Wire `tests/dsk-first-wave-experiment-smoke.mjs` into an aggregate Experiments validation command or document it as required targeted evidence.
- Update public consumption wording or release policy so docs distinguish GitHub/jsDelivr branch consumption from unavailable npm registry metadata.
- Decide whether branch `0.0.2` serving package version `0.1.0` is intentional policy or stale release metadata.
- Keep DSK expansion claims advisory until hardening fixtures include install/namespace, spatial/mobility, operations data, receipt identity, and event idempotency rows.

## Knowledge Nodes
- Wrote `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T07-11-00-0400-ecosystem-state-node.md`.
- New root lesson: core, ProtoKits, and Experiments are now clean/aligned on latest release refs and validation-green, but public browser proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening gates remain open.

## Master Tracker Updates
- Added `ecosystem-root-009`.
- Marked `ecosystem-root-008` as superseded by `ecosystem-root-009`.
- Added child branches for sibling latest-ref validation resolved, public proof import shape, aggregate DSK proof validation, expanded ProtoKits proof coverage validated locally, receipt integrity hardening, public npm gap, package-version policy, and DSK hardening proof gates.
- Moved `sibling-latest-ref-validation` out of open high-priority search branches and recorded it as resolved for this run.

## Not Claimed
- This packet does not edit source, tests, README, package metadata, public claims, release branches, deployments, `.agent`, or repo memory.
- This packet does not publish npm metadata or prove npm installability.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not fix GitHub Pages module paths.
- This packet does not promote ProtoKits into core.
- This packet does not claim Experiments aggregate `npm run check` includes DSK first-wave proof coverage.
- This packet does not claim DSK runtime hardening blockers are fixed.
- This packet does not claim idea docs are canonical release architecture.
