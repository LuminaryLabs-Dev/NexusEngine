# Knowledge Nodes: ecosystem_state_scout 2026-06-19T13-09-40-0400

## Root Lesson
- id: ecosystem-root-015
- statement: Core remains latest-ref aligned and validation-green, while sibling proof blockers have sharpened from generic drift into module-resolution gates: ProtoKits fetched-ref proof cannot resolve package `nexusengine`, Experiments fetched-ref targeted proof cannot resolve sibling `NexusEngine`, and public browser proof still stalls on deployed sibling module 404s.
- why it matters: Promotion review now needs one explicit module-source strategy before sibling fetched-ref proof, targeted DSK proof, and browser-complete public proof can converge.

## Child Nodes
- id: core-still-current-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs each run because sibling refs continue to drift.
- id: protokits-package-resolution-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: ProtoKits local available-checkout proof is green, but fetched latest-ref proof fails without a resolvable `nexusengine` package.
  evidence: Local ProtoKits `npm run check` and `node tests/dsk-first-wave.test.mjs` passed at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; disposable `origin/0.0.2` at `06f5f3bd35e3b4c2c24d49d4affbe026b0d92c8f` failed `smoke:imports` with 110 import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; targeted DSK smoke failed for the same package.
  look further: Validate fetched ProtoKits with a declared package, workspace, CDN, or link model for NexusEngine.
- id: experiments-targeted-fetched-ref-resolution-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: Experiments fetched-ref aggregate proof can pass while fetched-ref targeted DSK proof fails on sibling-relative imports.
  evidence: Disposable Experiments `origin/0.0.2` at `799fad882461502faa84b132f70de011e7dbe0cb` passed `npm run check`; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/.../NexusEngine/src/index.js`.
  look further: Run targeted DSK proof with the same module-source strategy intended for public proof.
- id: public-proof-import-shape-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Curl returned 200 for the proof route; Playwright snapshot showed heading text plus `Booting...`; console/network output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: module-source-strategy-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof are now the same category of module-source problem, not three unrelated failures.
  evidence: ProtoKits failed on package-name `nexusengine`; Experiments targeted proof failed on missing sibling `NexusEngine`; public route failed on deployed sibling module 404s.
  look further: Define one resolution model and use it in local, disposable, and public proof paths.
- id: aggregate-dsk-proof-validation-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: Experiments aggregate validation still omits the DSK first-wave smoke.
  evidence: Local and fetched Experiments `package.json` `check` scripts do not list `tests/dsk-first-wave-experiment-smoke.mjs`; disposable fetched aggregate check passed separately from the targeted DSK smoke failure.
  look further: Add the DSK smoke to an aggregate check, or document it as required targeted release evidence.
- id: generated-route-validation-boundary-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: Experiments aggregate validation remains write-producing and should stay disposable for scout lanes.
  evidence: Disposable fetched Experiments `npm run check` generated 100 flat route wrappers; this lane did not run aggregate generation in the main Experiments checkout.
  look further: Make route generation idempotent, add cleanup policy, or standardize disposable validation worktrees.
- id: traversal-proof-integrity-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: Runtime hardening rows now include traversal cost, navmesh identity, procedural signature, and recovery receipt/state proof.
  evidence: Deep bug node `2026-06-19T12-54-22-0400` reports navigation/procedural/physics gaps; domain idea node `2026-06-19T13-01-05-0400` maps them into traversal proof integrity inventory.
  look further: Keep traversal fixture work separate from public browser proof, sibling fetched-ref validation, aggregate proof, and distribution proof.
- id: public-consumption-npm-gap-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19-1309
  parent: ecosystem-root-015
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local and raw public package metadata report `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T12-08-54-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves core alignment, sibling proof gaps, public proof failure, aggregate DSK gap, npm/package policy, and hardening gates while replacing generic sibling drift with disposable fetched-ref module-resolution evidence.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T12-39-48-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Confirms module-resolution blockers for ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T12-23-47-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: DSK hardening rows remain separate from sibling fetched-ref, public browser, aggregate, npm, and package-version proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T12-54-22-0400-deep-bug-node.md`
- relationship: expands
- reason: Adds navigation/procedural/physics proof rows to hardening inventory.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T13-01-05-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts traversal bugs into reusable proof integrity planning rows.

## Next Search Branches
- branch: module-source-strategy
  files or folders: `package.json`, sibling package metadata, Experiments proof import maps, public CDN/raw URLs
  question: Should release proof resolve NexusEngine through package/workspace dependency, CDN `0.0.2`, same-origin assets, or build-step import maps?
- branch: protokits-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `protokits/nexus-dsk-adapter/index.js`, fetched `origin/0.0.2`
  question: Can fetched ProtoKits validate without relying on an undeclared ambient sibling checkout?
- branch: experiments-targeted-dsk-fetched-ref
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`, fetched `origin/0.0.2`, sibling path layout
  question: Can fetched Experiments targeted DSK proof pass with the intended module-source strategy?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as required targeted evidence?
- branch: traversal-proof-integrity
  files or folders: `src/pathfinding-kit.js`, `src/navmesh-kit.js`, `src/procedural-kit.js`, `src/world-physics-kit.js`, proof fixtures
  question: Which cost, identity, signature, and recovery rows belong in targeted DSK hardening proof?
- branch: public-consumption-wording
  files or folders: `README.md`, `package.json`, public npm metadata, raw/jsDelivr release URLs
  question: Should docs explicitly distinguish GitHub/jsDelivr branch consumption from unavailable npm metadata?
- branch: package-version-policy
  files or folders: `package.json`, raw public `package.json`, remote release branch list
  question: Is branch `0.0.2` plus package version `0.1.0` intentional release policy or stale metadata?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits fetched `origin/0.0.2` passed validation.
- This node does not claim Experiments fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim DSK hardening, traversal integrity, source-state, state-signal, or lifecycle/config blockers are fixed.
