# Kit-to-Core Upgrade — Main-only execution contract

## Purpose
Expand **existing** NexusEngine Core Domains with general reusable behavior discovered in NexusEngine-Kits. This is an implementation workflow, not a request to create every folder from a conceptual tree.

## Source of truth
- Current Core manifests under `src/core-domains/`, their public APIs, and the generated ownership ledger.
- `kit-core-reconciliation.json` is a source-registry **metadata** inventory (153 records; 23 official, 27 candidate, 8 scaffolded, 95 migration placeholders).
- Each inventory row proposes possible owners, **not** a verified function-by-function correspondence or a promotion decision.
- Source Registry blob pinned in that JSON must be refreshed and reconciled if it changes.

## Ownership decisions
For each external Kit, examine actual source before deciding:
1. **Reuse:** Existing Core Kit already provides the needed behavior; make the external Kit a thin composition.
2. **Extend:** Add genuinely missing configurable behavior inside the already-owning Core Subdomain.
3. **Add:** Create a new Subdomain *only* when no existing Subdomain can coherently own a distinct state/execution responsibility.
4. **Provider:** Keep executable SDK/driver/back-end code in NexusEngine-Kits; Core retains portable contracts and orchestration.
5. **Retire:** No real behavior, obsolete candidate, or fully superseded implementation; defer deletion until consumers and evidence are reconciled.
6. **Defer:** Ownership or equivalence is not yet proven; preserve implementation unchanged.

Do not infer implementation from a record name. Generic growth is not automatically a new Agriculture Domain; fluid forces are not a new Swimming Domain. Avoid a new top-level Core Domain for any mapped capability in this inventory without separate architectural evidence.

## Universal ownership boundaries
- Runtime schedules and commits operations; Simulation performs model processes.
- Object owns generic object identity/relationships; Actor owns control and actor semantics.
- World owns environmental organization; Spatial owns coordinate, relationship, and query semantics.
- Physics owns physical states and responses; Spatial holds accepted spatial projections.
- Presentation owns intended visual/audio meaning; Render owns provider-neutral frame execution.
- Policy evaluates constraints/permissions; Simulation performs modeled transitions.
- Authoring changes source definitions; runtime Domains own instantiated state.
- Host/Network/Asset/Compute/Render can define portable provider contracts; concrete provider execution stays in external Kits.
- Build-time `n:build` stays isolated from the runtime graph.

## Targeted promotion cycle
1. Inspect exact `main` SHA of Core and exact source SHA of the external Kit.
2. Identify each owned state, command, event, snapshot, and executable behavior; compare to current Core public capabilities.
3. Record the disposition (reuse / extend / add / provider / retire / defer), canonical owner, affected consumers, and alternatives rejected.
4. Change only the owning Core Kit(s), their required public APIs/manifests, and the directly affected tests.
5. Validate normal and invalid behavior, deterministic ordering, snapshot/reset, rollback where relevant, and composition through public imports.
6. Generate catalogs/docs from source manifests. **Do not hand-edit generated artifacts or `.agent/tracker.md`.**
7. Make a validated non-force commit on existing Core `main`. Keep package version and full 0.0.5 release readiness unchanged until their separate gates pass.
8. After authorization for each external repository, migrate and verify the consumer; only then deprecate duplicated code.

## Priority
Start with provenance and direct Core overlap for official Interaction, Spatial, and Progression Kits. Then production, procedural placement, camera/feedback, and Physics integration. Only investigate the 95 migration placeholders when actual source is available.

## Completion and reporting
Each targeted change reports: current SHA, changed owner and files, behavior added or reused, tests executed and outcomes, known failures and risk, consumer migration state, and pushed commit. A metadata mapping is **not** a completed promotion. Never equate this program's finish with the bounded 0.0.5 Physics/Render release.

## Scope of first commit
This pass introduces the traceable registry inventory and migration rules. It does not claim that Core already absorbed the 153 Kits or that the 21 Domains are feature-complete.
