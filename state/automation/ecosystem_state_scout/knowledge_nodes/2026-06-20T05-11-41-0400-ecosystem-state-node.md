# Knowledge Nodes: ecosystem_state_scout 2026-06-20T05-11-41-0400

## Root Lesson
- id: ecosystem-root-028
- statement: Core and ProtoKits now both match the preflight-resolved latest release branch refs, but ecosystem proof is still blocked by module-source strategy: ProtoKits local/fetched validation cannot resolve package `nexusengine`, local Experiments targeted proof fails through ProtoKits, fetched Experiments targeted proof assumes sibling `NexusEngine/src/index.js`, and public browser proof still stalls at `Booting...`.
- why it matters: ProtoKits ref drift and local package metadata mismatch are no longer the active blocker, but promotion review still cannot merge local, fetched-ref, aggregate, targeted, browser, npm, package-version, and hardening claims into one proof.

## Child Nodes
- id: core-current-2026-06-20-0511
  parent: ecosystem-root-028
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Continue resolving latest release branch with preflight every run.
- id: protokits-ref-aligned-package-resolution-2026-06-20-0511
  parent: ecosystem-root-028
  lesson: ProtoKits latest-ref drift closed, but package resolution still blocks local and fetched validation.
  evidence: Local ProtoKits `HEAD` and `origin/0.0.2` both resolved to `3d42b725dd166274ff6c5452beef86ef17863852`; ahead/behind was `0 0`; package metadata was `@luminarylabs/nexusengine-protokits@0.0.2`; local and disposable fetched `npm run check` both failed after 370 syntax-checked modules with 110 import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; local and fetched targeted DSK smoke failed for the same package.
  look further: Validate ProtoKits with the same package, workspace, CDN, or link model selected for local and public proof.
- id: experiments-targeted-proof-still-red-2026-06-20-0511
  parent: ecosystem-root-028
  lesson: Experiments fetched aggregate proof still passes while local and fetched targeted DSK proof remain blocked.
  evidence: Local Experiments `HEAD` was `57b3d668891794ddad00c765ce4faf342a3d9000`; fetched `origin/0.0.2` was `3e047f693f3ed58cab1c362deb09a597398d05e5`; ahead/behind was `0 2`; local targeted smoke failed through ProtoKits missing package `nexusengine`; disposable fetched `npm run check` generated 100 flat route wrappers and passed; fetched targeted smoke failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to a missing sibling path under the temp extraction parent.
  look further: Run targeted DSK proof with the same module-source strategy intended for public proof.
- id: public-proof-import-shape-2026-06-20-0511
  parent: ecosystem-root-028
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console history showed 404s for `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`, `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-targeted-proof-boundary-2026-06-20-0511
  parent: ecosystem-root-028
  lesson: Experiments aggregate validation is green but still separate from DSK first-wave targeted proof.
  evidence: Disposable fetched Experiments `npm run check` passed, but `package.json` aggregate script does not include `tests/dsk-first-wave-experiment-smoke.mjs`; both local and fetched targeted DSK smoke commands failed.
  look further: Decide whether the DSK first-wave proof smoke belongs in `npm run check`, `npm run check:deploy`, or a required targeted evidence checklist.
- id: public-consumption-version-policy-2026-06-20-0511
  parent: ecosystem-root-028
  lesson: Public consumption and version policy remain split even after ProtoKits metadata alignment.
  evidence: Core release branch `0.0.2` serves `nexusengine@0.1.0`; npm metadata for `nexusengine` remains 404; ProtoKits local/fetched metadata now reports `0.0.2`, but validation is still red.
  look further: Branch naming policy, package version policy, public consumption wording, and npm publication policy.
- id: query-read-model-hardening-separate-2026-06-20-0511
  parent: ecosystem-root-028
  lesson: Query read-model isolation is real hardening inventory, not a distribution proof fix.
  evidence: Deep bug node `2026-06-20T04-54-16-0400` and domain idea node `2026-06-20T05-02-13-0400` add public query helper, engine read-method, nested metadata/hazard, and stored query proof snapshot rows; public/local/fetched DSK proof still fails on module-source resolution.
  look further: Route read-model fixtures separately from module-source/public browser proof work.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T04-10-40-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves the module-source blocker while updating ProtoKits to aligned local/fetched `3d42b72` and recording package metadata alignment.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T04-42-18-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof claims separate while preserving ProtoKits metadata alignment.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T04-22-52-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps content-boundary/objective, runtime identity/lifecycle, and runtime failure-boundary hardening separate from module-source proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T04-54-16-0400-deep-bug-node.md`
- relationship: references
- reason: Treats public query helper and engine read-method isolation as hardening input, not distribution proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T05-02-13-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms the new idea family is Query Read Model Isolation, not a duplicate module-source family.

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
- branch: query-read-model-isolation
  files or folders: `src/*-kit.js`, exported `query*` helpers, engine read methods, proof snapshot fields
  question: Which public query helpers and read methods need clone/freeze policy before proof snapshots can be trusted?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits local or fetched `origin/0.0.2` passed validation.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim query read-model isolation, content-boundary/objective, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, or runtime failure-boundary rows are fixed.
