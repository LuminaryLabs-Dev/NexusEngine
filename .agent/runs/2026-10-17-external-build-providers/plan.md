# Plan and source changes

1. Append config.additionalTargetProviders to the installed target registry after built-ins. Existing provider validation and collision checks remain authoritative.
2. Derive the allowed target set from the installed registry. Normalize explicit arrays in the existing target-set kit.
3. Keep MCP schemas unchanged because targets already accepts arbitrary strings; normalization rejects absent providers.
4. Document public factory configuration in a nongenerated guide. No new public export, domain or kit is added.

Required final-phase evidence: built-in target parity; explicit custom provider plan/apply through installed Build and MCP; duplicate ID rejection; unknown target rejection; registry reset; exact-plan and immutable-source rejection; existing build/domain/manifest checks. No tests, syntax checks, builds or validation are run now. Guided controller initialization, submit/promotion and Agora pin adoption remain pending.
