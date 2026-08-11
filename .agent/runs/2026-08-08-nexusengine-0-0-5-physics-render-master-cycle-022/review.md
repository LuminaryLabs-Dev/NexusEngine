# Render Surface Source Review

## Accepted Ownership

`n:render:surface` owns portable output-surface identities and descriptors,
surface format selection, logical viewport and scissor state, and requested
resize/fullscreen transitions. Concrete windows, DOM elements, native handles,
GPU swapchains, presentation, frame submission, and provider execution remain
outside Core.

## Initial Findings

| Finding | Required disposition |
| --- | --- |
| One generic `config` object represents all nine Kits | Replace with strict per-Kit schemas and invariants. |
| One aggregate export claims all Kit execution surfaces | Add one atomic Kit source and manifest per planned Kit. |
| Generic records can duplicate semantic ownership | Give each Kit one bounded record/state contract. |
| Snapshot validation accepts extra and incoherent fields | Reuse strict Domain Kit snapshots and validate Kit identity and record semantics. |
| Surface manifest requires Resource without package-DAG evidence | Keep only requirements justified by portable Surface semantics. |
| Candidate proof status is implicit | Mark all new source and manifests explicitly pending. |
| Provider and host work could leak through broad configuration | Reject handles, functions, nonportable values, and backend execution fields. |

## Deferred Proof

No feature test is authorized in this cycle. Direct behavior, exact-once
commands, conflict-before-mutation, reset, snapshot/load, provider
composition, generated exports, packaging, MCP discovery, and consumer use
remain pending until source freeze.

## Final Source Disposition

- `render-surface-kit` alone owns `n:render:surface` and canonical dimensions.
- Window, Offscreen, Swapchain, Viewport, Scissor, Resize, Fullscreen, and Format
  remain independently installable records with one responsibility each.
- Parent and leaf records are validated through installed public capabilities;
  no private sibling source is imported.
- Referenced parent records cannot be removed or changed incompatibly.
- Coordinated kind or format changes use explicit dependent teardown, parent
  mutation, and dependent redefinition. No hidden cross-registry transaction
  abstraction was added.
- Receipt replay starts from exact configured baseline records and proves every
  post-baseline operation, including request hashes and no-op results.
- Generic `applyCommand`, `configure`, `update`, `setDescriptor`, and `emit`
  methods are not callable through the public Surface APIs.
- Concrete host surfaces, GPU objects, provider actions, and frame execution are
  still outside Core.

Two independent read-only reviews found no remaining P0/P1 source-level blocker
after the repairs. The package is eligible only for `integrated-unproven` state;
all behavioral and release proof remains deferred.
