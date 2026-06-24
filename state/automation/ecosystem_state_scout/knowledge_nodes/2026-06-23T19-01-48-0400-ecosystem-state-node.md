# Knowledge Nodes: ecosystem_state_scout 2026-06-23T19-01-48-0400

## Root Lesson
- id: ecosystem-root-036
- statement: Core remains commit-aligned with `origin/0.0.2` and smoke-green, but ecosystem proof remains red and sibling local proof drift widened materially. ProtoKits local `main` is now 140 commits ahead of `origin/0.0.2` and 11 behind `origin/main`, and local `npm run check` now fails at `generic-promotion-gate-smoke` on `pressure emits warning transition`; release `origin/0.0.2` ProtoKits aggregate still passes while targeted proof cannot resolve package `nexusrealtime`. Experiments local `main` is now 67 commits ahead of `origin/0.0.2` and 50 behind `origin/main`; both local and release layouts still fail aggregate route validation on `the-open-above-v2` and targeted DSK proof on missing `engine.n.zoneField`. Public proof remains visible as `Booting...` on deployed module 404s, npm metadata remains 404, branch `0.0.2` still serves `nexusrealtime@0.1.0`, and the optional ProtoKits jsDelivr `scan-survey-kit` path recovered to 200.
- why it matters: Local dev evidence, release-ref evidence, latest-main freshness, aggregate validation, targeted DSK proof, public-browser evidence, npm/package policy, CDN availability, and hardening inventory must stay separate until the proof target is chosen explicitly.

## Child Nodes
- id: core-dirty-host-docs-release-boundary-2026-06-23-1901
  parent: ecosystem-root-036
  lesson: Core `main`, `origin/main`, and `origin/0.0.2` still resolve to `6c450b3`, but dirty host/docs/source/test and neighboring lane changes remain local evidence only.
  evidence: `git rev-parse HEAD origin/main origin/0.0.2` returned `6c450b3073825ddd495979474f57342556658972`; ahead/behind vs `origin/0.0.2` and `origin/main` both returned `0 0`; `npm test` passed 9 smoke tests; `git status --short` still showed docs, ideal docs, host source/example/test, and lane tracker/artifact changes.
  look further: Decide whether dirty host/docs work is intended for next release proof or should remain separate until committed and intentionally promoted.
- id: protokits-local-aggregate-regression-2026-06-23-1901
  parent: ecosystem-root-036
  lesson: ProtoKits local `main` is no longer aggregate-green and is not release-ref or latest-main proof.
  evidence: ProtoKits local `main` resolved to `4c571ea238a4692880ce1e47830bcf092d4b9ea3`, `origin/0.0.2` to `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`, and `origin/main` to `1ec419e207a001a8347eba99c065bda2a6c5bc53`; local `HEAD...origin/0.0.2` returned `140 0`; local `HEAD...origin/main` returned `0 11`; local `npm run check` failed at `tests/generic-promotion-gate-smoke.test.mjs:23` with actual `0`, expected `1`.
  look further: Investigate the `pressure emits warning transition` regression before using local ProtoKits as green development proof.
- id: protokits-release-targeted-package-resolution-2026-06-23-1901
  parent: ecosystem-root-036
  lesson: ProtoKits release `origin/0.0.2` aggregate validation remains green, but targeted first-wave DSK proof remains package-resolution red.
  evidence: Disposable `origin/0.0.2` ProtoKits `npm run check` passed after 411 JavaScript modules; local and disposable `node tests/dsk-first-wave.test.mjs` both failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
  look further: Validate targeted first-wave DSK proof with an explicit package, workspace, CDN, or link model for `nexusrealtime`.
- id: experiments-local-release-main-drift-2026-06-23-1901
  parent: ecosystem-root-036
  lesson: Experiments local `main` is no longer release-ref aligned and latest `origin/main` advanced further, but local and release proof still fail the same gates.
  evidence: Experiments local `main` resolved to `2e66120391fa9d88e3c6a27e16bb59c82ad95a4a`, `origin/0.0.2` to `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`, and `origin/main` to `0508a2af3c47857187f7d31cf898d061d65d8b37`; local `HEAD...origin/0.0.2` returned `67 0`; local `HEAD...origin/main` returned `0 50`; local and disposable `npm run check` failed on `the-open-above-v2 route should not be versioned`; local and disposable targeted DSK smoke failed with `engine.n.zoneField` undefined.
  look further: Decide whether proof should stay pinned to preflight `origin/0.0.2`, consume local `main`, or inspect latest `origin/main` before route/API fixes.
- id: public-browser-module-404-2026-06-23-1901
  parent: ecosystem-root-036
  lesson: The public DSK proof route remains HTTP-visible but browser-incomplete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`, `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, package dependency, or import maps for public proof.
- id: protokits-jsdelivr-proof-path-recovered-2026-06-23-1901
  parent: ecosystem-root-036
  lesson: The optional ProtoKits jsDelivr `scan-survey-kit` path recovered from the prior 502, but CDN availability alone does not prove public browser execution.
  evidence: `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/protokits/scan-survey-kit/index.js` returned 200 and `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` returned 200; the public proof route still showed `Booting...` with same-origin deployed module 404s.
  look further: Decide whether ProtoKits public proof should rely on raw GitHub, jsDelivr, same-origin deployed assets, or package resolution.
- id: public-consumption-version-policy-2026-06-23-1901
  parent: ecosystem-root-036
  lesson: Public consumption and version policy remain split.
  evidence: Required core GitHub/raw/jsDelivr links returned 200, npm metadata for `nexusrealtime` returned 404, and branch `0.0.2` serves `nexusrealtime@0.1.0`.
  look further: Branch naming policy, package version policy, public consumption wording, and npm publication policy.
- id: composition-proof-hardening-separate-2026-06-23-1901
  parent: ecosystem-root-036
  lesson: Composition Proof Ownership is fresh core hardening inventory, not a distribution or public proof fix.
  evidence: Neighboring deep-bug/domain nodes report mutable nested composer arrays, stale supplied-composer handoff, and mutable `engine.game` proof metadata; live proof gates still fail separately on ProtoKits local aggregate validation, ProtoKits package resolution, Experiments route naming, targeted DSK API installation, npm, package-version policy, and public browser imports.
  look further: `src/game-kit-composer.js`, `tests/procedural-navigation-smoke.mjs`, composer immutability fixtures, supplied-composer parity fixtures, engine game proof metadata fixtures.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-23T06-06-22-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Reconfirms the proof split with current live evidence, changes sibling local/release/main drift, adds a ProtoKits local aggregate regression, and records optional ProtoKits jsDelivr recovery.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-23T06-38-41-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps branch/ref policy, package resolution, aggregate-route validation, DSK API installation, npm, package-version, optional CDN, and browser import deployment as separate gates.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-23T06-49-16-0400-deep-bug-node.md`
- relationship: references
- reason: Treats composer read-model and supplied-composer mutation evidence as hardening input, not proof-route fixes.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-23T07-02-55-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms Composition Proof Ownership planning extends hardening inventory without replacing public proof gates.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-23T06-17-21-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps DSK Extension Service Ownership, Runtime Failure Boundary, Host Graph Lifecycle Ownership, and Host Public State Ownership separate from release/public proof.

## Next Search Branches
- branch: protokits-local-aggregate-regression
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/tests/generic-promotion-gate-smoke.test.mjs`, generic promotion kits
  question: Why did `pressure emits warning transition` stop emitting in local ProtoKits `main`?
- branch: protokits-local-vs-release-vs-main-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`, fetched `origin/0.0.2`, fetched `origin/main`, package metadata, release branch policy
  question: Should the next ProtoKits proof target local `main`, `origin/main`, or the preflight-resolved release branch?
- branch: protokits-targeted-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/package.json`, `tests/dsk-first-wave.test.mjs`, `protokits/nexus-dsk-adapter/index.js`
  question: Which module-source model makes targeted first-wave DSK proof resolve `nexusrealtime` locally and in detached release layouts?
- branch: experiments-local-vs-release-vs-main-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`, fetched `origin/main`, fetched `origin/0.0.2`
  question: Should proof stay pinned to `origin/0.0.2`, use local `main`, or inspect latest `origin/main` now that local and release diverged?
- branch: experiments-aggregate-canonical-route
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/tests/canonical-game-routes-smoke.mjs`, generated route wrappers, `index.html`
  question: Why does aggregate validation still see `the-open-above-v2` as versioned?
- branch: experiments-targeted-dsk-api-installation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/domain-foundation`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/domain-service-kits`
  question: Why are expected first-wave APIs missing from `engine.n` after proof kit installation?
- branch: public-proof-import-shape
  files or folders: public DSK proof route, raw proof source, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, package dependency, or import maps?
- branch: composition-proof-ownership
  files or folders: `src/game-kit-composer.js`, `tests/procedural-navigation-smoke.mjs`
  question: Which composer immutability and supplied-composer handoff fixtures must exist before composition metadata counts as proof?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim dirty core host/docs changes are release-ready.
- This node does not claim ProtoKits local `main` is release-ref proof, latest-main proof, or aggregate-green.
- This node does not claim ProtoKits targeted first-wave DSK validation passed.
- This node does not claim Experiments local `main` is release-ref proof or latest-main proof.
- This node does not claim Experiments aggregate validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim DSK Extension Service Ownership, Host Graph Lifecycle Ownership, Host Public State Ownership, Composition Proof Ownership, Runtime Failure Boundary, Runtime Identity And Lifecycle Ownership, Query Read Model Isolation, Scheduler World Mutation Isolation, or any neighboring hardening row is fixed.
