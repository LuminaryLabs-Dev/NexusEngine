# Breaking Changes

This file tracks intentional breaking changes for the core capability-domain rebuild.

## Current status

```txt
Breaking compatibility removed: no
Old flat imports still visible: yes
New core capability imports added: yes
```

## Added public exports

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

## Future removals

Old flat kit imports may be removed later after app migration docs are complete.

```txt
createInputIntentKit       -> createCoreInputKit
createRenderDescriptorKit  -> createCoreGraphicsKit
createInteractionTargetKit -> createCoreInteractionKit
createTimingWindowKit      -> createCoreSimulationKit
createResourcePressureKit  -> createCoreSimulationKit
createObjectiveFlowKit     -> createCoreSimulationKit
createTelemetryKit         -> createCoreDiagnosticsKit
```

## Rule

Do not silently break downstream apps. Any future removal must update this file, `APP-MIGRATION-GUIDE.md`, `IMPORT-MIGRATION-MAP.md`, and `BUILD-AND-VERIFY.md`.
