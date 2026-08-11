# NexusEngine 0.0.5 Agent Operability Audit

This is the required human-agent pass before a model harness reviews or drafts any package. It grants no repository, matrix, branch, or publication authority.

## Result

- Master nodes: 74
- Work packages: 67
- Detailed nodes: 3343
- Atomic actions: 3268
- Structural errors: 0
- Review-only eligible packages: 67
- Direct edit-eligible packages: 7
- Active local package: master-package-n-physics-detection

## Findings

- **STRUCTURAL_INTEGRITY:** IDs, parents, package dependencies, detailed coverage, input paths, and dependency cycles passed.
- **CAPSULE_CONTEXT_REQUIRED:** The matrix is a control plane, not a complete worker prompt. Every dispatch must add a repository revision/status pin, scope, commands, prohibitions, and output schema.
- **GENERIC_ATOMIC_ACCEPTANCE:** 3227 atomic acceptance clauses use a generic evidence suffix and require package-local source and test context.
- **UNASSIGNED_DETAILED_OWNERS:** 2729 atomic nodes defer ownership to their master package; the binding step must resolve and record that owner.
- **PARALLEL_REVIEW_ONLY:** All packages may be reviewed concurrently, but repository edits and matrix transitions must remain isolated and dependency ordered.
- **ACTIVE_LOCAL_PACKAGE:** master-package-n-physics-detection has local unreconciled work and must receive a diff audit, not a clean-slate implementation proposal.

## Dispatch Rule

Every package may receive a parallel read-only review packet. Code edits remain isolated, dependency ordered, human reviewed, and outside this batch. The harness cannot update matrix status or declare proof.

Required capsule additions:

- master and detailed matrix hashes
- repository path, branch, SHA, and status hash
- one master package and its detailed child records
- dependency evidence and exclusions
- current source and test inventory for the source group
- allowed read scope and no-write authority
- forbidden mutation, integration, publication, and matrix actions
- structured review-packet schema
- time, token, and retry budgets

## Topological Waves

- Wave 0: 3 package(s)
- Wave 1: 6 package(s)
- Wave 2: 4 package(s)
- Wave 3: 6 package(s)
- Wave 4: 3 package(s)
- Wave 5: 5 package(s)
- Wave 6: 5 package(s)
- Wave 7: 5 package(s)
- Wave 8: 4 package(s)
- Wave 9: 6 package(s)
- Wave 10: 2 package(s)
- Wave 11: 6 package(s)
- Wave 12: 4 package(s)
- Wave 13: 2 package(s)
- Wave 14: 1 package(s)
- Wave 15: 1 package(s)
- Wave 16: 1 package(s)
- Wave 17: 1 package(s)
- Wave 18: 1 package(s)
- Wave 19: 1 package(s)

## Package Pass

| Wave | Package | Domain | State | Detailed | Dependencies | Agent action |
|---:|---|---|---|---:|---|---|
| 0 | `master-package-goal-checklist-kit-c-contract-and-ownership` | `integration` | dependency-ready | 1 | none | generate-read-only-review-packet |
| 0 | `master-package-n-physics-contracts` | `n:physics` | completed | 42 | none | summarize-existing-evidence |
| 0 | `master-package-n-render-contracts` | `n:render` | completed | 49 | none | summarize-existing-evidence |
| 1 | `master-package-goal-checklist-kit-i-implementation` | `integration` | dependency-blocked | 1 | 1 | generate-read-only-review-packet |
| 1 | `master-package-n-physics-lifecycle` | `n:physics` | completed | 42 | 1 | summarize-existing-evidence |
| 1 | `master-package-n-physics-material` | `n:physics` | completed | 42 | 1 | summarize-existing-evidence |
| 1 | `master-package-n-physics-shape` | `n:physics` | dependency-ready | 98 | 1 | generate-read-only-review-packet |
| 1 | `master-package-n-render-camera` | `n:render` | dependency-ready | 56 | 1 | generate-read-only-review-packet |
| 1 | `master-package-n-render-lifecycle` | `n:render` | completed | 42 | 1 | summarize-existing-evidence |
| 2 | `master-package-goal-checklist-kit-l-lifecycle` | `integration` | dependency-blocked | 1 | 1 | generate-read-only-review-packet |
| 2 | `master-package-n-physics-body` | `n:physics` | dependency-ready | 91 | 2 | generate-read-only-review-packet |
| 2 | `master-package-n-physics-world` | `n:physics` | completed | 49 | 2 | summarize-existing-evidence |
| 2 | `master-package-n-render-device` | `n:render` | completed | 63 | 2 | summarize-existing-evidence |
| 3 | `master-package-goal-checklist-kit-p-direct-proof` | `integration` | dependency-blocked | 1 | 1 | generate-read-only-review-packet |
| 3 | `master-package-n-physics-collider` | `n:physics` | dependency-blocked | 84 | 3 | generate-read-only-review-packet |
| 3 | `master-package-n-physics-constraints` | `n:physics` | dependency-blocked | 84 | 1 | generate-read-only-review-packet |
| 3 | `master-package-n-render-resource` | `n:render` | completed | 70 | 1 | summarize-existing-evidence |
| 3 | `master-package-n-render-shader` | `n:render` | completed | 91 | 1 | summarize-existing-evidence |
| 3 | `master-package-n-render-surface` | `n:render` | dependency-ready | 63 | 1 | generate-read-only-review-packet |
| 4 | `master-package-goal-checklist-kit-g-composition-provider-proof` | `integration` | dependency-blocked | 1 | 1 | generate-read-only-review-packet |
| 4 | `master-package-n-physics-detection` | `n:physics` | active-local-unreconciled | 77 | 2 | audit-current-diff-only |
| 4 | `master-package-n-render-buffer` | `n:render` | completed | 56 | 1 | summarize-existing-evidence |
| 5 | `master-package-goal-checklist-kit-d-documentation-and-exports` | `integration` | dependency-blocked | 1 | 1 | generate-read-only-review-packet |
| 5 | `master-package-n-physics-contact` | `n:physics` | dependency-blocked | 84 | 1 | generate-read-only-review-packet |
| 5 | `master-package-n-physics-queries` | `n:physics` | dependency-blocked | 77 | 2 | generate-read-only-review-packet |
| 5 | `master-package-n-render-geometry` | `n:render` | dependency-ready | 63 | 2 | generate-read-only-review-packet |
| 5 | `master-package-n-render-texture` | `n:render` | completed | 77 | 2 | summarize-existing-evidence |
| 6 | `master-package-n-physics-solver` | `n:physics` | dependency-blocked | 91 | 4 | generate-read-only-review-packet |
| 6 | `master-package-n-physics-surfaces` | `n:physics` | dependency-blocked | 63 | 3 | generate-read-only-review-packet |
| 6 | `master-package-n-render-animation` | `n:render` | dependency-blocked | 56 | 1 | generate-read-only-review-packet |
| 6 | `master-package-n-render-material` | `n:render` | completed | 63 | 2 | summarize-existing-evidence |
| 6 | `master-package-goal-checklist-kit-r-release-integrity` | `release` | dependency-blocked | 1 | 1 | generate-read-only-review-packet |
| 7 | `master-package-n-physics-articulation` | `n:physics` | dependency-blocked | 56 | 3 | generate-read-only-review-packet |
| 7 | `master-package-n-physics-execution` | `n:physics` | dependency-blocked | 56 | 2 | generate-read-only-review-packet |
| 7 | `master-package-n-physics-integration` | `n:physics` | dependency-blocked | 49 | 5 | generate-read-only-review-packet |
| 7 | `master-package-n-render-lighting` | `n:render` | dependency-ready | 84 | 1 | generate-read-only-review-packet |
| 7 | `master-package-n-render-pipeline` | `n:render` | dependency-blocked | 112 | 4 | generate-read-only-review-packet |
| 8 | `master-package-n-physics-determinism` | `n:physics` | dependency-blocked | 56 | 3 | generate-read-only-review-packet |
| 8 | `master-package-n-render-effects` | `n:render` | dependency-blocked | 70 | 2 | generate-read-only-review-packet |
| 8 | `master-package-n-render-frame` | `n:render` | dependency-blocked | 84 | 2 | generate-read-only-review-packet |
| 8 | `master-package-n-render-scene` | `n:render` | dependency-blocked | 77 | 3 | generate-read-only-review-packet |
| 9 | `master-package-n-physics-provider` | `n:physics` | dependency-blocked | 42 | 4 | generate-read-only-review-packet |
| 9 | `master-package-n-physics-recovery` | `n:physics` | dependency-blocked | 35 | 3 | generate-read-only-review-packet |
| 9 | `master-package-n-render-bridge` | `n:render` | dependency-blocked | 70 | 3 | generate-read-only-review-packet |
| 9 | `master-package-n-render-capture` | `n:render` | dependency-blocked | 42 | 2 | generate-read-only-review-packet |
| 9 | `master-package-n-render-postprocess` | `n:render` | dependency-blocked | 77 | 2 | generate-read-only-review-packet |
| 9 | `master-package-n-render-visibility` | `n:render` | dependency-blocked | 63 | 2 | generate-read-only-review-packet |
| 10 | `master-package-n-physics-diagnostics` | `n:physics` | dependency-blocked | 56 | 3 | generate-read-only-review-packet |
| 10 | `master-package-n-render-provider` | `n:render` | dependency-blocked | 49 | 4 | generate-read-only-review-packet |
| 11 | `master-package-n-render-diagnostics` | `n:render` | dependency-blocked | 77 | 2 | generate-read-only-review-packet |
| 11 | `master-package-n-render-xr` | `n:render` | dependency-blocked | 49 | 2 | generate-read-only-review-packet |
| 11 | `master-package-nexusengine-kits-n-physics-physx` | `providers` | dependency-blocked | 35 | 2 | generate-read-only-review-packet |
| 11 | `master-package-nexusengine-kits-n-physics-rapier` | `providers` | dependency-blocked | 35 | 2 | generate-read-only-review-packet |
| 11 | `master-package-nexusengine-kits-n-physics-reference` | `providers` | dependency-blocked | 28 | 3 | generate-read-only-review-packet |
| 11 | `master-package-nexusengine-kits-n-render-webgl2` | `providers` | dependency-blocked | 49 | 3 | generate-read-only-review-packet |
| 12 | `master-package-goal-checklist-physics-domain` | `n:physics` | dependency-blocked | 4 | 3 | generate-read-only-review-packet |
| 12 | `master-package-nexusengine-kits-n-render-headless` | `providers` | dependency-blocked | 35 | 2 | generate-read-only-review-packet |
| 12 | `master-package-nexusengine-kits-n-render-openxr` | `providers` | dependency-blocked | 49 | 2 | generate-read-only-review-packet |
| 12 | `master-package-nexusengine-kits-n-render-threejs` | `providers` | dependency-blocked | 49 | 2 | generate-read-only-review-packet |
| 13 | `master-package-nexusengine-kits-n-render-android-xr` | `providers` | dependency-blocked | 35 | 1 | generate-read-only-review-packet |
| 13 | `master-package-nexusengine-kits-n-render-pcvr` | `providers` | dependency-blocked | 35 | 1 | generate-read-only-review-packet |
| 14 | `master-package-goal-checklist-render-domain` | `n:render` | dependency-blocked | 4 | 4 | generate-read-only-review-packet |
| 15 | `master-package-goal-checklist-existing-domain-integration` | `integration` | dependency-blocked | 3 | 3 | generate-read-only-review-packet |
| 16 | `master-package-goal-checklist-the-open-above` | `consumer` | dependency-blocked | 3 | 1 | generate-read-only-review-packet |
| 17 | `master-package-goal-checklist-version-freeze-and-main-continuation` | `release` | dependency-blocked | 4 | 2 | generate-read-only-review-packet |
| 18 | `master-package-goal-checklist-open-above-main-validation-loop` | `consumer` | dependency-blocked | 3 | 1 | generate-read-only-review-packet |
| 19 | `master-package-goal-final-completion-gate` | `release` | dependency-blocked | 13 | 1 | generate-read-only-review-packet |
