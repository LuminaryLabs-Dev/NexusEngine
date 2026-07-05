# Knowledge Nodes: ecosystem proof scout 2026-06-19T17-39-50-0400

## Root Lesson
- id: ecosystem-proof-019
- statement: Core and local available-checkout DSK proof remain green, but fetched-ref and public proof are still blocked by one module-source strategy problem: ProtoKits fetched-ref proof cannot resolve package `nexusengine`, Experiments fetched-ref targeted proof cannot resolve sibling `NexusEngine`, and the public browser proof remains stuck at `Booting...` on deployed sibling module 404s; query/command semantics rows now join hardening inventory separately from distribution proof.
- why it matters: Promotion review must keep local checkout success, latest release-ref validation, aggregate checks, targeted DSK checks, browser-complete public proof, npm availability, runtime hardening, lifecycle parity, query/command semantics, and experience-edge proof as separate claims.

## Child Nodes
- id: ecosystem-proof-019-a
  parent: ecosystem-proof-019
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs every run because sibling refs continue to drift.
- id: ecosystem-proof-019-b
  parent: ecosystem-proof-019
  lesson: ProtoKits local available-checkout proof is green, but fetched latest-ref aggregate and targeted DSK proof remain blocked by package resolution.
  evidence: Local ProtoKits `npm run check` and `node tests/dsk-first-wave.test.mjs` passed at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; disposable `origin/0.0.2` at `06f5f3bd35e3b4c2c24d49d4affbe026b0d92c8f` failed import smoke with 110 failures and targeted DSK smoke with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
  look further: Validate fetched ProtoKits with a package, workspace, CDN, or link model that matches intended consumption.
- id: ecosystem-proof-019-c
  parent: ecosystem-proof-019
  lesson: Experiments fetched-ref aggregate check can pass while targeted DSK proof still fails.
  evidence: Disposable Experiments `origin/0.0.2` at `799fad882461502faa84b132f70de011e7dbe0cb` passed `npm run check`; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Wire the DSK smoke into aggregate validation or document the required sibling/module setup.
- id: ecosystem-proof-019-d
  parent: ecosystem-proof-019
  lesson: Public DSK proof remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Curl returned 200 for the route; Playwright snapshot showed heading `DSK first-wave proof` plus `Booting...`; console output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser-complete proof.
- id: ecosystem-proof-019-e
  parent: ecosystem-proof-019
  lesson: The same unresolved module-source strategy blocks fetched-ref and public proof surfaces.
  evidence: ProtoKits failed on package-name `nexusengine`; Experiments targeted proof failed on missing sibling `NexusEngine`; public route failed on deployed sibling module 404s.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, workspace/package dependency, or a build-step import map.
- id: ecosystem-proof-019-f
  parent: ecosystem-proof-019
  lesson: Fetched Experiments aggregate proof reflects tropical-island-scene but still omits DSK first-wave proof.
  evidence: Fetched `package.json` includes `tests/tropical-island-scene-static-smoke.mjs`; local `package.json` includes `tests/fluid-water-lab-static-smoke.mjs`; neither aggregate `check` script lists `tests/dsk-first-wave-experiment-smoke.mjs`.
  look further: Keep aggregate proof and targeted DSK proof distinct until the script or release checklist makes the DSK smoke explicit.
- id: ecosystem-proof-019-g
  parent: ecosystem-proof-019
  lesson: Query/command semantics rows join hardening inventory but stay separate from public route loading and package validation.
  evidence: Deep bug node `2026-06-19T16-54-05-0400` and domain idea node `2026-06-19T17-01-13-0400` add terminal guidance receipts, proximity query-versus-transition policy, rejected-command state, and public query snapshot isolation rows.
  look further: Route these rows to core, ProtoKits, or Experiments fixtures after module-source and base runtime hardening categories remain explicit.
- id: ecosystem-proof-019-h
  parent: ecosystem-proof-019
  lesson: Core/ProtoKits/Experiments ownership docs still point reusable implementation to ProtoKits and browser proof routing to Experiments, while runtime and edge invariants remain validation concerns.
  evidence: `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner.
  look further: Fix proof routing/imports without moving route ownership or reusable implementation into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T16-39-19-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Preserves local-green/public-failing proof split while refreshing current fetched-ref, Playwright, and query/command semantics evidence.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T17-10-00-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms module-resolution blockers for ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T17-22-41-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Separates runtime failure-boundary, lifecycle parity, query/command semantics, experience-edge, and public module-source proof.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T16-54-05-0400-deep-bug-node.md
- relationship: extends
- reason: Adds terminal receipt, query transition, rejected command, and query isolation rows that require fixture planning after base proof boundaries stay clear.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T17-01-13-0400-domain-kit-idea-node.md
- relationship: expands
- reason: Converts query/command semantics bugs into advisory proof planning rows until executable coverage exists.

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
- branch: query-command-semantics-proof
  files or folders: `src/landmark-guidance-kit.js`, `src/environmental-affordance-kit.js`, `src/route-field-kit.js`, proof fixtures
  question: Which terminal receipt, query/transition, rejected command, and query isolation rows belong in the smallest executable fixture set?
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
- This node does not claim DSK hardening, lifecycle parity, query/command semantics, or experience-edge blockers are fixed.
