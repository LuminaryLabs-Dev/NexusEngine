# Import Migration Map

This file maps old flat imports to new core capability-domain imports.

## Umbrella factory map

```txt
createInputIntentKit
  old: import { createInputIntentKit } from "nexusengine"
  new: import { createCoreInputKit } from "nexusengine"

createRenderDescriptorKit
  old: import { createRenderDescriptorKit } from "nexusengine"
  new: import { createCoreGraphicsKit } from "nexusengine"

createInteractionTargetKit
  old: import { createInteractionTargetKit } from "nexusengine"
  new: import { createCoreInteractionKit } from "nexusengine"

createTimingWindowKit
  old: import { createTimingWindowKit } from "nexusengine"
  new: import { createCoreSimulationKit } from "nexusengine"

createResourcePressureKit
  old: import { createResourcePressureKit } from "nexusengine"
  new: import { createCoreSimulationKit } from "nexusengine"

createObjectiveFlowKit
  old: import { createObjectiveFlowKit } from "nexusengine"
  new: import { createCoreSimulationKit } from "nexusengine"

createTelemetryKit
  old: import { createTelemetryKit } from "nexusengine"
  new: import { createCoreDiagnosticsKit } from "nexusengine"
```

## Piece import map

```txt
Resource meters / pressure / timers
  new: import { createResourceMeter, createPressureChannel, createProgressTimer } from "nexusengine/core-kits/core-simulation-kit"

Input pieces
  new: import { createInputActionMap, createInputBindings, normalizeInputIntent } from "nexusengine/core-kits/core-input-kit"

Graphics pieces
  new: import { createRenderDescriptor, createMaterialDescriptor, createLightingDescriptor } from "nexusengine/core-kits/core-graphics-kit"

Interaction pieces
  new: import { createInteractionTarget, createAffordanceState, createInteractionPrompt } from "nexusengine/core-kits/core-interaction-kit"

MLNN pieces
  new: import { createModelRegistry, createInferenceRequest, createMockModelAdapter } from "nexusengine/core-kits/core-mlnn-kit"

Agent pieces
  new: import { createAgentState, createAgentObservation, createActionProposal } from "nexusengine/core-kits/core-agent-kit"
```

## Engine namespace map

```txt
engine.inputIntent        -> engine.n.coreInput
engine.renderDescriptors  -> engine.n.coreGraphics
engine.interactionTargets -> engine.n.coreInteraction
engine.timingWindows      -> engine.n.coreSimulation
engine.resourcePressure   -> engine.n.coreSimulation
engine.objectiveFlow      -> engine.n.coreSimulation
engine.telemetry          -> engine.n.coreDiagnostics
```

## Note

Old imports are still visible in the first implementation pass. They may be removed in a later `refactor!` commit after downstream apps update.
