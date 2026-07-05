# Knowledge Nodes: ecosystem proof scout 2026-06-20T18-41-30-0400

## Root Lesson
- id: ecosystem-proof-031
- statement: Core and Experiments are aligned with the preflight-resolved latest release branch, but ecosystem DSK proof is still blocked because available ProtoKits is now local `main`/`0.0.1`, fetched ProtoKits `origin/0.0.2` cannot resolve package `nexusengine`, Experiments targeted proof fails, and the public browser proof remains stuck at `Booting...`.
- why it matters: Promotion review must separate available-checkout health from release-ref proof. A green local ProtoKits `main` aggregate check does not prove first-wave DSK release readiness, and a green Experiments aggregate check still omits the targeted DSK smoke.

## Child Nodes
- id: ecosystem-proof-031-a
  parent: ecosystem-proof-031
  lesson: Core remains latest-release aligned and smoke-green.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind is `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs every run because sibling refs and non-release branches continue to drift.
- id: ecosystem-proof-031-b
  parent: ecosystem-proof-031
  lesson: Available ProtoKits checkout is green but stale for first-wave DSK release proof.
  evidence: Local ProtoKits is `main` at `76c4a3819248b40ff0003103fbd43b8d6adfd434`, package `@luminarylabs/nexusengine-protokits@0.0.1`, and `0/251` against `origin/0.0.2`; `npm run check` passed for local `main`; `tests/dsk-first-wave.test.mjs` is absent locally.
  look further: Align ProtoKits to the release ref or explicitly model release proof through disposable fetched-ref validation only.
- id: ecosystem-proof-031-c
  parent: ecosystem-proof-031
  lesson: ProtoKits fetched `origin/0.0.2` still fails on package resolution.
  evidence: Fetched `origin/0.0.2` is `140d2646757394ed2dbd5c6ccf84f5f518b88618`, package `@luminarylabs/nexusengine-protokits@0.0.2`; disposable `npm run check` syntax checked 386 modules, then failed 111 import smokes rooted in missing package `nexusengine`; targeted `node tests/dsk-first-wave.test.mjs` failed with the same package error.
  look further: Re-run aggregate and targeted DSK proof after package/workspace/CDN/link resolution is defined.
- id: ecosystem-proof-031-d
  parent: ecosystem-proof-031
  lesson: Experiments latest-ref aggregate is green, but targeted DSK proof remains red in both available and disposable layouts.
  evidence: Experiments `HEAD` and `origin/0.0.2` both resolve to `3e047f693f3ed58cab1c362deb09a597398d05e5`; `npm run check` passed; local targeted smoke failed because local sibling ProtoKits `main` lacks `createNCompletionLedgerKit`; disposable fetched targeted smoke failed on missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Validate targeted DSK proof with the same module-source strategy intended for public proof.
- id: ecosystem-proof-031-e
  parent: ecosystem-proof-031
  lesson: Public DSK proof remains HTTP-visible but not browser-complete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console/request history showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser proof.
- id: ecosystem-proof-031-f
  parent: ecosystem-proof-031
  lesson: Experiments aggregate validation remains separate from targeted DSK proof.
  evidence: `package.json` aggregate `check` omits `tests/dsk-first-wave-experiment-smoke.mjs`; both available and fetched targeted DSK smoke commands failed.
  look further: Decide whether the DSK smoke belongs in `npm run check`, `npm run check:deploy`, or required targeted evidence.
- id: ecosystem-proof-031-g
  parent: ecosystem-proof-031
  lesson: Telemetry/command evidence ownership is fresh neighboring hardening inventory but does not change distribution proof status.
  evidence: DSK architecture node `2026-06-20T18-23-40-0400`, deep bug node `2026-06-20T17-54-14-0400`, and domain idea node `2026-06-20T18-00-21-0400` add telemetry selected-value snapshots, service command metadata, and input-frame ownership rows separate from module-source proof.
  look further: Route telemetry/command fixtures separately from package, public route, npm, package-version, and aggregate-vs-targeted proof work.
- id: ecosystem-proof-031-h
  parent: ecosystem-proof-031
  lesson: Core/ProtoKits/Experiments ownership boundaries still hold.
  evidence: Repo memory and boundary docs keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner; this run found no reason to move proof routing or reusable implementation into NexusEngine core.
  look further: Fix proof routing/imports without moving route ownership, reusable implementation, or proof-readiness checklist tooling into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T06-40-01-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Preserves the module-source blocker while updating the live sibling state: ProtoKits available checkout is now `main`/`0.0.1`, Experiments is now latest-ref aligned, and fetched ProtoKits `origin/0.0.2` remains package-resolution red.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T18-11-35-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof claims separate while refreshing current checkout drift.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T18-23-40-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Keeps telemetry/command evidence ownership and other hardening rows separate from distribution/module-source proof.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T17-54-14-0400-deep-bug-node.md
- relationship: references
- reason: Treats telemetry, RequestQueue, TransportRoute, and InputIntent ownership bugs as hardening inputs, not distribution proof.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T18-00-21-0400-domain-kit-idea-node.md
- relationship: references
- reason: Confirms the newest neighboring idea family is Telemetry Command Evidence Ownership, not a duplicate module-source family.

## Next Search Branches
- branch: protokits-release-source-alignment
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, fetched `origin/0.0.2`, package metadata
  question: Should local proof require checking out the release branch, or should this lane always use disposable fetched refs for release proof?
- branch: module-source-strategy
  files or folders: `package.json`, sibling package metadata, ProtoKits DSK adapter, Experiments proof import maps, public CDN/raw URLs
  question: Should release proof resolve NexusEngine through package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps?
- branch: protokits-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `protokits/nexus-dsk-adapter/index.js`, `tests/dsk-first-wave.test.mjs`, fetched `origin/0.0.2`
  question: Can ProtoKits validate latest-ref DSK proof without relying on an undeclared package?
- branch: experiments-targeted-dsk-local-and-fetched
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`, fetched `origin/0.0.2`, sibling path layout
  question: Can Experiments targeted DSK proof pass with release-aligned siblings and the intended module-source strategy?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: telemetry-command-hardening-separation
  files or folders: `src/telemetry-kit.js`, `src/request-queue-kit.js`, `src/transport-route-kit.js`, `src/input-intent-kit.js`, neighboring hardening nodes
  question: Which telemetry/command ownership rows should become executable fixtures without confusing them with module-source proof?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim the available ProtoKits checkout is latest-release proof.
- This node does not claim ProtoKits fetched `origin/0.0.2` validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
