# Knowledge Nodes: ecosystem proof scout 2026-06-18T21-40-21-0400

## Root Lesson
- id: ecosystem-proof-003
- statement: The ecosystem proof has moved from missing-public-route to public-route-runtime-failure: raw `0.0.2` artifacts exist, but the GitHub Pages proof page still does not execute.
- why it matters: Reviewers need a browser proof that reaches completed `engine.n.*` output, not just local tests or HTTP-visible files.

## Child Nodes
- id: ecosystem-proof-003-a
  parent: ecosystem-proof-003
  lesson: All three local repos now match `origin/0.0.2`.
  evidence: `git rev-list --left-right --count HEAD...origin/0.0.2` returned `0 0` in NexusRealtime, ProtoKits, and Experiments.
  look further: Re-run this check before any release or public-claim review because automation lanes are append-only and branch state can drift.
- id: ecosystem-proof-003-b
  parent: ecosystem-proof-003
  lesson: ProtoKits first-wave DSK proof artifacts are now present on raw `0.0.2`.
  evidence: Raw `docs/DSK-FIRST-WAVE-LEDGER.md` and `protokits/nexus-dsk-adapter/index.js` returned 200; `git ls-tree origin/0.0.2` lists the ledger, adapter, and `tests/dsk-first-wave.test.mjs`.
  look further: Decide the compatibility-shim removal condition for old injected-runtime calls and legacy `engine.*` APIs.
- id: ecosystem-proof-003-c
  parent: ecosystem-proof-003
  lesson: Experiments first-wave proof files are now public on raw `0.0.2`, but the GitHub Pages route is stuck at `Booting...`.
  evidence: Raw `experiments/dsk-first-wave-proof/index.html` and `src/proof.js` returned 200; Playwright snapshot showed `Booting...`.
  look further: Check whether the public proof should load CDN `0.0.2` modules instead of sibling workspace paths.
- id: ecosystem-proof-003-d
  parent: ecosystem-proof-003
  lesson: The current public proof import shape points outside the GitHub Pages site.
  evidence: Playwright console logged 404s for `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`, `.../NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`, and `.../domain-service-kits/index.js`.
  look further: Inspect `experiments/dsk-first-wave-proof/index.html` and `experiments/dsk-first-wave-proof/src/proof.js` for import-map and module import paths.
- id: ecosystem-proof-003-e
  parent: ecosystem-proof-003
  lesson: Local validation does not cover the public import-map failure.
  evidence: NexusRealtime `npm test`, ProtoKits `npm run check`, and Experiments `npm run check` passed, while the public browser route still failed to leave `Booting...`.
  look further: Add or choose an existing deployment-surface check only outside this scout lane's no-new-tests rule.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T20-40-32-0400-ecosystem-proof-node.md
- relationship: refines
- reason: The prior route/raw 404 gap is partly resolved; the current blocker is runtime module loading on the public proof route.

## Next Search Branches
- branch: public-proof-import-shape
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/src/proof.js`
- question: Should public proof modules resolve through CDN `0.0.2` URLs, same-origin deployed assets, or a build step?
- branch: compatibility-shim-exit
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/nexus-dsk-adapter/index.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/tests/dsk-first-wave.test.mjs`
- question: What condition retires old injected-runtime calls and legacy `engine.*` compatibility APIs?
- branch: stale-cdn-pins
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/README.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/docs`
- question: Which `@main` and `@0.0.1` pins are intentional legacy examples versus proof-blocking stale paths?

## Not Claimed
- This node does not fix, publish, rebase, deploy, or update public claims.
- This node does not claim the public DSK proof works; it records that HTTP-visible files still fail in the browser.
