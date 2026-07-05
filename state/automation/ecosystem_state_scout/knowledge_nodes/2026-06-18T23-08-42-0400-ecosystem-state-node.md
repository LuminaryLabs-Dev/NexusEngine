# Knowledge Nodes: ecosystem_state_scout 2026-06-18T23-08-42-0400

## Root Lesson
- id: ecosystem-root-005
- statement: Core, ProtoKits, and Experiments remain aligned on latest release branch `0.0.2`, but ecosystem proof readiness is still blocked by public browser module resolution and npm metadata remains unavailable.
- why it matters: Local tests and raw files are green, but reviewable public proof needs a browser route that reaches completed `engine.n.*` output, not just HTTP 200 and local sibling imports.

## Child Nodes
- id: public-proof-browser-failure-2026-06-18T23-08-42-0400
  parent: ecosystem-root-005
  lesson: The public DSK proof route is HTTP-visible but still stuck at `Booting...` in a browser.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed `Booting...`; console errors showed 404 module loads for NexusEngine and ProtoKits GitHub Pages paths.
  look further: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, CDN `0.0.2`, same-origin deploy assets, or build-step import maps.
- id: branch-alignment-stable-2026-06-18T23-08-42-0400
  parent: ecosystem-root-005
  lesson: Core and sibling repos remain cleanly aligned with `origin/0.0.2`.
  evidence: Core `HEAD` equals `origin/0.0.2`; ProtoKits `HEAD` equals `origin/0.0.2`; Experiments `HEAD` equals `origin/0.0.2`; ahead/behind was `0 0` in all three.
  look further: Repeat branch/status checks before public promotion or release review.
- id: local-dsk-proof-green-2026-06-18T23-08-42-0400
  parent: ecosystem-root-005
  lesson: Targeted local DSK proof still passes across ProtoKits and Experiments.
  evidence: ProtoKits `node tests/dsk-first-wave.test.mjs` passed; Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` passed; core `npm test` passed 8 smoke tests.
  look further: Keep local proof separate from public browser proof and npm/public package claims.
- id: public-consumption-npm-gap-2026-06-18T23-08-42-0400
  parent: ecosystem-root-005
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` and direct fetch checks returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, public consumption wording.
- id: governance-first-expansion-2026-06-18T23-08-42-0400
  parent: ecosystem-root-005
  lesson: Domain expansion should focus on composition governance, event handoff, proof surfaces, retention, and accounting policy before broad DSK promotion claims.
  evidence: Domain idea docs are planning inventory; DSK architecture packet keeps namespace/atomicity/dependency/state-contract blockers open; deep bug packet reproduced operations/logistics composition bugs.
  look further: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `examples/described-examples/composition-audit-rules.md`, `src/domain-service-kit.js`, `src/runtime-kit.js`, operations kit bug packets.
- id: package-version-policy-2026-06-18T23-08-42-0400
  parent: ecosystem-root-005
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local `package.json` reports `nexusengine@0.1.0`; raw public `0.0.2/package.json` returns 200 and preflight uses branch `0.0.2`.
  look further: Branch naming policy, package version policy, README release wording.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-18T22-08-40-0400-ecosystem-state-node.md`
- relationship: extends
- reason: Confirms branch/local proof stability while refining public proof readiness from local-checkout risk to browser-visible module failure.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T22-40-48-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Fresh Playwright check reproduced the public proof route `Booting...` failure and 404 module paths.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-18T23-01-44-0400-domain-kit-idea-node.md`
- relationship: constrains
- reason: Idea expansion points toward governance and proof surfaces rather than more product-domain claims.

## Next Search Branches
- branch: public-proof-import-shape
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
- question: Should the public DSK proof use CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: public-consumption-wording
- files or folders: `README.md`, `package.json`, `scripts/automation-preflight.mjs`, `https://registry.npmjs.org/nexusengine`
- question: Should docs explicitly say GitHub/jsDelivr branch consumption is supported while npm metadata is unavailable?
- branch: composition-governance-readiness
- files or folders: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `examples/described-examples/composition-audit-rules.md`, `src/domain-service-kit.js`, `src/runtime-kit.js`
- question: Which governance checks belong in runtime, audit tooling, or planning docs before broad DSK graph promotion?
- branch: package-version-policy
- files or folders: `package.json`, raw public `package.json`, remote release branch list
- question: Is branch `0.0.2` plus package version `0.1.0` intentional release policy or stale metadata?

## Not Claimed
- This node does not fix the public proof route.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim idea docs are canonical release architecture.
