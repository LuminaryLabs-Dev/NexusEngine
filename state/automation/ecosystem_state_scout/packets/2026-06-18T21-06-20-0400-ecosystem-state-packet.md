# NexusEngine Ecosystem State Packet

## Timestamp
- local: 2026-06-18T21-06-20-0400
- preflight: 2026-06-19T01:06:57.306Z
- automation: nexusengine-ecosystem-state-packet

## Latest branch
- latest remote release branch: `0.0.2`
- source: `npm run automation:preflight` and `git ls-remote --heads origin`
- remote release heads: `0.0.1`, `0.0.2`

## Current branch
- branch: `0.0.2`
- status: `## 0.0.2...origin/0.0.2`
- current commit: `aba770f Automation setup`
- dirty status: unrelated deep-bug scout files are dirty/untracked, and `examples/described-examples/` is untracked; ecosystem state scout lane was clean before this packet.

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
- `state/automation/ecosystem_state_scout/PROMPT.md`
- `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- `package.json`
- `README.md`
- `scripts/automation-preflight.mjs`
- `src/index.js`
- `src/domain-service-kit.js`
- `tests/`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/docs/DSK-FIRST-WAVE-LEDGER.md`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/tests/dsk-first-wave.test.mjs`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`

## Commands run
- `sed -n '1,220p' /Users/crimsonwheeler/.codex/skills/agent-it/SKILL.md`
- `sed -n '1,220p' /Users/crimsonwheeler/.codex/automations/nexusengine-ecosystem-state-packet/memory.md`
- `rg -n "NexusEngine|ProtoKits|ecosystem state|automation" /Users/crimsonwheeler/.codex/memories/MEMORY.md`
- `rg --files .agent state/automation | sort`
- `git rev-parse --show-toplevel`
- `git branch --show-current`
- `git status --short --branch`
- `date '+%Y-%m-%dT%H-%M-%S%z'`
- `sed -n '1,240p' .agent/start-here.md`
- `sed -n '1,240p' .agent/operating-model.md`
- `sed -n '1,260p' .agent/automation-rules.md`
- `sed -n '1,240p' .agent/report-format.md`
- `sed -n '1,260p' .agent/AGENT_MEMORY.md`
- `sed -n '1,260p' .agent/CHANGE_LOG.md`
- `sed -n '1,320p' memory.md`
- `sed -n '1,320p' state/automation/AUTOMATION_MANIFEST.md`
- `sed -n '1,280p' state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `node -e "const p=require('./package.json'); ..."`
- `rg -n "GitHub|jsDelivr|npm|import|install|package|LuminaryLabs|NexusEngine|cdn|raw.githubusercontent|github.io" README.md package.json scripts src state/automation/ecosystem_state_scout/PROMPT.md`
- `sed -n '1,260p' state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- `sed -n '1,260p' state/automation/ecosystem_state_scout/PROMPT.md`
- `npm run automation:preflight`
- `git ls-remote --heads origin | sed 's#refs/heads/##' | sort -V`
- `sed -n '1,220p' scripts/automation-preflight.mjs`
- `npm test`
- `sed -n '1,230p' README.md`
- `sed -n '1,220p' src/index.js`
- `sed -n '1,280p' src/domain-service-kit.js`
- `find tests -maxdepth 2 -type f | sort`
- sibling repo `git status --short --branch`
- sibling repo `git ls-remote --heads origin`
- sibling repo DSK/proof `find`
- sibling repo `git rev-parse HEAD`
- sibling repo `git rev-parse origin/0.0.2`
- sibling repo `git status --porcelain=v1`
- `node tests/dsk-first-wave.test.mjs`
- `node tests/dsk-first-wave-experiment-smoke.mjs`
- public URL `fetch` status spot-check

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> `200`
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> `200`
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> `200`
- `https://registry.npmjs.org/nexusengine` -> `404` optional, not a required-link failure

## Ecosystem state
- Core package metadata: `nexusengine@0.1.0`, ESM, export root `./src/index.js`.
- Latest release branch: `0.0.2`; current core branch matches latest release branch.
- Core public links required by preflight are reachable.
- Core validation passed: `npm test` passed 8 smoke tests.
- ProtoKits sibling is present on `0.0.2`, clean, and `HEAD` equals `origin/0.0.2` at `87888c9c0aa5b4dff67bd3438fe897ee22a95a7b`.
- Experiments sibling is present on `0.0.2`, clean, and `HEAD` equals `origin/0.0.2` at `056a12f4f786e61326417943682fcae29cc254e1`.
- ProtoKits DSK first-wave ledger lists seven `promoted-candidate` kits with `n-*` ids, `n:*` tokens, `engine.n.*` APIs, reset/snapshot/docs/adapter tests, and deferred core promotion.
- Targeted ProtoKits proof passed: `node tests/dsk-first-wave.test.mjs`.
- Targeted Experiments proof passed: `node tests/dsk-first-wave-experiment-smoke.mjs`.

## Drift findings
- Previous sibling dirty/behind drift appears resolved: both siblings are clean and exactly match `origin/0.0.2`.
- Public consumption is still not npm-backed: the npm registry endpoint for `nexusengine` returns `404`.
- README public examples import from `"nexusengine"`; that is valid for local/import-map/package consumers, but public npm installability is not proven.
- The Experiments DSK proof is local-workspace coupled: `proof.js` imports from `../../../../NexusEngine/src/index.js` and sibling ProtoKits paths. It proves local ecosystem wiring, not CDN-only or npm-only consumption.
- Core branch name is `0.0.2`, but package metadata is `0.1.0`; this may be intentional, but it is a review risk when release branch and package version are read as the same claim.

## Risks
- Reviewers may overread `import "nexusengine"` examples as npm availability while registry metadata is missing.
- DSK first-wave promotion evidence is now branch-clean, but public browser proof still depends on local sibling checkouts.
- Existing unrelated dirty deep-bug scout artifacts and untracked `examples/described-examples/` mean the repo is not globally clean, even though this lane is isolated.

## Blockers
- None for writing this packet.
- npm package metadata remains unavailable at the checked registry URL.
- Public CDN/raw links are reachable; no required public network checks failed.

## Suggested next review item
- Review public-consumption wording and proof path: decide whether to publish npm metadata, change README wording, or add a jsDelivr/GitHub-only DSK proof that does not rely on local sibling paths.

## Not claimed
- This packet does not edit source, tests, package metadata, README, canonical memory, or public claims.
- This packet does not prove npm package availability.
- This packet does not prove deployed GitHub Pages behavior for Experiments.
- This packet does not promote any ProtoKit into core.
- This packet does not reconcile unrelated deep-bug scout dirty files or untracked `examples/described-examples/`.
