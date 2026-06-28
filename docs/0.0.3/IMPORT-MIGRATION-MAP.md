# Import Migration Map

This file maps old flat imports to new core capability-domain imports.

## Umbrella factory map

```txt
createInputIntentKit
  old: import { createInputIntentKit } from "nexusrealtime"
  new: import { createCoreInputKit } from "nexusrealtime"

createRenderDescriptorKit
  old: import { createRenderDescriptorKit } from "nexusrealtime"
  new: import { createCoreGraphicsKit } from "nexusrealtime"

createInteractionTargetKit
  old: import { createInteractionTargetKit } from "nexusrealtime"
  new: import { createCoreInteractionKit } from "nexusrealtime"

createTimingWindowKit
  old: import { createTimingWindowKit } from "nexusrealtime"
  new: import { createCoreSimulationKit } from "nexusrealtime"

createResourcePressureKit
  old: import { createResourcePressureKit } from "nexusrealtime"
  new: import { createCoreSimulationKit } from "nexusrealtime"

createObjectiveFlowKit
  old: import { createObjectiveFlowKit } from "nexusrealtime"
  new: import { createCoreSimulationKit } from "nexusrealtime"

createTelemetryKit
  old: import { createTelemetryKit } from "nexusrealtime"
  new: import { createCoreDiagnosticsKit } from "nexusrealtime"
```

## Piece import map

```txt
Resource meters / pressure / timers
  new: import { createResourceMeter, createPressureChannel, createProgressTimer } from "nexusrealtime/core-kits/core-simulation-kit"

Input pieces
  new: import { createInputActionMap, createInputBindings, normalizeInputIntent } from "nexusrealtime/core-kits/core-input-kit"

Graphics pieces
  new: import { createRenderDescriptor, createMaterialDescriptor, createLightingDescriptor } from "nexusrealtime/core-kits/core-graphics-kit"

Interaction pieces
  new: import { createInteractionTarget, createAffordanceState, createInteractionPrompt } from "nexusrealtime/core-kits/core-interaction-kit"

MLNN pieces
  new: import { createModelRegistry, createInferenceRequest, createMockModelAdapter } from "nexusrealtime/core-kits/core-mlnn-kit"

Agent pieces
  new: import { createAgentState, createAgentObservation, createActionProposal } from "nexusrealtime/core-kits/core-agent-kit"
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
