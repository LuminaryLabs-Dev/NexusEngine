# Authoring implementation and validation

Goal: make every declared Authoring child and kit usable through real Engine
commands, a default external host and verified output. Active run:
`2026-09-06-authoring-completion`. The user-authorized finite harness replaces
the unavailable persistent controller for this task; unrelated global target
and tracker files remain intact.

Route: read → capture-before → plan → validate → submit → observe → verify →
capture-after → observed-differences. `authoring-lifecycle-complete-1` passed all
nine stages with six focused tests and source hashes. Physics Constraints used
its own nine-test attempt. Failed reconstruction/baseline attempts are retained.

Owner: `n:authoring`, 19 public kits and 18 children. Project owns editable source,
revisions, transactions, receipts and history. Child source operations register
with Project; child lifecycle reset/snapshot covers disposable service state.
Runtime owns Sequence execution. Object/Asset/Presentation/Composition retain
their existing authority. Editor owns the real host, files, workers, Canvas UI,
Three rendering and GLB/PNG encoding. Four concrete WebGPU providers moved to Kits.

Actual checks: 122 Engine smoke/contract tests; 34 release-candidate tests including
real Rust compilation, QuickJS-NG compilation/execution, OpenXR source compilation
and browser web targets; active docs, manifest parity, ownership, public export,
generated catalog and 221-page PDF checks. Editor headless, nine Authoring groups,
legacy intent/build/Playwright suite and Kits full registry/provider checks pass.
A clean packed consumer installs all three candidates, imports every public
Authoring factory, runs the guide example, saves/reopens, exports a textured GLB
and renders it with actual Chromium. Logs and package hashes are in closure/.

Observed changes: source editing now spans mesh/curve/modeling, UV/material/paint,
rig/skin/animation, workspace/selection, assemblies/scatter, domain composition,
finite sequences and delivery packets. 17 source kinds and 74 typed operations
are discoverable. Malformed/stale mutations preserve state; retries, history,
checkpoint recovery, worker cancellation and stale-result rejection are proved.
Source sharing and content-addressed history remove the prior persistence copy
explosion. Fifteen measured 10k/100k mesh and 1K/2K/4K image runs complete.

Limits: declared profiles are not Blender parity, a physics solver, FBX support,
a distributed asset service, arbitrary scene collision proof or production
throughput at hundreds of thousands of scenes. Heavy 100k/4K operations take
seconds. Authoring docs state algorithm-specific restrictions. The Editor
records independent rendered and deformation evidence separately from numerical
validity; the skinned hierarchy warning remains visible in validator reports.

Delivery: this Engine commit must exist before Kits and Editor can pin it.
Their final exact pins, packed-consumer rerun and fast-forward remote verification
follow in A → B → C order under the user's push-to-main authorization. No tags,
Actions, releases, npm publication or site deployment are part of this task.
