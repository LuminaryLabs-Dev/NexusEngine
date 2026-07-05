# Knowledge Nodes: ecosystem_state_scout 2026-06-20T01-59-37-0400

## Root Lesson
- id: ecosystem-root-025
- statement: Core remains current and validation-green, but ecosystem proof readiness regressed: local ProtoKits and local Experiments targeted DSK proof now fail on unresolved package `nexusengine`, ProtoKits fetched-ref proof fails on the same package, Experiments fetched-ref targeted proof still fails on sibling-relative `NexusEngine/src/index.js`, and public browser proof still stalls at `Booting...`.
- why it matters: Promotion review can no longer treat local available-checkout proof as green. The module-source decision is now blocking local validation, fetched-ref validation, and public browser proof, while proof-readiness/proof-signal rows remain planning and hardening inventory rather than distribution proof.

## Child Nodes
- id: core-current-2026-06-20-0159
  parent: ecosystem-root-025
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Continue resolving latest release branch with preflight every run.
- id: local-available-checkout-regression-2026-06-20-0159
  parent: ecosystem-root-025
  lesson: Local available-checkout DSK proof is no longer green because package `nexusengine` is not resolvable from ProtoKits.
  evidence: ProtoKits local `npm run check` failed after 330 syntax-checked modules with 110 import-smoke failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; ProtoKits local `node tests/dsk-first-wave.test.mjs` failed for the same package; Experiments local `node tests/dsk-first-wave-experiment-smoke.mjs` failed through local ProtoKits `protokits/nexus-dsk-adapter/index.js` for the same package.
  look further: Make local workspace/package resolution explicit before treating available-checkout proof as evidence.
- id: protokits-fetched-ref-drift-2026-06-20-0159
  parent: ecosystem-root-025
  lesson: ProtoKits fetched latest release ref advanced again and remains unvalidated because `nexusengine` is unresolved.
  evidence: Local ProtoKits `HEAD` was `f006fa3bbe5721b0aa073de2bca08a452bd8e492`; fetched `origin/0.0.2` was `b1d69099392a144a999cac824d344c403fe762d8`; ahead/behind was `0 31`; disposable fetched-ref `npm run check` syntax-checked 358 JavaScript modules and failed with 110 import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; targeted DSK smoke failed for the same package.
  look further: Validate fetched ProtoKits with the same package, workspace, CDN, or link model selected for local and public proof.
- id: experiments-targeted-fetched-ref-resolution-2026-06-20-0159
  parent: ecosystem-root-025
  lesson: Experiments fetched aggregate proof still passes while targeted DSK proof remains blocked by sibling-relative imports.
  evidence: Local Experiments `HEAD` was `799fad882461502faa84b132f70de011e7dbe0cb`; fetched `origin/0.0.2` was `eaeec53bc44e13136e18af37ed4c3f0755b57e60`; ahead/behind was `0 3`; disposable fetched-ref `npm run check` generated 100 flat route wrappers and passed; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Run targeted DSK proof with the same module-source strategy intended for public proof.
- id: public-proof-import-shape-2026-06-20-0159
  parent: ecosystem-root-025
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Curl returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof` and visible `Booting...`; console output showed 404s for `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`, `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: module-source-strategy-2026-06-20-0159
  parent: ecosystem-root-025
  lesson: Local ProtoKits, local Experiments targeted proof, ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof are now all one module-source problem.
  evidence: Local and fetched ProtoKits failed on package-name `nexusengine`; local Experiments targeted proof failed through local ProtoKits package-name import; fetched Experiments targeted proof failed on missing sibling `NexusEngine`; public route failed on deployed sibling module 404s.
  look further: Define one resolution model and use it in local, disposable, and public proof paths.
- id: proof-readiness-queue-boundary-2026-06-20-0159
  parent: ecosystem-root-025
  lesson: Repeated module-source, fetched-ref, browser proof, package-version, and aggregate-vs-targeted evidence should refine the existing Proof Readiness Queue instead of creating a duplicate idea family.
  evidence: Domain idea node `2026-06-20T00-00-47-0400` found no new durable idea family and mapped repeated signals to existing `proof-readiness-queue`, `module-source-gate-kit`, `proof-claim-taxonomy-kit`, `aggregate-targeted-proof-parity-kit`, and `release-evidence-checklist-kit` inventory.
  look further: Split proof-readiness kits later only if implementation planning needs smaller modules.
- id: public-consumption-npm-gap-2026-06-20-0159
  parent: ecosystem-root-025
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-20-0159
  parent: ecosystem-root-025
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local package metadata reports `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T22-10-08-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves module-source blockers while recording that local available-checkout proof now fails too and sibling latest refs advanced.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T22-40-52-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof-signal claims separate.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T22-25-35-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps proof-signal integrity as a later hardening tranche, not a distribution proof fix.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T00-00-47-0400-domain-kit-idea-node.md`
- relationship: constrains
- reason: Avoids duplicating proof-readiness idea families while module-source proof remains unresolved.

## Next Search Branches
- branch: module-source-strategy
  files or folders: `package.json`, sibling package metadata, ProtoKits `protokits/nexus-dsk-adapter/index.js`, Experiments proof import maps, public CDN/raw URLs
  question: Should release proof resolve NexusEngine through package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps?
- branch: local-available-checkout-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/tests/dsk-first-wave.test.mjs`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: What local package/workspace setup should make available-checkout proof reproducible without ambient assumptions?
- branch: protokits-latest-ref-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, fetched `origin/0.0.2`, `protokits/nexus-dsk-adapter/index.js`
  question: Can fetched ProtoKits validate without relying on an undeclared ambient package or sibling checkout?
- branch: experiments-targeted-dsk-fetched-ref
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`, fetched `origin/0.0.2`, sibling path layout
  question: Can fetched Experiments targeted DSK proof pass with the intended module-source strategy?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as required targeted evidence?
- branch: proof-readiness-refinement
  files or folders: `docs/domain_ideas.md`, `docs/kits_ideas.md`, ecosystem proof/state packets
  question: Should existing proof-readiness inventory split into smaller implementation modules, or stay as planning rows?
- branch: public-consumption-wording
  files or folders: `README.md`, `package.json`, public npm metadata, raw/jsDelivr release URLs
  question: Should docs explicitly distinguish GitHub/jsDelivr branch consumption from unavailable npm metadata?
- branch: package-version-policy
  files or folders: `package.json`, raw public `package.json`, remote release branch list
  question: Is branch `0.0.2` plus package version `0.1.0` intentional release policy or stale metadata?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits local checkout validation passed.
- This node does not claim ProtoKits fetched `origin/0.0.2` passed validation.
- This node does not claim Experiments local or fetched targeted DSK validation passed.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim proof-signal integrity rows are fixed.
