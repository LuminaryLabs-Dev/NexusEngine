# Knowledge Nodes: ecosystem proof scout 2026-06-19T11-40-11-0400

## Root Lesson
- id: ecosystem-proof-013
- statement: Core remains latest-ref aligned and validation-green, but both sibling release refs have drifted ahead of the local checkouts; local available-checkout DSK proof is green while latest-ref ProtoKits proof, latest-ref Experiments proof, browser-complete public proof, aggregate Experiments proof, npm availability, and runtime hardening remain open.
- why it matters: Promotion review must separate local command success from fetched release-ref truth and public browser truth, especially now that ProtoKits `origin/0.0.2` adds aggregate coverage not run by the local checkout.

## Child Nodes
- id: ecosystem-proof-013-a
  parent: ecosystem-proof-013
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs every run because sibling refs continue to drift.
- id: ecosystem-proof-013-b
  parent: ecosystem-proof-013
  lesson: ProtoKits local available-checkout proof is green, but fetched latest-ref proof reopened.
  evidence: Local ProtoKits `npm run check` and `node tests/dsk-first-wave.test.mjs` passed at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; fetched `origin/0.0.2` advanced to `06f5f3bd35e3b4c2c24d49d4affbe026b0d92c8f` with ahead/behind `0 5` and adds `tests/universal-game-domain-kits.test.mjs` to the aggregate test script.
  look further: Validate ProtoKits fetched `origin/0.0.2` in a disposable or fast-forwarded clean worktree.
- id: ecosystem-proof-013-c
  parent: ecosystem-proof-013
  lesson: Experiments local targeted proof is green, but fetched latest-ref proof remains open.
  evidence: Local Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` passed at `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f`; fetched `origin/0.0.2` remains `799fad882461502faa84b132f70de011e7dbe0cb` with ahead/behind `0 24` and swaps fluid-water-lab proof surface for tropical-island-scene.
  look further: Validate Experiments fetched `origin/0.0.2` in a disposable or fast-forwarded clean worktree.
- id: ecosystem-proof-013-d
  parent: ecosystem-proof-013
  lesson: Public DSK proof remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Curl returned 200 for the route; Playwright snapshot showed heading `DSK first-wave proof` plus `Booting...`; console and network output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser-complete proof.
- id: ecosystem-proof-013-e
  parent: ecosystem-proof-013
  lesson: The public proof import shape still targets sibling GitHub Pages paths that are not deployed.
  evidence: Local and fetched proof HTML map `nexusengine` to `../../../NexusEngine/src/index.js`; proof module imports sibling `NexusEngine` and `NexusEngine-ProtoKits` relative paths; direct curls returned 404 for those deployed URLs.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map.
- id: ecosystem-proof-013-f
  parent: ecosystem-proof-013
  lesson: Experiments fetched ref now contains experiment-local prototype kits that should not be mistaken for reusable ProtoKits.
  evidence: Fetched Experiments commits add tropical-island-scene plus local `protokits/*` modules such as island, palm-tree, fish, floating, orbit-camera, cel-shading, normal-style, outline-sobel, and reflect-probe kits.
  look further: Route reusable extraction to NexusEngine-ProtoKits before any promotion claim.
- id: ecosystem-proof-013-g
  parent: ecosystem-proof-013
  lesson: Runtime hardening proof remains separate from public proof loading and sibling release-ref validation.
  evidence: DSK architecture node `2026-06-19T11-23-07-0400` says executable hardening fixtures are now higher value than more scout-only confirmation; deep bug and domain idea nodes keep source-state and state-signal rows open.
  look further: Keep namespace/install/dependency/source-state/state-signal fixtures separate from browser public proof and distribution proof.
- id: ecosystem-proof-013-h
  parent: ecosystem-proof-013
  lesson: Core/ProtoKits/Experiments ownership docs still point public proof work to Experiments and reusable implementation to ProtoKits, not core.
  evidence: `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner.
  look further: Fix proof routing/imports without moving route ownership or reusable implementation into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T10-45-02-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Reopens ProtoKits latest-ref validation after fetched `origin/0.0.2` advanced, while preserving Experiments drift and public browser proof failure.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T11-08-56-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms Experiments 24-commit drift, public proof import failure, aggregate DSK smoke gap, npm gap, package-version policy, and hardening gates.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T11-23-07-0400-dsk-architecture-node.md
- relationship: constrains
- reason: DSK hardening now needs executable fixture work beyond scout packet confirmation.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T09-54-20-0400-deep-bug-node.md
- relationship: constrains
- reason: Placement invalidation, action repeat, transition, coordinate, and camera derived-state bugs remain proof readiness blockers.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T10-02-21-0400-domain-kit-idea-node.md
- relationship: expands
- reason: State-signal proof rows should stay advisory until executable coverage exists.

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
- branch: experiment-local-protokit-boundary
  files or folders: fetched `NexusEngine-Experiments/protokits/*`, `docs/how-to-protokit.md`, `docs/protokit-boundaries.md`
  question: Which fetched tropical-island prototype kits belong in Experiments only, and which should be extracted into NexusEngine-ProtoKits?
- branch: dsk-hardening-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, selected source-state and state-signal kits, proof fixtures
  question: Which executable fixture rows must pass before broad DSK promotion language is safe?
- branch: public-consumption-wording
  files or folders: `README.md`, `package.json`, public npm metadata, raw/jsDelivr release URLs
  question: Should docs explicitly distinguish GitHub/jsDelivr branch consumption from unavailable npm metadata?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits fetched `origin/0.0.2` was locally validated.
- This node does not claim Experiments fetched `origin/0.0.2` was locally validated.
- This node does not claim Experiments aggregate `npm run check` was run.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim DSK hardening blockers are fixed.
