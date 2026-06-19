# Knowledge Nodes: ecosystem proof scout 2026-06-18T23-39-46-0400

## Root Lesson
- id: ecosystem-proof-005
- statement: Ecosystem proof remains local/raw green but public-browser blocked; additionally, the Experiments aggregate check passes without listing the DSK first-wave smoke, so DSK proof coverage now needs an explicit targeted command or aggregate wiring.
- why it matters: Reviewers need browser-complete `engine.n.*` output and a clear validation command path, not only HTTP 200, raw files, local sibling imports, or unrelated aggregate checks.

## Child Nodes
- id: ecosystem-proof-005-a
  parent: ecosystem-proof-005
  lesson: Core, ProtoKits, and Experiments still match latest release branch `origin/0.0.2`.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; all three repos returned ahead/behind `0 0` against `origin/0.0.2`.
  look further: Re-run branch checks before any public promotion or release review.
- id: ecosystem-proof-005-b
  parent: ecosystem-proof-005
  lesson: Preferred local validations pass, including targeted DSK proof smokes.
  evidence: NexusRealtime `npm test`, ProtoKits `npm run check`, Experiments `npm run check`, ProtoKits `node tests/dsk-first-wave.test.mjs`, and Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` all exited 0.
  look further: Keep targeted DSK commands visible until aggregate checks include them.
- id: ecosystem-proof-005-c
  parent: ecosystem-proof-005
  lesson: The public proof route still stalls at `Booting...` for humans.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/` showed page heading plus `Booting...`, with console 404s for NexusRealtime and ProtoKits module paths.
  look further: Do not treat route HTTP 200 as a working browser proof.
- id: ecosystem-proof-005-d
  parent: ecosystem-proof-005
  lesson: The public proof import shape still points to sibling GitHub Pages paths that are not deployed.
  evidence: Direct curls returned 404 for `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`, `.../NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`, and `.../domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map.
- id: ecosystem-proof-005-e
  parent: ecosystem-proof-005
  lesson: DSK first-wave proof coverage is no longer evident from the Experiments aggregate check output.
  evidence: `npm run check` in Experiments passed but did not list `tests/dsk-first-wave-experiment-smoke.mjs`; the targeted command passed separately.
  look further: Add the DSK proof smoke to aggregate validation or document the targeted command as required evidence.
- id: ecosystem-proof-005-f
  parent: ecosystem-proof-005
  lesson: Idea coverage remains broader than executable proof coverage.
  evidence: Described/domain/kit idea files include governance, proof, world-space, boundary, object-inspection, mobility, and state ideas, while public proof covers only first-wave DSK service APIs.
  look further: Build a proof coverage matrix after the first-wave public route reaches completed output.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T22-40-48-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Confirms the same public-route runtime failure after fresh branch checks, validation, curl, and Playwright, and adds the aggregate-validation coverage gap.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-18T23-08-42-0400-ecosystem-state-node.md
- relationship: confirms
- reason: Branch alignment, npm metadata 404, and public proof browser failure remain current.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T23-23-35-0400-dsk-architecture-node.md
- relationship: constrains
- reason: DSK production hardening remains separate from public proof-route loading.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-18T23-01-44-0400-domain-kit-idea-node.md
- relationship: constrains
- reason: Idea expansion should remain governance/proof-surface oriented until executable proof coverage catches up.

## Next Search Branches
- branch: public-proof-import-shape
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/src/proof.js`
- question: Should public proof modules resolve through CDN `0.0.2` URLs, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
- question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or a documented targeted command?
- branch: compatibility-shim-exit
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/nexus-dsk-adapter/index.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/tests/dsk-first-wave.test.mjs`
- question: What condition retires old injected-runtime calls and legacy `engine.*` compatibility APIs?
- branch: idea-proof-coverage-matrix
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime/docs/described_examples.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime/docs/domain_ideas.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime/docs/kits_ideas.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments`
- question: Which idea domains should get the next executable proof path after first-wave DSK public loading works?

## Not Claimed
- This node does not fix, publish, rebase, deploy, or update public claims.
- This node does not claim the public DSK proof works; it records that HTTP-visible files still fail in the browser.
- This node does not claim Experiments aggregate validation currently covers DSK first-wave proof.
