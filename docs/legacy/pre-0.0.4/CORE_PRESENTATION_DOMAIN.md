# Core Presentation Domain

The optional core presentation domain separates platform measurement, presentation policy, subject framing, and renderer application.

```txt
Browser/native host measures the surface.
n:presentation:output computes aspect, viewport, bars, safe area, and render resolution.
n:presentation:ui-scale computes reference-resolution UI scale.
n:presentation:camera-framing fits subject bounds to the active viewport.
Renderer adapters apply the descriptors.
```

## Installation

```js
import { createCorePresentationDomain, createRealtimeGame } from "nexusengine";

const engine = createRealtimeGame({
  kits: createCorePresentationDomain({
    output: { referenceAspect: 16 / 9, frameMode: "contain" },
    ui: { referenceWidth: 1920, referenceHeight: 1080 },
    framing: { padding: 1.18, smoothTime: 0.18 }
  })
});
```

The domain is recommended for visual hosts and omitted from headless simulations by default.
