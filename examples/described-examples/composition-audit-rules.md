# Composition Audit Rules

## Goal

The DSK audit should prove that a game slice is valid because its installed kits form a coherent service graph. It should not assume that a domain name has one fixed scale or product meaning.

## Required Checks

- Every kit has a stable id.
- Every DSK has `domain`, `metadata.kind = "domain-service-kit"`, `metadata.namespace = "n"`, `metadata.version`, and `metadata.stability`.
- Every `requires` token has one installed provider unless the composition explicitly allows multiple providers.
- Every `provides` token has no accidental duplicate provider.
- Every `engine.n.<api>` key is unique and not reserved.
- Every declared path is owned by an installed kit.
- Every cross-domain read/write goes through a declared `n:` service token.
- Every promoted DSK declares snapshot and reset expectations.
- Failed install should not leave partial `engine.kits`, `engine.domainServiceKits`, `engine.kitBindings`, `engine.n`, resources, systems, or surfaces.

## Path Audit Shape

```txt
path: world.terrain.height
owner: n-terrain-data-kit
requires: n:terrain:data
allowed readers:
  - n-terrain-renderer-kit
  - n-hazard-director-kit
  - n-camera-kit
allowed writers:
  - n-terrain-data-kit
```

The path exists only because the composition installed a terrain data provider. A fish tank, diorama, and open world can all expose terrain-like paths if they install that service.

## Boundary Leak Examples

```txt
Bad:
HazardDirector reads engine.resources.terrainChunks directly.

Good:
HazardDirector requires n:terrain:data and calls engine.n.terrainData.heightAt(x, z).
```

```txt
Bad:
FishTankKit mutates TerrainRendererKit render buffers.

Good:
FishTankKit provides tank profile data, and TerrainRendererKit reads it through n:fish-tank.
```

## Composition Report Output

A future audit command should produce:

```txt
composition id
installed kits
install order
provided tokens
required tokens
service graph
engine.n API keys
owned paths
cross-domain edges
snapshot/reset coverage
warnings
blocking errors
```
