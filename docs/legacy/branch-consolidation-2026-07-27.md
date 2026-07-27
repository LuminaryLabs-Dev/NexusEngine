# Branch Consolidation Summary

This historical note records the disposition of the July 2026 preservation
work. It is not an active architecture or development instruction.

## Consolidated Material

| Preserved category | Disposition |
| --- | --- |
| Core Composition registry and composition-tree implementation | Integrated into `main` through the reviewed registry implementation and its smoke coverage. |
| Registry ownership metadata | Regenerated from the integrated source and retained in the active ownership ledger. |
| Architecture and workflow drafts | Not merged verbatim. Durable ownership rules are represented by the active documentation router, current architecture, kit ownership, experiment workflow, and retired ProtoKit guidance. |
| Reflection domain addressing | Already present in `main`; no additional change was required. |
| Deterministic timing adjustments in navigation smoke coverage | Already present in `main`; no additional change was required. |
| Generated development-run evidence | Not merged. Only its validation scope is summarized below. |

## Preserved Validation Scope

The historical run covered repository integrity, public exports, kit
composition, installed API parity, browser startup, deterministic replay,
runtime ticks, and test coverage. Current source and current validation remain
authoritative; the historical output does not override them.

## Public-Safety Boundary

The consolidation intentionally excludes raw run state, full machine-generated
evidence, local filesystem paths, environment details, command logs, prompts,
credentials, cookies, tokens, and other machine-specific material.

## Branch Policy

The durable repository branches are `main`, `0.0.1`, `0.0.2`, and `0.0.3`.
Temporary feature, integration, test, and preservation branches are retired
after their validated functionality or public-safe lessons enter `main`.
