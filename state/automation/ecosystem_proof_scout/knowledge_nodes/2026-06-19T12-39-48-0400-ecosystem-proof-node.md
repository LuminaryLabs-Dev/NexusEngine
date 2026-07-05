# Knowledge Nodes: ecosystem proof scout 2026-06-19T12-39-48-0400

## Root Lesson
- id: ecosystem-proof-014
- statement: Core and local available-checkout DSK proof remain green, but fetched-ref and public proof now point to a shared module-resolution problem: standalone ProtoKits cannot resolve `nexusengine`, Experiments fetched-ref targeted DSK proof cannot resolve sibling `NexusEngine`, and the public route still stalls at `Booting...`.
- why it matters: Promotion review must separate local checkout success from fetched release-ref validation, standalone package resolution, aggregate checks, targeted DSK checks, and browser-complete public proof.

## Child Nodes
- id: ecosystem-proof-014-a
  parent: ecosystem-proof-014
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs every run because sibling refs continue to drift.
- id: ecosystem-proof-014-b
  parent: ecosystem-proof-014
  lesson: ProtoKits local available-checkout proof is green, but fetched latest-ref proof remains blocked by package resolution.
  evidence: Local ProtoKits `npm run check` and `node tests/dsk-first-wave.test.mjs` passed at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; disposable `origin/0.0.2` worktree at `06f5f3bd35e3b4c2c24d49d4affbe026b0d92c8f` failed `smoke:imports` and targeted DSK smoke with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
  look further: Validate fetched ProtoKits with a package-resolution model that matches intended public/local consumption.
- id: ecosystem-proof-014-c
  parent: ecosystem-proof-014
  lesson: Experiments fetched-ref aggregate check can pass while targeted DSK proof fails.
  evidence: Disposable Experiments `origin/0.0.2` worktree at `799fad882461502faa84b132f70de011e7dbe0cb` passed `npm run check`; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Wire the DSK smoke into aggregate validation or document the required sibling/module setup.
- id: ecosystem-proof-014-d
  parent: ecosystem-proof-014
  lesson: Public DSK proof remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Curl returned 200 for the route; Playwright snapshot showed heading `DSK first-wave proof` plus `Booting...`; console/network output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser-complete proof.
- id: ecosystem-proof-014-e
  parent: ecosystem-proof-014
  lesson: The same sibling-relative import shape blocks public browser proof and disposable targeted proof.
  evidence: `index.html` maps `nexusengine` to `../../../NexusEngine/src/index.js`; `src/proof.js` imports sibling `NexusEngine` and `NexusEngine-ProtoKits` relative paths; public deployed paths return 404 and `/tmp` disposable worktree lacks those siblings.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map.
- id: ecosystem-proof-014-f
  parent: ecosystem-proof-014
  lesson: Fetched Experiments aggregate proof reflects tropical-island-scene but still omits DSK first-wave proof.
  evidence: Fetched `package.json` replaces `tests/fluid-water-lab-static-smoke.mjs` with `tests/tropical-island-scene-static-smoke.mjs`; neither local nor fetched aggregate scripts list `tests/dsk-first-wave-experiment-smoke.mjs`.
  look further: Keep aggregate proof and targeted DSK proof distinct until the script or release checklist makes the DSK smoke explicit.
- id: ecosystem-proof-014-g
  parent: ecosystem-proof-014
  lesson: Lifecycle/config hardening rows now join runtime proof boundaries but stay separate from public route loading and package validation.
  evidence: DSK architecture node `2026-06-19T12-23-47-0400`, deep bug node `2026-06-19T11-55-07-0400`, and domain idea node `2026-06-19T12-01-34-0400` add command lifecycle, elapsed-rate, descriptor normalization/source isolation, and finite generated-geometry rows.
  look further: Route these rows to executable hardening fixtures before broad DSK promotion claims.
- id: ecosystem-proof-014-h
  parent: ecosystem-proof-014
  lesson: Core/ProtoKits/Experiments ownership docs still point reusable implementation to ProtoKits and browser proof routing to Experiments, not core.
  evidence: `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner.
  look further: Fix proof routing/imports without moving route ownership or reusable implementation into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T11-40-11-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Preserves local-green/public-failing proof split while adding disposable fetched-ref validation evidence.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T12-08-54-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms sibling latest-ref drift, public proof failure, aggregate DSK gap, npm gap, package-version policy, and hardening gates.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T12-23-47-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Lifecycle/config hardening rows must stay separate from public/distribution proof.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T11-55-07-0400-deep-bug-node.md
- relationship: constrains
- reason: CompanionCommand, CorruptionWorld, SpatialRoom, and TreeRunner bugs are fixture inputs.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T12-01-34-0400-domain-kit-idea-node.md
- relationship: expands
- reason: Converts lifecycle/config bugs into advisory proof-row inventory until executable coverage exists.

## Next Search Branches
- branch: fetched-ref-module-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `protokits/nexus-dsk-adapter/index.js`, disposable worktree validation setup
  question: Should fetched-ref ProtoKits validation install/link `nexusengine`, consume CDN/raw URLs, or declare a workspace dependency?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: experiments-targeted-dsk-fetched-ref
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`, fetched `origin/0.0.2`, sibling path layout
  question: Can fetched Experiments targeted DSK proof pass with the intended module-source strategy?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as required targeted evidence?
- branch: service-lifecycle-config-hardening
  files or folders: `src/companion-command-kit.js`, `src/corruption-world-kit.js`, `src/spatial-room-kit.js`, `src/tree-runner-kit.js`, proof fixtures
  question: Which command lifecycle, elapsed-rate, descriptor normalization, and finite-geometry rows belong in the first hardening fixture set?
- branch: public-consumption-wording
  files or folders: `README.md`, `package.json`, public npm metadata, raw/jsDelivr release URLs
  question: Should docs explicitly distinguish GitHub/jsDelivr branch consumption from unavailable npm metadata?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits fetched `origin/0.0.2` passed validation.
- This node does not claim Experiments fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim DSK hardening blockers are fixed.
