# ProtoKit Extraction

ProtoKits is retired as an active development destination. Its history remains evidence for reconstructing useful behavior with Core atoms, external Kits, recipes, and game-owned code.

## Frozen Source

Extraction uses a clean read-only worktree at one immutable remote default-branch commit. The inventory records the remote, commit, file count, and source snapshot SHA-256. A stale or dirty local checkout is never canonical evidence.

## Unit Of Classification

Folder count is not capability count. The extractor records folders, files, exports, factories, manifests, tests, dependencies, state, lifecycle signals, commands, events, providers, adapters, and consumers. Every discovered source surface receives exactly one disposition.

## Dispositions

| Disposition | Meaning |
| --- | --- |
| `core-reuse` | Existing Core atom already owns the behavior |
| `core-composition` | Existing atoms reproduce it through composition |
| `core-new-atom` | A missing universal atom passed every promotion gate |
| `external-kit` | Reusable but optional, niche, platform, or vendor behavior |
| `recipe-data` | Authored data or declarative composition |
| `game-owned` | Complete product or gameplay behavior |
| `duplicate` | Semantically identical to a named canonical owner |
| `rejected-unproven` | Insufficient evidence for a safe owner |

## New Atom Gate

A candidate must have one indivisible responsibility, deterministic behavior or isolated nondeterminism, product neutrality, snapshot and reset support, no concrete presentation ownership, and two semantically different consumers. Failure of one condition keeps it outside Core.

## Reconstruction

Useful behavior is preserved as a recipe: source lineage, required Core atoms, external owner, data, policy, and proof status. Preserving behavior does not require preserving the old package shape.

## Archive Boundary

Writers and automations remain disabled. Archiving the remote repository is a separate external mutation that requires explicit approval after extraction coverage is complete.
