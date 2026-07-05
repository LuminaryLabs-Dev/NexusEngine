# Knowledge Nodes: ecosystem proof scout 2026-06-20T01-59-45-0400

## Root Lesson
- id: ecosystem-proof-025
- statement: Core still matches the preflight-resolved latest release branch and passes smoke tests, but first-wave DSK ecosystem proof is now blocked earlier: ProtoKits local/fetched checks and Experiments local targeted proof cannot resolve package `nexusengine`, while fetched Experiments targeted proof and public browser proof still fail on sibling module paths.
- why it matters: The promotion review can no longer describe local available-checkout DSK proof as green. The active blocker is a shared module-source/package-resolution strategy that must cover local sibling checkouts, disposable release refs, aggregate-vs-targeted validation, and public browser loading.

## Child Nodes
- id: ecosystem-proof-025-a
  parent: ecosystem-proof-025
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs every run because sibling refs and non-release branches continue to drift.
- id: ecosystem-proof-025-b
  parent: ecosystem-proof-025
  lesson: ProtoKits local available-checkout proof is no longer green because the direct-import DSK adapter cannot resolve package `nexusengine`.
  evidence: Local ProtoKits `npm run check` failed after checking 330 JavaScript modules with 110 import smoke failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; local `node tests/dsk-first-wave.test.mjs` failed on the same package import; local branch `0.0.2` is behind final fetched `origin/0.0.2` by 31 commits.
  look further: Validate ProtoKits with an explicit package, workspace, CDN, or link model that matches intended consumption.
- id: ecosystem-proof-025-c
  parent: ecosystem-proof-025
  lesson: ProtoKits fetched latest-ref proof remains blocked by the same package-resolution model, and the release ref moved during the run.
  evidence: Final fetched ProtoKits `origin/0.0.2` was `b1d69099392a144a999cac824d344c403fe762d8`; disposable fetched-ref `npm run check` failed after checking 358 JavaScript modules with 110 missing-package import failures; targeted DSK smoke failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
  look further: Record exact fetched refs in proof packets and retry only after module-source policy is chosen.
- id: ecosystem-proof-025-d
  parent: ecosystem-proof-025
  lesson: Experiments aggregate proof can pass at fetched ref while local and fetched targeted DSK proof remain blocked.
  evidence: Local Experiments targeted DSK smoke failed because sibling ProtoKits could not resolve package `nexusengine`; disposable fetched Experiments `origin/0.0.2` at `eaeec53bc44e13136e18af37ed4c3f0755b57e60` passed `npm run check`, but targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Wire the DSK smoke into aggregate validation or document the required sibling/module setup after module-source policy is fixed.
- id: ecosystem-proof-025-e
  parent: ecosystem-proof-025
  lesson: Public DSK proof remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Curl returned 200 for the route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console/request output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser-complete proof.
- id: ecosystem-proof-025-f
  parent: ecosystem-proof-025
  lesson: The same unresolved module-source strategy now blocks all DSK proof surfaces except core smoke.
  evidence: ProtoKits fails on package-name `nexusengine`; local Experiments fails through ProtoKits package resolution; fetched Experiments targeted proof fails on missing sibling `NexusEngine`; public route fails on deployed sibling module 404s; npm metadata remains optional 404.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, workspace/package dependency, or a build-step import map as one policy rather than repairing each surface separately.
- id: ecosystem-proof-025-g
  parent: ecosystem-proof-025
  lesson: Proof-signal integrity and AR/spatial hardening remain important proof inventory but are not evidence that distribution proof is fixed.
  evidence: DSK architecture node `2026-06-19T22-25-35-0400`, deep bug node `2026-06-19T21-55-21-0400`, and domain idea node `2026-06-20T00-00-47-0400` keep proof-signal integrity, AR/spatial rows, module-source gates, package-version policy, and aggregate-targeted parity separate.
  look further: Route proof-signal rows into executable fixtures separately from public module-source and fetched-ref validation work.
- id: ecosystem-proof-025-h
  parent: ecosystem-proof-025
  lesson: Core/ProtoKits/Experiments ownership boundaries still hold despite the package-resolution blocker.
  evidence: Repo memory and boundary docs keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner; this run found no reason to move proof routing or reusable implementation into NexusEngine core.
  look further: Fix proof routing/imports without moving route ownership, reusable implementation, or proof-readiness checklist tooling into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T22-40-52-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Preserves local/fetched/browser claim separation while correcting the local available-checkout DSK status from green to package-resolution-blocked.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T22-10-08-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms module-source strategy remains the shared blocker across fetched-ref proof and public browser proof.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T22-25-35-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Keeps runtime failure-boundary, AR/spatial, proof-signal, proof-readiness taxonomy, and public module-source proof separate.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T21-55-21-0400-deep-bug-node.md
- relationship: references
- reason: Keeps ARExperience receipt idempotency, hit-test rejection, negative tick time, and finite spatial-scale rows as hardening fixture inputs, not distribution proof.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T00-00-47-0400-domain-kit-idea-node.md
- relationship: references
- reason: Confirms repeated distribution-proof evidence maps to existing Proof Readiness Queue inventory, not a new idea family.

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
- branch: public-consumption-wording
  files or folders: `README.md`, `package.json`, public npm metadata, raw/jsDelivr release URLs
  question: Should docs explicitly distinguish GitHub/jsDelivr branch consumption from unavailable npm metadata?
- branch: package-version-policy
  files or folders: `package.json`, raw public `package.json`, remote release branch list
  question: Is branch `0.0.2` plus package version `0.1.0` intentional release policy or stale metadata?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits local or fetched `origin/0.0.2` passed validation.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim proof-signal integrity or AR/spatial rows are fixed.
- This node does not claim proof-readiness queueing is executable proof.
