# Knowledge Nodes: ecosystem proof scout 2026-06-20T06-40-01-0400

## Root Lesson
- id: ecosystem-proof-030
- statement: Core still matches the preflight-resolved latest release branch and passes smoke tests, while ProtoKits remains latest-ref aligned but first-wave DSK proof is still blocked by the same module-source strategy gap: ProtoKits cannot resolve package `nexusengine`, Experiments targeted proof fails, and the public browser proof remains stuck at `Booting...`.
- why it matters: The proof blocker did not move from branch drift to runtime hardening; it remains a package/workspace/CDN/same-origin module-source decision that must work consistently across ProtoKits, Experiments, fetched refs, aggregate checks, targeted checks, and public routes. New scheduler/world mutation evidence is important hardening inventory, but it does not change the distribution proof status.

## Child Nodes
- id: ecosystem-proof-030-a
  parent: ecosystem-proof-030
  lesson: Core remains latest-release aligned and smoke-green.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind is `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release refs every run because sibling refs and non-release branches can still drift.
- id: ecosystem-proof-030-b
  parent: ecosystem-proof-030
  lesson: ProtoKits remains latest-ref aligned but unvalidated.
  evidence: ProtoKits local `HEAD` and `origin/0.0.2` both resolve to `3d42b725dd166274ff6c5452beef86ef17863852`, ahead/behind `0 0`, package metadata `@luminarylabs/nexusengine-protokits@0.0.2`; local and disposable fetched `npm run check` both fail after 370 syntax-checked modules with 110 import smokes rooted in missing package `nexusengine`.
  look further: Treat ProtoKits as latest-ref aligned but red until the intended release-consumption model resolves `nexusengine`.
- id: ecosystem-proof-030-c
  parent: ecosystem-proof-030
  lesson: ProtoKits targeted DSK proof still never reaches first-wave assertions.
  evidence: Local/latest-ref `node tests/dsk-first-wave.test.mjs` and disposable fetched-ref targeted smoke both failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
  look further: Re-run targeted DSK proof only after package/workspace/CDN/link resolution is defined.
- id: ecosystem-proof-030-d
  parent: ecosystem-proof-030
  lesson: Experiments fetched aggregate proof still passes while targeted DSK proof remains blocked by sibling-relative imports.
  evidence: Experiments local `HEAD` is `57b3d668891794ddad00c765ce4faf342a3d9000`; fetched `origin/0.0.2` is `3e047f693f3ed58cab1c362deb09a597398d05e5`; ahead/behind is `0 2`; disposable fetched aggregate `npm run check` passed, but targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed on missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Re-run targeted DSK proof with the same module-source strategy intended for public proof.
- id: ecosystem-proof-030-e
  parent: ecosystem-proof-030
  lesson: Public DSK proof remains HTTP-visible but not browser-complete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console and request history showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Do not treat HTTP 200 on the route as browser proof.
- id: ecosystem-proof-030-f
  parent: ecosystem-proof-030
  lesson: Experiments aggregate validation remains separate from targeted DSK proof.
  evidence: Disposable fetched Experiments `npm run check` passed and reported flat route smoke for 100 generated AAA registry routes, but `package.json` aggregate script does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
  look further: Decide whether the DSK smoke belongs in `npm run check`, `npm run check:deploy`, or required targeted evidence.
- id: ecosystem-proof-030-g
  parent: ecosystem-proof-030
  lesson: Scheduler/world mutation isolation is fresh neighboring hardening inventory but does not change distribution proof status.
  evidence: DSK architecture node `2026-06-20T06-23-50-0400`, deep bug node `2026-06-20T05-53-01-0400`, and domain idea node `2026-06-20T06-01-42-0400` add active scheduler mutation, phase topology, `runSystem()` membership, and `world.readEvents()` payload isolation rows separate from module-source proof.
  look further: Route scheduler/world fixtures separately from module-source/public browser proof.
- id: ecosystem-proof-030-h
  parent: ecosystem-proof-030
  lesson: Core/ProtoKits/Experiments ownership boundaries still hold.
  evidence: Repo memory and boundary docs keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner; this run found no reason to move proof routing or reusable implementation into NexusEngine core.
  look further: Fix proof routing/imports without moving route ownership, reusable implementation, or proof-readiness checklist tooling into NexusEngine core.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T05-39-53-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Preserves the same module-source blocker while refreshing live preflight, local, fetched-ref, public link, and Playwright evidence.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T06-09-43-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Confirms core and ProtoKits remain latest-ref aligned while package/module-source proof still blocks validation.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T06-23-50-0400-dsk-architecture-node.md
- relationship: constrains
- reason: Keeps scheduler/world mutation isolation and other hardening rows separate from distribution/module-source proof.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T05-53-01-0400-deep-bug-node.md
- relationship: references
- reason: Treats scheduler/world mutation bugs as hardening inputs, not distribution proof.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T06-01-42-0400-domain-kit-idea-node.md
- relationship: references
- reason: Confirms the newest neighboring idea family is Scheduler World Mutation Isolation, not a duplicate module-source family.

## Next Search Branches
- branch: module-source-strategy
  files or folders: `package.json`, sibling package metadata, ProtoKits DSK adapter, Experiments proof import maps, public CDN/raw URLs
  question: Should release proof resolve NexusEngine through package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps?
- branch: protokits-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `protokits/nexus-dsk-adapter/index.js`, `tests/dsk-first-wave.test.mjs`
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
- branch: scheduler-world-hardening-separation
  files or folders: `src/ecs.js`, `src/engine.js`, scheduler/world fixtures, neighboring DSK/deep-bug/domain nodes
  question: Which scheduler/world mutation fixtures should be tracked separately from module-source proof?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits local/latest-ref validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core or retire compatibility shims.
- This node does not claim scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, or content-boundary/objective rows are fixed.
