# core-policy-kit

Purpose: permissions, guards, allowed/blocked actions, sandbox rules, tool/action policies, runtime checks, and promotion restrictions.

Owns: policy descriptors, permission gates, action validation, sandbox constraints, and promotion rules.

Does not own: agent planning or project-specific product policy.

Public API: `createCorePolicyKit(config?)`.

Proof required: allowed action smoke, blocked action smoke, sandbox rule smoke, deterministic headless smoke.
