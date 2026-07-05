# Knowledge Nodes: ecosystem proof scout 2026-06-20T03-41-33-0400

## Root Lesson
- id: ecosystem-proof-027
- statement: Core still matches the preflight-resolved latest release branch and passes smoke tests, while first-wave DSK proof remains blocked by the same module-source strategy gap; sibling refs moved again, but local/fetched ProtoKits still cannot resolve package `nexusengine`, Experiments targeted proof still fails, and the public browser proof remains stuck at `Booting...`.
- why it matters: Promotion review still cannot merge local, fetched-ref, aggregate, targeted, browser, npm, and package-version claims into one proof. The live update is that ProtoKits fetched `origin/0.0.2` advanced to `d8b353bd4a5922f863b56d3de6f365b8d792c427`, Experiments fetched `origin/0.0.2` advanced to `3e047f693f3ed58cab1c362deb09a597398d05e5`, and local ProtoKits metadata remains `0.0.1` while fetched metadata is `0.0.2`.

## Child Nodes
- id: ecosystem-proof-027-a
  parent: ecosystem-proof-027
  lesson: Core remains latest-release aligned and smoke-green.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs every run because sibling refs continue to drift.
- id: ecosystem-proof-027-b
  parent: ecosystem-proof-027
  lesson: ProtoKits local and fetched proof remain blocked by the direct package import `nexusengine`.
  evidence: Local ProtoKits `npm run check` checked 367 JavaScript modules, then failed 110 import smokes rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; local targeted DSK smoke failed on the same package; fetched `origin/0.0.2` at `d8b353bd4a5922f863b56d3de6f365b8d792c427` checked 369 modules and failed the same way.
  look further: Validate ProtoKits with an explicit package, workspace, CDN, or link model that matches intended release consumption.
- id: ecosystem-proof-027-c
  parent: ecosystem-proof-027
  lesson: ProtoKits now has a local-vs-fetched package metadata split in addition to package-resolution failure.
  evidence: Local ProtoKits `package.json` is `@luminarylabs/nexusengine-protokits@0.0.1`; fetched `origin/0.0.2` package metadata is `@luminarylabs/nexusengine-protokits@0.0.2`; both fail DSK validation because `nexusengine` is unresolved.
  look further: Decide whether local package metadata should match the release branch before release-proof language relies on local checkout state.
- id: ecosystem-proof-027-d
  parent: ecosystem-proof-027
  lesson: Experiments fetched aggregate proof still passes while targeted DSK proof remains blocked by sibling-relative imports.
  evidence: Experiments local `HEAD` was `57b3d668891794ddad00c765ce4faf342a3d9000`; fetched `origin/0.0.2` was `3e047f693f3ed58cab1c362deb09a597398d05e5`; ahead/behind `0 2`; disposable fetched aggregate `npm run check` passed, but targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed on missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Re-run targeted DSK proof with the same module-source strategy intended for public proof.
- id: ecosystem-proof-027-e
  parent: ecosystem-proof-027
  lesson: Public DSK proof remains HTTP-visible but not browser-complete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser proof.
- id: ecosystem-proof-027-f
  parent: ecosystem-proof-027
  lesson: Experiments aggregate validation remains a separate green claim from targeted DSK proof.
  evidence: Disposable fetched Experiments `npm run check` passed and generated 100 flat route wrappers, but `package.json` aggregate script does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
  look further: Decide whether the DSK smoke belongs in `npm run check`, `npm run check:deploy`, or required targeted evidence.
- id: ecosystem-proof-027-g
  parent: ecosystem-proof-027
  lesson: Runtime identity/lifecycle and composition-proof hardening are real neighboring inventory but do not change distribution proof status.
  evidence: DSK architecture node `2026-06-20T03-23-42-0400`, deep bug node `2026-06-20T02-54-27-0400`, and domain idea node `2026-06-20T03-01-44-0400` add binding ownership, ECS definition identity, SequenceNode install-only idempotency, event-bus disposed parity, provider ownership, type/history isolation, and AR runtime-source consistency as hardening rows separate from module-source proof.
  look further: Route hardening fixtures separately from module-source/public browser proof.
- id: ecosystem-proof-027-h
  parent: ecosystem-proof-027
  lesson: Core/ProtoKits/Experiments ownership boundaries still hold.
  evidence: Repo memory and boundary docs keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner; this run found no reason to move proof routing or reusable implementation into NexusEngine core.
  look further: Fix proof routing/imports without moving route ownership, reusable implementation, or proof-readiness checklist tooling into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T02-40-59-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Preserves the module-source blocker while updating live sibling refs, local/fetched package versions, and current Playwright state.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T03-07-30-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms local, fetched-ref, public browser, npm, package-version, and aggregate-targeted claims remain separate while sibling refs continue moving.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T03-23-42-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Keeps runtime identity/lifecycle, composition-proof ownership, and runtime hardening separate from distribution/module-source proof.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T02-54-27-0400-deep-bug-node.md
- relationship: references
- reason: Treats binding ownership, ECS definition identity, SequenceNode install-only idempotency, and disposed event-bus parity as hardening inputs, not distribution proof.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T03-01-44-0400-domain-kit-idea-node.md
- relationship: references
- reason: Confirms the new neighboring idea family is Runtime Identity And Lifecycle Ownership, not a duplicate module-source family.

## Next Search Branches
- branch: module-source-strategy
  files or folders: `package.json`, sibling package metadata, ProtoKits DSK adapter, Experiments proof import maps, public CDN/raw URLs
  question: Should release proof resolve NexusEngine through package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps?
- branch: protokits-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `protokits/nexus-dsk-adapter/index.js`, fetched `origin/0.0.2`
  question: Can ProtoKits validate locally and at fetched ref without relying on an undeclared package?
- branch: protokits-package-version-policy
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, fetched `origin/0.0.2`
  question: Should local package metadata match fetched release branch metadata before proof packets use local checkout evidence?
- branch: experiments-targeted-dsk-local-and-fetched
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`, fetched `origin/0.0.2`, sibling path layout
  question: Can Experiments targeted DSK proof pass with the intended module-source strategy across local and disposable layouts?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as required targeted evidence?
- branch: moving-sibling-release-ref
  files or folders: sibling `origin/0.0.2` refs, automation packets, release evidence checklist
  question: How should proof packets handle sibling release refs that advance during a scout run?
- branch: hardening-boundary
  files or folders: `src/game-kit-composer.js`, `src/runtime-kit.js`, `src/ecs.js`, `src/sequence-node*.js`, `src/ar-launcher.js`, neighboring DSK/deep-bug/domain nodes
  question: Which hardening rows belong in executable runtime fixtures after module-source proof is separated?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits local or fetched `origin/0.0.2` passed validation.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, or AR/spatial rows are fixed.
