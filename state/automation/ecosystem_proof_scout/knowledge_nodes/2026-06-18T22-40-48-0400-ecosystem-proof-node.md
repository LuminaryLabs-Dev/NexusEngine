# Knowledge Nodes: ecosystem proof scout 2026-06-18T22-40-48-0400

## Root Lesson
- id: ecosystem-proof-004
- statement: The ecosystem proof remains public-route-runtime-failure: local validation and raw `0.0.2` artifacts pass, but the GitHub Pages proof page still cannot load its runtime modules.
- why it matters: The reviewable proof state cannot claim public browser success until the page reaches completed `engine.n.*` output, not just HTTP 200 and local smoke tests.

## Child Nodes
- id: ecosystem-proof-004-a
  parent: ecosystem-proof-004
  lesson: Core, ProtoKits, and Experiments all still match latest release branch `origin/0.0.2`.
  evidence: `git rev-list --left-right --count HEAD...origin/0.0.2` returned `0 0` in all three repos after `git fetch --prune origin`.
  look further: Re-run branch checks before promotion review because NexusEngine already has unrelated automation/docs worktree changes.
- id: ecosystem-proof-004-b
  parent: ecosystem-proof-004
  lesson: Preferred local validations are green.
  evidence: `npm run automation:preflight`, NexusEngine `npm test`, ProtoKits `npm run check`, and Experiments `npm run check` all exited 0.
  look further: Keep public route validation separate from local check success.
- id: ecosystem-proof-004-c
  parent: ecosystem-proof-004
  lesson: The public proof route still stalls at `Booting...` in a browser.
  evidence: Playwright CLI snapshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed heading text plus `Booting...`.
  look further: Do not treat route HTTP 200 as a working proof.
- id: ecosystem-proof-004-d
  parent: ecosystem-proof-004
  lesson: The public proof import shape still points to sibling GitHub Pages repos that are not deployed at those paths.
  evidence: Playwright requests and direct curls returned 404 for `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`, `.../NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `.../domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step mapping.
- id: ecosystem-proof-004-e
  parent: ecosystem-proof-004
  lesson: Idea coverage is broader than proof coverage.
  evidence: Described examples and idea docs list large DSK domains, but this run only found public route proof for first-wave DSK APIs and no exact proof-path match for `world-space`, `boundary`, `object-inspection`, `mobility`, or `replicated-state` domains.
  look further: Build a coverage matrix after the public DSK proof route is fixed.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T21-40-21-0400-ecosystem-proof-node.md
- relationship: confirms
- reason: The prior public-route-runtime-failure remains current after fresh fetch, validation, curl, and Playwright checks.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T22-23-28-0400-dsk-architecture-node.md
- relationship: constrains
- reason: DSK production hardening issues remain separate from this proof-route blocker.

## Next Search Branches
- branch: public-proof-import-shape
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`
- question: Should public proof modules resolve through CDN `0.0.2` URLs, same-origin deployed assets, or a build step?
- branch: compatibility-shim-exit
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits/nexus-dsk-adapter/index.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/tests/dsk-first-wave.test.mjs`
- question: What condition retires old injected-runtime calls and legacy `engine.*` compatibility APIs?
- branch: idea-proof-coverage-matrix
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine/docs/described_examples.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine/docs/domain_ideas.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine/docs/kits_ideas.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments`
- question: Which idea domains should get the next executable proof path after first-wave DSK public loading works?

## Not Claimed
- This node does not fix, publish, rebase, deploy, or update public claims.
- This node does not claim the public DSK proof works; it records that HTTP-visible files still fail in the browser.
