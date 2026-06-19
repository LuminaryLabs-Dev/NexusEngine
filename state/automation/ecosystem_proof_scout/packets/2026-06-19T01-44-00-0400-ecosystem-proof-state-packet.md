# Ecosystem Proof State Packet

Timestamp: 2026-06-19T01:44:00-0400
Automation: Nexus Realtime: Ecosystem Proof State Packet
Scope: NexusRealtime core, NexusRealtime-ProtoKits, NexusRealtime-Experiments
Result: partial; local/raw proof remains green, but public browser proof is still blocked

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-proof-005`.
- Latest proof packet `2026-06-18T23-39-46-0400` said local/raw DSK proof remained green, but the public GitHub Pages route still stalled at `Booting...`, and Experiments aggregate validation omitted the DSK first-wave smoke.
- Latest ecosystem state packet `2026-06-19T01-11-04-0400` adds that core and sibling release `HEAD`s remain aligned, but ProtoKits and Experiments worktrees are dirty again.
- Latest DSK architecture packet `2026-06-19T01-24-20-0400` keeps DSK promotion gated by namespace, install transaction, dependency, state-contract, accepted-mutation, idempotency, time, and config policy.
- Latest deep bug packet `2026-06-19T00-54-03-0400` adds objective reset/idempotency, lifecycle accepted-mutation, transport large-delta, and schedule numeric-config bugs.
- Latest domain idea packet `2026-06-19T01-00-48-0400` maps those bugs into accepted mutation, completion idempotency, simulation time, and config normalization planning inventory.
- These packets were used for context only. Live source, docs, tests, branch checks, preflight, public URLs, and Playwright output are the authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- NexusRealtime local branch `0.0.2` at `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits local branch `0.0.2` at `87888c9c0aa5b4dff67bd3438fe897ee22a95a7b`, matching `origin/0.0.2`; ahead/behind `0/0`.
- Experiments local branch `0.0.2` at `056a12f4f786e61326417943682fcae29cc254e1`, matching `origin/0.0.2`; ahead/behind `0/0`.
- Core package metadata remains `nexusrealtime@0.1.0` on release branch `0.0.2`.
- Worktree note:
  - NexusRealtime has pre-existing automation/docs changes.
  - ProtoKits has modified `memory.md`, `package.json`, high-fidelity meadow files, and untracked path-meadow docs/kit/test files.
  - Experiments has modified high-fidelity meadow files and `memory.md`, plus untracked `docs/VISUAL-EXPERIMENT-LOOP.md` and `experiments/path-meadow/`.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime`
- `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`

## Commands run
- NexusRealtime: `npm run automation:preflight` -> passed; required GitHub/raw/jsDelivr links OK; optional npm metadata 404.
- NexusRealtime/ProtoKits/Experiments: `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD`, `git rev-parse origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`.
- ProtoKits/Experiments: `git branch --show-current`, `git ls-remote --heads origin`.
- NexusRealtime: `npm test` -> passed 8 smoke tests.
- ProtoKits: `npm run check` -> passed syntax, import smoke, and full listed test chain.
- ProtoKits targeted DSK: `node tests/dsk-first-wave.test.mjs` -> passed.
- Experiments: `npm run check` -> passed syntax/static/content/game route checks with legacy static warnings.
- Experiments targeted DSK: `node tests/dsk-first-wave-experiment-smoke.mjs` -> passed.
- Public URL checks: direct `curl -L -s -o /dev/null -w "%{http_code}"`.
- Human-view browser check: Playwright opened the public DSK proof route, captured snapshot/console/request state, then the generated `.playwright-cli` scratch artifacts were removed.
- Targeted `rg`/file scans checked DSK aliases, `engine.n.*`, import maps, stale public pins, proof routes, package scripts, idea docs, and proof coverage.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusRealtime` -> 200 by preflight.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusRealtime/0.0.2/package.json` -> 200 by preflight.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@0.0.2/src/index.js` -> 200 by preflight.
- `https://registry.npmjs.org/nexusrealtime` -> 404; optional preflight link.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/` -> 200 by curl, but Playwright-visible proof remains stuck at `Booting...`.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200.
- Public proof runtime dependency paths still fail:
  - `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js` -> 404.
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js` -> 404.
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js` -> 404.

## ProtoKits migration state
- `docs/DSK-FIRST-WAVE-LEDGER.md` remains present locally and on raw `0.0.2`.
- The ledger lists seven first-wave `promoted-candidate` kits: token registry, completion ledger, scan survey, route checkpoint, resource pressure, zone field, and hazard director.
- First-wave `createN...Kit` aliases remain present for those kits and are covered by `tests/dsk-first-wave.test.mjs`.
- The targeted DSK test still proves direct `createN...Kit()` use, legacy compatibility calls, `engine.n.*` install, compatibility `engine.*` APIs, serializable snapshots, and missing-token failure.
- Compatibility shim exit remains unresolved; direct-import, injected-runtime, `engine.n.*`, and legacy `engine.*` API paths all remain active.
- ProtoKits aggregate `npm run check` now includes dirty worktree code in high-fidelity meadow/path-meadow areas because those local changes are present, but DSK first-wave targeted proof still passed separately.

## Experiment proof state
- `experiments/dsk-first-wave-proof/index.html`, `experiments/dsk-first-wave-proof/src/proof.js`, and `tests/dsk-first-wave-experiment-smoke.mjs` exist locally and on public raw `0.0.2`.
- Targeted smoke `node tests/dsk-first-wave-experiment-smoke.mjs` passed.
- Experiments `npm run check` passed, but the `package.json` `check` script still does not list `tests/dsk-first-wave-experiment-smoke.mjs`; DSK proof coverage is still proven by the targeted command, not the aggregate check.
- The proof composes first-wave `createN...Kit()` aliases through `createRealtimeGame()`, ticks the engine, and reads promoted APIs under `engine.n.*`.
- Public raw proof files exist, and the GitHub Pages route returns HTTP 200.
- Human-view result: a reviewer sees the heading, description, and `Booting...`; the proof never reaches completed output.
- Playwright console/request evidence shows 404s for:
  - `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
- Current source still explains the public failure:
  - `index.html` maps bare `nexusrealtime` to `../../../NexusRealtime/src/index.js`.
  - `src/proof.js` imports `../../../../NexusRealtime/src/index.js` and sibling ProtoKits paths.

## Domain and kit proof coverage
- Current public proof route only attempts first-wave DSK service APIs: `zoneField`, `scanSurvey`, `routeCheckpoint`, `resourcePressure`, `hazardDirector`, and `completionLedger`.
- `tokenRegistry` remains covered by ProtoKits targeted DSK tests but not by the public Experiments proof output.
- Idea docs and described examples now cover much broader domains: world-space, boundary, object-inspection, mobility, replicated state, proof coverage, accepted mutation, time policy, and config normalization.
- No browser-complete proof route was found for the broader idea domains; they remain planning inventory or local/source-level surfaces, not public executable proof coverage.
- Coverage classification is a scout map from file/token inspection, not a final architecture audit.

## Runtime ownership drift
- No new DSK proof renderer-vs-runtime drift was found; the first-wave proof route is runtime/API-only and visible rendering is page text.
- Core owns generic DSK runtime contracts; ProtoKits owns first-wave DSK implementations/adapters; Experiments owns the browser proof route and smoke.
- Broader DSK promotion blockers remain separate from the public proof import blocker: namespace safety, install atomicity, dependency policy, state contracts, accepted mutation, completion idempotency, large-delta time catch-up, and config normalization.
- New reusable proof work should still target ProtoKits for reusable domains and Experiments for browser/playable proof, not core, unless it exposes a missing runtime primitive or invariant.

## Broken/stale proof paths
- Public DSK proof route remains HTTP-visible but runtime-broken because browser imports resolve to missing sibling GitHub Pages paths.
- Optional npm package metadata still returns 404, so npm consumption remains unproved.
- Experiments still contains stale or non-latest CDN pins including `@0.0.1`, `@main`, and commit-pinned ProtoKits imports across next-ledge, the-open-above, fogline-relay, zombie-orchard, signal-bastion, high-fidelity-meadow, and path-meadow surfaces.
- The current Experiments aggregate check omits the DSK first-wave smoke even though the targeted smoke exists and passes.
- Release branch `0.0.2` continues to serve package metadata version `0.1.0`.

## Risks
- A reviewer can still mistake route HTTP 200 and raw file availability for a working public browser proof.
- Local tests import sibling workspace files and do not exercise GitHub Pages module resolution.
- Aggregate Experiments validation can pass without running the DSK first-wave smoke.
- ProtoKits and Experiments validation now runs against dirty local worktrees, so branch alignment and review cleanliness are separate claims.
- Compatibility shims keep multiple API paths alive without a recorded removal condition.
- Expansion idea docs are broader than executable proof coverage and should not be read as release-ready architecture.

## Blockers
- The public DSK proof route must load NexusRealtime and ProtoKits from public-safe URLs, same-origin deployed assets, or a build-step import map before a public browser proof can be claimed.
- DSK first-wave smoke should be included in an aggregate Experiments validation path or explicitly documented as a required targeted proof command before reviewers rely on `npm run check` for DSK coverage.
- Sibling worktree dirt should be classified before promotion review: unrelated local work, proof work to capture, or a blocker for review-stable ecosystem claims.
- Scout lane rules did not allow source fixes, publishing, package metadata edits, public claim edits, or new tests.

## Suggested next review item
- Fix the public proof import/module-source strategy for `experiments/dsk-first-wave-proof/index.html` and `src/proof.js`, then wire or document `tests/dsk-first-wave-experiment-smoke.mjs` as required DSK proof evidence.

## Not claimed
- No source, tests, docs, package metadata, memory, release branches, public claims, or proof routes were fixed.
- No deployment, push, release, npm publication, or package publication was performed.
- HTTP 200 for the public proof route is not claimed as a working browser proof.
- Passing Experiments aggregate `npm run check` is not claimed to include DSK first-wave proof coverage.
- Passing sibling checks is not claimed to mean sibling worktrees are clean or release-review ready.
