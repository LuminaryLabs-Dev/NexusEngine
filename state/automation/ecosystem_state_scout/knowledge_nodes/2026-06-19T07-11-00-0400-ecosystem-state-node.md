# Knowledge Nodes: ecosystem_state_scout 2026-06-19T07-11-00-0400

## Root Lesson
- id: ecosystem-root-009
- statement: Core, ProtoKits, and Experiments are clean and aligned with latest release refs and validation-green, but public browser proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening gates remain open.
- why it matters: Promotion review can now stop treating sibling latest-ref drift as the active blocker for this run, but it still needs separate gates for browser-complete public proof, targeted versus aggregate proof, npm/package claims, and DSK runtime invariants.

## Child Nodes
- id: sibling-latest-ref-validation-resolved-2026-06-19-0711
  parent: ecosystem-root-009
  lesson: ProtoKits and Experiments local checkouts are clean and match fetched `origin/0.0.2`.
  evidence: ProtoKits local and origin both resolved to `40d70b93bef6a0e88dadc48067aa4fd2844284f8` with ahead/behind `0 0`; Experiments local and origin both resolved to `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f` with ahead/behind `0 0`; both status outputs were clean.
  look further: Keep this as a recurring watch, not an active blocker, because sibling branches have drifted across prior runs.
- id: latest-ref-validation-green-2026-06-19-0711
  parent: ecosystem-root-009
  lesson: Current local latest refs pass core, ProtoKits, Experiments aggregate, and targeted first-wave DSK validation.
  evidence: Core `npm test` passed 8 smoke tests; ProtoKits `npm run check` and `node tests/dsk-first-wave.test.mjs` passed; Experiments `npm run check` and `node tests/dsk-first-wave-experiment-smoke.mjs` passed.
  look further: Keep aggregate proof and targeted DSK proof distinct until the targeted smoke is wired into an aggregate command or documented as required evidence.
- id: public-proof-import-shape-2026-06-19-0711
  parent: ecosystem-root-009
  lesson: The public DSK proof route remains HTTP-visible but stuck at `Booting...` in a browser.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed `Booting...`; console errors and curl checks showed 404s for `NexusEngine/src/index.js`, `NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-dsk-proof-validation-2026-06-19-0711
  parent: ecosystem-root-009
  lesson: Experiments aggregate validation still omits the DSK first-wave smoke even though both pass separately.
  evidence: Experiments `package.json` `check` does not list `tests/dsk-first-wave-experiment-smoke.mjs`; `npm run check` passed and targeted `node tests/dsk-first-wave-experiment-smoke.mjs` passed separately.
  look further: Add the DSK smoke to an aggregate check or document the targeted command as required release evidence.
- id: expanded-protokits-proof-coverage-2026-06-19-0711
  parent: ecosystem-root-009
  lesson: Expanded ProtoKits fluid/water/domain surfaces are now included in latest local ProtoKits validation, but this remains local command proof, not browser-complete proof.
  evidence: ProtoKits `package.json` exports fluid/water kits and `npm run check` ran `tests/fluid-water-kits.test.mjs`; public first-wave proof route still fails in-browser.
  look further: Build public or browser-visible proof rows only after first-wave module loading is resolved.
- id: receipt-integrity-hardening-2026-06-19-0711
  parent: ecosystem-root-009
  lesson: Receipt identity and event idempotency now join DSK hardening gates.
  evidence: Deep bug node `2026-06-19T06-53-41-0400` found timing result id overwrite, repeated interaction completion, duplicate collectible claim events, and request generated-id collision; domain idea node `2026-06-19T07-01-13-0400` maps those to receipt integrity planning.
  look further: Add receipt identity, event idempotency, claim policy, and request identity fixture rows before broad timing, interaction, reward, or logistics DSK promotion.
- id: public-consumption-npm-gap-2026-06-19-0711
  parent: ecosystem-root-009
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19-0711
  parent: ecosystem-root-009
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local package metadata reports `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.
- id: dsk-hardening-proof-gates-2026-06-19-0711
  parent: ecosystem-root-009
  lesson: DSK promotion gates remain broader than sibling alignment and public module loading.
  evidence: DSK architecture node `2026-06-19T06-24-24-0400` keeps namespace, install, dependency, state-contract, service-call, operations data, spatial/mobility, and resource-bound fixtures open; deep bug and domain idea nodes add receipt integrity.
  look further: Keep public proof loading fixes separate from DSK production-hardening fixture plans.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T06-09-33-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Replaces clean-yet-behind sibling evidence with current clean/aligned sibling latest-ref evidence while preserving public proof and DSK hardening blockers.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T06-46-32-0400-ecosystem-proof-node.md`
- relationship: partially supersedes
- reason: Confirms public proof and aggregate DSK smoke gaps, but current sibling latest-ref validation is now green.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T06-24-24-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: DSK production hardening remains separate from distribution and public proof readiness.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T06-53-41-0400-deep-bug-node.md`
- relationship: constrains
- reason: Receipt identity and idempotency bugs add promotion gates beyond first-wave DSK proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T07-01-13-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Receipt integrity planning inventory should stay advisory until executable coverage exists.

## Next Search Branches
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as a required targeted command?
- branch: sibling-release-alignment-watch
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`
  question: Do sibling branches remain clean/aligned on the next run?
- branch: expanded-protokits-public-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/fluid-water-lab`, public routes
  question: Which expanded fluid/water/domain surfaces need browser-complete proof rows after first-wave proof loads?
- branch: receipt-integrity-hardening
  files or folders: `src/timing-window-kit.js`, `src/interaction-target-kit.js`, `src/collectible-kit.js`, `src/request-fulfillment-kit.js`, proof fixtures
  question: Which receipt identity and event idempotency rows must pass before timing, interaction, reward, or logistics DSK promotion?
- branch: public-consumption-wording
  files or folders: `README.md`, `package.json`, `scripts/automation-preflight.mjs`, `https://registry.npmjs.org/nexusengine`
  question: Should docs explicitly say GitHub/jsDelivr branch consumption is supported while npm metadata is unavailable?
- branch: package-version-policy
  files or folders: `package.json`, raw public `package.json`, remote release branch list
  question: Is branch `0.0.2` plus package version `0.1.0` intentional release policy or stale metadata?
- branch: dsk-hardening-proof-gates
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, selected promoted-domain kits, sibling proof routes
  question: Which hardening fixtures must pass before broad DSK promotion language is safe?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not claim Experiments aggregate validation currently covers DSK first-wave proof.
- This node does not promote ProtoKits into core.
- This node does not claim DSK hardening blockers are fixed.
