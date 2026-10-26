# External build providers for Agora

Extend the existing n:build target-registry and target-set composition so host applications can supply explicit additional build target providers through createBuildDomain({additionalTargetProviders:[provider]}). Preserve the existing built-in targets, collision rejection, exact-plan approval, isolated stages and source-immutability checks. Keep concrete Agora packaging outside Core; do not add a new domain.

User explicitly requires all source to be written before tests/builds/validation. This run is source read/plan and implementation only. Promotion, generated evidence, controller submit, final checks and adoption of an updated Agora engine pin remain pending until the final validation phase. Do not modify the existing completed run or generated tracker.
