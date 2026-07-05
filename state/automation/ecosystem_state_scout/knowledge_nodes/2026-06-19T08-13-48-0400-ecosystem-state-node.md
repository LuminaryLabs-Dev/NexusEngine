# Knowledge Nodes: ecosystem_state_scout 2026-06-19T08-13-48-0400

## Root Lesson
- id: ecosystem-root-010
- statement: Core and ProtoKits remain release-aligned and validation-green, but Experiments latest fetched ref has advanced beyond the clean local checkout while public browser proof, aggregate DSK smoke coverage, npm metadata, package-version policy, generated-route cleanliness, and DSK hardening/bridge-state gates remain open.
- why it matters: Promotion review should not regress to a broad "ecosystem green" claim. Core and ProtoKits are green, Experiments available-checkout proof is green, but latest Experiments release-ref validation and public browser-complete proof are still separate gates.

## Child Nodes
- id: core-and-protokits-aligned-2026-06-19-0813
  parent: ecosystem-root-010
  lesson: Core and ProtoKits match the fetched latest release branch and pass validation.
  evidence: Core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ProtoKits `HEAD` and `origin/0.0.2` both resolved to `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; core `npm test`, ProtoKits `npm run check`, and ProtoKits `node tests/dsk-first-wave.test.mjs` passed.
  look further: Keep resolving latest release refs each run because prior packets have flipped between aligned and drifted sibling states.
- id: experiments-latest-ref-drift-2026-06-19-0813
  parent: ecosystem-root-010
  lesson: Experiments available checkout is clean and validation-green, but fetched `origin/0.0.2` is ahead by 22 commits.
  evidence: Experiments local `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f` and origin `6a4982ec59a06b5e0c7c12a56da58eed15866b0f` showed ahead/behind `0 22`; available-checkout `npm run check` and targeted `node tests/dsk-first-wave-experiment-smoke.mjs` passed; final status was clean after removing validation-generated wrappers.
  look further: Fast-forward or separately validate Experiments at fetched `origin/0.0.2` before claiming latest sibling release-ref proof.
- id: public-proof-import-shape-2026-06-19-0813
  parent: ecosystem-root-010
  lesson: The public DSK proof route remains HTTP-visible but stuck at `Booting...` in a browser.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed `Booting...`; console and curl checks showed 404s for `NexusEngine/src/index.js`, `NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-dsk-proof-validation-2026-06-19-0813
  parent: ecosystem-root-010
  lesson: Experiments aggregate validation still omits the DSK first-wave smoke, including on fetched `origin/0.0.2`.
  evidence: Local and fetched Experiments `package.json` `check` scripts do not list `tests/dsk-first-wave-experiment-smoke.mjs`; local `npm run check` and targeted DSK smoke passed separately.
  look further: Add the DSK smoke to an aggregate check or document the targeted command as required release evidence.
- id: generated-flat-route-cleanliness-2026-06-19-0813
  parent: ecosystem-root-010
  lesson: Experiments aggregate validation can dirty the sibling checkout through generated flat route wrappers.
  evidence: `npm run check` generated 100 flat experiment route wrappers and reformatted `experiments/tideglass-salvage/index.html`; generated artifacts were removed/restored and final status returned clean.
  look further: Make route generation idempotent against tracked files or pair validation with an explicit cleanup command.
- id: bridge-state-hardening-2026-06-19-0813
  parent: ecosystem-root-010
  lesson: Bridge phase, step receipts, delegated action reconciliation, and wrapper state ownership now join DSK hardening gates.
  evidence: Deep bug node `2026-06-19T07-53-41-0400` found AR/objective bridge phase, missing step receipt, and wrapper-owned state gaps; domain idea node `2026-06-19T08-00-55-0400` maps those into bridge-state proof inventory.
  look further: Add bridge delivery, step receipt, delegated action, and wrapper state truth rows before AR, lesson, puzzle, or platformer DSK promotion claims.
- id: public-consumption-npm-gap-2026-06-19-0813
  parent: ecosystem-root-010
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19-0813
  parent: ecosystem-root-010
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local package metadata reports `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.
- id: dsk-hardening-proof-gates-2026-06-19-0813
  parent: ecosystem-root-010
  lesson: DSK promotion gates remain broader than branch alignment and public module loading.
  evidence: DSK architecture node `2026-06-19T07-24-53-0400` keeps namespace, install, dependency, state-contract, service-call, operations data, spatial/mobility, and receipt integrity fixtures open; latest bridge-state nodes add phase and state ownership gates.
  look further: Keep public proof loading fixes separate from DSK production-hardening fixture plans.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T07-11-00-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Replaces all-sibling-aligned evidence with renewed Experiments fetched-ref drift while preserving core and ProtoKits green evidence.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T07-42-18-0400-ecosystem-proof-node.md`
- relationship: partially supersedes
- reason: Confirms public proof and aggregate DSK smoke gaps, but updates sibling status because Experiments origin has advanced again.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T07-24-53-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: DSK production hardening remains separate from distribution and public proof readiness.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T07-53-41-0400-deep-bug-node.md`
- relationship: constrains
- reason: Bridge phase, step receipt, and wrapper state bugs add promotion gates beyond first-wave DSK proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T08-00-55-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Bridge-state planning inventory should stay advisory until executable proof coverage exists.

## Next Search Branches
- branch: experiments-latest-ref-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, fetched `origin/0.0.2`
  question: Can Experiments be fast-forwarded or separately validated at latest release ref without disturbing local work?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as a required targeted command?
- branch: generated-flat-route-cleanliness
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/scripts/generate-flat-experiment-routes.mjs`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`
  question: Should route generation be made idempotent against tracked formatting or paired with an explicit cleanup command?
- branch: bridge-state-hardening
  files or folders: `src/surface-placement-kit.js`, `src/objective-flow-kit.js`, `src/ar-experience-kit.js`, wrapper kits, proof fixtures
  question: Which bridge delivery, step receipt, delegated action, and wrapper state rows must pass before AR/lesson/puzzle/platformer promotion?
- branch: public-consumption-wording
  files or folders: `README.md`, `package.json`, `scripts/automation-preflight.mjs`, `https://registry.npmjs.org/nexusengine`
  question: Should docs explicitly say GitHub/jsDelivr branch consumption is supported while npm metadata is unavailable?
- branch: package-version-policy
  files or folders: `package.json`, raw public `package.json`, remote release branch list
  question: Is branch `0.0.2` plus package version `0.1.0` intentional release policy or stale metadata?
- branch: dsk-hardening-proof-gates
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, selected promoted-domain kits, sibling proof routes
  question: Which hardening fixtures must pass before broad DSK promotion language is safe?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim Experiments fetched `origin/0.0.2` was locally validated.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not promote ProtoKits into core.
- This node does not claim DSK hardening or bridge-state blockers are fixed.
