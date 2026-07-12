# Headless Reliability Domain Kit

The optional Headless Reliability Domain Kit turns repository and target signals into guided evidence requirements without becoming part of gameplay or simulation truth.

## Owns

- invariant and reliability-check registry
- heuristic risk classification
- generated fixture plans
- required and missing evidence calculation
- evidence confidence scoring
- completion gates

## Does not own

- project-specific semantics
- gameplay state
- browser implementation
- renderer implementation
- GitHub writes
- test implementation details

Heuristics select likely proof paths. Deterministic fixtures and adapter evidence decide correctness.

```js
import {
  createHeadlessReliabilityDomainKit
} from "nexusengine";

const engine = createRealtimeGame({
  kits: [
    ...gameKits,
    createCoreHeadlessEditorKit(),
    createHeadlessReliabilityDomainKit()
  ]
});
```

The kit can run as an optional submodule in an existing NexusEngine instance through `engine.n.headlessReliability`.
