# Knowledge Nodes: Ecosystem State Scout 2026-06-18T20-07-25-0400

## Root Lesson
- id: ecosystem-root-002
- statement: The core `0.0.2` release branch is publicly reachable and test-clean locally, but ecosystem-level DSK proof is not review-stable while ProtoKits and Experiments are behind origin with untracked proof artifacts.
- why it matters: DSK promotion readiness depends on cross-repo proof, not just the core package passing tests.

## Child Nodes
- id: latest-release-public-core
  parent: ecosystem-root-002
  lesson: `npm run automation:preflight` resolved `0.0.2` as the latest release branch and required GitHub/raw/jsDelivr links passed.
  evidence: `github-repo` 200, `raw-package-json` 200, `jsdelivr-src-index` 200, `npm-package-metadata` 404 optional.
  look further: Recheck public package targets before changing README consumption language.
- id: sibling-dsk-proof-dirty
  parent: ecosystem-root-002
  lesson: ProtoKits and Experiments have locally passing DSK first-wave proof tests, but both repos are behind origin and dirty.
  evidence: ProtoKits behind 69 with `docs/DSK-FIRST-WAVE-LEDGER.md` untracked; Experiments behind 38 with `experiments/dsk-first-wave-proof/` untracked.
  look further: Compare sibling local changes to origin before promoting DSK first-wave claims.
- id: npm-name-not-published
  parent: ecosystem-root-002
  lesson: GitHub and jsDelivr public consumption works for the resolved release branch, but npm registry metadata for `nexusrealtime` is unavailable.
  evidence: `https://registry.npmjs.org/nexusrealtime` returned 404 in preflight.
  look further: Decide whether README should distinguish npm import syntax from GitHub/CDN consumption status.

## Related Nodes
- source: ecosystem-root-001
- relationship: expands
- reason: Converts the original preflight-first rule into a cross-repo review-stability finding.

## Next Search Branches
- branch: sibling-branch-reconciliation
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`
- question: Which DSK first-wave local proof artifacts are intended for commit, and do they still pass after rebasing or merging latest `origin/0.0.2`?
- branch: public-consumption-wording
- files or folders: `README.md`, `package.json`, public GitHub/raw/jsDelivr/npm endpoints
- question: Should public import examples distinguish package-name usage from unavailable npm registry metadata?

## Not Claimed
- This node does not prove npm publication.
- This node does not approve sibling dirty changes.
- This node does not edit canonical release claims.
