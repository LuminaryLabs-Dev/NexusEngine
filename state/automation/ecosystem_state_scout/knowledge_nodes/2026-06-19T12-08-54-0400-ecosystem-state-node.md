# Knowledge Nodes: ecosystem_state_scout 2026-06-19T12-08-54-0400

## Root Lesson
- id: ecosystem-root-014
- statement: Core remains latest-ref aligned and validation-green, but both sibling latest refs are ahead of local clean checkouts; available-checkout DSK proof passes locally while ProtoKits latest-ref proof, Experiments latest-ref proof, browser-complete public proof, aggregate Experiments DSK coverage, npm/package policy, and DSK hardening fixtures remain open.
- why it matters: Promotion review must separate core command proof from sibling latest-ref proof, available-checkout proof, public browser proof, aggregate proof, distribution proof, and runtime hardening proof.

## Child Nodes
- id: core-still-current-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs each run because sibling refs continue to drift.
- id: protokits-latest-ref-drift-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: ProtoKits local available-checkout proof is green, but fetched latest-ref proof reopened.
  evidence: Local ProtoKits `npm run check` and `node tests/dsk-first-wave.test.mjs` passed at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; fetched `origin/0.0.2` is `06f5f3bd35e3b4c2c24d49d4affbe026b0d92c8f` with ahead/behind `0 5` and adds `tests/universal-game-domain-kits.test.mjs` to the aggregate test script.
  look further: Validate ProtoKits fetched `origin/0.0.2` in a disposable or fast-forwarded clean worktree.
- id: experiments-latest-ref-drift-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: Experiments local targeted proof is green, but fetched latest-ref proof remains open.
  evidence: Local Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` passed at `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f`; fetched `origin/0.0.2` remains `799fad882461502faa84b132f70de011e7dbe0cb` with ahead/behind `0 24`.
  look further: Validate Experiments fetched `origin/0.0.2` in a disposable or fast-forwarded clean worktree.
- id: public-proof-import-shape-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed heading text plus `Booting...`; network and curl checks showed 404s for `NexusEngine/src/index.js`, `NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-dsk-proof-validation-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: Experiments aggregate validation still omits the DSK first-wave smoke, and default aggregate checks remain write-producing.
  evidence: Local and fetched Experiments `package.json` `check` scripts do not list `tests/dsk-first-wave-experiment-smoke.mjs`; both start with `npm run generate:flat-routes`; the targeted smoke passed separately.
  look further: Add the DSK smoke to an aggregate check, document it as required targeted release evidence, or run aggregate validation in a disposable worktree.
- id: generated-route-validation-boundary-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: Experiments aggregate validation should stay out of scout main-checkout runs until route generation is idempotent or disposable validation is standard.
  evidence: Experiments `package.json` `check` starts with `npm run generate:flat-routes`; prior packets observed generated route dirt; this run left Experiments clean by running only the targeted DSK smoke.
  look further: Make route generation idempotent, add cleanup policy, or validate aggregate checks in a disposable worktree.
- id: dsk-hardening-fixture-boundary-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: DSK hardening proof now needs executable fixture work rather than more scout-only confirmation.
  evidence: DSK architecture node `2026-06-19T11-23-07-0400` says repeated evidence points to fixtures for namespace, install, dependency, source-state, and state-signal contracts.
  look further: Keep runtime fixtures separate from public browser proof, sibling latest-ref validation, aggregate proof, and distribution proof.
- id: service-lifecycle-config-hardening-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: Command lifecycle, elapsed-rate, descriptor normalization, and finite generated-geometry rows now join DSK hardening inputs.
  evidence: Deep bug node `2026-06-19T11-55-07-0400` reports CompanionCommand, CorruptionWorld, SpatialRoom, and TreeRunner gaps; domain idea node `2026-06-19T12-01-34-0400` maps them into service lifecycle/config proof inventory.
  look further: Add command, time, descriptor, and generated-geometry fixture rows before treating related services as broadly DSK-safe.
- id: public-consumption-npm-gap-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19-1208
  parent: ecosystem-root-014
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local and raw public package metadata report `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T11-08-56-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Reopens ProtoKits latest-ref validation after fetched `origin/0.0.2` advanced, while preserving Experiments drift, public proof failure, aggregate DSK gap, npm/package policy, and hardening gates.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T11-40-11-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Confirms both sibling release refs are ahead of local checkouts while available-checkout proof remains green.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T11-23-07-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: DSK hardening now needs executable fixture work beyond scout packet confirmation.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T11-55-07-0400-deep-bug-node.md`
- relationship: constrains
- reason: Command lifecycle, elapsed-time, descriptor source-state, and generated geometry bugs are promotion fixture inputs.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T12-01-34-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Service lifecycle/config proof rows should stay advisory until executable coverage exists.

## Next Search Branches
- branch: protokits-latest-ref-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, fetched `origin/0.0.2`, `tests/universal-game-domain-kits.test.mjs`
  question: Can ProtoKits fetched `origin/0.0.2` pass aggregate and targeted DSK checks without dirtying the main checkout?
- branch: experiments-latest-ref-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, fetched `origin/0.0.2`, tropical-island-scene, aggregate and targeted smoke scripts
  question: Can Experiments fetched `origin/0.0.2` be validated without dirtying the main checkout?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as required targeted evidence?
- branch: generated-route-validation-boundary
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/scripts/generate-flat-experiment-routes.mjs`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`
  question: Should route generation be made idempotent, moved out of default check, or run only in disposable validation worktrees?
- branch: dsk-hardening-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, selected source-state and state-signal kits, proof fixtures
  question: Which executable fixture rows must pass before broad DSK promotion language is safe?
- branch: service-lifecycle-config-hardening
  files or folders: `src/companion-command-kit.js`, `src/corruption-world-kit.js`, `src/spatial-room-kit.js`, `src/tree-runner-kit.js`, proof fixtures
  question: Which command lifecycle, elapsed-rate, descriptor normalization, and finite-geometry rows belong in hardening coverage?
- branch: public-consumption-wording
  files or folders: `README.md`, `package.json`, public npm metadata, raw/jsDelivr release URLs
  question: Should docs explicitly distinguish GitHub/jsDelivr branch consumption from unavailable npm metadata?
- branch: package-version-policy
  files or folders: `package.json`, raw public `package.json`, remote release branch list
  question: Is branch `0.0.2` plus package version `0.1.0` intentional release policy or stale metadata?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits fetched `origin/0.0.2` was locally validated.
- This node does not claim Experiments fetched `origin/0.0.2` was locally validated.
- This node does not claim Experiments aggregate `npm run check` was run.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not promote ProtoKits into core.
- This node does not claim DSK hardening, source-state, state-signal, or service lifecycle/config blockers are fixed.
