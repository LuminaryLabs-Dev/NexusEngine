# Knowledge Nodes: dsk_architecture_scout 2026-06-19T14-24-17-0400

## Root Lesson
- id: dsk-runtime-failure-boundary-root-2026-06-19-1424
- statement: DSK remains release-aligned and test-green, but the executable hardening fixture handoff must now include runtime failure-boundary rows: namespace reserved keys, failed-install rollback and retryability, dependency-policy parity, and scheduler failed-tick event lifetime.
- why it matters: Current smoke tests prove the happy-path DSK surface, not production safety. Fresh live source and probe evidence shows a DSK API can hide on the `engine.n` prototype, a failed late install can be recorded as installed, direct install can bypass declared runtime requirements, and failed-frame events can publish during the next successful tick.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-19-1424
  parent: dsk-runtime-failure-boundary-root-2026-06-19-1424
  lesson: Core still matches the latest release branch, so the failure-boundary conclusion is not caused by branch drift.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat old packet commit hashes as context only.
- id: dsk-namespace-reserved-key-gap-2026-06-19-1424
  parent: dsk-runtime-failure-boundary-root-2026-06-19-1424
  lesson: `engine.n` needs reserved-key rejection, null-prototype policy, and own-property API assertions before broad DSK promotion.
  evidence: `src/domain-service-kit.js:146-160` creates a normal-object namespace and assigns `engine.n[apiName]`; `src/domain-service-kit.js:175-177` accepts JS identifier-shaped names including `__proto__`; probe produced no own `__proto__` key while `engine.n.marker` resolved through the prototype.
  look further: Add fixtures for `__proto__`, `constructor`, `prototype`, inherited keys, null-prototype behavior, and own-property service lookup.
- id: dsk-install-rollback-retry-gap-2026-06-19-1424
  parent: dsk-runtime-failure-boundary-root-2026-06-19-1424
  lesson: DSK installs need mutation staging, rollback, or preflight so failed late hooks do not become false installed state.
  evidence: `src/runtime-kit.js:135-157` records metadata/bindings/kit identity before later mutations; `src/runtime-kit.js:214-215` calls late `kit.install()`; probe left `n-late-collision-kit` in `engine.kits` and `engine.domainServiceKits`, then same-object reinstall returned success while the API remained old.
  look further: Add rollback fixtures for API collision, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, sequence node runtime throw, and install hook throw.
- id: dsk-dependency-policy-parity-gap-2026-06-19-1424
  parent: dsk-runtime-failure-boundary-root-2026-06-19-1424
  lesson: Direct install and composer install need one dependency policy before local direct-install proof can stand in for composed proof.
  evidence: `src/runtime-kit.js:142-145` filters direct missing requirements to `n:` tokens; `src/game-kit-composer.js:49-76` resolves all `requires`; probe installed a DSK requiring `runtime:missing` and exposed `engine.n.needsRuntime.ready`.
  look further: Decide whether direct install rejects every missing token or intentionally diverges with explicit diagnostics and tests.
- id: dsk-scheduler-failure-lifetime-gap-2026-06-19-1424
  parent: dsk-runtime-failure-boundary-root-2026-06-19-1424
  lesson: Failed-tick clock, event, journal, lifecycle, and surface publication semantics must be explicit before event surfaces are proof evidence.
  evidence: `src/engine.js:168-214` advances clock before `scheduler.run()` and has no failure cleanup; `src/ecs.js:251-269` queues events immediately; `src/ecs.js:344-370` drains and clears only after all phases finish; probe published failed-frame and recovery-frame events together on the second tick.
  look further: Add fixtures for throw-before-emit, throw-after-emit, clock rollback/commit, event clearing, journal clearing, lifecycle diagnostics, and SequenceNode bridge inputs.
- id: dsk-prior-hardening-rows-carried-2026-06-19-1424
  parent: dsk-runtime-failure-boundary-root-2026-06-19-1424
  lesson: Runtime failure-boundary rows extend, not replace, prior traversal, lifecycle/config, source-state, state-signal, receipt, bridge, wrapper, operations, and spatial hardening rows.
  evidence: DSK nodes `2026-06-19T13-24-43-0400`, `2026-06-19T12-23-47-0400`, and `2026-06-19T11-23-07-0400` remain unresolved; current source/test reads did not add coverage for those rows.
  look further: Bundle the smallest base DSK/runtime fixture set first, then add representative rows from each carried category.
- id: dsk-proof-boundary-separation-2026-06-19-1424
  parent: dsk-runtime-failure-boundary-root-2026-06-19-1424
  lesson: Runtime failure-boundary proof remains separate from sibling latest-ref proof, module-source strategy, public browser proof, aggregate proof, npm availability, and package-version policy.
  evidence: Ecosystem state node `2026-06-19T14-10-45-0400` and ecosystem proof node `2026-06-19T13-40-31-0400` report module-source blockers while core remains current and test-green.
  look further: Keep runtime fixtures, sibling fetched-ref validation, public module loading, aggregate checks, and distribution wording as separate evidence branches.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T13-24-43-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves traversal proof integrity handoff while adding runtime failure-boundary rows from fresher neighboring lanes and live probes.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T13-53-17-0400-deep-bug-node.md`
- relationship: confirms
- reason: Confirms DSK namespace/install/dependency and scheduler failed-tick bugs are fixture inputs.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T14-00-58-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts runtime failure-boundary bugs into advisory planning rows until executable coverage exists.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T14-10-45-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Separates runtime hardening from module-source, fetched-ref, public browser, aggregate, npm, and package-version proof.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T13-40-31-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Confirms local checkout proof is not fetched-ref, aggregate, targeted DSK, browser-complete, npm, or hardening proof.

## Next Search Branches
- branch: runtime-failure-boundary-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, and failed-tick event lifetime?
- branch: DSK hardening fixture implementation
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`
  question: Which namespace/install/dependency/reset/snapshot rows should be promoted from scout evidence into failing tests first?
- branch: carried promotion rows
  files or folders: selected traversal, lifecycle/config, source-state, state-signal, receipt, bridge, wrapper, operations, and spatial kits
  question: Which representative rows should join the first fixture pass without turning it into an unbounded audit?
- branch: proof-boundary separation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, public raw/CDN/GitHub Pages URLs
  question: Which evidence belongs to core runtime hardening versus sibling latest-ref validation, public browser proof, aggregate proof, and distribution proof?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, or prove browser-complete public DSK proof.
