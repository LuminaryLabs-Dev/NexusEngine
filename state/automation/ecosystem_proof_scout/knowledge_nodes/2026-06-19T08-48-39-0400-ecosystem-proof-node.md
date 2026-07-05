# Knowledge Nodes: ecosystem proof scout 2026-06-19T08-48-39-0400

## Root Lesson
- id: ecosystem-proof-010
- statement: Ecosystem proof regressed from all-sibling latest-ref green: core and ProtoKits still align with `origin/0.0.2`, but Experiments is 22 commits behind fetched `origin/0.0.2`, public browser proof still fails at module loading, aggregate DSK proof remains separate, and aggregate ProtoKits validation was incomplete in this run.
- why it matters: Promotion review must distinguish targeted local DSK proof from aggregate validation, latest-ref validation, public browser proof, and runtime hardening proof.

## Child Nodes
- id: ecosystem-proof-010-a
  parent: ecosystem-proof-010
  lesson: Core and ProtoKits match the latest release branch while Experiments does not.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ProtoKits both resolved to `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; Experiments local `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f` and origin `6a4982ec59a06b5e0c7c12a56da58eed15866b0f` showed ahead/behind `0 22`.
  look further: Fast-forward or separately validate Experiments at fetched `origin/0.0.2`.
- id: ecosystem-proof-010-b
  parent: ecosystem-proof-010
  lesson: Targeted first-wave DSK proof passes locally, but aggregate proof is not fully established this run.
  evidence: Core `npm test`, ProtoKits `node tests/dsk-first-wave.test.mjs`, and Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` passed; ProtoKits `npm run check` was interrupted after no progress output during `check:syntax`; Experiments aggregate `npm run check` was skipped because it starts with route generation.
  look further: Use bounded validation splits or disposable worktrees for aggregate checks that are long-running or write generated artifacts.
- id: ecosystem-proof-010-c
  parent: ecosystem-proof-010
  lesson: Public DSK proof remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Playwright opened `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/`; snapshot showed `Booting...`; console and curl evidence showed 404s for sibling NexusEngine and ProtoKits module paths.
  look further: Do not treat HTTP 200 on the route as browser-complete proof.
- id: ecosystem-proof-010-d
  parent: ecosystem-proof-010
  lesson: The public proof import shape still targets sibling GitHub Pages paths that are not deployed.
  evidence: Fetched `origin/0.0.2` proof HTML maps `nexusengine` to `../../../NexusEngine/src/index.js`; `src/proof.js` imports sibling `NexusEngine` and `NexusEngine-ProtoKits` relative paths; direct curls returned 404 for those deployed URLs.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map.
- id: ecosystem-proof-010-e
  parent: ecosystem-proof-010
  lesson: Fetched Experiments aggregate validation still omits the DSK first-wave smoke.
  evidence: `origin/0.0.2:package.json` `check` script does not list `tests/dsk-first-wave-experiment-smoke.mjs`; it lists `tests/tropical-island-scene-static-smoke.mjs`; targeted DSK smoke passed only on the local available checkout.
  look further: Add the DSK smoke to an aggregate check or document it as required targeted release evidence.
- id: ecosystem-proof-010-f
  parent: ecosystem-proof-010
  lesson: Available Experiments proof surface differs from fetched release-ref surface.
  evidence: Local `package.json` lists `tests/fluid-water-lab-static-smoke.mjs`; fetched `origin/0.0.2:package.json` lists `tests/tropical-island-scene-static-smoke.mjs`; local checkout is behind by 22 commits.
  look further: Separate local available-checkout proof from latest-ref proof in every public-promotion review.
- id: ecosystem-proof-010-g
  parent: ecosystem-proof-010
  lesson: Bridge-state hardening now constrains DSK proof claims beyond first-wave install success.
  evidence: DSK architecture node `2026-06-19T08-23-23-0400` adds bridge phase delivery, step-transition receipts, delegated-action reconciliation, and wrapper state contracts; deep bug node `2026-06-19T07-53-41-0400` supplies source-level examples.
  look further: Keep runtime hardening fixtures separate from distribution/public-browser proof.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T07-42-18-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Reopens sibling latest-ref proof for Experiments and narrows aggregate validation claims while preserving public proof and DSK hardening gaps.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T08-13-48-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms Experiments local checkout is clean but behind fetched release ref while public proof, npm, aggregate proof, and hardening gates remain open.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T08-23-23-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Bridge-state and wrapper-state fixture gates are now part of promotion proof readiness.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T07-53-41-0400-deep-bug-node.md
- relationship: constrains
- reason: AR/objective bridge, missing step receipt, and wrapper-state bugs are promotion blockers beyond first-wave proof.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T08-00-55-0400-domain-kit-idea-node.md
- relationship: expands
- reason: Bridge-state proof rows should stay advisory until executable coverage exists.

## Next Search Branches
- branch: experiments-latest-ref-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, fetched `origin/0.0.2`, aggregate and targeted smoke scripts
  question: Can fetched `origin/0.0.2` be validated in a disposable worktree without dirtying the main checkout?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`
  question: Which aggregate checks should include DSK first-wave proof, and which should be documented as targeted release evidence?
- branch: generated-route-validation-boundary
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/scripts/generate-flat-experiment-routes.mjs`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`
  question: Should route generation be made idempotent, moved out of default check, or run only in disposable validation worktrees?
- branch: dsk-hardening-proof-separation
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, selected bridge/objective/wrapper kits, sibling proof routes
  question: Which evidence belongs to runtime hardening versus browser-complete public proof?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim Experiments fetched `origin/0.0.2` was locally validated.
- This node does not claim ProtoKits aggregate `npm run check` passed.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim DSK hardening blockers are fixed.
