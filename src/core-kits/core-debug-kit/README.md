# Core Debug Kit

`core-debug` is the renderer-agnostic NexusEngine debug domain.

It publishes serializable descriptors for debug rays, points, scalars, state captures, and export packets. Hosts and experiments can render those descriptors through their own adapters, such as a Three.js ray adapter, without putting renderer objects into engine core.

## Domain

```txt
n:core-debug
engine.n.coreDebug
```

## Owns

- debug rays
- debug points
- debug scalars
- debug channel toggles
- frame-scoped descriptor clearing
- state capture packets
- full debug export packets

## Does not own

- Three.js meshes
- WebGL line objects
- DOM overlays
- external telemetry vendors

## Common ray convention

```txt
blue  = camera/rendered forward basis
green = movement wish or solved control direction
red   = actor/root facing direction
```

## Example

```js
const debug = engine.n.coreDebug;

debug.beginFrame({ frame: engine.clock.frame });
debug.clearFrame("third-person-follow-through");

debug.registerRay({
  id: "thirdPerson.camera.forward",
  scope: "third-person-follow-through",
  channel: "camera",
  color: "blue",
  origin: [0, 1.6, 0],
  direction: [0, 0, -1],
  length: 3,
  label: "camera forward"
});

debug.captureState("third-person-controller", {
  rootYawDeg: 0,
  cameraYawDeg: 0,
  movementYawDeg: 0
});

const packet = debug.exportState("third-person-controller");
```

## Renderer adapter boundary

A renderer adapter should read descriptors from `engine.n.coreDebug.getSnapshot()` or `engine.n.coreDebug.getDebugPacket()` and create renderer-specific objects outside core.

```txt
core-debug descriptors
  -> host renderer adapter
  -> visible debug rays / markers / panels
```
