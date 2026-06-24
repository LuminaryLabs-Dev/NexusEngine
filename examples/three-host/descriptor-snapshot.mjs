import {
  createNexusHost,
  defineHostAdapter,
  defineResource,
  defineRuntimeKit
} from "../../src/index.js";

const RenderDescriptorState = defineResource("threeHostExample.renderDescriptorState");
const renderDescriptorKit = defineRuntimeKit({
  id: "render-descriptor-kit",
  resources: { RenderDescriptorState },
  provides: ["render.descriptor"],
  metadata: { domain: "render.descriptor", version: "0.0.1" },
  initWorld({ world }) {
    world.setResource(RenderDescriptorState, {
      revision: "three-host-demo-001",
      source: "examples/three-host"
    });
  }
});

const threeHostAdapter = defineHostAdapter({
  id: "three-host-kit",
  domain: "host.render.three",
  provides: ["host.render.three", "render.adapter.three"],
  requires: ["render.descriptor"],
  snapshot({ engine }) {
    return engine.world.getResource(RenderDescriptorState);
  }
});

const HOST_REVISION = "three-host-demo-001";

const RENDER_DESCRIPTOR = Object.freeze({
  frameId: 1,
  revision: HOST_REVISION,
  meshes: [
    {
      id: "cube-01",
      kind: "box",
      size: [1, 1, 1],
      materialId: "mat-coral",
      transform: {
        position: [0, 0.5, 0],
        rotation: [0, 0.35, 0],
        scale: [1, 1, 1]
      },
      bounds: {
        center: [0, 0.5, 0],
        halfExtents: [0.5, 0.5, 0.5]
      }
    },
    {
      id: "ground-01",
      kind: "plane",
      size: [5, 5],
      materialId: "mat-slate",
      transform: {
        position: [0, 0, 0],
        rotation: [-Math.PI / 2, 0, 0],
        scale: [1, 1, 1]
      },
      bounds: {
        center: [0, 0, 0],
        halfExtents: [2.5, 0.01, 2.5]
      }
    }
  ],
  materials: [
    {
      id: "mat-coral",
      baseColor: "#d85c48",
      roughness: 0.58,
      metallic: 0,
      alpha: 1
    },
    {
      id: "mat-slate",
      baseColor: "#263238",
      roughness: 0.82,
      metallic: 0,
      alpha: 1
    }
  ],
  lights: [
    {
      id: "sun",
      kind: "directional",
      direction: [0.35, -1, 0.4],
      color: "#fff3d6",
      intensity: 1.8
    },
    {
      id: "ambient",
      kind: "ambient",
      color: "#9fb7d8",
      intensity: 0.6
    }
  ],
  camera: {
    id: "main-camera",
    position: [3, 2.2, 4],
    target: [0, 0.45, 0],
    fov: 52,
    near: 0.1,
    far: 100
  },
  diagnostics: []
});

export function createThreeHostDescriptorSnapshot() {
  const host = createNexusHost({
    id: "nexus-host-three-example",
    revision: HOST_REVISION,
    provides: ["scene.ops", "input.intent"],
    kits: [renderDescriptorKit],
    adapters: [threeHostAdapter]
  });

  return {
    graph: host.snapshot(),
    render: RENDER_DESCRIPTOR,
    stream: {
      frameId: RENDER_DESCRIPTOR.frameId,
      revision: RENDER_DESCRIPTOR.revision,
      adds: RENDER_DESCRIPTOR.meshes.map((mesh) => mesh.id),
      updates: [],
      removes: [],
      diagnostics: []
    }
  };
}

export function createDescriptorHash(snapshot = createThreeHostDescriptorSnapshot()) {
  const text = JSON.stringify(snapshot);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

const isNodeCli = typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  import.meta.url === `file://${process.argv[1]}`;

if (isNodeCli) {
  const snapshot = createThreeHostDescriptorSnapshot();
  console.log(JSON.stringify({
    ...snapshot,
    descriptorHash: createDescriptorHash(snapshot)
  }, null, 2));
}
