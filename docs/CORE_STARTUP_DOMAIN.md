# Core Startup Domain

## Decision

NexusEngine provides one optional `n:core-startup` domain rather than a collection of mechanical loading subdomains.

## Purpose

Core Startup determines whether one application launch became authoritative and usable.

```txt
Host performs work.
Core domains produce receipts.
Core Startup records launch truth.
Product sequences author the waiting experience.
Presentation adapters draw it.
```

## Semantic areas

```txt
Launch
  Which application launch is active and how it ended.

Preparation
  Which required facts are ready, waiting, working, skipped, or failed.

Continuation
  Whether the application begins new state or continues restored, recovered, or safe state.

Failure
  Why startup failed, where it failed, whether retry is allowed, and what fallback was offered.

Playable readiness
  Whether all required facts are ready, one successful frame was presented, and input may enter.
```

These are service areas inside one domain, not separate installable DSKs.

## Composition

Core Startup consumes receipts from existing domains and adapters:

```txt
Core Platform
Core Composition
Core Assets
Core Persistence
Core Presentation
Core Diagnostics
browser/native host adapters
renderer adapters
```

It does not replace them.

## Invariants

```txt
A launch has one stable launch ID.
Required preparations cannot be skipped.
A failed required preparation blocks playable readiness.
The same readiness or first-frame receipt is idempotent.
Playable readiness requires every required preparation.
Playable readiness requires a successful presented frame.
Snapshots contain serializable facts only.
DOM, Canvas, Three.js, transport, and game copy stay outside the domain.
```

## Browser adapter

`createBrowserStartupPresentationAdapter()` applies a renderer-neutral descriptor to supplied elements. Product code supplies the formatter that turns factual startup state into player-facing copy. The adapter also exposes a bounded host-side timeout wrapper and structured failure reporting.
