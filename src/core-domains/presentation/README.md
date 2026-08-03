# Presentation Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:presentation`
- Status: `stable-candidate`
- Registry SHA-256: `f9e9afc0934ea34e93e2b4f6f579456c68c98752b57cc667310b9503c830bfef`
- Public entry: `nexusengine/domains/presentation`

## Responsibility

Own renderer-neutral presentation descriptors and output policy contracts.

## Owns

- output policy contracts
- presentation capability registry
- presentation descriptors

## Does Not Own

- DOM implementation
- audio playback
- authored visual presets
- renderer implementation

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:presentation:output` | Own surface, safe-area, viewport, aspect, bar, and render-resolution policy. |
| `n:presentation:graphics` | Own renderer-neutral material, lighting, VFX, reflection, quality, batch, and render graph descriptors. |
| `n:presentation:camera` | Own renderer-neutral camera targets, modes, smoothing, framing, and occlusion policy. |
| `n:presentation:animation` | Own animation, pose, blend, rig, and timeline descriptors. |
| `n:presentation:audio` | Own audio cue, music, ambience, mix, volume, and spatial audio descriptors. |
| `n:presentation:ui` | Own renderer-neutral HUD, menu, prompt, notification, focus, selection, accessibility, and scale descriptors. |
| `n:presentation:speech` | Own provider-neutral speech requests, voices, utterance lifecycle, and synthesis result contracts. |
| `n:presentation:capture` | Own observation requests, view sets, framing, capture jobs, progress, and result contracts. |
| `n:presentation:sky` | Own generic sky, atmosphere, cloud, horizon, and celestial descriptors. |
| `n:presentation:camera:third-person` | Own renderer-neutral third-person camera follow descriptors. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `presentation-registry-kit` | `nexusengine/domains/presentation/registry` | Register renderer-neutral presentation capabilities and descriptors. |
| `presentation-output-kit` | `nexusengine/domains/presentation/output` | Calculate renderer-neutral surfaces, safe areas, viewports, aspect policy, and render resolution. |
| `graphics-descriptor-kit` | `nexusengine/domains/presentation/graphics` | Create renderer-neutral material, lighting, VFX, quality, batch, and terrain LOD descriptors. |
| `render-layer-graph-kit` | `nexusengine/domains/presentation/graphics/render-graph` | Validate renderer-neutral render layers, dependencies, and pass ordering. |
| `reflection-descriptor-kit` | `nexusengine/domains/presentation/graphics/reflection` | Describe renderer-neutral reflection probes, plans, and update policy. |
| `camera-descriptor-kit` | `nexusengine/domains/presentation/camera` | Manage camera targets, modes, smoothing, and renderer-neutral camera policy. |
| `camera-framing-kit` | `nexusengine/domains/presentation/camera/framing` | Calculate perspective and orthographic subject framing for a viewport. |
| `camera-control-math-kit` | `nexusengine/domains/presentation/camera/control-math` | Calculate camera-relative yaw, orbit limits, and root handoff state. |
| `animation-descriptor-kit` | `nexusengine/domains/presentation/animation` | Manage animation clips, poses, blends, transitions, and timeline descriptors. |
| `rig-transform-kit` | `nexusengine/domains/presentation/animation/rig` | Create neutral joint, limb, and rig transform descriptors. |
| `audio-descriptor-kit` | `nexusengine/domains/presentation/audio` | Manage renderer-neutral audio cues, mix groups, volume policy, and spatial audio descriptors. |
| `ui-descriptor-kit` | `nexusengine/domains/presentation/ui` | Manage renderer-neutral UI, focus, selection, prompt, notification, and accessibility descriptors. |
| `ui-scale-kit` | `nexusengine/domains/presentation/ui/scale` | Calculate deterministic reference-resolution and UI scale policy. |
| `speech-contract-kit` | `nexusengine/domains/presentation/speech` | Manage provider-neutral speech requests, voices, utterance lifecycle, and synthesis results. |
| `capture-contract-kit` | `nexusengine/domains/presentation/capture` | Manage observation requests, view sets, framing, capture jobs, progress, and result contracts. |
| `sky-descriptor-kit` | `nexusengine/domains/presentation/sky` | Create generic sky, horizon, atmosphere, cloud, and celestial descriptors. |
| `third-person-camera-kit` | `nexusengine/domains/presentation/camera/third-person` | Produce deterministic renderer-neutral third-person camera descriptors from public Character and Motion bindings. |

## Lifecycle

- Duplicate install: Return the installed Presentation API without duplicate state or systems.
- Snapshot: Serialize Presentation state and descriptors.
- Reset: Restore the configured Presentation baseline.
