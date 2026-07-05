# Knowledge Nodes: ecosystem_state_scout 2026-06-20T04-10-40-0400

## Root Lesson
- id: ecosystem-root-027
- statement: Core remains current and smoke-green, but ecosystem proof is still blocked by one module-source strategy: ProtoKits local and fetched validation cannot resolve package `nexusengine`, local Experiments targeted proof fails through ProtoKits, fetched Experiments targeted proof still assumes sibling `NexusEngine/src/index.js`, and public browser proof still stalls at `Booting...`.
- why it matters: Promotion review still cannot merge local, fetched-ref, aggregate, targeted, browser, npm, package-version, and hardening claims into one proof. ProtoKits latest release ref advanced again to `82c879f`, while new Fishing/content-boundary rows are validation inventory rather than a module-source fix.

## Child Nodes
- id: core-current-2026-06-20-0410
  parent: ecosystem-root-027
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Continue resolving latest release branch with preflight every run.
- id: protokits-latest-ref-drift-2026-06-20-0410
  parent: ecosystem-root-027
  lesson: ProtoKits fetched latest release ref advanced again and remains unvalidated because package `nexusengine` is unresolved.
  evidence: Local ProtoKits `HEAD` was `ee9e964b64b4202072528ff70ebc31c488983fae`; fetched `origin/0.0.2` advanced to `82c879f48d9a35db520015a7b219da8c349d7fd9`; ahead/behind was `0 7`; disposable fetched-ref `npm run check` syntax-checked 370 JavaScript modules and failed with 110 import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; targeted DSK smoke failed for the same package.
  look further: Validate fetched ProtoKits with the same package, workspace, CDN, or link model selected for local and public proof.
- id: local-available-checkout-regression-2026-06-20-0410
  parent: ecosystem-root-027
  lesson: Local available-checkout DSK proof remains red because package `nexusengine` is not resolvable from ProtoKits.
  evidence: ProtoKits local `npm run check` failed after 367 syntax-checked modules with 110 import-smoke failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; ProtoKits local `node tests/dsk-first-wave.test.mjs` failed for the same package; Experiments local `node tests/dsk-first-wave-experiment-smoke.mjs` failed through local ProtoKits `protokits/nexus-dsk-adapter/index.js` for the same package.
  look further: Make local workspace/package resolution explicit before treating available-checkout proof as evidence.
- id: experiments-targeted-fetched-ref-resolution-2026-06-20-0410
  parent: ecosystem-root-027
  lesson: Experiments fetched aggregate proof still passes while targeted DSK proof remains blocked by sibling-relative imports.
  evidence: Local Experiments `HEAD` was `57b3d668891794ddad00c765ce4faf342a3d9000`; fetched `origin/0.0.2` was `3e047f693f3ed58cab1c362deb09a597398d05e5`; ahead/behind was `0 2`; disposable fetched-ref `npm run check` generated 100 flat route wrappers and passed; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to a missing sibling path under the temp extraction parent.
  look further: Run targeted DSK proof with the same module-source strategy intended for public proof.
- id: public-proof-import-shape-2026-06-20-0410
  parent: ecosystem-root-027
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console and request history showed 404s for `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`, `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-targeted-proof-boundary-2026-06-20-0410
  parent: ecosystem-root-027
  lesson: Experiments aggregate validation is green but still separate from DSK first-wave targeted proof.
  evidence: Disposable fetched Experiments `npm run check` passed, but `package.json` aggregate script does not include `tests/dsk-first-wave-experiment-smoke.mjs`; both local and fetched targeted DSK smoke commands failed.
  look further: Decide whether the DSK first-wave proof smoke belongs in `npm run check`, `npm run check:deploy`, or a required targeted evidence checklist.
- id: package-version-policy-2026-06-20-0410
  parent: ecosystem-root-027
  lesson: Package version signals remain split across branch names and package metadata.
  evidence: Core release branch `0.0.2` serves `nexusengine@0.1.0`; local ProtoKits package metadata is `0.0.1`; fetched ProtoKits `origin/0.0.2` package metadata runs as `0.0.2`; npm metadata for `nexusengine` remains 404.
  look further: Branch naming policy, package version policy, public consumption wording, and npm publication policy.
- id: content-boundary-hardening-separate-2026-06-20-0410
  parent: ecosystem-root-027
  lesson: Fishing/ReefRescue content-boundary and objective-contract rows are real validation inventory, not distribution proof fixes.
  evidence: Deep bug node `2026-06-20T03-55-08-0400` and domain idea node `2026-06-20T04-01-35-0400` add product-themed core export, fixed FishingKit id, zero/negative objective completion, and content dataset validation rows; public/local/fetched DSK proof still fails on module-source resolution.
  look further: Route content-boundary fixtures separately from module-source/public browser proof work.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T03-07-30-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves the module-source blocker and local proof regression while updating ProtoKits fetched-ref drift to `82c879f` and confirming current public browser state.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T03-41-33-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof claims separate while refreshing sibling refs.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T03-23-42-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps runtime identity/lifecycle and composition-proof hardening separate from module-source proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T03-55-08-0400-deep-bug-node.md`
- relationship: references
- reason: Treats Fishing/ReefRescue boundary, identity, and objective rows as hardening inputs, not distribution proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T04-01-35-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms the new idea family is Content Boundary And Objective Contract, not a duplicate module-source family.

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
- branch: content-boundary-objective-hardening
  files or folders: `src/index.js`, `src/reef-rescue-kit.js`, `src/fishing-kit.js`, content proof fixtures
  question: Which content-boundary rows should become executable fixtures without confusing them with module-source proof?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits local or fetched `origin/0.0.2` passed validation.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim runtime identity/lifecycle, composition-proof ownership, or content-boundary/objective rows are fixed.
