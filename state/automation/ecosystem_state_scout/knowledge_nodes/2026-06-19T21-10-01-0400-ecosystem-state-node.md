# Knowledge Nodes: ecosystem_state_scout 2026-06-19T21-10-01-0400

## Root Lesson
- id: ecosystem-root-023
- statement: Core remains current and validation-green, while ecosystem distribution proof is still blocked by the same unresolved module-source strategy; sibling drift is unchanged from the last ecosystem state run, public browser proof still stalls at `Booting...`, and fresh AR/spatial read-model rows are hardening inventory rather than distribution proof.
- why it matters: Promotion review still cannot rely on local available-checkout success. ProtoKits fetched-ref validation, Experiments fetched-ref targeted validation, and public browser proof need one declared module-source model before distribution proof can converge; AR launch and SpatialRoom read-model rows belong in executable hardening fixtures, not in the module-source gate.

## Child Nodes
- id: core-current-2026-06-19-2110
  parent: ecosystem-root-023
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Continue resolving latest release branch with preflight each run because sibling refs can move independently.
- id: local-available-checkout-green-2026-06-19-2110
  parent: ecosystem-root-023
  lesson: Local available-checkout validation still passes across core, ProtoKits, and the targeted Experiments DSK proof.
  evidence: Core `npm test` passed; ProtoKits `npm run check` and `node tests/dsk-first-wave.test.mjs` passed; Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` passed.
  look further: Keep local available-checkout proof separate from fetched-ref and public browser proof.
- id: protokits-fetched-ref-drift-2026-06-19-2110
  parent: ecosystem-root-023
  lesson: ProtoKits fetched latest release ref remains 26 commits ahead of the local checkout and detached validation still fails because package `nexusengine` is not resolvable.
  evidence: Local ProtoKits `HEAD` was `40d70b9`; fetched `origin/0.0.2` was `f0fa45a75eea2c4b88683fe3bf146b0453812820`; ahead/behind after fetch was `0 26`; disposable fetched-ref `npm run check` checked 311 JavaScript modules and failed during `smoke:imports` with 110 failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; targeted DSK smoke failed for the same package.
  look further: Validate fetched ProtoKits with a declared package, workspace, CDN, or link model for NexusEngine.
- id: experiments-targeted-fetched-ref-resolution-2026-06-19-2110
  parent: ecosystem-root-023
  lesson: Experiments fetched aggregate proof can pass while targeted DSK proof fails on sibling-relative imports.
  evidence: Disposable extracted Experiments `origin/0.0.2` at `799fad882461502faa84b132f70de011e7dbe0cb` passed `npm run check` and generated 100 flat route wrappers; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Run targeted DSK proof with the same module-source strategy intended for public proof.
- id: public-proof-import-shape-2026-06-19-2110
  parent: ecosystem-root-023
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Direct fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof` and visible `Booting...`; public sibling module URL checks returned 404.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: module-source-strategy-2026-06-19-2110
  parent: ecosystem-root-023
  lesson: ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof remain one module-source problem.
  evidence: ProtoKits failed on package-name `nexusengine`; Experiments targeted proof failed on missing sibling `NexusEngine`; public route failed on deployed sibling module 404s.
  look further: Define one resolution model and use it in local, disposable, and public proof paths.
- id: ar-spatial-read-model-hardening-2026-06-19-2110
  parent: ecosystem-root-023
  lesson: AR launch preconditions, AR preferred-mode fallback, AR launcher state isolation, and SpatialRoom getter isolation are new hardening inventory, not distribution proof.
  evidence: Deep bug node `2026-06-19T20-53-37-0400` and domain idea node `2026-06-19T21-01-07-0400` add AR/spatial rows; live proof evidence still shows package/sibling/browser module-resolution failures.
  look further: Decide whether AR/spatial read-model rows join compatibility/content-safety, read-model/orchestration, or a dedicated AR/spatial proof tranche after base distribution and runtime hardening decisions.
- id: public-consumption-npm-gap-2026-06-19-2110
  parent: ecosystem-root-023
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19-2110
  parent: ecosystem-root-023
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local package metadata reports `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T20-10-14-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves module-source blockers while refreshing live preflight, sibling fetched refs, local checks, disposable fetched-ref checks, public URL checks, and Playwright launch state.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T20-39-49-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps local available-checkout proof, fetched-ref proof, aggregate proof, targeted proof, browser proof, npm availability, package-version policy, and hardening rows separate.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T20-24-13-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps compatibility/content-safety rows separate from runtime failure-boundary, proof-readiness taxonomy, and public module-source proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T20-53-37-0400-deep-bug-node.md`
- relationship: expands
- reason: Adds AR launch capability, fallback policy, support-state aliasing, and SpatialRoom getter isolation as hardening inventory.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T21-01-07-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts AR launch and SpatialRoom evidence into planning boundaries without replacing module-source work.

## Next Search Branches
- branch: module-source-strategy
  files or folders: `package.json`, sibling package metadata, Experiments proof import maps, public CDN/raw URLs
  question: Should release proof resolve NexusEngine through package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps?
- branch: protokits-fetched-ref-drift
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `protokits/nexus-dsk-adapter/index.js`, fetched `origin/0.0.2`
  question: Can fetched ProtoKits validate without relying on an undeclared ambient package or sibling checkout?
- branch: experiments-targeted-dsk-fetched-ref
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`, fetched `origin/0.0.2`, sibling path layout
  question: Can fetched Experiments targeted DSK proof pass with the intended module-source strategy?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: ar-spatial-read-model-hardening
  files or folders: `src/ar-launcher.js`, `src/ar-device.js`, `src/spatial-room-kit.js`, AR/spatial proof fixtures
  question: Which AR launch and SpatialRoom read-model rows belong in executable fixtures after base distribution and runtime hardening decisions?
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
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim AR/spatial read-model rows are fixed.
