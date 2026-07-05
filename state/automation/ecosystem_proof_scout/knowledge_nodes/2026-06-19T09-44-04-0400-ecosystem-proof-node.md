# Knowledge Nodes: ecosystem proof scout 2026-06-19T09-44-04-0400

## Root Lesson
- id: ecosystem-proof-011
- statement: Core and ProtoKits are latest-ref aligned and validation-green, including ProtoKits aggregate DSK proof, but Experiments remains 22 commits behind fetched `origin/0.0.2`, public browser proof still fails at module loading, and source-state hardening now constrains DSK promotion claims.
- why it matters: Promotion review must distinguish core/ProtoKits command proof from Experiments latest-ref proof, Experiments aggregate proof, browser-complete public proof, npm availability, and runtime hardening proof.

## Child Nodes
- id: ecosystem-proof-011-a
  parent: ecosystem-proof-011
  lesson: Core and ProtoKits still match the preflight-resolved latest release branch and pass available aggregate/targeted validation.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ProtoKits both resolved to `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; core `npm test`, ProtoKits `npm run check`, and ProtoKits `node tests/dsk-first-wave.test.mjs` passed.
  look further: Keep resolving latest release refs each run because sibling refs have drifted repeatedly.
- id: ecosystem-proof-011-b
  parent: ecosystem-proof-011
  lesson: ProtoKits aggregate proof recovered from the prior incomplete run, but Experiments aggregate proof remains separate.
  evidence: ProtoKits `npm run check` passed after checking 294 JavaScript modules, importing 236 ProtoKit indexes, and running its smoke chain; Experiments aggregate `check` still starts with `generate:flat-routes` and omits `tests/dsk-first-wave-experiment-smoke.mjs`.
  look further: Add the DSK smoke to an aggregate Experiments command, document it as required targeted evidence, or run aggregate validation in a disposable worktree.
- id: ecosystem-proof-011-c
  parent: ecosystem-proof-011
  lesson: Experiments available checkout targeted proof is green, but fetched latest-ref proof is still open.
  evidence: Experiments local `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f` and origin `6a4982ec59a06b5e0c7c12a56da58eed15866b0f` showed ahead/behind `0 22`; `node tests/dsk-first-wave-experiment-smoke.mjs` passed only on the local available checkout.
  look further: Validate fetched `origin/0.0.2` in a disposable or fast-forwarded clean worktree.
- id: ecosystem-proof-011-d
  parent: ecosystem-proof-011
  lesson: Public DSK proof remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Curl returned 200 for the route; Playwright launch-state snapshot showed `Booting...`; console output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser-complete proof.
- id: ecosystem-proof-011-e
  parent: ecosystem-proof-011
  lesson: The public proof import shape still targets sibling GitHub Pages paths that are not deployed.
  evidence: Local and fetched proof HTML map `nexusengine` to `../../../NexusEngine/src/index.js`; proof module imports sibling `NexusEngine` and `NexusEngine-ProtoKits` relative paths; direct curls returned 404 for those deployed URLs.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map.
- id: ecosystem-proof-011-f
  parent: ecosystem-proof-011
  lesson: Source-state hardening now belongs in DSK proof boundaries beyond first-wave install success.
  evidence: DSK architecture node `2026-06-19T09-25-20-0400` adds authored-source isolation, reset-source guarantees, retention-limit normalization, and initial terminal-state receipts; deep bug node `2026-06-19T08-56-02-0400` supplies source-level examples.
  look further: Keep runtime hardening fixtures separate from public route loading and distribution proof.
- id: ecosystem-proof-011-g
  parent: ecosystem-proof-011
  lesson: Core/ProtoKits/Experiments ownership docs still point public proof work to Experiments and reusable implementation to ProtoKits, not core.
  evidence: `docs/how-to-protokit.md` and `docs/how-to-experiment.md` keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner.
  look further: Fix proof routing/imports without moving route ownership into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T08-48-39-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Restores ProtoKits aggregate validation to green while preserving Experiments latest-ref drift and public browser proof failure.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T09-12-09-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms core/ProtoKits alignment, Experiments drift, public proof import failure, aggregate DSK smoke gap, npm gap, package-version policy, and hardening gates.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T09-25-20-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Source-state hardening joins DSK promotion proof gates.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T08-56-02-0400-deep-bug-node.md
- relationship: constrains
- reason: Dataset/reset, ledger retention, and pursuit initial-state bugs are now proof readiness blockers.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T09-00-53-0400-domain-kit-idea-node.md
- relationship: expands
- reason: Source-state proof rows should stay advisory until executable coverage exists.

## Next Search Branches
- branch: experiments-latest-ref-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, fetched `origin/0.0.2`, aggregate and targeted smoke scripts
  question: Can fetched `origin/0.0.2` be validated in a disposable worktree without dirtying the main checkout?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as a required targeted command?
- branch: generated-route-validation-boundary
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/scripts/generate-flat-experiment-routes.mjs`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`
  question: Should route generation be made idempotent, moved out of default check, or run only in disposable validation worktrees?
- branch: source-state-hardening-proof
  files or folders: `src/water-surface-kit.js`, `src/route-field-kit.js`, `src/render-descriptor-kit.js`, `src/economy-kit.js`, `src/pursuit-pressure-kit.js`, DSK promotion fixtures
  question: Which source/reset/retention/initial-state rows must pass before source-state DSK promotion claims?
- branch: public-consumption-wording
  files or folders: `README.md`, `package.json`, public npm metadata, raw/jsDelivr release URLs
  question: Should docs explicitly distinguish GitHub/jsDelivr branch consumption from unavailable npm metadata?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim Experiments fetched `origin/0.0.2` was locally validated.
- This node does not claim Experiments aggregate `npm run check` was run.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim DSK hardening blockers are fixed.
