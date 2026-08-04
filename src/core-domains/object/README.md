# Object Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:object`
- Status: `stable-candidate`
- Registry SHA-256: `0fe0ffcc730675224e5a487231520ffec4f07153e8665fe18ccef21743adb9aa`
- Public entry: `nexusengine/domains/object`

## Responsibility

Own renderer-neutral object identity, intrinsic geometry meaning, fidelity, vegetation identity, and placement.

## Owns

- ground anchor
- intrinsic bounds
- object descriptors
- object identity
- object registry
- pivot

## Does Not Own

- GPU resources
- agent decisions
- physics resolution
- renderer objects
- world generation

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:object:shape` | Own source and derived geometric shapes, provider jobs, qualification, and fallback. |
| `n:object:fidelity` | Own valid object forms, fidelity packages, readiness, and contextual adaptation. |
| `n:object:vegetation` | Own rooted plant species, instances, lifecycle, and deterministic variation. |
| `n:object:vegetation:tree` | Own deterministic tree structure, canopy, growth, and fidelity descriptors. |
| `n:object:vegetation:foliage` | Own deterministic foliage structure and descriptors. |
| `n:object:vegetation:ecology` | Own deterministic vegetation suitability scoring and species selection. |
| `n:object:placement` | Own deterministic placement transforms, grounding, alignment, fit, and validation receipts. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `object-registry-kit` | `nexusengine/domains/object/registry` | Own object identity and renderer-neutral lifecycle records. |
| `object-shape-kit` | `nexusengine/domains/object/shape` | Derive and qualify renderer-neutral geometric shape candidates. |
| `object-fidelity-kit` | `nexusengine/domains/object/fidelity` | Package and select valid object fidelity forms. |
| `object-vegetation-kit` | `nexusengine/domains/object/vegetation` | Own deterministic plant species, instances, and lifecycle state. |
| `object-tree-kit` | `nexusengine/domains/object/vegetation/tree` | Produce deterministic tree structure, canopy, growth, and fidelity descriptors. |
| `object-foliage-kit` | `nexusengine/domains/object/vegetation/foliage` | Produce deterministic foliage structures and descriptors. |
| `object-vegetation-ecology-kit` | `nexusengine/domains/object/vegetation/ecology` | Score vegetation suitability and select species deterministically. |
| `object-placement-kit` | `nexusengine/domains/object/placement` | Create, validate, and replay deterministic object placement receipts. |
| `object-meshoptimizer-shape-provider-kit` | `nexusengine/domains/object/shape/meshoptimizer-provider` | Resolve object shape jobs through an explicitly registered meshoptimizer-compatible provider. |
| `object-shape-fidelity-adapter-kit` | `nexusengine/domains/object/adapters/shape-fidelity` | Translate qualified shape records into Object Fidelity form requests. |
| `object-vegetation-bridge-kit` | `nexusengine/domains/object/adapters/vegetation-object` | Project vegetation identities into canonical Object descriptors without owning either state. |

## Lifecycle

- Duplicate install: Return the installed Object API without duplicate state or systems.
- Snapshot: Serialize object descriptors and registry state.
- Reset: Restore the configured object registry baseline.
