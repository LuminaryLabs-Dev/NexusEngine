# Core Motion Domain

`createCoreMotionDomain()` composes the existing root `core-motion-kit` with the `Articulated Motion` subdomain.

```txt
n:core-motion
└── n:core-motion:articulation
```

Core Motion owns desired root movement. Articulated Motion owns renderer-neutral rigs, poses, IK targets, and kinematic pose resolution. Physics contact resolution and renderer bones remain outside this domain.
