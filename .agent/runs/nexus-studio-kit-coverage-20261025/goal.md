# Studio Kit Coverage Goal

Make all 390 Kits in the Engine revision pinned by NexusEngine-Studio available through purpose-appropriate Studio GUI workflows backed by public NexusEngine APIs. Put reusable behavior, validation, persistence, runtime, dependency planning, and target-aware export in NexusEngine. Preserve the existing Studio project format, browser/native host boundary, empty-project workflow, and all unrelated repository work.

## Acceptance

- Reconcile every Kit ID from the pinned Engine manifest with a real Studio GUI path and Engine API contract.
- Keep the manifest as the only Domain/Kit catalog source; keep any Studio mapping limited to GUI/API bindings and evidence.
- Add missing reusable behavior within the Engine-owned Domain/Kit boundary.
- Preserve old project readability and stable asset/reference identity.
- Validate browser Studio, actual packaged native Studio, save/reopen, Play/Stop, and independent game export for applicable targets.
- Do not publish or push without separate authorization.

## State

In progress. The initial source inspection found a broad gap between manifest visibility and executable Studio integration. See `baseline.md` and `bootstrap.md` for verified state and source limitations.
