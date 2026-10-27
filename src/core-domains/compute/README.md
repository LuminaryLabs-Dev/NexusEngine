# Compute Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:compute`
- Status: `stable-candidate`
- Registry SHA-256: `a49b310d0bf31ffb0a1b52b532ed92490e94a7ada5a2110453d21cb8eb529c6f`
- Public entry: `nexusengine/domains/compute`

## Responsibility

Own portable compute graphs, resource requirements, dispatch intent, executor hosting, and execution-family contracts.

## Owns

- compute execution contracts
- compute executor hosting
- compute graphs
- compute resource requirements
- dispatch intent

## Does Not Own

- authored world rules
- gameplay meaning
- physics solving
- renderer passes
- shared physical GPU ownership

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:compute:graph` | Own portable compute topology, dependencies, and deterministic plans. |
| `n:compute:graph:node` | Own portable node identity, ports, operations, and requirements. |
| `n:compute:graph:dependency` | Own data, control, and barrier dependencies. |
| `n:compute:graph:plan` | Own deterministic validation, ordering, partitioning, and batching. |
| `n:compute:resource` | Own portable compute resource requirements, access intent, and receipts. |
| `n:compute:resource:buffer` | Own portable compute buffer size, usage, and access semantics. |
| `n:compute:resource:image` | Own portable compute image format, view, and access semantics. |
| `n:compute:resource:binding` | Own portable compute binding slots, layouts, and sets. |
| `n:compute:dispatch` | Own provider-neutral execution intent, workgroups, submissions, and receipts. |
| `n:compute:dispatch:workgroup` | Own portable workgroup shape and count semantics. |
| `n:compute:host` | Own compute executor compatibility, deterministic selection, and lifecycle. |
| `n:compute:host:capability` | Own compute-specific features, limits, requirements, and profiles. |
| `n:compute:host:selection` | Own deterministic compatibility, preferences, and executor selection. |
| `n:compute:host:lifecycle` | Own acquisition, readiness, recovery, and release contracts for compute executors. |
| `n:compute:host:execution` | Own execution-family classification and realization of portable compute work. |
| `n:compute:host:execution:gpu` | Own GPU-class compute execution semantics over Host GPU resources. |
| `n:compute:host:execution:gpu:vulkan` | Own portable Vulkan compute contracts over a Host GPU environment without pretending a browser runtime exists. |
| `n:compute:host:execution:gpu:opengl` | Own portable OpenGL compute contracts over a Host GPU environment without pretending a browser runtime exists. |
| `n:compute:host:execution:cpu` | Own processor-class compute execution and deterministic CPU fallback. |
| `n:compute:host:execution:cpu:javascript` | Own JavaScript and Worker execution of portable Compute graphs. |
| `n:compute:host:execution:cpu:wasm` | Own WebAssembly compute execution, memory, SIMD, and threading contracts. |
| `n:compute:host:execution:cpu:native` | Own native CPU extension contracts for threads, vector execution, and synchronization. |
| `n:compute:model` | Own model descriptors, registry and capabilities. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `compute-graph-kit` | `nexusengine/domains/compute/graph` | Validate compute descriptors, create deterministic dependency-ordered dispatch plans, and execute them through an injected provider or Compute Host. |
| `model-registry-kit` | `nexusengine/domains/compute/model` | Register model descriptors and capabilities without executing inference. |

## Lifecycle

- Duplicate install: Return the installed Compute API without duplicate state or systems.
- Snapshot: Serialize Compute state and descriptors.
- Reset: Restore the configured Compute baseline.
