# Core Object Shape

`n:object:shape` owns renderer-neutral source geometry, provider-derived candidates, qualification evidence, approved shapes, rejected candidates, conservative fallback, jobs, snapshots, and reset.

## Safe skinned production flow

```txt
source shape
→ provider candidate
→ structural qualification
→ deterministic pose deformation qualification
→ multi-view silhouette qualification
→ approved or rejected
→ approved shape only
→ Object Fidelity form
```

Provider completion does not make a shape ready. A candidate becomes available through `getCandidate()`, its evidence through `getQualification()`, and only an approved result is returned by `getShape()`.

## Production profile

Use `skinned-organic-production` for skinned trees and comparable organic objects.

The profile keeps:

- the original vertex layout
- the original skeleton and bind contract
- skin-index and skin-weight arrays
- protected branch-root and fork vertices
- deterministic validation poses
- silhouette thresholds
- conservative fallback ratios

Automatic skeleton reduction remains experimental and is not enabled by this profile.

## Source metadata

```js
engine.n.objectShape.registerSource({
  id: "oak:source",
  objectId: oak.id,
  objectContentHash: oak.contentHash,
  geometry: {
    positions,
    indices,
    attributes: {
      skinIndex: { itemSize: 4, values: skinIndices },
      skinWeight: { itemSize: 4, values: skinWeights },
      normal: { itemSize: 3, values: normals },
      uv: { itemSize: 2, values: uvs }
    }
  },
  metadata: {
    semanticPartitions: {
      trunk: trunkVertices,
      majorBranches: majorBranchVertices,
      secondaryBranches: secondaryBranchVertices,
      foliage: foliageVertices
    },
    vertexConstraints: {
      lockPosition: branchRootVertices,
      lockTopology: forkVertices,
      preserveWeights: protectedWeightVertices
    },
    skinning: {
      boneCount,
      bindMatrices,
      protectedVertices: branchRootVertices,
      validationPoses: deterministicWindPoses
    }
  }
});
```

## Derivation

```js
const job = await engine.n.objectShape.derive({
  sourceShapeId: "oak:source",
  profileId: "skinned-organic-production",
  targetId: "reduced",
  providerId: "meshoptimizer-shape-provider"
});

if (job.state === "ready") {
  const shape = engine.n.objectShape.getShape(job.resultShapeId);
  console.log(shape.qualification.status); // approved
}
```

When a requested ratio fails, Object Shape retries the profile's safer ratios and finally the source geometry. Every attempt remains inspectable through `listCandidates(job.id)` and `listQualifications(job.id)`.

## Fidelity boundary

`object-shape-form` only accepts jobs in `ready` state whose result embeds approved qualification evidence. Rejected, failed, cancelled, or stale candidates cannot become Fidelity forms.

## Ownership

Object Shape does not own tree morphology, renderer objects, capture rendering, materials, GPU buffers, runtime form selection, or production skeleton reduction.
