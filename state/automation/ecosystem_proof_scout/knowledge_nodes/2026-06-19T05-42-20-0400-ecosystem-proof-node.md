# Knowledge Nodes: ecosystem proof scout 2026-06-19T05-42-20-0400

## Root Lesson
- id: ecosystem-proof-007
- statement: Ecosystem proof is still local-targeted green and public-browser blocked, but fetched sibling release refs have advanced beyond the available local checkouts.
- why it matters: Promotion review now needs separate gates for core release alignment, sibling local checkout freshness, sibling latest-ref validation, targeted DSK proof, aggregate proof, raw file availability, public browser completion, and npm/package-version claims.

## Child Nodes
- id: ecosystem-proof-007-a
  parent: ecosystem-proof-007
  lesson: Core still matches latest release branch `origin/0.0.2`.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0` with ahead/behind `0 0`.
  look further: Re-run preflight before any public promotion or release review.
- id: ecosystem-proof-007-b
  parent: ecosystem-proof-007
  lesson: ProtoKits and Experiments local checkouts are behind fetched `origin/0.0.2`.
  evidence: ProtoKits local `8c1c933e5dc21cab0579dc3ae806341413f18b00` is behind `40d70b93bef6a0e88dadc48067aa4fd2844284f8` by 22 commits; Experiments local `b4d48101ec599ae9ca2998734040874f377c8108` is behind `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f` by 33 commits.
  look further: Fast-forward or use a separate clean latest-ref validation surface before claiming latest sibling release validation.
- id: ecosystem-proof-007-c
  parent: ecosystem-proof-007
  lesson: Available-checkout local validations pass, including targeted DSK proof smokes.
  evidence: Core `npm test`, ProtoKits `npm run check`, ProtoKits `node tests/dsk-first-wave.test.mjs`, Experiments `npm run check`, and Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` exited 0.
  look further: Keep these as available-checkout evidence until sibling latest refs are validated.
- id: ecosystem-proof-007-d
  parent: ecosystem-proof-007
  lesson: The public proof route still stalls at `Booting...` for humans.
  evidence: Playwright snapshot for `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` showed heading text plus `Booting...`, with console/request 404s for NexusEngine and ProtoKits module paths.
  look further: Do not treat route HTTP 200 as a working browser proof.
- id: ecosystem-proof-007-e
  parent: ecosystem-proof-007
  lesson: Fetched Experiments `origin/0.0.2` still points the DSK proof route at sibling GitHub Pages paths that are not deployed.
  evidence: `git show origin/0.0.2:experiments/dsk-first-wave-proof/index.html` maps `nexusengine` to `../../../NexusEngine/src/index.js`; `src/proof.js` imports sibling `NexusEngine` and `NexusEngine-ProtoKits` paths; direct curl and Playwright returned 404 for those Pages module URLs.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map.
- id: ecosystem-proof-007-f
  parent: ecosystem-proof-007
  lesson: Fetched Experiments aggregate validation still omits the DSK first-wave smoke.
  evidence: `git show origin/0.0.2:package.json` adds flat-route, high-fidelity meadow, and fluid-water checks, but does not list `tests/dsk-first-wave-experiment-smoke.mjs`; the targeted command passed separately on the available checkout.
  look further: Add the DSK proof smoke to aggregate validation or document the targeted command as required evidence.
- id: ecosystem-proof-007-g
  parent: ecosystem-proof-007
  lesson: Fetched ProtoKits `origin/0.0.2` has expanded fluid/water/domain surfaces, but first-wave DSK ledger and aliases remain present.
  evidence: `git diff HEAD..origin/0.0.2` shows new fluid/water kits and domain-service exports; raw `docs/DSK-FIRST-WAVE-LEDGER.md` still lists seven first-wave promoted candidates, and `origin/0.0.2:protokits/domain-service-kits/index.js` still exports `createNCompletionLedgerKit`.
  look further: Build proof coverage rows for new fluid/water/domain surfaces only after latest-ref validation and first-wave public loading are resolved.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T01-44-00-0400-ecosystem-proof-node.md
- relationship: supersedes
- reason: Confirms the same public route failure and aggregate DSK validation gap after fresh preflight, fetch, validation, curl, and Playwright checks, while replacing sibling-clean/aligned state with behind-local-checkout evidence.
- source: state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T01-11-04-0400-ecosystem-state-node.md
- relationship: updates
- reason: Branch alignment remains true for core, but sibling release refs advanced since the older state packet.
- source: state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T02-24-48-0400-dsk-architecture-node.md
- relationship: constrains
- reason: DSK production hardening remains broader than the public proof route loading fix.
- source: state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T01-53-53-0400-deep-bug-node.md
- relationship: constrains
- reason: Runtime operations data bugs remain promotion blockers outside browser import-map state.
- source: state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T02-02-08-0400-domain-kit-idea-node.md
- relationship: expands
- reason: New operations data integrity ideas should stay advisory until executable proof coverage catches up.

## Next Search Branches
- branch: sibling-latest-ref-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, fetched `origin/0.0.2`
  question: Can the sibling checkouts be fast-forwarded or separately validated at latest release refs without disturbing local work?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`
  question: Should public proof modules resolve through CDN `0.0.2` URLs, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or a documented targeted command?
- branch: expanded-protokits-proof-coverage
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine/docs/described_examples.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine/docs/domain_ideas.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine/docs/kits_ideas.md`
  question: Which new fluid/water/domain surfaces have executable proof rows versus planning or export-only coverage?
- branch: compatibility-shim-exit
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits/nexus-dsk-adapter/index.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/tests/dsk-first-wave.test.mjs`
  question: What condition retires old injected-runtime calls and legacy `engine.*` compatibility APIs?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim the public DSK proof works; it records that HTTP-visible files still fail in the browser.
- This node does not claim latest sibling release refs were locally validated.
- This node does not claim Experiments aggregate validation currently covers DSK first-wave proof.
