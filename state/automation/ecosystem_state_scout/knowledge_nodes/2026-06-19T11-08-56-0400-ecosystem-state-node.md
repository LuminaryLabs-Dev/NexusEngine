# Knowledge Nodes: ecosystem_state_scout 2026-06-19T11-08-56-0400

## Root Lesson
- id: ecosystem-root-013
- statement: Core and ProtoKits remain latest-ref aligned and validation-green, but Experiments latest release ref advanced again and is now 24 commits ahead of the clean local checkout; public browser proof still stalls on missing module paths; aggregate DSK smoke coverage still omits the targeted proof; npm/package policy and DSK hardening gates remain unresolved.
- why it matters: Promotion review must keep core/ProtoKits command proof separate from Experiments latest-ref proof, browser-complete public proof, aggregate proof, public distribution proof, and runtime hardening proof.

## Child Nodes
- id: core-and-protokits-still-aligned-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: Core and ProtoKits still match the preflight-resolved latest release branch and pass available validation.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ProtoKits `HEAD` and `origin/0.0.2` both resolved to `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; core `npm test`, ProtoKits `npm run check`, and ProtoKits `node tests/dsk-first-wave.test.mjs` passed.
  look further: Keep resolving latest release refs each run because sibling refs have drifted repeatedly.
- id: experiments-latest-ref-drift-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: Experiments available checkout is clean and targeted DSK proof passes, but fetched `origin/0.0.2` advanced again and is now 24 commits ahead.
  evidence: Experiments local `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f` and origin `799fad882461502faa84b132f70de011e7dbe0cb` showed ahead/behind `0 24`; `node tests/dsk-first-wave-experiment-smoke.mjs` passed on the available checkout.
  look further: Validate Experiments at fetched `origin/0.0.2` in a disposable worktree or fast-forwarded clean checkout.
- id: public-proof-import-shape-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Playwright snapshot and screenshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed `Booting...`; console and curl checks showed 404s for `NexusEngine/src/index.js`, `NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-dsk-proof-validation-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: Experiments aggregate validation still omits the DSK first-wave smoke, and default aggregate checks remain write-producing.
  evidence: Local and fetched Experiments `package.json` `check` scripts do not list `tests/dsk-first-wave-experiment-smoke.mjs`; both start with `npm run generate:flat-routes`; the targeted smoke passed separately.
  look further: Add the DSK smoke to an aggregate check, document it as required targeted release evidence, or run aggregate validation in a disposable worktree.
- id: generated-route-validation-boundary-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: Experiments aggregate validation should stay out of scout main-checkout runs until route generation is idempotent or disposable validation is standard.
  evidence: Experiments `package.json` `check` starts with `npm run generate:flat-routes`; prior packets observed generated route dirt; this run left Experiments clean by running only the targeted DSK smoke.
  look further: Make route generation idempotent, add cleanup policy, or validate aggregate checks in a disposable worktree.
- id: source-state-hardening-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: Source-state integrity remains a DSK hardening gate separate from public proof loading.
  evidence: DSK architecture and prior ecosystem state nodes keep authored-source isolation, reset-source guarantees, retention-limit normalization, and initial terminal-state receipts in promotion gates.
  look further: Add source/reset/retention/initial-terminal proof rows before dataset-heavy, ledger, pressure, replay, or proof services are promoted broadly.
- id: state-signal-contract-hardening-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: State signal contracts remain DSK promotion gates: descriptor invalidation, action repeat policy, transition receipts, coordinate-axis policy, and derived-state boundaries.
  evidence: Deep bug node `2026-06-19T09-54-20-0400` found route-aware placement, held interaction, puzzle/combat transition, scenario-driver axis, and camera-derived-state gaps; domain idea node `2026-06-19T10-02-21-0400` maps them into state signal contract proof rows.
  look further: Add invalidation/action/transition/coordinate/derived-state rows before placement, interaction, puzzle/combat, validation-driver, or camera services are promoted.
- id: public-consumption-npm-gap-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local and raw public package metadata report `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.
- id: dsk-hardening-proof-gates-2026-06-19-1108
  parent: ecosystem-root-013
  lesson: DSK promotion gates remain broader than branch alignment, local targeted proof, aggregate validation, and public module loading.
  evidence: Neighboring architecture, proof, bug, and idea nodes keep namespace, install, dependency, state-contract, service-call, operations, spatial/mobility, receipt, bridge, source-state, and state-signal fixtures open.
  look further: Keep public proof loading fixes separate from DSK production-hardening fixture plans.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T10-10-19-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves core/ProtoKits alignment and public proof failure while updating Experiments drift from 22 to 24 commits behind the newly advanced fetched release ref.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T10-45-02-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Confirms core/ProtoKits validation, public browser proof failure, Experiments latest-ref proof gap, aggregate DSK smoke gap, and state-signal hardening boundary.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T10-23-10-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: DSK hardening fixtures now include state-signal contracts alongside earlier install, state, receipt, bridge, source-state, operations, and spatial gates.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T09-54-20-0400-deep-bug-node.md`
- relationship: constrains
- reason: Placement invalidation, action repeat, transition, coordinate, and camera derived-state bugs remain proof readiness blockers.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T10-02-21-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: State-signal proof rows should stay advisory until executable coverage exists.

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
- branch: state-signal-contract-hardening
  files or folders: `src/forest-placement-kit.js`, `src/interaction-kit.js`, `src/shrine-puzzle-kit.js`, `src/light-combat-kit.js`, `src/scenario-driver-kit.js`, `src/camera-occlusion-kit.js`, proof fixtures
  question: Which invalidation, held-action, transition, coordinate, and derived-state rows must pass before signal-heavy DSK promotion claims?
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
- This node does not claim DSK hardening, source-state, or state-signal blockers are fixed.
