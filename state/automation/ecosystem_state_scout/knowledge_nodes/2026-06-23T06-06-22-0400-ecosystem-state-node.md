# Knowledge Nodes: ecosystem_state_scout 2026-06-23T06-06-22-0400

## Root Lesson
- id: ecosystem-root-035
- statement: Core remains commit-aligned with `origin/0.0.2` and smoke-green, but ecosystem proof remains red across the same release/public gates: ProtoKits local `main` is aggregate-green while 103 commits ahead of `origin/0.0.2` and now 30 behind `origin/main`, ProtoKits targeted proof cannot resolve package `nexusrealtime`, Experiments aggregate proof fails on canonical route naming, Experiments targeted DSK proof misses `engine.n.zoneField`, npm metadata is 404, branch `0.0.2` serves `nexusrealtime@0.1.0`, and the public proof route still stalls at `Booting...` on deployed module 404s. New live drift is that Experiments is now 29 behind `origin/main` and the optional ProtoKits jsDelivr `scan-survey-kit` proof path returns 502 while raw GitHub returns 200. Host Public State Ownership adds host hardening risk but does not change distribution proof status.
- why it matters: Local dev evidence, release-ref evidence, sibling `origin/main` freshness, public-browser evidence, dirty host/docs work, host/DSK hardening, npm/package policy, and CDN availability must stay separate until their proof targets are explicitly chosen.

## Child Nodes
- id: core-dirty-host-docs-release-boundary-2026-06-23-0606
  parent: ecosystem-root-035
  lesson: Core `main`, `origin/main`, and `origin/0.0.2` all resolve to `6c450b3`, but dirty host/docs/source/test and neighboring lane changes are still local evidence only.
  evidence: `git rev-parse HEAD origin/main origin/0.0.2` returned `6c450b3073825ddd495979474f57342556658972`; ahead/behind vs `origin/0.0.2` and `origin/main` both returned `0 0`; `git status --short` showed docs, ideal docs, host source/example/test, and lane tracker/artifact changes; `npm test` passed 9 smoke tests.
  look further: Decide whether dirty host/docs work is intended for next release proof or should remain separate until committed and intentionally promoted.
- id: protokits-local-ahead-release-behind-main-2026-06-23-0606
  parent: ecosystem-root-035
  lesson: ProtoKits available checkout is clean and aggregate-green, but it is development-state proof rather than release-ref or latest-main proof.
  evidence: ProtoKits local `main` resolved to `a23664b8e346482df773aeff9c0793919ba04ccb`, `origin/0.0.2` to `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`, and `origin/main` to `476178b6baba291dbe39f7261b8c37255adf9a8f`; local `HEAD...origin/0.0.2` returned `103 0`; local `HEAD...origin/main` returned `0 30`; local `npm run check` passed after 470 JavaScript modules.
  look further: Decide whether the next ProtoKits proof target is local `main`, `origin/main`, or preflight-resolved `origin/0.0.2`.
- id: protokits-targeted-package-resolution-2026-06-23-0606
  parent: ecosystem-root-035
  lesson: ProtoKits targeted first-wave DSK proof remains package-resolution red in both local and disposable release layouts.
  evidence: Local and disposable `node tests/dsk-first-wave.test.mjs` both failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`; disposable `origin/0.0.2` aggregate check passed after 411 JavaScript modules.
  look further: Validate targeted first-wave DSK proof with an explicit package, workspace, CDN, or link model for `nexusrealtime`.
- id: experiments-release-ref-aggregate-and-targeted-red-2026-06-23-0606
  parent: ecosystem-root-035
  lesson: Experiments local `main` still equals `origin/0.0.2`, but both aggregate and targeted proof remain red and `origin/main` has advanced.
  evidence: Experiments `HEAD` and `origin/0.0.2` both resolved to `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; `origin/main` resolved to `9fb36c4cec023df8df427b681855ed1fa5cfb03c`; local `HEAD...origin/main` returned `0 29`; local and disposable `npm run check` failed on `the-open-above-v2 route should not be versioned`; local and disposable targeted DSK smoke failed with `engine.n.zoneField` undefined.
  look further: Fix canonical route expectations separately from first-wave DSK API installation and decide whether proof should consume `origin/main` drift.
- id: public-browser-module-404-2026-06-23-0606
  parent: ecosystem-root-035
  lesson: The public DSK proof route remains HTTP-visible but browser-incomplete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`, `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, package dependency, or build-step import maps for public proof.
- id: protokits-jsdelivr-proof-path-2026-06-23-0606
  parent: ecosystem-root-035
  lesson: A ProtoKits CDN proof path is currently unavailable even though raw GitHub serves the same file.
  evidence: `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/protokits/scan-survey-kit/index.js` returned 200, while `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` returned 502 after retry.
  look further: Recheck jsDelivr availability and decide whether ProtoKits public proof should rely on raw GitHub, jsDelivr, same-origin deployed assets, or package resolution.
- id: public-consumption-version-policy-2026-06-23-0606
  parent: ecosystem-root-035
  lesson: Public consumption and version policy remain split.
  evidence: Required core GitHub/raw/jsDelivr links returned 200 after a transient first preflight abort, npm metadata for `nexusrealtime` returned 404, and branch `0.0.2` serves `nexusrealtime@0.1.0`.
  look further: Branch naming policy, package version policy, public consumption wording, and npm publication policy.
- id: host-public-state-hardening-separate-2026-06-23-0606
  parent: ecosystem-root-035
  lesson: Host Public State Ownership is fresh host graph hardening inventory, not a distribution or public proof fix.
  evidence: Neighboring deep-bug/domain nodes report mutable `host.provides`, public `adapterRecords`, record/lifecycle disagreement, and mount callback side-effect leaks; live proof gates still fail separately on package resolution, route naming, targeted DSK API installation, npm, package-version policy, and public browser imports.
  look further: `src/host.js`, `tests/host-smoke.mjs`, root capability immutability fixtures, private adapter record fixtures, lifecycle parity fixtures, mount transaction fixtures.
- id: dsk-extension-service-hardening-separate-2026-06-23-0606
  parent: ecosystem-root-035
  lesson: DSK Extension Service Ownership remains core hardening inventory, not a release/public proof fix.
  evidence: Neighboring DSK architecture nodes report `extendDomainServiceKit()` token/API parity, base-plus-extension install atomicity, and extension definition identity risks while live proof gates still fail separately.
  look further: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`, extension API/token parity fixtures, base-already-installed extension transaction fixtures, duplicate definition-name fixtures.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-22T18-07-07-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Reconfirms the same proof split with current live evidence, adds widened sibling `origin/main` drift, adds optional ProtoKits jsDelivr failure, and adds Host Public State Ownership as separate host hardening.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-22T18-36-17-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps branch/ref policy, package resolution, aggregate-route validation, DSK API installation, npm, package-version, and browser import deployment as separate gates.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-22T18-49-24-0400-deep-bug-node.md`
- relationship: references
- reason: Treats host public-state mutation evidence as host graph hardening input, not proof-route fixes.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-22T19-04-12-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms Host Public State Ownership extends Host Graph Lifecycle Ownership without replacing public proof gates.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-22T18-19-08-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps DSK Extension Service Ownership and runtime failure-boundary separate from module-source and public browser proof.

## Next Search Branches
- branch: protokits-local-vs-release-vs-main-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`, fetched `origin/0.0.2`, fetched `origin/main`, package metadata, release branch policy
  question: Should the next proof target local ProtoKits `main`, `origin/main`, or the preflight-resolved release branch?
- branch: protokits-targeted-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/package.json`, `tests/dsk-first-wave.test.mjs`, `protokits/nexus-dsk-adapter/index.js`
  question: Which module-source model makes targeted first-wave DSK proof resolve `nexusrealtime` locally and in detached release layouts?
- branch: experiments-main-drift-and-release-ref-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`, fetched `origin/main`, fetched `origin/0.0.2`
  question: Should proof stay pinned to preflight `origin/0.0.2` or also inspect sibling `origin/main` drift now that main advanced 29 commits?
- branch: experiments-aggregate-canonical-route
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/tests/canonical-game-routes-smoke.mjs`, generated route wrappers, `index.html`
  question: Why does aggregate validation still see `the-open-above-v2` as versioned?
- branch: experiments-targeted-dsk-api-installation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/domain-foundation`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/domain-service-kits`
  question: Why are expected first-wave APIs missing from `engine.n` after proof kit installation?
- branch: public-proof-import-shape
  files or folders: public DSK proof route, raw proof source, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, package dependency, or import maps?
- branch: protokits-cdn-proof-path
  files or folders: ProtoKits raw and jsDelivr public URLs
  question: Is the current jsDelivr 502 transient, path-specific, or a blocker for CDN-backed ProtoKits proof?
- branch: host-public-state-ownership
  files or folders: `src/host.js`, `tests/host-smoke.mjs`
  question: Which root capability, private record, lifecycle parity, and mount transaction fixtures must exist before host graphs count as proof?
- branch: dsk-extension-service-ownership
  files or folders: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`
  question: Should extension kits require explicit extension APIs, base-already-installed transaction handling, and same-name ECS definition checks before DSK promotion?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim dirty core host/docs changes are release-ready.
- This node does not claim ProtoKits local `main` is release-ref proof or latest-main proof.
- This node does not claim branch names match latest release branch names.
- This node does not claim ProtoKits targeted first-wave DSK validation passed.
- This node does not claim Experiments aggregate validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability or ProtoKits CDN availability.
- This node does not promote ProtoKits into core.
- This node does not claim DSK Extension Service Ownership, Host Graph Lifecycle Ownership, Host Public State Ownership, domain command/config ownership, telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
