# Knowledge Nodes: ecosystem_state_scout 2026-06-18T22-08-40-0400

## Root Lesson
- id: ecosystem-root-004
- statement: Core, ProtoKits, and Experiments are aligned on latest release branch `0.0.2`, but public consumption remains GitHub/jsDelivr-backed rather than npm-backed.
- why it matters: Branch and local DSK proof drift are under control, so the next review should focus on whether public claims match the actual public consumption paths.

## Child Nodes
- id: public-consumption-npm-gap-2026-06-18T22-08-40-0400
  parent: ecosystem-root-004
  lesson: Required GitHub/raw/jsDelivr links are reachable, while `https://registry.npmjs.org/nexusrealtime` returns 404.
  evidence: `npm run automation:preflight` and direct `curl` checks returned 200 for GitHub/raw/jsDelivr and 404 for npm metadata.
  look further: `README.md`, `package.json`, npm registry, release publishing policy.
- id: dsk-proof-local-path-2026-06-18T22-08-40-0400
  parent: ecosystem-root-004
  lesson: First-wave DSK proof passes locally but still imports local sibling checkouts rather than public URLs.
  evidence: `node tests/dsk-first-wave.test.mjs` passed; `node tests/dsk-first-wave-experiment-smoke.mjs` passed; `experiments/dsk-first-wave-proof/src/proof.js` imports local `NexusRealtime` and `NexusRealtime-ProtoKits` paths.
  look further: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/`, public CDN/raw URL variant.
- id: branch-alignment-stable-2026-06-18T22-08-40-0400
  parent: ecosystem-root-004
  lesson: The prior sibling branch drift remains resolved.
  evidence: Core `HEAD` equals `origin/0.0.2`; ProtoKits `HEAD` equals `origin/0.0.2`; Experiments `HEAD` equals `origin/0.0.2`; all three are on `0.0.2`.
  look further: repeat branch/status checks before any future public promotion review.
- id: package-version-policy-2026-06-18T22-08-40-0400
  parent: ecosystem-root-004
  lesson: Branch `0.0.2` serves package metadata reporting `nexusrealtime@0.1.0`.
  evidence: raw public `package.json` from branch `0.0.2` and local `package.json` both report version `0.1.0`.
  look further: release branch naming policy, package version policy, README release wording.
- id: domain-expansion-inventory-2026-06-18T22-08-40-0400
  parent: ecosystem-root-004
  lesson: New domain/kit expansion docs define useful DSK composition-audit targets, but they are untracked and not canonical yet.
  evidence: `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, and `examples/described-examples/` describe service graph, token, path ownership, and composition audit checks.
  look further: decide whether to canonicalize these docs or keep them as scout-only advisory material.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-18T21-06-20-0400-ecosystem-state-node.md`
- relationship: extends
- reason: Confirms that sibling branch cleanliness and local DSK proof success persisted while the npm/public-consumption issue remained open.

## Next Search Branches
- branch: public-consumption-wording
- files or folders: `README.md`, `package.json`, public GitHub/raw/jsDelivr/npm endpoint results
- question: Should public docs distinguish GitHub/jsDelivr branch consumption from unavailable npm package consumption?
- branch: public-dsk-proof
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/`, public CDN/raw URLs
- question: Can the first-wave proof be validated from public URLs without local sibling checkout imports?
- branch: package-version-policy
- files or folders: `package.json`, remote branch list, raw public `package.json`
- question: Is `0.0.2` a release branch name only, or should it match package version semantics?
- branch: dsk-composition-audit-readiness
- files or folders: `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `examples/described-examples/`, `src/domain-service-kit.js`
- question: Which domain/kit expansion docs should become canonical inputs for a future DSK composition audit?

## Not Claimed
- This node does not require or recommend source edits by itself.
- This node does not prove npm installability.
- This node does not prove browser execution of a public-URL DSK proof.
