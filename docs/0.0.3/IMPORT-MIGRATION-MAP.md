# Import Migration Map

This file maps old flat imports to new core capability-domain imports.

## Factory map

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

## Engine namespace map

```txt
engine.inputIntent       -> engine.n.coreInput
engine.renderDescriptors -> engine.n.coreGraphics
engine.interactionTargets -> engine.n.coreInteraction
engine.timingWindows     -> engine.n.coreSimulation
engine.resourcePressure  -> engine.n.coreSimulation
engine.objectiveFlow     -> engine.n.coreSimulation
engine.telemetry         -> engine.n.coreDiagnostics
```

## Note

Old imports are still visible in the first implementation pass. They may be removed in a later `refactor!` commit after downstream apps update.
