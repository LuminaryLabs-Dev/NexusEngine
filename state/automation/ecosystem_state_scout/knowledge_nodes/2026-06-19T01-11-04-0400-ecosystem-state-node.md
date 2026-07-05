# Knowledge Nodes: ecosystem_state_scout 2026-06-19T01-11-04-0400

## Root Lesson
- id: ecosystem-root-007
- statement: Core, ProtoKits, and Experiments still have release-aligned `HEAD`s and green local validation, but sibling worktree dirt has reappeared while browser-complete public proof, aggregate DSK proof coverage, npm metadata, and package-version policy remain open.
- why it matters: Promotion review should not collapse branch alignment, local validation, and clean review state into one claim. Current evidence supports release-HEAD alignment and local proof, but not clean sibling worktrees, npm installability, or a working public browser proof.

## Child Nodes
- id: sibling-worktree-dirt-2026-06-19T01-11-04-0400
  parent: ecosystem-root-007
  lesson: ProtoKits and Experiments `HEAD`s still equal `origin/0.0.2`, but both sibling worktrees now contain local modified/untracked high-fidelity/meadow memory/docs work.
  evidence: ProtoKits `git status --short --branch` showed modified `memory.md`, high-fidelity meadow kit files/tests, and untracked `docs/PROTOKIT-EXPANSION-LOOP.md`; Experiments status showed modified high-fidelity meadow files and `memory.md`, plus untracked `docs/VISUAL-EXPERIMENT-LOOP.md`.
  look further: Before promotion review, decide whether sibling dirt is unrelated local work, proof work to capture, or a blocker for review-stable ecosystem claims.
- id: branch-local-proof-stable-2026-06-19T01-11-04-0400
  parent: ecosystem-root-007
  lesson: Core and sibling repositories remain release-HEAD aligned and validation-green despite sibling worktree dirt.
  evidence: Core, ProtoKits, and Experiments all returned ahead/behind `0 0` against `origin/0.0.2`; core `npm test`, ProtoKits `npm run check`, ProtoKits `node tests/dsk-first-wave.test.mjs`, Experiments `npm run check`, and Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` all passed.
  look further: Keep branch alignment, local validation, and worktree cleanliness as separate review gates.
- id: public-proof-import-shape-2026-06-19T01-11-04-0400
  parent: ecosystem-root-007
  lesson: The public DSK proof route is still HTTP-visible but stuck at `Booting...` in a browser.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed `Booting...`; console errors showed 404s for `NexusEngine/src/index.js`, `NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-dsk-proof-validation-2026-06-19T01-11-04-0400
  parent: ecosystem-root-007
  lesson: Experiments aggregate validation passes but still does not include the DSK first-wave smoke.
  evidence: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json` `check` script does not list `tests/dsk-first-wave-experiment-smoke.mjs`; `npm run check` and the targeted DSK smoke both passed separately.
  look further: Add the DSK smoke to an aggregate check or document the targeted command as required release evidence.
- id: public-consumption-npm-gap-2026-06-19T01-11-04-0400
  parent: ecosystem-root-007
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` and direct curl checks returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19T01-11-04-0400
  parent: ecosystem-root-007
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local package metadata reports `nexusengine@0.1.0`; raw public `0.0.2/package.json` returned 200 during preflight and direct curl checks.
  look further: Branch naming policy, package version policy, and README release wording.
- id: dsk-hardening-proof-gates-2026-06-19T01-11-04-0400
  parent: ecosystem-root-007
  lesson: Neighboring lanes now make DSK promotion gates broader than public module loading.
  evidence: DSK architecture node `2026-06-19T00-23-44-0400` keeps namespace, transaction, dependency, state-contract, and state-machine gates open; deep bug node `2026-06-19T00-54-03-0400` adds objective, lifecycle, transport, and schedule invariants; domain idea node `2026-06-19T01-00-48-0400` maps those into accepted mutation, idempotency, time, and config policies.
  look further: Separate public proof loading fixes from DSK production-hardening fixture plans.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T00-11-28-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves branch/local proof stability but replaces the stale sibling-clean claim with current sibling worktree dirt evidence.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T23-39-46-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Public proof remains browser-blocked and aggregate Experiments validation still does not show DSK first-wave smoke coverage.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T00-23-44-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: DSK production hardening remains separate from public proof and distribution readiness.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T00-54-03-0400-deep-bug-node.md`
- relationship: constrains
- reason: Runtime state-transition bugs add promotion gates beyond install and browser-loading evidence.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T01-00-48-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Accepted mutation, idempotency, time catch-up, and config normalization ideas should stay advisory until executable proof coverage catches up.

## Next Search Branches
- branch: sibling-worktree-dirt
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`
- question: Is current sibling dirt unrelated local work, review-relevant proof work, or a blocker for ecosystem promotion claims?
- branch: public-proof-import-shape
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
- question: Should the public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
- question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as a required targeted command?
- branch: public-consumption-wording
- files or folders: `README.md`, `package.json`, `scripts/automation-preflight.mjs`, `https://registry.npmjs.org/nexusengine`
- question: Should docs explicitly say GitHub/jsDelivr branch consumption is supported while npm metadata is unavailable?
- branch: package-version-policy
- files or folders: `package.json`, raw public `package.json`, remote release branch list
- question: Is branch `0.0.2` plus package version `0.1.0` intentional release policy or stale metadata?
- branch: dsk-hardening-proof-gates
- files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/objective-flow-kit.js`, `src/lifecycle-progression-kit.js`, `src/transport-route-kit.js`, `src/schedule-kit.js`
- question: Which hardening fixtures must pass before broad DSK promotion language is safe?

## Not Claimed
- This node does not fix sibling worktree dirt.
- This node does not fix the public proof route.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim idea docs are canonical release architecture.
- This node does not edit source, tests, public docs, package metadata, deployment, `.agent`, or repo memory.
