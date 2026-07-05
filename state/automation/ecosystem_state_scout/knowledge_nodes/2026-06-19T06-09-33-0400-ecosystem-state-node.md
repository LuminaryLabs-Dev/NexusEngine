# Knowledge Nodes: ecosystem_state_scout 2026-06-19T06-09-33-0400

## Root Lesson
- id: ecosystem-root-008
- statement: Core is current on the latest release branch and available-checkout validation is green, but ProtoKits and Experiments are now clean-yet-behind fetched release refs while public browser proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening gates remain open.
- why it matters: Promotion review needs separate gates for core release alignment, sibling checkout freshness, latest sibling release-ref validation, targeted DSK proof, aggregate proof, raw file availability, public browser completion, npm/package-version claims, and DSK runtime hardening.

## Child Nodes
- id: core-release-head-drift-revalidated-2026-06-19-0609
  parent: ecosystem-root-008
  lesson: Older ecosystem state packets cited core release head `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`, but the current latest release head is `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving the latest release branch every run and treat prior packet commit hashes as context, not authority.
- id: sibling-latest-ref-validation-2026-06-19-0609
  parent: ecosystem-root-008
  lesson: ProtoKits and Experiments local checkouts are clean but behind fetched `origin/0.0.2`, so local validation is available-checkout proof, not latest sibling release-ref proof.
  evidence: ProtoKits local `8c1c933e5dc21cab0579dc3ae806341413f18b00` is behind `40d70b93bef6a0e88dadc48067aa4fd2844284f8` by 22 commits; Experiments local `b4d48101ec599ae9ca2998734040874f377c8108` is behind `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f` by 33 commits; available-checkout `npm run check` and targeted DSK smokes passed in both sibling repos.
  look further: Fast-forward or separately validate sibling latest refs before claiming latest release validation.
- id: public-proof-import-shape-2026-06-19-0609
  parent: ecosystem-root-008
  lesson: The public DSK proof route is still HTTP-visible but stuck at `Booting...` in a browser.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed `Booting...`; console errors and curl checks showed 404s for `NexusEngine/src/index.js`, `NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-dsk-proof-validation-2026-06-19-0609
  parent: ecosystem-root-008
  lesson: Experiments aggregate validation still omits the DSK first-wave smoke, including on fetched `origin/0.0.2`.
  evidence: Available-checkout and fetched `origin/0.0.2` `package.json` `check` scripts do not list `tests/dsk-first-wave-experiment-smoke.mjs`; available-checkout `npm run check` and the targeted DSK smoke both passed separately.
  look further: Add the DSK smoke to an aggregate check or document the targeted command as required release evidence.
- id: expanded-protokits-proof-coverage-2026-06-19-0609
  parent: ecosystem-root-008
  lesson: Fetched ProtoKits `origin/0.0.2` has expanded domain/fluid/water surfaces beyond the available local checkout, but first-wave public browser proof is still blocked.
  evidence: `git diff --stat HEAD..origin/0.0.2` in ProtoKits showed new 2d-platformer, adventure, environment, survival-crafting, fluid, and water surfaces plus domain-service-kit exports and tests; raw first-wave ledger still lists seven promoted candidates and defers core promotion.
  look further: Build proof coverage rows for new surfaces only after sibling latest-ref validation and first-wave browser loading are resolved.
- id: public-consumption-npm-gap-2026-06-19-0609
  parent: ecosystem-root-008
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` and direct curl checks returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-19-0609
  parent: ecosystem-root-008
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local package metadata reports `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.
- id: dsk-hardening-proof-gates-2026-06-19-0609
  parent: ecosystem-root-008
  lesson: DSK promotion gates are broader than sibling freshness and public module loading.
  evidence: DSK architecture node `2026-06-19T05-40-58-0400` calls for namespace, install, dependency, state-contract, service-call, and operations data fixtures; deep bug node `2026-06-19T05-53-25-0400` adds spatial, hazard, mobility, and scenario-time invariant bugs; domain idea node `2026-06-19T06-00-34-0400` maps those into planning boundaries.
  look further: Separate public proof loading fixes from DSK production-hardening fixture plans.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T01-11-04-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Replaces sibling-worktree-dirt evidence with current clean-yet-behind sibling release-ref evidence and revalidates core on the newer release head.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T05-42-20-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Confirms sibling latest-ref drift, public browser proof failure, and aggregate DSK smoke omission with fresh ecosystem-state evidence.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T05-40-58-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: DSK production hardening remains separate from distribution and public proof readiness.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T05-53-25-0400-deep-bug-node.md`
- relationship: constrains
- reason: Spatial, hazard, mobility, and scenario-time invariant bugs add promotion gates beyond first-wave DSK proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T06-00-34-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Spatial and mobility invariant ideas should stay advisory until executable proof coverage catches up.

## Next Search Branches
- branch: sibling-latest-ref-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, fetched `origin/0.0.2`
  question: Can the sibling checkouts be fast-forwarded or separately validated at latest release refs without disturbing local work?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as a required targeted command?
- branch: expanded-protokits-proof-coverage
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits`, `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`
  question: Which new fluid/water/domain surfaces have executable proof rows versus planning or export-only coverage?
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
- This node does not pull, merge, rebase, reset, publish, deploy, or update public claims.
- This node does not claim latest sibling release refs were locally validated.
- This node does not fix the public proof route.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not edit source, tests, public docs, package metadata, deployment, `.agent`, or repo memory.
