# Knowledge Nodes: ecosystem proof scout 2026-06-19T14-41-14-0400

## Root Lesson
- id: ecosystem-proof-016
- statement: Core and local available-checkout DSK proof remain green, but the current review blockers are still module-source gates: ProtoKits fetched-ref proof cannot resolve package `nexusengine`, Experiments fetched-ref targeted proof cannot resolve sibling `NexusEngine`, and public browser proof remains stuck at `Booting...` on deployed sibling module 404s.
- why it matters: Promotion review must not merge local checkout success, fetched release-ref validation, aggregate checks, targeted DSK checks, browser-complete public proof, npm availability, and runtime hardening into one proof claim.

## Child Nodes
- id: ecosystem-proof-016-a
  parent: ecosystem-proof-016
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs every run because sibling refs continue to drift.
- id: ecosystem-proof-016-b
  parent: ecosystem-proof-016
  lesson: ProtoKits local available-checkout proof is green, but fetched latest-ref aggregate and targeted DSK proof remain blocked by package resolution.
  evidence: Local ProtoKits `npm run check` and `node tests/dsk-first-wave.test.mjs` passed at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; disposable `origin/0.0.2` at `06f5f3bd35e3b4c2c24d49d4affbe026b0d92c8f` failed import smoke with 110 failures and targeted DSK smoke with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
  look further: Validate fetched ProtoKits with a package, workspace, CDN, or link model that matches intended consumption.
- id: ecosystem-proof-016-c
  parent: ecosystem-proof-016
  lesson: Experiments fetched-ref aggregate check can pass while targeted DSK proof still fails.
  evidence: Disposable Experiments `origin/0.0.2` at `799fad882461502faa84b132f70de011e7dbe0cb` passed `npm run check`; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Wire the DSK smoke into aggregate validation or document the required sibling/module setup.
- id: ecosystem-proof-016-d
  parent: ecosystem-proof-016
  lesson: Public DSK proof remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Curl returned 200 for the route; Playwright snapshot showed heading `DSK first-wave proof` plus `Booting...`; console and request output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser-complete proof.
- id: ecosystem-proof-016-e
  parent: ecosystem-proof-016
  lesson: The same unresolved module-source strategy blocks fetched-ref and public proof surfaces.
  evidence: ProtoKits failed on package-name `nexusengine`; Experiments targeted proof failed on missing sibling `NexusEngine`; public route failed on deployed sibling module 404s.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, workspace/package dependency, or a build-step import map.
- id: ecosystem-proof-016-f
  parent: ecosystem-proof-016
  lesson: Fetched Experiments aggregate proof reflects tropical-island-scene but still omits DSK first-wave proof.
  evidence: Fetched `package.json` includes `tests/tropical-island-scene-static-smoke.mjs`; local `package.json` includes `tests/fluid-water-lab-static-smoke.mjs`; neither aggregate `check` script lists `tests/dsk-first-wave-experiment-smoke.mjs`.
  look further: Keep aggregate proof and targeted DSK proof distinct until the script or release checklist makes the DSK smoke explicit.
- id: ecosystem-proof-016-g
  parent: ecosystem-proof-016
  lesson: Runtime failure-boundary rows now join runtime hardening scope but stay separate from public route loading and package validation.
  evidence: DSK architecture node `2026-06-19T14-24-17-0400`, deep bug node `2026-06-19T13-53-17-0400`, and domain idea node `2026-06-19T14-00-58-0400` add namespace reserved-key, failed-install rollback, dependency parity, and failed-tick event lifetime rows.
  look further: Route these rows to executable hardening fixtures before broad DSK promotion claims.
- id: ecosystem-proof-016-h
  parent: ecosystem-proof-016
  lesson: Core/ProtoKits/Experiments ownership docs still point reusable implementation to ProtoKits and browser proof routing to Experiments, while runtime failure-boundary invariants remain core validation concerns.
  evidence: `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner.
  look further: Fix proof routing/imports without moving route ownership or reusable implementation into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T13-40-31-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Preserves local-green/public-failing proof split while refreshing current fetched-ref, Playwright, and runtime failure-boundary evidence.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T14-10-45-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms module-resolution blockers for ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T14-24-17-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Runtime failure-boundary rows must stay separate from public/distribution proof.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T13-53-17-0400-deep-bug-node.md
- relationship: constrains
- reason: DSK namespace/install/dependency and scheduler failed-tick bugs are fixture inputs.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T14-00-58-0400-domain-kit-idea-node.md
- relationship: expands
- reason: Converts runtime failure-boundary bugs into advisory proof planning rows until executable coverage exists.

## Next Search Branches
- branch: module-source-strategy
  files or folders: `package.json`, sibling package metadata, Experiments proof import maps, public CDN/raw URLs
  question: Should release proof resolve NexusEngine through package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps?
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
- branch: runtime-failure-boundary-hardening
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, proof fixtures
  question: Which namespace, install rollback, dependency parity, and failed-tick semantics must be executable fixtures?
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
