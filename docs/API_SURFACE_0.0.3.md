# NexusEngine API Surface 0.0.3

## Status

`0.0.3` is a release-hardening line for the NexusEngine runtime substrate, runtime-kit contract, Domain Service Kit contract, core capability-kit pattern, surfaces, sequences, and public package exports.

## Stable-candidate runtime surface

These APIs are treated as the core 0.0.3 surface:

```txt
createEngine
createRealtimeEngine
createRealtimeGame
createGameKitComposer
createWorld
createScheduler
defineComponent
defineResource
defineEvent
createEventSurface
createResourceSurface
createQuerySurface
createLifecycleSurface
defineRuntimeKit
installRuntimeKit
validateRuntimeKit
createDomainServiceToken
defineDomainServiceKit
extendDomainServiceKit
isDomainServiceKit
validateDomainServiceKit
createSequenceRuntime
createSequenceNodeRuntime
createSequenceNodeKit
createCoreCapabilityKit
createCoreCapabilityDescriptor
```

## Release metadata

```txt
NEXUS_ENGINE_VERSION
NEXUS_ENGINE_STABILITY
NEXUS_ENGINE_RELEASE_BRANCH
NEXUS_ENGINE_RELEASE
```

## Core capability kit surface

The 0.0.3 release line treats the `src/core-kits/` family as the stable-candidate domain center:

```txt
createCoreDataKit
createCorePersistenceKit
createCoreAssetsKit
createCorePlatformKit
createCoreInputKit
createCoreSpatialKit
createCoreSceneKit
createCorePhysicsKit
createCoreMotionKit
createCoreSimulationKit
createCoreInteractionKit
createCoreGraphicsKit
createCoreCameraKit
createCoreAnimationKit
createCoreAudioKit
createCoreUIKit
createCoreNetworkKit
createCoreDiagnosticsKit
createCorePolicyKit
createCoreCompositionKit
createCoreMLNNKit
createCoreAgentKit
```

## Stable-compat legacy surface

The broad top-level exports in `src/index.js` remain import-compatible for 0.0.3, but not all of them are promoted to the stable core contract. Legacy gameplay, AR, host, renderer, scenario, and older kit exports are `stable-compat` until each one has an explicit domain manifest, smoke test, snapshot/reset policy, and promotion decision.

## Release gate

The release branch must pass:

```bash
npm test
npm run test:release
npm run release:manifest
```

The final `0.0.3` branch should not be cut until the release gate has a recorded pass report.
