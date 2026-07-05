# Knowledge Nodes: Ecosystem State Scout 2026-06-18T21-06-20-0400

## Root Lesson
- id: ecosystem-root-003
- statement: NexusEngine `0.0.2` is branch-clean across core, ProtoKits, and Experiments with local DSK proofs passing, but public consumption remains GitHub/raw/jsDelivr-only until npm metadata or a non-local proof path exists.
- why it matters: The main ecosystem drift moved from sibling branch reconciliation to public import/distribution clarity.

## Child Nodes
- id: latest-release-public-links-003
  parent: ecosystem-root-003
  lesson: `npm run automation:preflight` resolves `0.0.2` as the latest release branch and required public links return `200`.
  evidence: `github-repo`, `raw-package-json`, and `jsdelivr-src-index` passed; `npm-package-metadata` returned optional `404`.
  look further: Check whether npm publication is intended before strengthening package-install claims.
- id: sibling-dsk-proof-clean-003
  parent: ecosystem-root-003
  lesson: The prior dirty/behind sibling review blocker is no longer present.
  evidence: ProtoKits and Experiments both report `## 0.0.2...origin/0.0.2`, empty porcelain status, and matching `HEAD`/`origin/0.0.2`.
  look further: Keep checking sibling branch state before using DSK proof results in public claims.
- id: local-proof-path-003
  parent: ecosystem-root-003
  lesson: DSK first-wave proof is valid locally but still coupled to sibling checkout paths.
  evidence: `experiments/dsk-first-wave-proof/src/proof.js` imports from `../../../../NexusEngine/src/index.js` and `../../../../NexusEngine-ProtoKits/...`.
  look further: Add or review a public-link proof path that consumes the same contract without local relative imports.
- id: package-version-branch-risk-003
  parent: ecosystem-root-003
  lesson: The release branch is `0.0.2`, while `package.json` and raw public package metadata say `nexusengine@0.1.0`.
  evidence: local `package.json` and raw GitHub package metadata both report version `0.1.0`.
  look further: Decide whether branch-version mismatch is intentional release policy or stale metadata.

## Related Nodes
- source: ecosystem-root-002
- relationship: partially superseded
- reason: Sibling dirty/behind state is resolved, but npm/public-consumption wording remains open.

## Next Search Branches
- branch: public-consumption-wording
- files or folders: `README.md`, `package.json`, `scripts/automation-preflight.mjs`, public npm registry endpoint
- question: Should README/package language distinguish GitHub/jsDelivr consumption from npm package availability?
- branch: non-local-dsk-proof
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/docs/DSK-FIRST-WAVE-LEDGER.md`
- question: Can the first-wave DSK proof run from public URLs or vendored release artifacts instead of local sibling paths?
- branch: package-version-policy
- files or folders: `package.json`, release branches, public raw package metadata
- question: Is `0.0.2` as branch and `0.1.0` as package version the intended release shape?

## Not Claimed
- This node does not prove npm availability.
- This node does not prove deployed browser/GitHub Pages behavior.
- This node does not change source, tests, README, package metadata, or canonical memory.
