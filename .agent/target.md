# Development Target

## Goal

Deliver a production-ready `0.0.5` candidate on `main` with canonical `n:physics`
and `n:render` Core domains, evidence-backed atomic Kits and providers,
deterministic physics, real frame rendering, clean public composition, and The
Open Above proving visible physics-driven gameplay from a committed install.

The frozen `0.0.4` ref must remain unchanged. The approved release commit must
be published as immutable `origin/0.0.5`; `main` then remains the mutable
default line for progress toward `0.0.6`.

The repository-local control planes are:

- Version packet: `.agent/versions/0.0.5/README.md`
- Master execution matrix: `.agent/versions/0.0.5/master-matrix.jsonl`
- Detailed evidence matrix: `.agent/versions/0.0.5/feature-matrix.jsonl`
- Detailed checklist: `.agent/versions/0.0.5/checklist.md`
- Current readiness: `.agent/versions/0.0.5/readiness.json`

## Required Outcomes

- Validate both matrices before execution and select exactly one
  dependency-ready master package per cycle. Reconcile every referenced
  detailed node independently; never promote a node from a plan, manifest, or
  aggregate count alone.
- Establish canonical `n:physics` ownership for bodies, colliders, detection,
  queries, constraints, deterministic stepping, recovery, snapshots, reset,
  replay, and provider contracts.
- Establish canonical `n:render` ownership for devices, resources, shaders,
  materials, pipelines, frames, descriptor bridges, provider selection, and
  diagnostics.
- Keep concrete runtime providers in NexusEngine-Kits; keep project-specific
  behavior out of Core; preserve atomic, idempotent, deterministic boundaries.
- Prove direct APIs, installed composition, duplicate installation, reset,
  snapshot/load, deterministic replay, conflict-before-mutation, and rollback.
- Prove headless and browser providers, real physics bodies/collisions/queries,
  render resources/shaders/materials/frames, and recovery behavior.
- Update The Open Above to an exact committed Engine dependency and prove visible
  physics-driven gameplay, MCP inspection/planning/approval/application, repeated
  no-op application, restart restoration, and continued operation after agent
  disconnection.
- After the release freeze, make The Open Above track NexusEngine through HTTPS
  `#main` while its lockfile and every validation receipt record the exact
  resolved SHA. Cover every released Physics and Render capability and prove
  two repeatable clean validation cycles at one SHA.
- Keep package exports, manifests, catalogs, MCP resources, documentation, and
  evidence aligned with the same committed source.
- Complete the matrix gates before considering the mission achieved.

## End State

```txt
origin/0.0.4  -> unchanged frozen commit B
origin/0.0.5  -> immutable approved release commit A
origin/main   -> default mutable line, at A on release and ready for 0.0.6 work
The Open Above -> HTTPS #main dependency with exact lock-resolved SHA receipts
```

At completion, immutable `0.0.5` contains the validated release, while `main`
remains available for subsequent `0.0.6` development. The Open Above is the
continuous main consumer and rebuild proof, not only a one-time release sample.

## Safety And Release Gates

- Preserve current work and existing worktrees; never stash, reset, rebase,
  force-clean, or absorb unrelated changes.
- Work in an isolated feature branch/worktree and integrate to `main` only after
  committed-SHA proof and explicit push approval.
- Create immutable `origin/0.0.5` only after separate exact-SHA release
  approval. Prove fresh Git HTTPS and jsDelivr `@0.0.5` imports. Never
  force-update, merge into, or delete the frozen branch.
- Do not push, deploy, publish, mutate Google Drive, archive repositories,
  install to hardware, create tags/releases, or update `0.0.4` without separate
  explicit approval.
- Record each selected package's actions, owners, detailed evidence, acceptance
  results, failures, repairs, and next action in the active run and matrix
  history.
