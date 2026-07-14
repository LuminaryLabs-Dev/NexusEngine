// Temporary compatibility bridge.
//
// Core capability domain ownership now lives kit-by-kit under:
//   src/core-kits/<core-kit>/index.js
//
// Keep this file only until all downstream imports use the local kit folders
// or the public top-level exports from src/index.js.

export { createCoreDataKit } from "./core-data-kit/index.js";
export { createCoreObjectFidelityKit } from "./core-object-fidelity-kit/index.js";
export { createCoreCaptureKit } from "./core-capture-kit/index.js";
export { createCorePersistenceKit } from "./core-persistence-kit/index.js";
export { createCoreAssetsKit } from "./core-assets-kit/index.js";
export { createCorePlatformKit } from "./core-platform-kit/index.js";
export { createCoreStartupKit } from "./core-startup-kit/index.js";
export { createCoreInputKit } from "./core-input-kit/index.js";
export { createCoreSpatialKit } from "./core-spatial-kit/index.js";
export { createCoreSceneKit } from "./core-scene-kit/index.js";
export { createCorePhysicsKit } from "./core-physics-kit/index.js";
export { createCoreMotionKit } from "./core-motion-kit/index.js";
export { createCoreSimulationKit } from "./core-simulation-kit/index.js";
export { createCoreComputeKit } from "./core-compute-kit/index.js";
export { createCoreInteractionKit } from "./core-interaction-kit/index.js";
export { createCoreGraphicsKit } from "./core-graphics-kit/index.js";
export { createCoreCameraKit } from "./core-camera-kit/index.js";
export { createCoreAnimationKit } from "./core-animation-kit/index.js";
export { createCoreAudioKit } from "./core-audio-kit/index.js";
export { createCoreUIKit } from "./core-ui-kit/index.js";
export { createCoreNetworkKit } from "./core-network-kit/index.js";
export { createCoreDiagnosticsKit } from "./core-diagnostics-kit/index.js";
export { createCoreDebugKit } from "./core-debug-kit/index.js";
export { createCoreHeadlessEditorKit } from "./core-headless-editor-kit/index.js";
export { createCorePolicyKit } from "./core-policy-kit/index.js";
export { createCoreCompositionKit } from "./core-composition-kit/index.js";
export { createCoreMLNNKit } from "./core-mlnn-kit/index.js";
export { createCoreAgentKit } from "./core-agent-kit/index.js";
export { createCoreUtilityKit } from "./core-utility-kit/index.js";
