# Ecosystem Proof State Packet

Timestamp: 2026-06-18T21:40:21-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; local and raw branch proof is green, public browser proof route still fails at runtime

## Latest branch
- NexusEngine preflight resolved `latestReleaseBranch: 0.0.2`.
- NexusEngine: local `0.0.2` at `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits: local `0.0.2` at `87888c9c0aa5b4dff67bd3438fe897ee22a95a7b`, matching `origin/0.0.2`; ahead/behind `0/0`.
- Experiments: local `0.0.2` at `056a12f4f786e61326417943682fcae29cc254e1`, matching `origin/0.0.2`; ahead/behind `0/0`.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Commands run
- NexusEngine: `npm run automation:preflight` -> passed; required public links OK; optional npm metadata 404.
- NexusEngine: `npm test` -> passed 8 smoke tests.
- ProtoKits: `npm run check` -> passed syntax, import smoke, and ProtoKit tests including first-wave DSK migration.
- Experiments: `npm run check` -> passed syntax/static/content/proof checks; static smoke still emitted legacy HTML warnings and exited 0.
- Branch checks: `git status --short --branch`, `git rev-parse`, `git rev-list --left-right --count HEAD...origin/0.0.2`, `git ls-remote --heads origin`, `git ls-tree -r --name-only origin/0.0.2`.
- Evidence searches: targeted `rg` for DSK aliases, `engine.n.*`, import maps, stale public pins, first-wave ledger state, and renderer/runtime ownership.
- Public checks: targeted `curl -L -s -o /dev/null -w '%{http_code} %{url_effective}'`.
- Human-view check: Playwright opened the public DSK proof route and snapshot showed the page title/content, `Booting...`, and console 404s for sibling repo module paths. Generated Playwright temp artifacts were removed to preserve the lane boundary.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200 by preflight.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200 by preflight.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200 by preflight and direct curl.
- `https://registry.npmjs.org/nexusengine` -> 404; optional preflight link.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/` -> 200.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 200 by curl, but Playwright-visible proof is stuck at `Booting...`.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200.
- Public proof runtime dependency paths from the current relative imports return 404:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`

## ProtoKits migration state
- Direct-import DSK adapter exists at `protokits/nexus-dsk-adapter/index.js`, imports bare `nexusengine`, and is present in `origin/0.0.2`.
- Adapter supports direct-import and old injected-runtime call modes, and wraps first-wave kits into `defineDomainServiceKit()` when available.
- `createN...Kit` aliases exist for zone-field, scan-survey, route-checkpoint, resource-pressure, hazard-director, token-registry, and completion-ledger.
- `tests/dsk-first-wave.test.mjs` proves direct `createN...Kit()` use, legacy compatibility calls, `engine.n.*` installation, serializable snapshots, `engine.*` compatibility APIs, and missing-token failure.
- `docs/DSK-FIRST-WAVE-LEDGER.md` is present locally and on raw `0.0.2`; it says no first-wave kit is half migrated and core promotion is deferred.

## Experiment proof state
- Local `experiments/dsk-first-wave-proof/` exists, is present in `origin/0.0.2`, and is covered by `tests/dsk-first-wave-experiment-smoke.mjs`.
- The proof composes first-wave `createN...Kit()` aliases through `createRealtimeGame()`, ticks the engine, and reads promoted APIs under `engine.n.*`.
- Experiments `npm run check` passes the DSK first-wave smoke locally.
- Public raw proof files now exist, unlike the previous run.
- Public GitHub Pages proof route returns 200 but is not a successful browser proof: Playwright saw `Booting...` and module-load 404s.
- The proof HTML maps bare `nexusengine` to `../../../NexusEngine/src/index.js`, and `src/proof.js` imports sibling `../../../../NexusEngine` and `../../../../NexusEngine-ProtoKits` paths. Those paths do not exist under the GitHub Pages origin.

## Runtime ownership drift
- NexusEngine core still owns the generic DSK contract and passes `domain-service-kit-smoke`.
- ProtoKits owns the first-wave DSK implementations/adapters; Experiments owns the proof page and smoke route.
- No new DSK proof renderer drift was found; the proof is runtime/API-only and the page renderer is presentation-only.
- Broader stale public pins remain in Experiments and ProtoKits docs/demos, including `@main` and `@0.0.1` CDN imports. These are not the current DSK proof blocker but can mask latest-branch proof claims.

## Broken/stale proof paths
- Public DSK proof route is HTTP-visible but runtime-broken because browser module imports resolve to missing sibling GitHub Pages paths.
- Optional npm package metadata is still 404, so npm consumption remains unproved.
- Experiments still contains public URLs pinned to `main` and `0.0.1` in routes such as next-ledge, signal-bastion, zombie-orchard, the-open-above, and fogline-relay.
- ProtoKits README/docs/demos still contain multiple `@main` and some `@0.0.1` CDN examples outside the new DSK import-map guidance.

## Risks
- A reviewer could mistake route HTTP 200 and raw file availability for a working public browser proof.
- Compatibility shims keep direct-import and injected-runtime call paths alive, plus `engine.n.*` and legacy `engine.*` APIs.
- Stale public pins resolve successfully enough to hide whether latest `0.0.2` proof paths are being exercised.
- Local tests import sibling workspace files, so they do not catch public GitHub Pages import-map/path failures.

## Blockers
- Public DSK proof route must load NexusEngine and ProtoKits from public-safe URLs or same-site deployed assets before a public browser proof can be claimed.
- Scout lane rules did not allow source fixes, publishing, package metadata edits, public claim edits, or new tests.

## Suggested next review item
- Review `experiments/dsk-first-wave-proof/index.html` and `experiments/dsk-first-wave-proof/src/proof.js` for public import-map/runtime path shape, then decide whether the proof should use CDN `0.0.2` imports or deploy sibling repo assets under the same Pages origin.

## Not claimed
- No source, tests, docs, package metadata, memory, release branches, public claims, or proof routes were fixed.
- No deployment, push, release, npm publication, or package publication was performed.
- HTTP 200 for the public proof route is not claimed as a working browser proof.
