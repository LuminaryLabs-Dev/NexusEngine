# Core Object Kit

`core-object-kit` defines the universal renderer-agnostic object contract used by procedural creatures, trees, rocks, buildings, imported assets, and other physical/generated objects.

It owns object identity, type, transforms, part hierarchy, bounds, pivot, ground anchor, descriptor references, content hashing, lifecycle state, snapshots, reset, and validation.

It does not own procedural generation policy, entity/world state, Three.js objects, GPU resources, physics resolution, capture rendering, or asset transport.
