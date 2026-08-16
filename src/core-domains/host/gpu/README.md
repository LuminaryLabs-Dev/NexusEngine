# Host GPU Domain

`n:host:gpu` owns the shared GPU environment used by engine consumers.

It owns portable device identity, resource identity/usage/revision/residency/lifetime, cross-consumer readiness, and coordinated device-loss recovery. Concrete WebGPU handles remain inside the WebGPU Host provider.

It does not own Compute kernels or dispatch semantics, Render materials/passes/draw semantics, World meaning, or product/game logic.

The intended relationship is:

```text
World semantics
      ↓
Compute ──writes──┐
                  │
              n:host:gpu
                  │
Render ───reads───┘
```

Compute and Render may resolve provider-private handles only inside their concrete execution providers. Portable Core snapshots and receipts contain resource IDs and revisions, never `GPUDevice`, `GPUBuffer`, `GPUTexture`, or other native objects.
