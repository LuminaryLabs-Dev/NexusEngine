# Knowledge Nodes: ecosystem_state_scout 2026-06-22T18-07-07-0400

## Root Lesson
- id: ecosystem-root-034
- statement: Core remains commit-aligned with `origin/0.0.2` and smoke-green, but ecosystem proof is still red across the same release/public gates: ProtoKits local `main` is clean and aggregate-green at 470 modules while 103 commits ahead of `origin/0.0.2`, ProtoKits targeted proof cannot resolve package `nexusrealtime`, Experiments aggregate proof fails on canonical route naming, Experiments targeted DSK proof misses `engine.n.zoneField`, npm metadata is 404, branch `0.0.2` serves `nexusrealtime@0.1.0`, and the public proof route still stalls at `Booting...` on deployed module 404s. The newest DSK Extension Service Ownership evidence adds core hardening risk but does not change distribution proof status.
- why it matters: The ecosystem is still not ready to claim release/public DSK proof. Local dev evidence, release-ref evidence, public-browser evidence, dirty host/docs work, host graph hardening, and extension-service hardening must stay separate until their proof targets are explicitly chosen.

## Child Nodes
- id: core-dirty-host-docs-release-boundary-2026-06-22-1807
  parent: ecosystem-root-034
  lesson: Core `main`, `origin/main`, and `origin/0.0.2` all resolve to `6c450b3`, but dirty host/docs/source/test and neighboring lane changes are still local evidence only.
  evidence: `git rev-parse HEAD origin/main origin/0.0.2` returned `6c450b3073825ddd495979474f57342556658972`; ahead/behind vs `origin/0.0.2` and `origin/main` both returned `0 0`; `git status --short` showed docs, ideal docs, host source/example/test, and lane tracker/artifact changes; `npm test` passed 9 smoke tests.
  look further: Decide whether dirty host/docs work is intended for next release proof or should remain separate until committed and intentionally promoted.
- id: protokits-local-ahead-release-ref-2026-06-22-1807
  parent: ecosystem-root-034
  lesson: ProtoKits available checkout is clean and aggregate-green, but it remains development-state proof rather than release-ref proof.
  evidence: ProtoKits local `main` resolved to `a23664b8e346482df773aeff9c0793919ba04ccb`, `origin/0.0.2` to `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`, and `HEAD...origin/0.0.2` to `103 0`; local `npm run check` passed after 470 JavaScript modules.
  look further: Keep local ProtoKits development proof separate from `origin/0.0.2` proof until the release branch advances or proof policy changes.
- id: protokits-targeted-package-resolution-2026-06-22-1807
  parent: ecosystem-root-034
  lesson: ProtoKits targeted first-wave DSK proof remains package-resolution red in both local and disposable release layouts.
  evidence: Local and disposable `node tests/dsk-first-wave.test.mjs` both failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`; disposable `origin/0.0.2` aggregate check passed after 411 JavaScript modules.
  look further: Validate targeted first-wave DSK proof with an explicit package, workspace, CDN, or link model for `nexusrealtime`.
- id: experiments-release-ref-aggregate-and-targeted-red-2026-06-22-1807
  parent: ecosystem-root-034
  lesson: Experiments local `main` still equals `origin/0.0.2`, but both aggregate and targeted proof remain red.
  evidence: Experiments `HEAD` and `origin/0.0.2` both resolved to `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; local and disposable `npm run check` failed on `the-open-above-v2 route should not be versioned`; local and disposable targeted DSK smoke failed with `engine.n.zoneField` undefined.
  look further: Fix canonical route expectations separately from first-wave DSK API installation.
- id: public-browser-module-404-2026-06-22-1807
  parent: ecosystem-root-034
  lesson: The public DSK proof route remains HTTP-visible but browser-incomplete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`, `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, package dependency, or build-step import maps for public proof.
- id: public-consumption-version-policy-2026-06-22-1807
  parent: ecosystem-root-034
  lesson: Public consumption and version policy remain split.
  evidence: Required GitHub/raw/jsDelivr links returned 200, npm metadata for `nexusrealtime` returned 404, and branch `0.0.2` serves `nexusrealtime@0.1.0`.
  look further: Branch naming policy, package version policy, public consumption wording, and npm publication policy.
- id: dsk-extension-service-hardening-separate-2026-06-22-1807
  parent: ecosystem-root-034
  lesson: DSK Extension Service Ownership is fresh core hardening inventory, not a release/public proof fix.
  evidence: Neighboring deep-bug/domain packets reported `extendDomainServiceKit()` missing extension APIs, non-atomic base-plus-extension install, and same-name ECS definition aliasing; live local/release/public proof gates still fail separately.
  look further: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`, extension API/token parity fixtures, base-already-installed extension transaction fixtures, duplicate definition-name fixtures.
- id: host-graph-hardening-separate-2026-06-22-1807
  parent: ecosystem-root-034
  lesson: Host Graph Lifecycle Ownership remains hardening inventory, not distribution proof.
  evidence: Neighboring packets report mutable host adapter tokens, duplicate adapter collapse, non-atomic unmount, and snapshot side effects while proof gates still fail on package resolution, route naming, targeted DSK API installation, npm metadata, version policy, and browser imports.
  look further: `src/host.js`, host graph fixtures, dirty host-surface release boundary.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-22T06-05-45-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Reconfirms the same proof split with current live evidence and adds DSK Extension Service Ownership as a separate hardening branch.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-22T06-36-22-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps branch/ref policy, package resolution, aggregate-route validation, DSK API installation, npm, and browser import deployment as separate gates.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-22T06-49-01-0400-deep-bug-node.md`
- relationship: references
- reason: Treats extension-service bugs as core DSK hardening inputs, not proof-route fixes.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-22T07-03-20-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms DSK Extension Service Ownership is planning inventory and does not replace proof-readiness gates.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-22T06-19-35-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps dirty host-surface, runtime failure-boundary, domain command/config, and host graph lifecycle as hardening context rather than distribution proof.

## Next Search Branches
- branch: protokits-local-vs-release-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`, fetched `origin/0.0.2`, package metadata, release branch policy
  question: Should the next proof target local ProtoKits `main`, `origin/main`, or the preflight-resolved release branch?
- branch: protokits-targeted-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/package.json`, `tests/dsk-first-wave.test.mjs`, `protokits/nexus-dsk-adapter/index.js`
  question: Which module-source model makes targeted first-wave DSK proof resolve `nexusrealtime` locally and in detached release layouts?
- branch: experiments-aggregate-canonical-route
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/tests/canonical-game-routes-smoke.mjs`, generated route wrappers, `index.html`
  question: Why does aggregate validation still see `the-open-above-v2` as versioned?
- branch: experiments-targeted-dsk-api-installation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/domain-foundation`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/domain-service-kits`
  question: Why are expected first-wave APIs missing from `engine.n` after proof kit installation?
- branch: public-proof-import-shape
  files or folders: public DSK proof route, raw proof source, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, package dependency, or import maps?
- branch: dsk-extension-service-ownership
  files or folders: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`
  question: Should extension kits require explicit extension APIs, base-already-installed transaction handling, and same-name ECS definition checks before DSK promotion?
- branch: host-graph-release-boundary
  files or folders: `src/host.js`, `src/index.js`, `tests/host-smoke.mjs`, `examples/three-host/`, `docs/ideal/ideal-hosts.md`
  question: Should host graph hardening fixtures wait until the dirty host surface is committed or explicitly release-scoped?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim dirty core host/docs changes are release-ready.
- This node does not claim ProtoKits local `main` is release-ref proof.
- This node does not claim branch names match latest release branch names.
- This node does not claim ProtoKits targeted first-wave DSK validation passed.
- This node does not claim Experiments aggregate validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim DSK Extension Service Ownership, Host Graph Lifecycle Ownership, domain command/config ownership, telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
