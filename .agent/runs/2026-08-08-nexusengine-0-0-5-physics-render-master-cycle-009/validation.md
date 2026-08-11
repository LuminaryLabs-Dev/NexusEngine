# Validation

- Detailed matrix SHA-256 matched the expected Cycle 008 output.
- Master matrix is valid: 74 nodes, 67 packages, 3,343 of 3,343 detailed nodes.
- Selected package: `n:physics/material`.
- Selected actions: 42 across six Kits.
- Dependency `n:physics/contracts`: completed.
- Worktree before cycle: clean at `6e3d91541707a882cdf23b6d7c845c00018137fb`.
- Protected remote refs were fetched and remain unchanged.
- `origin/0.0.5` and `origin/0.0.6` remain absent.
- `nexus-editor`: unavailable; generated tracker state was not manually changed.

## Ownership Finding

No canonical Physics material implementation exists in current or historical
Engine commits. ProtoKits contains an uncontracted rigid-body descriptor and
NexusEngine-Rust contains product-level friction and restitution constants.
Those are evidence for required behavior, not reusable ownership.

The canonical package will own physical material descriptors and pair-combine
rules only. It will not own visual materials, authored effects, colliders,
contacts, solving, bodies, or concrete providers.

No push or release-branch creation is authorized.

## Worktree Proof

- Added six manifest-owned atomic Kits under `n:physics:material`.
- Generated seven public package subpaths from manifests.
- Registry SHA-256: `ef314620e72611d23a5be2931556d5977a743fb0d5a60fa35076409b3ac43ee0`.
- Guide content SHA-256: `d3c5c7a6252d5430fdaf31afa6168b3d95a761e1b999f21eb62b4355c129f694`.
- Targeted canonical Physics smoke: passed.
- Core manifest, executable parity, ownership, package-surface, release-manifest, migration, boundary, and documentation checks: passed.
- Full suite: 101 smoke tests passed.
- Release suite: 34 tests passed.
- Guide PDF: 141 nonblank, unclipped US Letter pages.
- Package dry run: 1,155 entries, 2,782,314 packed bytes.
- No push, release branch, deployment, consumer mutation, or protected-ref change occurred.

The package is worktree-proven only. Matrix promotion remains denied until the
exact committed source is isolated, packed, installed with SSH disabled, and
exercised through public imports, Composition, replay, snapshot, and reset.

## Exact Commit Proof

- Exact source commit: `6b2743881414d4ece4b1645d9e58a94d245606d5`.
- Detached install with SSH disabled: passed with no tracked drift.
- Targeted Physics, Core generation, contract parity, ownership, public
  surface, release-manifest, boundary, documentation, full, and release checks:
  passed from the exact commit.
- Actual tarball SHA-256:
  `74b4198cf1d8774c8cf9f30925cd58a057f32bc7a686245acdc2e5c0faa53690`.
- Fresh consumer imported the root, Composition, Contracts, Material aggregate,
  and six atomic Material subpaths.
- Composition selected 11 required Kits with no missing capability.
- Define, exact replay, changed-content rejection, symmetric pair resolution,
  snapshot, reset, repeated restore, and remove: passed.
- Installed package symlinks: zero; tarball symlink entries: zero.

Three harness retries are retained in the evidence packet: literal-newline
encoding, intentionally missing `n:runtime` after disabling default Core Kits,
and shell expansion in the first evidence writer. None mutated package state;
the corrected public consumer and exact committed proof passed.

## Matrix Reconciliation

- Guarded detailed matrix before SHA-256:
  `629cb91325cad55a6773084edd56c4d5740d0391d71454ee7a1f4ed58ecb9a7d`.
- Detailed matrix after SHA-256:
  `bf474d593aa74ef371cdd9e00b249e50b61c6d998fee30369d70ae326fc7c506`.
- Master matrix after SHA-256:
  `2008477a178728b0e257cc0a064e959e51de81957966bac1e76be0bae9781a7b`.
- Material actions: 42 of 42 completed from direct evidence.
- Material capability: completed.
- Physics domain: in progress, 3 of 21 packages completed.
- Mission: in progress, 3 of 67 packages completed.
- Master DAG: valid, 74 nodes, 67 packages, 3,343 of 3,343 detailed nodes represented.
- Protected refs, consumers, deployment, and release branches: unchanged.

Cycle 009 is complete. The next bounded package is
`master-package-n-physics-world` with 49 detailed actions; it was selected but
not implemented in this cycle.
