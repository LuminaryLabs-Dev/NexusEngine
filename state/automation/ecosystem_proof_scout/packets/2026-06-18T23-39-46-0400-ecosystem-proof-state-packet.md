# Ecosystem Proof State Packet

Timestamp: 2026-06-18T23:39:46-0400
Automation: Nexus Realtime: Ecosystem Proof State Packet
Scope: NexusRealtime core, NexusRealtime-ProtoKits, NexusRealtime-Experiments
Result: partial; local/raw proof remains green, but public browser proof still fails at runtime

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-proof-004`.
- Latest proof packet `2026-06-18T22-40-48-0400` said core, ProtoKits, and Experiments were aligned on `origin/0.0.2`; local/raw DSK proof was green; the public GitHub Pages proof route stalled at `Booting...` due sibling module 404s.
- Latest ecosystem state packet `2026-06-18T23-08-42-0400` confirmed the same public proof blocker and kept npm metadata unavailable at 404.
- Latest DSK architecture packet `2026-06-18T23-23-35-0400` kept production hardening open around `engine.n` namespace safety, install transaction rollback, dependency policy, state contracts, and event handoff.
- Latest deep bug packet `2026-06-18T22-52-38-0400` found operations/logistics composition bugs around request/economy event order, default rewards, cargo negative value, and telemetry retention.
- Latest domain idea packet `2026-06-18T23-01-44-0400` reframed expansion around governance, event handoff, proof surfaces, retention, and accounting policy before broad DSK promotion.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- NexusRealtime local branch `0.0.2` at `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits local branch `0.0.2` at `87888c9c0aa5b4dff67bd3438fe897ee22a95a7b`, matching `origin/0.0.2`; ahead/behind `0/0`.
- Experiments local branch `0.0.2` at `056a12f4f786e61326417943682fcae29cc254e1`, matching `origin/0.0.2`; ahead/behind `0/0`.
- NexusRealtime has pre-existing automation/doc worktree changes; ProtoKits and Experiments were clean.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime`
- `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`

## Commands run
- NexusRealtime: `npm run automation:preflight` -> passed; required public links OK; optional npm metadata 404.
- NexusRealtime: `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD`, `git rev-parse origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`.
- ProtoKits and Experiments: `git fetch --prune origin`, `git status --short --branch`, `git branch --show-current`, `git rev-parse HEAD`, `git rev-parse origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`, `git ls-remote --heads origin`.
- NexusRealtime: `npm test` -> passed 8 smoke tests.
- ProtoKits: `npm run check` -> passed syntax, import smoke, and full listed test chain.
- Experiments: `npm run check` -> passed syntax/static/content/game route checks with legacy static warnings.
- ProtoKits targeted DSK: `node tests/dsk-first-wave.test.mjs` -> passed.
- Experiments targeted DSK: `node tests/dsk-first-wave-experiment-smoke.mjs` -> passed.
- Public URL checks: direct `curl -L -s -o /dev/null -w "%{http_code}"`.
- Human-view browser check: Playwright CLI opened the public DSK proof route and snapshot showed `Booting...`; generated `.playwright-cli` scratch files were removed after reading evidence.
- Targeted `rg` scans checked DSK aliases, `engine.n.*`, import maps, stale branch pins, proof routes, and domain/kit idea coverage.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusRealtime` -> 200 by preflight.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusRealtime/0.0.2/package.json` -> 200 by preflight.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@0.0.2/src/index.js` -> 200 by preflight.
- `https://registry.npmjs.org/nexusrealtime` -> 404; optional preflight link.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/` -> 200 by curl, but browser-visible proof remains stuck at `Booting...`.
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
- The ledger lists first-wave `promoted-candidate` kits for token registry, completion ledger, scan survey, route checkpoint, resource pressure, zone field, and hazard director.
- `protokits/nexus-dsk-adapter/index.js` remains direct-import capable and still keeps injected-runtime compatibility mode.
- `createN...Kit` aliases remain present for zone field, scan survey, route checkpoint, resource pressure, hazard director, token registry, and completion ledger.
- `tests/dsk-first-wave.test.mjs` still proves direct `createN...Kit()` use, legacy compatibility calls, `engine.n.*` install, compatibility `engine.*` APIs, serializable snapshots, and missing-token failure.
- Compatibility shim exit remains unresolved; direct-import, injected-runtime, `engine.n.*`, and legacy `engine.*` API paths all remain active.

## Experiment proof state
- `experiments/dsk-first-wave-proof/index.html`, `experiments/dsk-first-wave-proof/src/proof.js`, and `tests/dsk-first-wave-experiment-smoke.mjs` exist locally and on `origin/0.0.2`.
- Targeted smoke `node tests/dsk-first-wave-experiment-smoke.mjs` passed.
- Experiments `npm run check` passed, but the current check chain did not list `tests/dsk-first-wave-experiment-smoke.mjs`; DSK proof coverage is therefore proven by the targeted command this run, not by the aggregate check script.
- The proof composes first-wave `createN...Kit()` aliases through `createRealtimeGame()`, ticks the engine, and reads promoted APIs under `engine.n.*`.
- Public raw proof files exist, and the GitHub Pages route returns HTTP 200.
- Human-view result: a reviewer sees the page heading and description, then `Booting...`; the proof does not reach completed output.
- Playwright console errors include 404s for:
  - `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
- Current public source shape still explains the failure:
  - `index.html` maps bare `nexusrealtime` to `../../../NexusRealtime/src/index.js`.
  - `src/proof.js` imports `../../../../NexusRealtime/src/index.js` and sibling ProtoKits paths.

## Domain and kit proof coverage
- Current public proof route only covers first-wave DSK service APIs: `zoneField`, `scanSurvey`, `routeCheckpoint`, `resourcePressure`, `hazardDirector`, and `completionLedger`.
- `tokenRegistry` is covered by ProtoKits targeted DSK tests but is not part of the public Experiments proof output.
- Described examples and idea docs now describe broader candidate domains and proof/governance services, but they remain planning inventory.
- No exact executable proof-path match was found for idea families such as `world-space`, `boundary`, `object-inspection`, `mobility`, and `replicated-state`.
- Several core implementations and ProtoKit/game surfaces exist outside the first-wave proof, but this run did not find a public browser proof matrix for those domains.
- Coverage classification is a scout map from file/token inspection, not a final architecture audit.

## Runtime ownership drift
- No new DSK proof renderer-vs-runtime drift was found; the DSK proof route is runtime/API-only and its visible renderer is page text.
- Core owns generic DSK runtime contracts; ProtoKits owns first-wave DSK implementations/adapters; Experiments owns the proof page and route smoke.
- Broader DSK hardening risks remain separate from this public proof blocker: namespace safety, install atomicity, direct dependency policy, state contracts, and deterministic event handoff.

## Broken/stale proof paths
- Public DSK proof route remains HTTP-visible but runtime-broken because browser module imports resolve to missing sibling GitHub Pages paths.
- Optional npm package metadata still returns 404, so npm consumption remains unproved.
- Experiments still contains stale or non-latest pins including `@0.0.1`, `@main`, and commit-pinned ProtoKits imports in routes such as next-ledge, the-open-above, fogline-relay, zombie-orchard, high-fidelity-meadow, and signal-bastion.
- The current Experiments aggregate check omits the DSK first-wave smoke even though the targeted smoke exists and passes.

## Risks
- A reviewer can still mistake route HTTP 200 and raw file availability for a working public browser proof.
- Local tests import sibling workspace files and do not exercise GitHub Pages module resolution.
- Aggregate Experiments validation can pass without running the DSK first-wave smoke.
- Compatibility shims keep multiple API paths alive without a recorded removal condition.
- Expansion idea docs are broader than executable proof coverage and should not be read as release-ready architecture.

## Blockers
- The public DSK proof route must load NexusRealtime and ProtoKits from public-safe URLs, same-origin deployed assets, or a build-step import map before a public browser proof can be claimed.
- DSK first-wave smoke should be included in an aggregate validation path or explicitly documented as a targeted proof command before reviewers rely on `npm run check` for DSK coverage.
- Scout lane rules did not allow source fixes, publishing, package metadata edits, public claim edits, or new tests.

## Suggested next review item
- Fix the public proof import/module-source strategy for `experiments/dsk-first-wave-proof/index.html` and `src/proof.js`, then add the DSK first-wave smoke to the Experiments aggregate validation path or document it as the required targeted proof command.

## Not claimed
- No source, tests, docs, package metadata, memory, release branches, public claims, or proof routes were fixed.
- No deployment, push, release, npm publication, or package publication was performed.
- HTTP 200 for the public proof route is not claimed as a working browser proof.
- Passing aggregate `npm run check` in Experiments is not claimed to include DSK first-wave proof coverage.
