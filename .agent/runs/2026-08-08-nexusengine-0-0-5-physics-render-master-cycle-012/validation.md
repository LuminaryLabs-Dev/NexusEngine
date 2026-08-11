# Validation

- Detailed matrix SHA-256 matched the Cycle 011 output.
- Master matrix is valid: 74 nodes, 67 packages, 3,343 of 3,343 detailed nodes.
- Selected package: `n:render/lifecycle`.
- Selected actions: 42 across six Kits.
- `n:render/contracts` is completed, so the package is dependency-ready.
- Worktree before cycle: clean at
  `74009f46a699f2eadbb2e0c25a3a8ed7b8585185`.
- Protected remote refs remain unchanged; `origin/0.0.5` and `origin/0.0.6`
  remain absent.

## Ownership Finding

Runtime owns engine ticking and generic Kit installation. Render Lifecycle owns
only the portable lifecycle state of one selected Render provider composition.
Concrete provider initialization, disposal, reset, recovery, GPU resources,
frame submission, and host surfaces remain external.

The six planned Kits have distinct responsibilities and are retained. Recovery
returns a failed installation either to `installed` for a new startup or to
`ready` when a provider proves in-place recovery. Coordinated mutations must
roll back all affected lifecycle atoms on failure.

No browser or Human View proof is required for this provider-neutral state
package. Those gates remain assigned to concrete provider and The Open Above
packages.

No push or release-branch creation is authorized.

## Worktree Proof

- Six manifest-owned atomic Kits and seven public lifecycle subpaths are present.
- The lifecycle composition plan is complete, acyclic, deterministic, and orders
  the six Kits after canonical Render contracts.
- Same-instance and reconstructed-equivalent Kit installation are no-ops;
  changed content under the same Kit identity fails before mutation.
- Coordinated startup, shutdown, recovery, reset, and restore failures roll all
  affected lifecycle atoms back to their prior portable snapshots.
- Ready recovery restores Startup and Installation to `ready`; nonready recovery
  returns Installation to `installed` and requires a fresh Startup operation.
- Uncoordinated Startup stop is rejected.
- The deterministic property probe passed 200 paired traces and 7,996
  exact-once command calls with equal final state.
- `npm test` passed 101 smoke tests.
- `npm run test:release` passed 34 release-candidate tests.
- Core, contract, ownership, package-surface, migration, ProtoKit, release
  manifest, boundary, and documentation checks all passed.
- Ownership reported 197 manifest-proven public atoms, zero unreviewed modules,
  and zero violations.
- Boundaries reported 1,009 production modules with no ownership drift or
  private sibling imports.
- The Guide PDF contains 151 nonblank, unclipped US Letter pages.
- Dry package inspection found 1,234 entries, including all 22 lifecycle source
  files, at registry SHA
  `b00ce85625ed41b7cffc6bad7eb433d1d0dda353845e90058910c3ff38db21e9`.

## Contract Hardening

- Pinned provider versions now match startup, shutdown, and recovery receipts
  exactly before mutation.
- Composed snapshots now validate every nested component, capture-key identity,
  provider identity, and aggregate lifecycle phase coherence.
- The first shutdown version-check pass changed invalid-command error ordering.
  The targeted test caught it; state validation was restored ahead of provider
  validation, and the complete gate set passed afterward.

## Harness Retry

An initial dry-pack parser consumed tool-truncated JSON, and an earlier property
probe result was truncated before a trustworthy completion record. Neither
failure reached product code. Both commands were rerun with bounded output; the
final dry pack and 200-pair property probe passed.

At the worktree checkpoint, committed-SHA and fresh-tarball proof remained
pending. Detailed matrix state stayed unchanged while those proofs ran.

## Committed-SHA Proof

- Source commit:
  `6cc816e4a124c1fe8b93cd4a7db60b2a83322561`.
- A detached worktree installed dependencies with SSH disabled and remained
  clean before packing.
- All structural checks, 101 smoke tests, 34 release tests, the targeted Render
  smoke, and 200 paired replay traces passed at the exact commit.
- The real tarball contains 1,234 files, including all 22 lifecycle source
  files; SHA-256:
  `1ecb67f392945aaacce139a39c5345c16c95ede4f1ba5331f6d5d5c9ca700c9c`.
- A fresh SSH-disabled consumer imported all seven public lifecycle subpaths,
  matched the registry hash, planned all dependencies, rejected changed
  content, replayed exact commands, restored after restart, and reset stably.
- Tarball and installed-package scans found zero symlinks, hidden Git/Agent
  paths, or private machine paths.
- The first temporary consumer initialization used unsupported `npm init
  --prefix` behavior. A new isolated directory was initialized from its own
  working directory and passed; package code was never implicated.

At that checkpoint, the detailed matrix still had not changed. Reconciliation
followed only after the committed proof packet existed.

## Matrix Reconciliation

- The detailed matrix matched its expected SHA-256 before mutation:
  `454c54242e1c63cc85a1d9d238906c1fa8271b4c1a8bf555aa42d5db7ceca966`.
- Exactly 42 Render Lifecycle atomic actions moved from `pending` revision 0 to
  `completed` revision 1 with direct evidence from source commit
  `6cc816e4a124c1fe8b93cd4a7db60b2a83322561`.
- The lifecycle capability completed; Render Domain remained `in_progress` at
  revision 2; the mission remained `in_progress` at revision 6.
- Exactly 45 detailed rows changed. All other 3,298 rows remained byte-identical.
- Detailed matrix SHA-256:
  `68bc86ce3eb43c4467cb3dae409e652c28d46c8365298cc63005c5432ab27ef8`.
- The regenerated master matrix represents all 3,343 detailed nodes exactly
  once, remains acyclic, and projects 6 of 67 packages complete.
- Master matrix SHA-256:
  `26a96a8f25c4f0026b823ffe5eb91c4bf8ac7383d6c9f4128d337f3c42357fde`.
- Protected remote refs remain unchanged: `origin/main` and `origin/0.0.4`
  both resolve to `16aee598c06efcb7b511e4827ee3f7e23ce3549b`;
  `origin/0.0.5` and `origin/0.0.6` remain absent.

## Next Selection

Selected `master-package-n-render-device`: 63 actions across nine Kits. Its
completed Contracts and Lifecycle dependencies make it ready, and it unlocks
the Render surface, resource, shader, pipeline, and provider paths. Render
Camera is smaller but has less dependency leverage; the Physics packages are
larger; the one-row checklist projection is not a complete semantic package.

No Render Device implementation belongs to Cycle 012.
