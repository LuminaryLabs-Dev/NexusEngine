# Core Physics Domain

`createCorePhysicsDomain()` composes the existing root `core-physics-kit` with the `Articulated Dynamics` subdomain.

```txt
n:core-physics
└── n:core-physics:articulated-dynamics
```

Core Physics owns backend-neutral bodies, colliders, contacts, constraints, articulation inputs, provider boundaries, and normalized frames. Articulated Dynamics owns portable physical-joint, motor-target, ragdoll-weight, and articulated-frame state. Backend handles remain private to providers.
