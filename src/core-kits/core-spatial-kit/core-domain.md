# core-spatial-kit

Purpose: where-things-are facts: transforms, bounds, zones, coordinate spaces, distances, rays, and volumes.

Owns: transform descriptors, bounds descriptors, zone descriptors, spatial query descriptors, coordinate-space metadata.

Does not own: scene object identity, physics resolution, or renderer transforms.

Public API: `createCoreSpatialKit(config?)`.

Proof required: transform descriptor smoke, zone descriptor smoke, query descriptor smoke, deterministic headless smoke.
