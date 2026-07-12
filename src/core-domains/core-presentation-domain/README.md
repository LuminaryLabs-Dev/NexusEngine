# Core Presentation Domain

`n:presentation` is an optional promoted domain family for visual applications.

```txt
host measures the platform
-> presentation-output determines viewport and render policy
-> ui-scale determines reference-resolution scale
-> camera-framing fits subjects to the active viewport
-> renderer adapter applies descriptors
```

It is not installed automatically. Browser, desktop, mobile, and editor hosts should opt in. Headless simulations and dedicated servers can omit it.

The domain is renderer-neutral. DOM measurement and Three.js mutation live in adapters outside domain state.
