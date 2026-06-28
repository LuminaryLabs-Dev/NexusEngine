# core-interaction-kit

Purpose: target, affordance, prompt, activation, and interaction event contracts.

Owns: interactable targets, affordance state, activation progress, semantic action requirements, prompts, and interaction completion events.

Does not own: raw input devices or UI rendering.

Public API: `createCoreInteractionKit(config?)` plus seed exports from `interaction-target-kit.js`.

Proof required: target descriptor smoke, affordance state smoke, policy override smoke, deterministic headless smoke.
