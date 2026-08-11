# Validation

- Detailed matrix SHA-256 matched the Cycle 012 output.
- Master matrix is valid: 74 nodes, 67 packages, and all 3,343 detailed nodes represented.
- Selected package: `n:render/device`.
- Selected actions: 63 across nine Kits.
- Render Contracts and Render Lifecycle are completed, so the package is dependency-ready.
- Worktree before cycle: clean at `39288336a70fe8e4c620be250ea9ba9efa9d9381`.
- Protected remote refs remain unchanged; `origin/0.0.5` and `origin/0.0.6` remain absent.

## Ownership Finding

Core Render Device owns JSON-portable device identity, feature vocabulary,
limits, capability profiles, memory accounting, logical queue receipts,
acquisition state, loss records, and deterministic diagnostics. Render
Lifecycle continues to own the selected provider composition lifecycle. Host
owns surfaces and platform lifecycle. Concrete providers own GPU handles,
allocations, command encoding, queue execution, and repair.

Feature owns declarations and negotiation. Capability aggregates a device,
features, and limits. Memory and Queue record semantic intent and receipts only.
Device Loss records facts; it does not execute recovery. Diagnostics is a
read-only projection of public device APIs.

No browser or Human View proof is required for this provider-neutral package.
No push or release-branch creation is authorized.

## Worktree Proof

- Nine manifest-owned atomic Kits and ten public Render Device subpaths are present.
- The package composition plan is complete, acyclic, deterministic, and orders
  Device atoms after canonical Render Contracts and Installation.
- Same-instance and reconstructed-equivalent Kit installation are no-ops;
  changed content under the same Kit identity fails before mutation.
- Every portable record rejects unknown fields, non-finite or unsafe numbers,
  functions, provider objects, backend handles, and malformed references.
- Feature and limit negotiation, capability composition, memory accounting,
  logical queue submission, lifecycle, loss, and diagnostics are deterministic.
- Invalid memory capacity, queue dependency, provider receipt, snapshot,
  lifecycle, and loss-resolution operations fail before semantic mutation.
- A 200-step paired replay probe passed 2,796 exact-once calls with equal state
  after every step.
- `npm test` passed 101 smoke tests.
- `npm run test:release` passed 34 release-candidate tests.
- Core, contract, ownership, package-surface, migration, ProtoKit, release
  manifest, boundary, documentation, and Guide checks all passed.
- Ownership reported 206 manifest-proven public atoms, zero unreviewed modules,
  and zero violations.
- Boundaries reported 1,040 production modules with no ownership drift or
  private sibling imports.
- The Guide PDF contains 154 nonblank, unclipped US Letter pages.
- Dry package inspection found 1,266 entries at registry SHA
  `8d622e4b382ffad56fdc9340cb32dd46037808f3586c47568dffc1c82632ceb1`.

At this checkpoint, committed-SHA and fresh-tarball proof remain pending.
Detailed matrix state remains unchanged.

The first fresh-consumer proof found that Device Lifecycle acquisition checked
the current capability reference before the exact-once ledger. Changed content
under a completed operation ID therefore failed safely but returned the wrong
conflict classification. The validation order was moved inside the ledger
executor, the source SHA was invalidated, and committed proof restarted.
The repaired worktree then passed the complete 101-smoke and 34-release suites
at Guide SHA `9b7e16d5bb9209c84b27591fa9298d5a1a279febe3189344be7883766e5b9a73`.

## Committed-SHA Proof

- Source commit:
  `d71adbc12ed39246c681a32e12a193686c5ab50b`.
- A detached worktree installed 100 dependencies with SSH disabled and remained
  clean before and after proof.
- All structural checks, 101 smoke tests, 34 release tests, the targeted Render
  Device smoke, and 200 paired replay steps passed at the exact commit.
- The real tarball contains 1,266 files, including all 31 Render Device source
  files; SHA-256:
  `97bb6d96345a7abcab6f6661b8f82b24a48aab632b0773f1b188ce79594a1fab`.
- A fresh SSH-disabled consumer imported all ten public device subpaths,
  matched the registry hash, planned all dependencies, classified changed
  content as an identity conflict, restored every snapshot after restart, and
  reproduced diagnostics.
- Tarball and installed-package scans found zero symlinks, hidden Git/Agent
  paths, or private machine paths. Repository documentation and tests retain
  deliberate rejected-SSH source examples, not live SSH dependencies.

Detailed matrix state still has not changed. Reconciliation follows only from
this committed proof packet.

## Matrix Reconciliation

- The detailed matrix matched its expected SHA-256 before mutation:
  `68bc86ce3eb43c4467cb3dae409e652c28d46c8365298cc63005c5432ab27ef8`.
- Exactly 63 Render Device atomic actions moved from `pending` revision 0 to
  `completed` revision 1 with direct evidence from source commit
  `d71adbc12ed39246c681a32e12a193686c5ab50b`.
- The Device capability completed; Render Domain remained `in_progress` at
  revision 3; the mission remained `in_progress` at revision 7.
- Exactly 66 detailed rows changed. All other 3,277 rows remained
  byte-identical.
- Detailed matrix SHA-256:
  `34861309f73775f4f5ca707d3c0de8a7209ac98ea00c0685c741ea6226d5a48c`.
- The regenerated master matrix represents all 3,343 detailed nodes exactly
  once, remains acyclic, and projects 7 of 67 packages complete.
- Master matrix SHA-256:
  `1b6dcbadee46d7e1a721850f05a00174ac4d695536e0f3a0ce4e78d6137ab179`.
- Protected remote refs remain unchanged: `origin/main` and `origin/0.0.4`
  both resolve to `16aee598c06efcb7b511e4827ee3f7e23ce3549b`;
  `origin/0.0.5` and `origin/0.0.6` remain absent.

## Next Selection

Selected `master-package-n-render-resource`: 70 actions across ten Kits. Its
Device dependency is complete. It has the highest downstream leverage of the
eligible packages, directly unlocking Buffer, Texture, and Geometry and
transitively unlocking 29 packages. No Render Resource implementation belongs
to Cycle 013.
