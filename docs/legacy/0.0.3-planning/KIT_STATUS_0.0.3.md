# NexusEngine Kit Status 0.0.3

## Status taxonomy

| Status | Meaning |
|---|---|
| `stable-core` | Runtime substrate or contract surface that belongs in `nexusengine` core. |
| `stable-candidate` | Core capability kit using the 0.0.3 DSK/core-capability contract. |
| `stable-compat` | Export preserved for compatibility but not yet upgraded to a manifest-grade 0.0.3 kit. |
| `adapter-host` | Host, renderer, platform, AR/XR, shader, or presentation-facing surface. |
| `incubating` | Belongs in ProtoKits until promotion criteria pass. |
| `deprecated` | Needs a migration path or removal plan. |

## Stable-core

```txt
ecs
engine
surfaces
runtime-kit
domain-service-kit
game-kit-composer
sequences
sequence-node
sequence-node-library
sequence-node-kit
foundation
release
```

## Stable-candidate core kits

```txt
core-data-kit
core-persistence-kit
core-assets-kit
core-platform-kit
core-input-kit
core-spatial-kit
core-scene-kit
core-physics-kit
core-motion-kit
core-simulation-kit
core-interaction-kit
core-graphics-kit
core-camera-kit
core-animation-kit
core-audio-kit
core-ui-kit
core-network-kit
core-diagnostics-kit
core-policy-kit
core-composition-kit
core-mlnn-kit
core-agent-kit
```

## Stable-compat exports pending promotion decision

The broad top-level kit exports remain available in 0.0.3 for compatibility. They must be audited one-by-one before they are described as stable promoted domain kits.

## Adapter-host exports

Host, renderer, shader, AR, and platform-facing exports are adapter-host surfaces. They must present descriptors, input, host lifecycle, or platform bridges. They must not own gameplay truth.

## 0.0.3 promotion rule

A kit can move from `stable-compat` or `incubating` to `stable-candidate` only when it has:

```txt
stable domain name
runtime install path
requires/provides tokens
README
machine-readable manifest or descriptor metadata
headless smoke test
snapshot/reset policy if stateful
no renderer-owned gameplay
no DOM/Canvas/Three/WebGL dependency unless explicitly adapter-host
```
