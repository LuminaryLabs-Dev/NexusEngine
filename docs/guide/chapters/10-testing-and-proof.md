# Testing And Proof

Tests prove contracts at the level where failure would matter. A green unit test is not enough when a change affects package exports, composition, consumers, or rendered output.

## Manifest Proof

Validate unique IDs, normalized paths, immediate parents, one owner per public module, source paths, export names, schemas, lifecycle declarations, dependencies, and proof references.

## Atomic Lifecycle Proof

For each stateful atom:

1. Install twice and prove no duplicate state or systems.
2. Apply the same command twice and compare state and result.
3. Reuse an idempotency key with changed content and require failure.
4. Snapshot, load, and compare equality.
5. Reset twice and compare equality.
6. Replay ordered inputs from the same snapshot.

## Composition Proof

Test missing providers, cycles, collisions, status rejection, stable ordering, repeated apply, process restart, receipt persistence, host rollback, and continued runtime operation after MCP disconnect.

## Restoration Proof

The restoration generator checks 26 historical source checksums against the
last complete Git snapshot, requires exactly 27 replacement atoms, nine
adapters, and six recipes, and confirms every proof path exists. Regression
tests cover each named historical defect, JSON-portable snapshot boundaries,
exact-once operations, deterministic ties, large-delta advancement, and
side-effect-free queries.

The root disposition ledger must classify those exact 26 sources as
`core-restored`. A source returning to `external-kit`, a missing old export, or
a replacement that is no longer manifest-reachable fails documentation and
migration checks.

## Combination Coverage

Test each atom alone, every declared dependency edge, pairwise cross-Domain combinations, official recipes, high-risk three-way stacks, and installation-order permutations. Do not attempt every mathematical combination.

## Registry Security Proof

Prove that metadata reads cannot execute code. Reject moving refs, integrity mismatch, path escape, wrong export, missing package, duplicate identity, and changed-content replay before mutation.

## Consumer Proof

Install the packed Engine tarball in clean temporary directories. Then prove Kits, Editor, and Simulator against that exact artifact without local symlinks. Browser-facing workflows require Playwright and human-view inspection in addition to DOM assertions.

## Documentation Proof

Regenerate all derived files, run drift checks, execute guide examples, resolve links, render the PDF, verify every page contains content, and visually inspect rendered page images for clipping or overlap.
