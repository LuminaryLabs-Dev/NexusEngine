# Turn Ledger: Core Startup Domain

**Date:** 2026-07-13  
**Branch:** `main`

## Goal

Add one optional semantic startup authority that records whether a NexusEngine application launch became usable without absorbing host transport, renderer creation, persistence mechanics or product loading-screen orchestration.

## Implemented

- Added `core-startup-kit` at `n:core-startup`.
- Added the `core-startup-domain` barrel.
- Added launch identity and outcome.
- Added required preparation facts and receipts.
- Added new, restored, recovered and safe continuation choices.
- Added structured failure, cancel and retry behavior.
- Added first-presented-frame and playable-entry gates.
- Added renderer-neutral progress and failure descriptors.
- Added exact snapshot, restore and reset behavior.
- Added the browser startup presentation adapter and bounded host timeout helper.
- Added root, `core-kits`, `core-domains` and package subpath exports.
- Added public API freeze and barrel coverage.
- Added deterministic headless and adapter smoke coverage.
- Documented the boundary between Core Startup, product sequences and host presentation.

## Semantic boundary

```txt
Core Startup owns:
  launch truth
  required preparation truth
  continuation choice
  structured failure
  first-frame receipt
  playable readiness

Core Startup does not own:
  module or asset transport
  renderer implementation
  save migration mechanics
  DOM or native loading screens
  splash order or timing
  player-facing copy
  gameplay rules
```

## Validation wiring

`tests/core-kits/core-startup-domain-smoke.mjs` is included in `tests/run-all.mjs`. Public entrypoints and API freeze lists include the new domain and browser adapter.

## Downstream proof

`LuminaryLabs-Publish/MyCozyIsland` is the first browser consumer. It reports renderer, composition, continuation, world and input facts and enters only after one successful rendered frame.

## Truth label

Source and test wiring are on `main`. Do not claim full-suite or downstream browser success until the corresponding workflow and deployed route are observed.
