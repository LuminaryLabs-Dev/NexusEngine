# Knowledge Nodes: ecosystem_state_scout 2026-06-19T00-11-28-0400

## Root Lesson
- id: ecosystem-root-006
- statement: Core, ProtoKits, and Experiments remain aligned on latest release branch `0.0.2` with local DSK proof green, but public proof readiness still needs browser-complete module loading and explicit aggregate DSK proof coverage.
- why it matters: The ecosystem can support local review, but public promotion still needs evidence that humans see completed `engine.n.*` output, aggregate commands cover the DSK proof, and public consumption wording does not imply npm availability.

## Child Nodes
- id: public-proof-import-shape-2026-06-19T00-11-28-0400
  parent: ecosystem-root-006
  lesson: The public DSK proof route is still HTTP-visible but stuck at `Booting...` in a browser.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/` showed `Booting...`; console errors showed 404s for `NexusRealtime/src/index.js`, `NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`, and `NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-dsk-proof-validation-2026-06-19T00-11-28-0400
  parent: ecosystem-root-006
  lesson: Experiments aggregate validation passes but still does not include the DSK first-wave smoke.
  evidence: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/package.json` `check` script does not list `tests/dsk-first-wave-experiment-smoke.mjs`; `npm run check` and the targeted DSK smoke both passed separately.
  look further: Add the DSK smoke to an aggregate check or document the targeted command as required release evidence.
- id: branch-local-proof-stable-2026-06-19T00-11-28-0400
  parent: ecosystem-root-006
  lesson: Core, ProtoKits, and Experiments remain cleanly aligned to `origin/0.0.2`, and local DSK proof commands pass.
  evidence: Core, ProtoKits, and Experiments all returned ahead/behind `0 0`; core `npm test`, ProtoKits `node tests/dsk-first-wave.test.mjs`, and Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` passed.
  look further: Repeat branch/status checks before public promotion or release review.
- id: public-consumption-npm-gap-2026-06-19T00-11-28-0400
  parent: ecosystem-root-006
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` and direct curl checks returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusrealtime`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19T00-11-28-0400
  parent: ecosystem-root-006
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local package metadata reports `nexusrealtime@0.1.0`; raw public `0.0.2/package.json` returned 200 during preflight.
  look further: Branch naming policy, package version policy, and README release wording.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-18T23-08-42-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Confirms branch/local proof stability while carrying forward public proof, npm, and package-version risks with fresh browser and command evidence.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T23-39-46-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Public proof remains browser-blocked and aggregate Experiments validation still does not show DSK first-wave smoke coverage.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T23-23-35-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: DSK production hardening remains separate from public proof and distribution readiness.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T00-00-19-0400-domain-kit-idea-node.md`
- relationship: constrains
- reason: Proof coverage matrix and state-policy ideas should stay advisory until executable proof coverage catches up.

## Next Search Branches
- branch: public-proof-import-shape
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
- question: Should the public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
- question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as a required targeted command?
- branch: public-consumption-wording
- files or folders: `README.md`, `package.json`, `scripts/automation-preflight.mjs`, `https://registry.npmjs.org/nexusrealtime`
- question: Should docs explicitly say GitHub/jsDelivr branch consumption is supported while npm metadata is unavailable?
- branch: package-version-policy
- files or folders: `package.json`, raw public `package.json`, remote release branch list
- question: Is branch `0.0.2` plus package version `0.1.0` intentional release policy or stale metadata?

## Not Claimed
- This node does not fix the public proof route.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim idea docs are canonical release architecture.
- This node does not edit source, tests, public docs, package metadata, deployment, `.agent`, or repo memory.
