# Ideal Hosts

This describes the ideal target architecture, not a guarantee that the current NexusEngine implementation already satisfies every rule.

Reading order: [Categories](categories.md) -> [Domains](domains.md) -> [Kits](kits.md) -> [Services](services.md) -> [DSK](dsk.md) -> [Composition](composition.md) -> [Shared Host](shared-host.md) -> Ideal Hosts

## Definition

An ideal host is an explicit runtime shell for running kit compositions. It replaces the informal idea that the DOM, a browser page, a native window, or a local script is the host.

```text
Nexus.Host
  = universal host kit/runtime shell

Graph Kit
  = composition graph of loaded kits, domains, services, dependencies, state, and host adapters
```

The host should make composition visible, inspectable, reusable, and portable across browser, native, headless, editor, and proof environments.

## Core Principle

Everything is a kit.

Legacy names such as `ProtoKit`, plus `experiment kit`, `deploy kit`, `host
kit`, `adapter kit`, `descriptor kit`, and `validation kit`, are naming,
status, or usage conventions. They are not separate architecture species.

The durable structure is:

```text
kit
  domain
  services
  resources
  events
  systems
  descriptors
  snapshots
  reset/load behavior
  provides/requires
  optional child kits
```

Domains can exist at every tier. A kit is not categorized first by type. A kit is understood by the domain it owns and the services it exposes.

Examples:

```text
three-host-kit
  domain: host.render.three

render-descriptor-kit
  domain: render.descriptor

terrain-kit
  domain: world.terrain

objective-flow-kit
  domain: progression.objective

nexusengine-host-kit
  domain: host.runtime.nexusengine
```

## Nexus.Host Responsibilities

`Nexus.Host` owns composition and lifecycle. It should not own the behavior of every domain.

An ideal host owns:

- Loaded kit records.
- Kit graph.
- Domain graph.
- Service registry.
- Host adapters.
- Lifecycle state.
- Input/output bridge.
- Snapshots.
- Diagnostics.
- Instance identity.
- Dependency validation.
- Runtime mount/unmount flow.

It should know which kits are loaded, why they are valid, what they provide, what they require, what domains they own, and which host adapters are currently mounted.

## Core Shape

```text
Nexus.Host
|
+-- graph-kit
|   |
|   +-- kit nodes
|   +-- domain nodes
|   +-- service edges
|   +-- provides/requires edges
|   +-- lifecycle state
|   +-- dependency ordering
|
+-- runtime-kit-loader
|   |
|   +-- load kit
|   +-- validate kit
|   +-- install kit
|   +-- unload kit
|
+-- host adapters
|   |
|   +-- dom-host
|   +-- three-host
|   +-- nexusengine-native-host
|   +-- headless-host
|   +-- editor-host
|
`-- snapshots
    |
    +-- graph snapshot
    +-- render snapshot
    +-- input snapshot
    +-- diagnostics snapshot
```

## Graph Kit

The graph kit owns dependency visibility. It does not own all domain behavior.

It should store kit nodes, domain nodes, service edges, lifecycle status, dependency order, validation diagnostics, and mounted host adapters.

Example graph snapshot:

```json
{
  "kits": {
    "three-host-kit": {
      "domain": "host.render.three",
      "provides": ["host.render.three", "render.adapter.three"],
      "requires": ["render.descriptor"],
      "state": "ready"
    },
    "render-descriptor-kit": {
      "domain": "render.descriptor",
      "provides": ["render.descriptor"],
      "requires": [],
      "state": "ready"
    }
  },
  "edges": [
    {
      "from": "render-descriptor-kit",
      "to": "three-host-kit",
      "type": "provides/requires",
      "token": "render.descriptor"
    }
  ]
}
```

## Why This Is Better

The host makes composition explicit.

```text
not:
  random host JS manually wires kits

but:
  Nexus.Host loads kits into a graph
  graph validates dependencies
  graph exposes state
  graph drives host adapters
```

This gives every environment the same composition truth.

```text
NexusEngine ECS
  - still ticks systems

Nexus.Host
  - owns composition graph and host lifecycle

Kits
  - install into Nexus.Host / NexusEngine engine

Graph Kit
  - stores what is loaded, why it is valid, and how it connects
```

## Host Domains

Host domains should be normal domains. They are not special exceptions.

Examples:

```text
host.dom
host.render.three
host.runtime.nexusengine
host.input.browser
host.input.native
host.audio.browser
host.audio.native
host.storage.local
host.storage.native
host.editor
host.headless
```

Each can be represented by kits that own their domain-specific bridge services.

## Three Host

The Three host should be a host/render adapter kit bound to the `host.render.three` domain.

It may own:

- Three.js scene sync service.
- Renderer/camera/canvas mount references.
- Descriptor-to-Three conversion.
- Object lifecycle mapping.
- Resize and viewport bridge.
- Render frame submission.
- Render diagnostics.

It should not own:

- General game rules.
- Objective truth.
- Terrain simulation.
- Physics authority.
- Generic render descriptor schema.
- Product-specific DOM layout.

The correct split is:

```text
render-descriptor-kit
  domain: render.descriptor
  owns renderer-neutral scene meaning

material-domain-kit
  domain: render.material
  owns portable material meaning

three-host-kit
  domain: host.render.three
  owns descriptor -> Three.js object adaptation

browser composition
  owns page shell, canvas placement, UI, and public route
```

## DOM Host

The DOM can hold browser host mechanics, but it should not hold engine truth.

The DOM may own:

- Canvas element.
- Sizing and layout.
- Focus and pointer lock.
- Keyboard, pointer, touch, and visibility events.
- Debug panels.
- UI overlays.
- Browser asset URLs.
- Script and module loading shell.

The DOM should not own:

- Kit state.
- Domain ownership.
- Objective truth.
- Physics truth.
- Terrain truth.
- Descriptor schema.
- Save truth.

Flow:

```text
DOM event
  -> browser host captures input
  -> host sends semantic input to NexusEngine
  -> NexusEngine tick updates kits
  -> kits emit descriptors/events/resources
  -> Three host syncs descriptors into Three.js objects
  -> Three renders into DOM canvas
```

## NexusEngine Native Host

`nexusengine-host-kit` should represent the native NexusEngine host domain.

```text
nexusengine-host-kit
  domain: host.runtime.nexusengine
  owns: native runtime bridge service
  provides:
    - host.runtime.native
    - host.render.native
    - host.input.native
  requires:
    - render.descriptor
    - scene.ops
    - input.intent
```

NexusEngine can then act as the native shell for NexusEngine:

```text
NexusEngine
  - ECS
  - kits
  - domain services
  - SequenceNode orchestration

NexusEngine
  - native window
  - native renderer
  - filesystem
  - editor
  - packaging
  - native input/audio/GPU bridge
  - embedded or sidecar JS runtime host
```

The native host should consume the same descriptor, input, scene-op, audio, and diagnostic contracts that a browser host consumes.

## Universal Descriptor Stream

Hosts should communicate through neutral descriptors, not renderer-specific objects.

```text
kit output
  -> render descriptors
  -> mesh descriptors
  -> material descriptors
  -> light descriptors
  -> camera descriptors
  -> input/action descriptors
  -> scene op descriptors
```

Then each host adapts them:

```text
Three.js host
  -> THREE.Mesh
  -> THREE.Material
  -> THREE.Light

NexusEngine native host
  -> native GPU mesh buffers
  -> native materials
  -> native lights

Headless host
  -> descriptor hashes
  -> counts
  -> validation packets
```

The kit should not create renderer objects directly.

```text
bad:
  terrain kit imports Three.js and creates THREE.Mesh

good:
  terrain kit emits terrain/render descriptors
  three-host-kit converts descriptors to THREE.Mesh
  nexusengine-host-kit converts descriptors to native renderer input
```

## Descriptor Snapshot

A descriptor snapshot is the neutral proof artifact. It says:

```text
Given this kit graph, seed, config, and input,
what render-neutral scene description does the ecosystem produce?
```

It does not render, create Three.js objects, or call NexusEngine directly. It proves the shared language that all hosts can consume.

Example:

```json
{
  "frameId": 1,
  "revision": "demo-001",
  "meshes": [
    {
      "id": "cube-01",
      "kind": "box",
      "transform": {
        "position": [0, 1, 0],
        "scale": [1, 1, 1]
      },
      "materialId": "mat-red"
    }
  ],
  "materials": [
    {
      "id": "mat-red",
      "baseColor": "#b3261e",
      "roughness": 0.6,
      "metallic": 0
    }
  ],
  "lights": [
    {
      "id": "sun",
      "kind": "directional",
      "direction": [0.4, -1, 0.2],
      "intensity": 1
    }
  ],
  "camera": {
    "position": [3, 2, 5],
    "target": [0, 0, 0],
    "fov": 55
  }
}
```

## Streaming Contract

A host should support streaming descriptor changes, not only full snapshots.

```text
RenderFramePacket
  frameId
  revision
  adds[]
  updates[]
  removes[]
  meshes[]
  materials[]
  lights[]
  cameras[]
  diagnostics[]
```

Every host should report:

- Accepted descriptors.
- Rejected descriptors.
- Unsupported fields.
- Object counts.
- Descriptor hashes.
- Frame/revision status.
- Cleanup and disposal results.

## Compatibility Rule

Adding ideal hosts must be additive.

Do not break current NexusEngine compatibility:

- Keep existing ECS APIs.
- Keep existing kit install shape.
- Keep existing examples working.
- Keep existing browser hosts working.
- Keep existing `createEngine()` and `createRealtimeGame()` behavior.
- Add host graph and descriptor host behavior as new composition surfaces.

## Validation Direction

The first validation should prove one universal descriptor packet can drive multiple hosts.

```text
1. Headless NexusEngine snapshot
2. Three.js host scene
3. NexusEngine native host intake
```

Recommended first proof:

```text
universal render descriptor
  mesh: cube or plane
  material: baseColor, roughness, metallic
  light: directional + ambient
  camera: position, target, fov
  transform: position, rotation, scale
  streaming: add/update/remove descriptors
```

Success means:

```text
one kit composition
  -> one descriptor stream
    -> Three.js renders it
    -> NexusEngine native host accepts it
    -> headless validation can compare it
```

## Ideal Rule

```text
Kits are atoms.
Domains are ownership.
Composition is dependency wiring.
Nexus.Host owns runtime host lifecycle.
Graph Kit owns composition visibility.
Host Adapter Kits own platform bridges.
Individual kits own their domains.
```

The host stores loaded kits compositionally, but it must not become a god object.
