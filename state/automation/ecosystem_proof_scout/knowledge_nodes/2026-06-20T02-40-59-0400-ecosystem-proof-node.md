# Knowledge Nodes: ecosystem proof scout 2026-06-20T02-40-59-0400

## Root Lesson
- id: ecosystem-proof-026
- statement: Core still matches the preflight-resolved latest release branch and passes smoke tests, while the first-wave DSK proof blocker is unchanged: local/fetched ProtoKits cannot resolve package `nexusengine`, local Experiments fails through ProtoKits, fetched Experiments targeted proof fails on sibling paths, and the public browser proof remains stuck at `Booting...`.
- why it matters: The only live change since the previous proof packet is sibling ref drift, especially Experiments `origin/0.0.2` advancing to `81b39bccadf2cdf8269df24cd4970a5b2d7ebbd9`. Promotion still depends on a single module-source strategy that works for local checkouts, disposable release refs, aggregate-vs-targeted validation, and browser loading.

## Child Nodes
- id: ecosystem-proof-026-a
  parent: ecosystem-proof-026
  lesson: Core remains latest-release aligned and smoke-green.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs every run because sibling refs continue to drift.
- id: ecosystem-proof-026-b
  parent: ecosystem-proof-026
  lesson: ProtoKits local and fetched proof remain blocked by the direct package import `nexusengine`.
  evidence: Local ProtoKits `npm run check` checked 330 JavaScript modules, then failed 110 import smokes rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; local targeted DSK smoke failed on the same package; fetched `origin/0.0.2` at `b1d69099392a144a999cac824d344c403fe762d8` checked 358 modules and failed the same way.
  look further: Validate ProtoKits with an explicit package, workspace, CDN, or link model that matches intended release consumption.
- id: ecosystem-proof-026-c
  parent: ecosystem-proof-026
  lesson: Experiments latest release ref advanced, but targeted DSK proof is still blocked by sibling-relative imports.
  evidence: Experiments local `HEAD` was `799fad882461502faa84b132f70de011e7dbe0cb`; fetched `origin/0.0.2` advanced to `81b39bccadf2cdf8269df24cd4970a5b2d7ebbd9`; ahead/behind `0 10`; disposable fetched aggregate `npm run check` passed, but targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed on missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Re-run targeted DSK proof with the same module-source strategy intended for public proof.
- id: ecosystem-proof-026-d
  parent: ecosystem-proof-026
  lesson: Public DSK proof remains HTTP-visible but not browser-complete.
  evidence: Curl returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser proof.
- id: ecosystem-proof-026-e
  parent: ecosystem-proof-026
  lesson: Experiments aggregate validation remains a separate green claim from targeted DSK proof.
  evidence: Disposable fetched Experiments `npm run check` passed and generated 100 flat route wrappers, but `package.json` aggregate script does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
  look further: Decide whether the DSK smoke belongs in `npm run check`, `npm run check:deploy`, or required targeted evidence.
- id: ecosystem-proof-026-f
  parent: ecosystem-proof-026
  lesson: Composition-proof ownership is new neighboring inventory, but it does not change distribution proof status.
  evidence: DSK architecture node `2026-06-20T02-23-35-0400`, deep bug node `2026-06-20T01-55-55-0400`, and domain idea node `2026-06-20T02-01-55-0400` add provider ownership, SequenceNode type/history isolation, and AR runtime-source consistency as hardening rows separate from module-source proof.
  look further: Route composition-proof fixtures separately from the module-source/public browser proof lane.
- id: ecosystem-proof-026-g
  parent: ecosystem-proof-026
  lesson: Core/ProtoKits/Experiments ownership boundaries still hold.
  evidence: Repo memory and boundary docs keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner; this run found no reason to move proof routing or reusable implementation into NexusEngine core.
  look further: Fix proof routing/imports without moving route ownership, reusable implementation, or proof-readiness checklist tooling into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T01-59-45-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Preserves the module-source blocker while updating Experiments fetched-ref drift to `81b39bccadf2cdf8269df24cd4970a5b2d7ebbd9`.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T01-59-37-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms local, fetched-ref, public browser, npm, package-version, and aggregate-targeted claims remain separate.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T02-23-35-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Keeps composition-proof ownership and runtime hardening separate from distribution/module-source proof.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T01-55-55-0400-deep-bug-node.md
- relationship: references
- reason: Treats provider ownership, SequenceNode type/history isolation, and AR runtime-source mismatch as hardening inputs, not distribution proof.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T02-01-55-0400-domain-kit-idea-node.md
- relationship: references
- reason: Confirms the new neighboring idea family is Composition Proof Ownership, not a duplicate module-source family.

## Next Search Branches
- branch: module-source-strategy
  files or folders: `package.json`, sibling package metadata, ProtoKits DSK adapter, Experiments proof import maps, public CDN/raw URLs
  question: Should release proof resolve NexusEngine through package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps?
- branch: protokits-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `protokits/nexus-dsk-adapter/index.js`, fetched `origin/0.0.2`
  question: Can ProtoKits validate locally and at fetched ref without relying on an undeclared package?
- branch: experiments-targeted-dsk-local-and-fetched
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`, fetched `origin/0.0.2`, sibling path layout
  question: Can Experiments targeted DSK proof pass with the intended module-source strategy across local and disposable layouts?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as required targeted evidence?
- branch: moving-sibling-release-ref
  files or folders: sibling `origin/0.0.2` refs, automation packets, release evidence checklist
  question: How should proof packets handle sibling release refs that advance during a scout run?
- branch: composition-proof-boundary
  files or folders: `src/game-kit-composer.js`, `src/sequence-node-library.js`, `src/sequence-node.js`, `src/ar-launcher.js`, neighboring DSK/deep-bug nodes
  question: Which composition-proof rows should become executable fixtures after runtime failure-boundary work begins?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits local or fetched `origin/0.0.2` passed validation.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim composition-proof ownership, proof-signal integrity, or AR/spatial rows are fixed.
