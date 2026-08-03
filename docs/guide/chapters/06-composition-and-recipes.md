# Composition And Recipes

Composition turns semantic intent into a deterministic, reviewable installation order.

## Registry First

Core discovery starts from merged registry metadata generated from manifests. It never scans the filesystem at runtime. Imported registries may add identities but may not replace Core records or collide with an existing Domain path.

## Selection Inputs

A request may select:

- individual atomic Kit IDs
- Domain IDs, which select the Domain's public atoms
- recipe IDs, which select declared Domains and Kits
- a scoped composition tree
- per-Kit configuration and allowed statuses

The retired `bundles` request key is rejected. Use recipes for declarative composition.

## Validate Before Plan

Validation checks identity, dependencies, provider availability, status policy, cycles, and ordering without resolving executable code.

The runnable inspection example is `examples/guide/composition-inspection.mjs`.

```js
const validation = engine.n.composition.planning.validate({
  kits: ["object-placement-kit"]
});

if (!validation.ok) throw new Error("Composition is invalid");
```

## Plan

Planning adds required providers and returns a stable dependency order. MCP planning also asks the application host to preflight exact executable sources. Preflight is read-only.

## Recipe Ownership

A recipe is data. It can express a useful combination without creating a new state owner. Reusable optional recipes belong in a trusted Kit registry. Complete game recipes belong with the game.

Core includes six data-only recipes for proving the restored universal graph:

- `procedural-navigation`
- `terrain-character-traversal`
- `management-operations`
- `vehicle-rescue-logistics`
- `spatial-guidance`
- `hazard-pursuit`

These recipes select atoms and adapters; they do not contain authored levels,
economies, objectives, or tuning. Applications provide that data themselves.

## Apply

Apply requires the exact reviewed plan ID and explicit authorization. The controller resolves the same metadata, rejects drift, applies through the host, persists a receipt, and returns the original receipt on replay.
