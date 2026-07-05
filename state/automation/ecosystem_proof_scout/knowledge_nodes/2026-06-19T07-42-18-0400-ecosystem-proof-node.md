# Knowledge Nodes: ecosystem proof scout 2026-06-19T07-42-18-0400

## Root Lesson
- id: ecosystem-proof-009
- statement: Ecosystem proof is latest-ref green locally across core, ProtoKits, and Experiments, but public-browser proof still fails at module loading and DSK proof coverage remains split between targeted, aggregate, distribution, and hardening gates.
- why it matters: Promotion review can drop sibling-behind as the active blocker for this run, but it still cannot claim public proof success, npm installability, aggregate DSK coverage, or production-ready DSK invariants.

## Child Nodes
- id: ecosystem-proof-009-a
  parent: ecosystem-proof-009
  lesson: Core, ProtoKits, and Experiments all match fetched latest release branch `origin/0.0.2`.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ProtoKits both resolved to `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; Experiments both resolved to `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f`; all ahead/behind counts were `0 0`.
  look further: Keep sibling branch alignment as a recurring watch because prior runs saw drift.
- id: ecosystem-proof-009-b
  parent: ecosystem-proof-009
  lesson: Local latest-ref validations pass, including targeted DSK proof smokes.
  evidence: Core `npm test`, ProtoKits `npm run check`, ProtoKits `node tests/dsk-first-wave.test.mjs`, Experiments `npm run check`, and Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` all exited 0.
  look further: Keep targeted DSK proof distinct from aggregate check proof until the smoke is wired or documented.
- id: ecosystem-proof-009-c
  parent: ecosystem-proof-009
  lesson: Public DSK proof remains human-visible stuck at `Booting...`.
  evidence: Playwright opened `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/`; body text and `#proof-status` remained `Booting...`; console/request evidence showed 404s for sibling NexusEngine and ProtoKits module paths.
  look further: Do not treat HTTP 200 on the route as browser-complete proof.
- id: ecosystem-proof-009-d
  parent: ecosystem-proof-009
  lesson: The public proof import shape still targets sibling GitHub Pages paths that are not deployed.
  evidence: Fetched `origin/0.0.2` proof HTML maps `nexusengine` to `../../../NexusEngine/src/index.js`; `src/proof.js` imports sibling `NexusEngine` and `NexusEngine-ProtoKits` relative paths; direct curls returned 404 for those deployed URLs.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map.
- id: ecosystem-proof-009-e
  parent: ecosystem-proof-009
  lesson: Experiments aggregate validation still omits the DSK first-wave smoke.
  evidence: `origin/0.0.2:package.json` `check` script does not list `tests/dsk-first-wave-experiment-smoke.mjs`; `npm run check` passed and targeted `node tests/dsk-first-wave-experiment-smoke.mjs` passed separately.
  look further: Add the DSK proof smoke to an aggregate check or document it as required targeted release evidence.
- id: ecosystem-proof-009-f
  parent: ecosystem-proof-009
  lesson: Expanded ProtoKits fluid/water surfaces are locally validated but not public-browser proven.
  evidence: ProtoKits `npm run check` ran `tests/fluid-water-kits.test.mjs`; package exports include fluid/water kits; public first-wave route still fails before executing proof code.
  look further: Add browser-visible proof rows for expanded surfaces after first-wave public module loading works.
- id: ecosystem-proof-009-g
  parent: ecosystem-proof-009
  lesson: Receipt integrity now belongs in the DSK hardening proof backlog.
  evidence: DSK architecture node `2026-06-19T07-24-53-0400` adds receipt identity, event idempotency, claim policy, and request identity gates; deep bug node `2026-06-19T06-53-41-0400` supplies source-level examples.
  look further: Keep receipt hardening fixtures separate from distribution/public-browser proof.
- id: ecosystem-proof-009-h
  parent: ecosystem-proof-009
  lesson: Validation-generated Experiments flat-route wrappers can dirty sibling state during proof checks.
  evidence: Experiments `npm run check` generated 100 flat route wrappers; generated untracked wrappers were removed and one generated tracked formatting diff was restored; final Experiments status was clean.
  look further: Consider an idempotent generation strategy or explicit cleanup expectation outside this scout lane.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T06-46-32-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Replaces sibling-behind evidence with clean latest-ref alignment while preserving public proof and aggregate DSK gaps.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T07-11-00-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms sibling latest-ref validation is green for this run and public proof, npm, aggregate proof, and hardening gates remain open.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T07-24-53-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Receipt integrity and earlier DSK hardening fixtures remain separate from public route loading.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T06-53-41-0400-deep-bug-node.md
- relationship: constrains
- reason: Receipt identity, repeated events, duplicate claims, and request id collisions are promotion blockers beyond first-wave proof.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T07-01-13-0400-domain-kit-idea-node.md
- relationship: expands
- reason: Receipt integrity proof rows should stay advisory until executable coverage exists.

## Next Search Branches
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as required targeted evidence?
- branch: expanded-protokits-public-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/fluid-water-lab`, public routes
  question: Which expanded fluid/water/domain surfaces need browser-complete proof after first-wave public loading works?
- branch: dsk-hardening-proof-separation
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, selected domain kits, sibling proof routes
  question: Which evidence belongs to runtime hardening versus browser-complete public proof?
- branch: receipt-integrity-hardening
  files or folders: `src/timing-window-kit.js`, `src/interaction-target-kit.js`, `src/collectible-kit.js`, `src/request-fulfillment-kit.js`, proof fixtures
  question: Which receipt identity, event idempotency, claim policy, and request identity rows must pass before broad service promotion?
- branch: generated-flat-route-cleanliness
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/scripts/generate-flat-experiment-routes.mjs`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`
  question: Should route generation be made idempotent against tracked formatting or paired with an explicit cleanup command?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim DSK hardening blockers are fixed.
