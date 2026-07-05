# Knowledge Nodes: ecosystem_state_scout 2026-06-19T09-12-09-0400

## Root Lesson
- id: ecosystem-root-011
- statement: Core and ProtoKits remain release-aligned and validation-green, but Experiments latest release-ref validation, browser-complete public proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening/source-state gates remain open.
- why it matters: Promotion review should distinguish clean aligned core/ProtoKits proof from Experiments latest-ref proof, public browser proof, aggregate proof, distribution proof, and runtime hardening proof.

## Child Nodes
- id: core-and-protokits-still-aligned-2026-06-19-0912
  parent: ecosystem-root-011
  lesson: Core and ProtoKits still match the preflight-resolved latest release branch and pass available validation.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ProtoKits `HEAD` and `origin/0.0.2` both resolved to `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; core `npm test`, ProtoKits `npm run check`, and ProtoKits `node tests/dsk-first-wave.test.mjs` passed.
  look further: Keep resolving latest release refs each run because sibling refs have drifted repeatedly.
- id: experiments-latest-ref-drift-2026-06-19-0912
  parent: ecosystem-root-011
  lesson: Experiments available checkout is clean and targeted DSK proof passes, but fetched `origin/0.0.2` is still 22 commits ahead.
  evidence: Experiments local `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f` and origin `6a4982ec59a06b5e0c7c12a56da58eed15866b0f` showed ahead/behind `0 22`; `node tests/dsk-first-wave-experiment-smoke.mjs` passed on the available checkout.
  look further: Validate Experiments at fetched `origin/0.0.2` in a disposable worktree or fast-forwarded clean checkout.
- id: public-proof-import-shape-2026-06-19-0912
  parent: ecosystem-root-011
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Playwright snapshot and screenshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed `Booting...`; console and curl checks showed 404s for `NexusEngine/src/index.js`, `NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-dsk-proof-validation-2026-06-19-0912
  parent: ecosystem-root-011
  lesson: Experiments aggregate validation still omits the DSK first-wave smoke, and its default check writes generated route artifacts.
  evidence: Local and fetched Experiments `package.json` `check` scripts do not list `tests/dsk-first-wave-experiment-smoke.mjs`; both start with `npm run generate:flat-routes`; the targeted smoke passed separately.
  look further: Add the DSK smoke to an aggregate check, document it as required targeted release evidence, or run aggregate validation in a disposable worktree.
- id: source-state-hardening-2026-06-19-0912
  parent: ecosystem-root-011
  lesson: Source-state integrity now joins DSK hardening gates alongside bridge, receipt, operations, spatial, namespace, install, dependency, and state-contract rows.
  evidence: Deep bug node `2026-06-19T08-56-02-0400` found dataset/reset leaks, economy zero-retention behavior, and pursuit initial-state receipt contradictions; domain idea node `2026-06-19T09-00-53-0400` maps those into authored-source isolation, reset-source policy, retention-limit policy, initial-terminal receipts, and source-state proof rows.
  look further: Add source/reset/retention/initial-terminal proof rows before dataset-heavy, ledger, pressure, replay, or proof services are promoted broadly.
- id: generated-route-validation-boundary-2026-06-19-0912
  parent: ecosystem-root-011
  lesson: Experiments aggregate validation remains a write-producing command, so scout lanes should avoid running it in the main checkout unless cleanup or disposable validation is explicit.
  evidence: Experiments `package.json` `check` starts with `npm run generate:flat-routes`; previous packets observed generated route dirt, and this run left Experiments clean by running only the targeted DSK smoke.
  look further: Make route generation idempotent, add cleanup policy, or validate aggregate checks in a disposable worktree.
- id: public-consumption-npm-gap-2026-06-19-0912
  parent: ecosystem-root-011
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19-0912
  parent: ecosystem-root-011
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local package metadata reports `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.
- id: dsk-hardening-proof-gates-2026-06-19-0912
  parent: ecosystem-root-011
  lesson: DSK promotion gates remain broader than branch alignment, local targeted proof, and public module loading.
  evidence: DSK architecture node `2026-06-19T08-23-23-0400` keeps namespace, install, dependency, state-contract, service-call, bridge, step, wrapper-state, receipt, operations, and spatial/mobility fixtures open; latest source-state nodes add dataset/reset/retention/initial-state gates.
  look further: Keep public proof loading fixes separate from DSK production-hardening fixture plans.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T08-13-48-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves core/ProtoKits alignment and Experiments drift while updating ProtoKits aggregate validation from incomplete to passed and adding source-state hardening gates.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T08-48-39-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Confirms Experiments latest-ref drift, public proof import failure, aggregate DSK smoke gap, and target-proof separation.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T08-23-23-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Runtime hardening remains separate from distribution and public proof readiness.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T08-56-02-0400-deep-bug-node.md`
- relationship: constrains
- reason: Dataset/reset, retention, and initial-state bugs add promotion gates beyond first-wave DSK proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T09-00-53-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Source-state proof rows should stay advisory until executable coverage exists.

## Next Search Branches
- branch: experiments-latest-ref-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, fetched `origin/0.0.2`
  question: Can Experiments be validated at fetched `origin/0.0.2` without dirtying the main checkout?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as a required targeted command?
- branch: generated-route-validation-boundary
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/scripts/generate-flat-experiment-routes.mjs`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`
  question: Should route generation be made idempotent, moved out of default check, or run only in disposable validation worktrees?
- branch: source-state-hardening
  files or folders: `src/water-surface-kit.js`, `src/route-field-kit.js`, `src/render-descriptor-kit.js`, `src/economy-kit.js`, `src/pursuit-pressure-kit.js`, proof fixtures
  question: Which authored-source, reset-source, retention-limit, and initial-terminal rows must pass before source-state DSK promotion claims?
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
- This node does not claim Experiments aggregate `npm run check` was run.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not promote ProtoKits into core.
- This node does not claim DSK hardening, bridge-state, or source-state blockers are fixed.
