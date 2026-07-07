# Nexus Utility Domain

The Nexus Utility Domain is the core utility layer for reusable math, transform, camera, rig, IK, quaternion, and debug helpers.

It is not a gameplay domain. It is a foundation domain used by gameplay, camera, rigging, animation, physics, and editor kits.

## Core location

```text
src/core-kits/core-utility-kit/
```

## Utility kits

```text
transform-math-utility-kit
camera-control-utility-kit
rig-transform-utility-kit
two-bone-ik-utility-kit
quaternion-utility-kit
debug-draw-utility-kit
```

## Dependency direction

```text
Game / Experiment
→ Domain Kit
→ Utility Kit
→ Nexus Engine Core
```

## Why this exists

Character controllers, cameras, rigs, IK, and animation systems repeatedly need the same low-level operations:

```text
normalizeAngle
shortestAngle
forwardFromYaw
rightFromYaw
cameraRelativeWishVector
applyRootYawHandoff
quatAngleBetween
quatAlmostEqual
describeSegment
solveTwoBoneIK
jointSphere
limbSegment
```

These must not be rewritten inside every experiment. Rewriting them causes sign errors, local/world confusion, yaw drift, bad quaternion comparisons, and broken rig helpers.

## Current API

Import from the public engine index:

```js
import {
  createCoreUtilityKit,
  createTransformMathUtilityKit,
  createCameraControlUtilityKit,
  createRigTransformUtilityKit,
  createTwoBoneIKUtilityKit,
  createQuaternionUtilityKit,
  createDebugDrawUtilityKit
} from '@luminary-labs/nexus-engine';
```

Or from the core kit path:

```js
import { createCoreUtilityKit } from './src/core-kits/core-utility-kit/index.js';
```

## Promotion rule

A helper should move into the Nexus Utility Domain when it is needed by more than one domain or when a mistake in that helper can break camera, movement, rigging, IK, animation, or physics.
