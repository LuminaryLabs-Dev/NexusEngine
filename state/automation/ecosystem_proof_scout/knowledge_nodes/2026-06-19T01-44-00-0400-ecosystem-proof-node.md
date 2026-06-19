# Knowledge Nodes: ecosystem proof scout 2026-06-19T01-44-00-0400

## Root Lesson
- id: ecosystem-proof-006
- statement: Ecosystem proof is still local/raw green but public-browser blocked; sibling release HEADs remain aligned while sibling worktrees are dirty, and aggregate Experiments validation still omits the DSK first-wave smoke.
- why it matters: Promotion review needs separate gates for branch alignment, clean review state, local targeted proof, aggregate proof, raw file availability, public browser completion, and npm/package-version claims.

## Child Nodes
- id: ecosystem-proof-006-a
  parent: ecosystem-proof-006
  lesson: Core, ProtoKits, and Experiments still match latest release branch `origin/0.0.2`.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; all three repos returned ahead/behind `0 0` against `origin/0.0.2`.
  look further: Re-run branch checks before public promotion or release review.
- id: ecosystem-proof-006-b
  parent: ecosystem-proof-006
  lesson: Preferred local validations pass, including targeted DSK proof smokes.
  evidence: NexusRealtime `npm test`, ProtoKits `npm run check`, ProtoKits `node tests/dsk-first-wave.test.mjs`, Experiments `npm run check`, and Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` all exited 0.
  look further: Keep targeted DSK commands visible until aggregate checks include them.
- id: ecosystem-proof-006-c
  parent: ecosystem-proof-006
  lesson: The public proof route still stalls at `Booting...` for humans.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/` showed heading text plus `Booting...`, with console/request 404s for NexusRealtime and ProtoKits module paths.
  look further: Do not treat route HTTP 200 as a working browser proof.
- id: ecosystem-proof-006-d
  parent: ecosystem-proof-006
  lesson: The public proof import shape still points to sibling GitHub Pages paths that are not deployed.
  evidence: Direct curls and Playwright requests returned 404 for `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`, `.../NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`, and `.../domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map.
- id: ecosystem-proof-006-e
  parent: ecosystem-proof-006
  lesson: DSK first-wave proof coverage is still not part of the Experiments aggregate check.
  evidence: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/package.json` `check` script does not list `tests/dsk-first-wave-experiment-smoke.mjs`; the targeted command passed separately.
  look further: Add the DSK proof smoke to aggregate validation or document the targeted command as required evidence.
- id: ecosystem-proof-006-f
  parent: ecosystem-proof-006
  lesson: ProtoKits and Experiments release HEADs are aligned, but both sibling worktrees have local modified/untracked work.
  evidence: ProtoKits status showed modified `memory.md`, `package.json`, high-fidelity meadow files, and untracked path-meadow files; Experiments status showed modified high-fidelity meadow files and `memory.md`, plus untracked visual/path-meadow files.
  look further: Classify sibling dirt before release-review claims.
- id: ecosystem-proof-006-g
  parent: ecosystem-proof-006
  lesson: Idea coverage remains broader than executable proof coverage and now includes promotion policy gaps.
  evidence: Idea docs cover world-space, boundary, object-inspection, mobility, replicated state, proof coverage, accepted mutation, time, and config policy, while browser proof still covers only first-wave DSK service APIs and does not complete publicly.
  look further: Build a proof coverage matrix only after first-wave public loading works.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T23-39-46-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Confirms the same public route failure and aggregate DSK validation gap after fresh preflight, validation, curl, and Playwright checks, while adding current sibling worktree dirt.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T01-11-04-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Branch alignment and local validation remain separate from sibling dirt, npm metadata, package-version policy, and public browser proof.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T01-24-20-0400-dsk-architecture-node.md
- relationship: constrains
- reason: DSK production hardening remains broader than the public proof route loading fix.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T00-54-03-0400-deep-bug-node.md
- relationship: constrains
- reason: Runtime reset, accepted-mutation, time, and config bugs are promotion blockers outside the browser import-map issue.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T01-00-48-0400-domain-kit-idea-node.md
- relationship: expands
- reason: New policy ideas should stay advisory until executable proof coverage catches up.

## Next Search Branches
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/src/proof.js`
  question: Should public proof modules resolve through CDN `0.0.2` URLs, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or a documented targeted command?
- branch: sibling-worktree-dirt
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`
  question: Is current sibling dirt unrelated local work, review-relevant proof work, or a blocker for ecosystem promotion claims?
- branch: compatibility-shim-exit
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/nexus-dsk-adapter/index.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/tests/dsk-first-wave.test.mjs`
  question: What condition retires old injected-runtime calls and legacy `engine.*` compatibility APIs?
- branch: idea-proof-coverage-matrix
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime/docs/described_examples.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime/docs/domain_ideas.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime/docs/kits_ideas.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments`
  question: Which idea domains should get the next executable proof path after first-wave DSK public loading works?

## Not Claimed
- This node does not fix, publish, rebase, deploy, or update public claims.
- This node does not claim the public DSK proof works; it records that HTTP-visible files still fail in the browser.
- This node does not claim Experiments aggregate validation currently covers DSK first-wave proof.
- This node does not claim sibling worktrees are clean or release-review ready.
