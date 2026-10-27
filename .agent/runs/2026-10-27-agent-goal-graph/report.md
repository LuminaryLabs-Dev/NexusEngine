# Agent graph and optional goal-loop delivery

Goal: implement the approved reusable Agent graph/goal contracts and optional model-neutral traversal, validate, then publish the scoped change to main. Run: 2026-10-27-agent-goal-graph.

Route: inspect -> preserve dirty checkout -> isolated candidate from fetched main -> implement all code/exports/docs and extend existing suites -> generate metadata -> validate/repair -> review scoped diff -> commit/push/read back.

Base: 6d2727a6f26b93f0f2ce413da676e4693a550199. The primary NexusEngine checkout remains at its existing HEAD with unrelated Authoring work. No reset, stash, merge, staging or file edits were performed there. Cloud and its persistent projects, evidence, configuration and rollback were not accessed or modified. Work is confined to the isolated candidate and this feature's external maintenance evidence directory.

Owners and changes:
- n:agent:graph / agent-graph-kit: stable typed topology; dependency-only DAG policy; bounded traversal; atomic expected-revision patches; duplicate-operation protection; validated snapshots, restore and reset. No replacement of existing task graphs.
- n:agent:goal / agent-goal-kit: one Graph-owned state store; user/inferred/dependency provenance; requirements, targets and constraints; conditional registered checks; actual evidence bindings; history and policy-gated supersession. Failed proof is retained through repairs. Async duplicate checks share a promise, and concurrent graph changes reject stale verification.
- Optional agent-goal-loop-kit: composes existing runAgentLoop with supplied observe/propose/decide/authorize/execute ports. Failed checks produce correction work; no-ready-work is blocked. Actual resulting source revision is checked before implementation is recorded. Checkpoints include graph state and selected proposal context. Interrupted source operations require explicit receipt/graph reconciliation.
- n:agent:decision: additive optional graphRef/graphRevision binding. Existing bindings and plain loops remain compatible. Existing TypeSafe runtime bridge, inference providers and Harness routing are unchanged.
- Public exports, manifest records, ownership ledger, release catalogue, test package surface and generated guide/PDF reconciled. No new repository test files were added.

Implementation completed before tests. Validation-phase hardening retained failed evidence, deduplicated concurrent verification, preserved configured graph limits and protected offered proposals from model mutation. The affected focused suites were rerun after the final changes.

Observed validation:
- npm test: PASS, 137 smoke tests. Full suite completed during validation; final affected suites separately rerun after hardening.
- npm run test:release: PASS, 34 release-candidate tests.
- Final focused Agent, loop composition/specialization/coordination/recovery/completion and inference-routing: PASS, 7 suites.
- Deterministic, synthetic LLM, synthetic classifier and mixed selection: expand -> implement -> failed check -> repair -> verified completion. Actual zero/nonzero usage accounted.
- Atomic failure, duplicate patches, cycle policy, capacity, supersession, unknown conditions, source/graph staleness, dependency invalidation, installed lifecycle, cancellation, interrupted decision, step-budget exhaustion and source-changing execution: PASS in focused suites.
- All 398 manifest-backed Kit executable contracts: PASS.
- Core boundaries, generated catalogue, ownership and public test surface: PASS.
- docs:check: PASS; generated PDF contains 229 nonblank unclipped pages.
- npm pack --dry-run: PASS, 2561 files, 25858072 unpacked bytes; all five new source modules included, no .agent/env/ledger files in package listing.
- git diff --check: PASS.

Evidence: external directory recorded in run.json contains npm-test.log, release.log, focused.log, docs-check.log, package.json and primary-preservation.json. Publication readback is recorded externally after pushing; the completion response identifies the verified remote commit.

Limits: deterministic and synthetic provider proof establishes Engine contracts, not live LLM/Jev accuracy, Cloud adoption or visual/player acceptance. No paid inference, scene demonstration or live-service activation ran. Conditional facts and verifier functions are trusted injected domain/host services; this capability does not infer that authored content works from code or model scores alone. Snapshot/graph reset does not reset external accounting. Completion confidence is high for the exercised portable contracts.
