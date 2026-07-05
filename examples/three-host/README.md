# Three Host Descriptor Example

This example is an additive proof for the ideal `Nexus.Host` direction. It does not change NexusEngine core, package exports, tests, or existing examples.

## Purpose

Prove that one host graph and one renderer-neutral descriptor stream can be consumed by a Three.js host now and by a NexusEngine native host later.

```text
Nexus.Host
  -> graph-kit snapshot
  -> render descriptor stream
  -> host adapter
```

The example keeps host behavior separate from domain behavior:

```text
render-descriptor-kit
  domain: render.descriptor
  owns renderer-neutral scene meaning

three-host-kit
  domain: host.render.three
  owns descriptor -> Three.js object adaptation

nexusengine-host-kit
  domain: host.runtime.nexusengine
  future native host intake
```

## Files

```text
descriptor-snapshot.mjs
  Builds a deterministic JSON-compatible host graph and render descriptor packet.

index.html
  Loads the same descriptor packet and adapts it into a small Three.js scene.
```

## Run

```bash
cd /Users/crimsonwheeler/Documents/GitHub/NexusEngine
node examples/three-host/descriptor-snapshot.mjs
```

Open the browser proof:

```text
/Users/crimsonwheeler/Documents/GitHub/NexusEngine/examples/three-host/index.html
```

If a browser blocks local module imports from `file://`, serve the repo with any local static server and open:

```text
examples/three-host/index.html
```

## Compatibility Rule

This example must stay isolated. It should not:

- edit `src/`
- change `package.json`
- add dependencies
- rewrite existing examples
- promote `Nexus.Host` as a public API before dedicated compatibility proof

## Validation Meaning

Passing this example means the descriptor shape is usable by a Three.js host. It does not mean NexusEngine native host support exists yet.

