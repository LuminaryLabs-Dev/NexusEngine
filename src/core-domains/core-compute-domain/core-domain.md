# Core Compute Domain

`n:compute` is the optional provider-neutral domain for describing and executing large parallel workloads without placing renderer, GPU, Worker, physics, or gameplay ownership into the realtime tick.

## Owns

- compute buffer descriptors
- compute kernel descriptors
- dependency-ordered compute graphs
- dispatch dimensions
- provider lifecycle
- provider-neutral execution requests
- serializable execution summaries
- snapshots and reset

## Does not own

- graphics materials, lighting, VFX, or fidelity policy
- GPU Scene or indirect-draw meaning
- WebGPU device creation or command submission
- Worker or OffscreenCanvas lifecycle
- authoritative gameplay state
- physics backend behavior

## Composition rule

```txt
Core Graphics defines visual meaning.
Core Compute executes parallel work descriptions.
A provider performs the backend work.
A host owns platform presentation and submission.
```

## Installation

```js
const engine = createRealtimeGame({
  kits: createCoreComputeDomain({
    root: {
      buffers: [],
      kernels: [],
      graphs: []
    }
  })
});

engine.n.coreCompute.setProvider(provider);
await engine.n.coreCompute.executeGraph("graph-id");
```

The domain is optional and installs no scheduler system, renderer, GPU backend, or browser host behavior by itself.
