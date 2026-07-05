# Knowledge Nodes: ecosystem_state_scout 2026-06-20T18-11-35-0400

## Root Lesson
- id: ecosystem-root-030
- statement: Core and ProtoKits remain aligned with the preflight-resolved latest release branch refs, but ecosystem proof is still blocked by module-source strategy: ProtoKits local/latest-ref validation cannot resolve package `nexusengine`, local Experiments targeted proof fails through ProtoKits, fetched Experiments targeted proof assumes sibling `NexusEngine/src/index.js`, and public browser proof still stalls at `Booting...`.
- why it matters: Ref alignment and core smoke tests are stable, but promotion review still cannot merge local, fetched-ref, aggregate, targeted, browser, npm, package-version, and hardening claims into one proof. Procedural/navigation and telemetry/command ownership rows are important runtime hardening inventory, not distribution proof fixes.

## Child Nodes
- id: core-current-2026-06-20-1811
  parent: ecosystem-root-030
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Continue resolving latest release branch with preflight every run.
- id: protokits-ref-aligned-package-resolution-2026-06-20-1811
  parent: ecosystem-root-030
  lesson: ProtoKits remains latest-ref aligned, but package resolution still blocks local/latest-ref validation.
  evidence: Local ProtoKits `HEAD` and `origin/0.0.2` both resolved to `3d42b725dd166274ff6c5452beef86ef17863852`; ahead/behind was `0 0`; package metadata was `@luminarylabs/nexusengine-protokits@0.0.2`; `npm run check` failed after 370 syntax-checked modules with 110 import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; targeted DSK smoke failed for the same package.
  look further: Validate ProtoKits with the same package, workspace, CDN, or link model selected for local and public proof.
- id: experiments-targeted-proof-still-red-2026-06-20-1811
  parent: ecosystem-root-030
  lesson: Experiments fetched aggregate proof still passes while local and fetched targeted DSK proof remain blocked.
  evidence: Local Experiments `HEAD` was `57b3d668891794ddad00c765ce4faf342a3d9000`; fetched `origin/0.0.2` was `3e047f693f3ed58cab1c362deb09a597398d05e5`; ahead/behind was `0 2`; local targeted smoke failed through ProtoKits missing package `nexusengine`; disposable fetched `npm run check` generated 100 flat route wrappers and passed; fetched targeted smoke failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Run targeted DSK proof with the same module-source strategy intended for public proof.
- id: public-proof-import-shape-2026-06-20-1811
  parent: ecosystem-root-030
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console history showed 404s for `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`, `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-targeted-proof-boundary-2026-06-20-1811
  parent: ecosystem-root-030
  lesson: Experiments aggregate validation is green but still separate from DSK first-wave targeted proof.
  evidence: Disposable fetched Experiments `npm run check` passed, but `package.json` aggregate script does not include `tests/dsk-first-wave-experiment-smoke.mjs`; both local and fetched targeted DSK smoke commands failed.
  look further: Decide whether the DSK first-wave proof smoke belongs in `npm run check`, `npm run check:deploy`, or a required targeted evidence checklist.
- id: public-consumption-version-policy-2026-06-20-1811
  parent: ecosystem-root-030
  lesson: Public consumption and version policy remain split.
  evidence: Core release branch `0.0.2` serves `nexusengine@0.1.0`; npm metadata for `nexusengine` remains 404; ProtoKits metadata reports `0.0.2`, but validation is still red.
  look further: Branch naming policy, package version policy, public consumption wording, and npm publication policy.
- id: procedural-navigation-hardening-separate-2026-06-20-1811
  parent: ecosystem-root-030
  lesson: Procedural/navigation state ownership is real neighboring hardening inventory, not a distribution proof fix.
  evidence: DSK architecture node `2026-06-20T17-38-41-0400` adds navigation command endpoint aliasing, navigation/procedural live snapshots, and procedural regenerate return-state mutation rows; public/local/fetched DSK proof still fails on module-source resolution.
  look further: Route procedural/navigation fixtures separately from module-source/public browser proof work.
- id: telemetry-command-evidence-hardening-separate-2026-06-20-1811
  parent: ecosystem-root-030
  lesson: Telemetry command evidence ownership is fresh neighboring hardening inventory, not a distribution proof fix.
  evidence: Deep bug node `2026-06-20T17-54-14-0400` and domain idea node `2026-06-20T18-00-21-0400` add telemetry selected-value/path selector ownership plus RequestQueue, TransportRoute, and InputIntent command payload/state ownership rows; public/local/fetched DSK proof still fails on module-source resolution.
  look further: Route telemetry/command ownership fixtures separately from package, public route, npm, package-version, and aggregate-vs-targeted proof work.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T06-09-43-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves the module-source blocker and ProtoKits ref alignment while refreshing live proof checks and adding procedural/navigation plus telemetry/command ownership as separate hardening inventory.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T06-40-01-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof claims separate while preserving ProtoKits alignment.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T17-38-41-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps procedural/navigation ownership hardening separate from distribution/module-source proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T17-54-14-0400-deep-bug-node.md`
- relationship: references
- reason: Treats telemetry and service command payload ownership as hardening input, not distribution proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T18-00-21-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms the newest neighboring idea family is Telemetry Command Evidence Ownership, not a duplicate module-source family.

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
- branch: procedural-navigation-hardening-separation
  files or folders: `src/pathfinding-kit.js`, `src/procedural-kit.js`, procedural/navigation ownership fixtures
  question: Which procedural/navigation ownership rows should become executable fixtures without confusing them with module-source proof?
- branch: telemetry-command-evidence-hardening-separation
  files or folders: `src/telemetry-kit.js`, `src/request-queue-kit.js`, `src/transport-route-kit.js`, `src/input-intent-kit.js`, telemetry/command ownership fixtures
  question: Which telemetry and service command ownership rows should become executable fixtures without confusing them with module-source proof?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits local/latest-ref validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim procedural/navigation ownership, telemetry/command evidence ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
