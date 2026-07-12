# Core Motion and Core Physics Hierarchy

Status: implemented on `main`

## Domain graph

```txt
n:core-motion
└── n:core-motion:articulation

n:core-physics
└── n:core-physics:articulated-dynamics
```

Core Animation remains a sibling domain. It owns authored and time-driven pose sources. Articulated Motion owns renderer-neutral rig registration, pose descriptors, inverse-kinematics targets, and kinematic pose resolution. Articulated Dynamics owns portable physical articulations, joints, motor requests, ragdoll weights, and normalized dynamics frames.

## Factories

```js
createCoreMotionKit(config)
createCoreMotionDomain(config)
createArticulatedMotionDomain(config)

createCorePhysicsKit(config)
createCorePhysicsDomain(config)
createArticulatedDynamicsDomain(config)
createArticulatedMotionDriveAdapter(config)
```

The umbrella factories return ordered kit arrays:

```js
const motionKits = createCoreMotionDomain();
const physicsKits = createCorePhysicsDomain();
```

Consumers that only need the original root capabilities can continue using `createCoreMotionKit()` and `createCorePhysicsKit()` directly.

## Ownership

### Core Motion

Owns movement modes, desired velocity and facing, acceleration and deceleration policy, trajectories, root-motion requests, and serializable motion frames.

Does not own physical contacts, renderer transforms, or articulated rig solving.

### Articulated Motion

Owns rigs, rest poses, chains, IK targets, kinematic pose resolution, diagnostics, snapshots, and reset.

It uses pure mathematical solvers from Core Utility and does not require a physics provider.

### Core Physics

Owns backend-neutral body, collider, motion-request, contact, constraint, articulation, joint-motor, and normalized-frame contracts.

Only `step()` and `getFrame()` remain mandatory provider methods. Existing providers may omit articulated methods.

### Articulated Dynamics

Owns portable articulation descriptors, physical joints, motor targets, ragdoll blend state, articulated dynamics frames, snapshots, and reset.

Backend handles remain private to physics providers.

## Physical articulation bridge

`createArticulatedMotionDriveAdapter()` converts a desired articulated pose into joint-motor requests and can blend normalized physical pose feedback into a target pose.

```txt
animation pose
  -> articulated-motion correction
  -> desired pose
  -> pose-to-motor adapter
  -> articulated dynamics
  -> normalized physical feedback
  -> final pose
```

## Compatibility policy

- Existing Core Motion and Core Physics factory names and domain paths remain available.
- Existing physics providers continue to work without implementing joints or articulations.
- Existing movement, ragdoll, animation, and renderer adapters remain compatibility surfaces.
- Articulated dynamics is opt-in. Installing the domain does not automatically create per-bone rigid bodies.
- Renderer objects and backend physics handles never enter public snapshots or frames.

## Validation

The normal NexusEngine test runner includes smoke coverage for:

```txt
Core Motion intent, trajectory, frame, snapshot, reset, and custom API compatibility
Core Utility IK and quaternion operations
Articulated rig validation and two-bone IK pose resolution
Core Physics legacy-provider compatibility and normalized articulation arrays
Articulated Dynamics contracts, motor requests, snapshots, and fake-provider bridge behavior
Public API and recursive public-entrypoint validation
```
