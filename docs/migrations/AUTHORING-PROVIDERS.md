# External WebGPU providers

Concrete WebGPU execution moves from Core to the trusted NexusEngine-Kits
`n:host:gpu-providers` package. Import the optional factories from
`@luminarylabs/nexusengine-kits/providers/webgpu`:

- `createWebGPUHostProvider`
- `createWebGPURenderProvider`
- `createWebGPUFrameExecutor`
- `createWebGPUComputeProvider`

Pass these providers to the existing public Core Host, Render or Compute
consumer. They are platform adapters, not source-document owners. Authoring
does not require them; its minimal Editor viewport uses an external Three/WebGL
provider. No backend object or codec was added to Core Authoring.

The old concrete Core implementations under Host GPU WebGPU, Render execution
GPU and Compute host execution GPU are removed, including their barrel exports.
The provider source originates at Engine
`bacc8fc0073bf92910e26776a6695d2b8ec45858`; preserved mock-device tests move with it.
Those tests prove provider protocol behavior, not production hardware support.
