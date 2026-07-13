# core-composition-kit

Purpose: visible kit and domain composition meaning, including manifests, registry metadata, capability dependencies, composition plans, promotion metadata, and health.

Owns: kit/domain/bundle registration, strict identity collisions, requires/provides graphs, missing-dependency and cycle diagnostics, deterministic planning, graph snapshots, and health read models.

Does not own: low-level install mechanics, remote module transport, or game-specific bundles.

Public API: `createCoreCompositionKit(config?)`.

Promoted service surfaces:

```txt
engine.n.coreComposition.registry
engine.n.coreComposition.capabilities
engine.n.coreComposition.planning
engine.n.coreComposition.health
```

Compatibility aliases are installed only when they are not already owned: `engine.n.kitRegistry`, `engine.n.capabilityGraph`, and `engine.n.compositionPlanning`.

Proof required: registry collision smoke, provider/consumer graph smoke, missing-dependency and cycle smoke, deterministic plan ordering, snapshot/load/reset, and deterministic headless smoke.
