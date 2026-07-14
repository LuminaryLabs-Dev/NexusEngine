# Core Capture Domain

`n:capture` observes subjects through renderer-neutral requests and returns reusable asset references.

## Owns

- capture subjects
- view sets and framing
- requested observations
- capture job progress
- provider coordination
- results, failure, and cancellation state
- serializable snapshots and reset

## Does not own

- why an observation is required
- object fidelity or LOD policy
- renderer, GPU device, Canvas, or render targets
- texture upload, file encoding, or download

## Contract

```txt
A consumer requests observations.
Capture chooses a provider and tracks the work.
The provider performs platform rendering.
The result contains asset references only.
```

The domain installs without a provider. Waiting work remains serializable and may resume when a provider becomes available.
