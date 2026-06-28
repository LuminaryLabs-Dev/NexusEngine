# core-input-kit

Purpose: semantic input actions, axes, bindings, contexts, rebinding, dead zones, and input adapter boundaries.

Owns: input intent, action states, action events, input contexts, device mapping descriptors.

Does not own: motion policy, interaction results, or platform-specific UI.

Public API: `createCoreInputKit(config?)` plus seed exports from `input-intent-kit.js`.

Proof required: keyboard/gamepad-style data config smoke, snapshot/reset, action event smoke, deterministic headless smoke.
