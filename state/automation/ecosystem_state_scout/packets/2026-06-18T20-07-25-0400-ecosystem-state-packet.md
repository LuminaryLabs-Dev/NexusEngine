# Ecosystem State Packet

## Timestamp
- local: 2026-06-18T20-07-25-0400
- preflight: 2026-06-19T00:06:23.147Z

## Latest branch
- latest remote release branch: `0.0.2`
- resolution evidence: `npm run automation:preflight`, `git ls-remote --heads origin`
- remote heads observed: `0.0.1`, `0.0.2`, `main`
- current branch is the latest release branch.

## Current branch
- repo: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- branch: `0.0.2`
- local HEAD: `2b3b66da33a2c561f0ad901604ba09404f747a82`
- origin/0.0.2: `2b3b66da33a2c561f0ad901604ba09404f747a82`
- status: dirty from pre-existing modified/untracked automation and public-claim files.
- dirty summary: `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, `README.md`, `memory.md`, `package.json`, plus untracked `.agent/*`, `scripts/`, and `state/`.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/README.md`
- `state/automation/ecosystem_state_scout/PROMPT.md`
- `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- `package.json`
- `README.md`
- `src/index.js`
- `src/domain-service-kit.js`
- `tests/domain-service-kit-smoke.mjs`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/docs/DSK-FIRST-WAVE-LEDGER.md`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/tests/dsk-first-wave.test.mjs`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/aaa-batch/host/game-registry.js`

## Commands run
- `git branch --show-current`
- `git status --short --branch`
- `git remote -v`
- `git ls-remote --heads origin`
- `npm run automation:preflight`
- `npm test`
- `git -C /Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits status --short --branch`
- `git -C /Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments status --short --branch`
- `node tests/dsk-first-wave.test.mjs` in `NexusEngine-ProtoKits`
- `node tests/dsk-first-wave-experiment-smoke.mjs` in `NexusEngine-Experiments`
- `node -e "import('/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/aaa-batch/host/game-registry.js')..."`

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine`: ok, 200
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json`: ok, 200
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js`: ok, 200
- `https://registry.npmjs.org/nexusengine`: optional npm metadata check returned 404
- required public links ok: true

## Ecosystem state
- Core package metadata: `name` is `nexusengine`, `version` is `0.1.0`, ESM package, export root points to `./src/index.js`.
- Core scripts: `automation:preflight` and `test`.
- Core README claims the ECS/runtime package shape, public API, DSK contract, and automation scout process.
- Core source exports DSK APIs from `src/index.js`, implemented by `src/domain-service-kit.js`.
- Core validation passed: `npm test` ran 8 smoke tests including `domain-service-kit-smoke`.
- ProtoKits sibling exists on `0.0.2`, is behind `origin/0.0.2` by 69 commits, and has modified/untracked DSK first-wave work.
- ProtoKits DSK first-wave ledger lists seven promoted-candidate kits: token-registry, completion-ledger, scan-survey, route-checkpoint, resource-pressure, zone-field, hazard-director.
- ProtoKits targeted DSK migration test passed.
- Experiments sibling exists on `0.0.2`, is behind `origin/0.0.2` by 38 commits, and has modified/untracked DSK first-wave proof work.
- Experiments targeted DSK proof smoke test passed.
- Experiments AAA registry exports 100 routes through `aaaBatchGames`.

## Drift findings
- Core branch state is clean against `origin/0.0.2` by commit, but the working tree contains existing dirty public-claim and automation files. This packet did not classify those changes as authored in this run.
- The ecosystem proof path is not review-stable yet because both sibling repos are behind their remotes and contain untracked DSK first-wave artifacts.
- README import examples use the `nexusengine` package name while npm registry metadata for that name returns 404. GitHub/raw/jsDelivr consumption is live; npm package availability is not.
- The current DSK proof appears coherent locally, but the proof is distributed across core plus two dirty sibling checkouts.

## Risks
- Promoting DSK first-wave claims before reconciling sibling branches may publish local-only proof.
- Public consumers may confuse GitHub/CDN availability with npm registry availability.
- Dirty canonical files in core can blur what belongs to release claims versus automation evidence if not reviewed separately.

## Blockers
- None for this packet.
- Public npm registry metadata is unavailable with 404; recorded as non-required public availability gap, not a broken required link.

## Suggested next review item
- Reconcile `NexusEngine-ProtoKits` and `NexusEngine-Experiments` against `origin/0.0.2`, then rerun the DSK first-wave tests and decide whether the ledger/proof route are ready for canonical promotion.

## Not claimed
- This packet did not edit source, tests, package metadata, README, `memory.md`, or public claims.
- This packet does not prove npm publication.
- This packet does not prove sibling dirty changes are safe to merge.
- This packet does not prove public deployment of the Experiments DSK proof route.
