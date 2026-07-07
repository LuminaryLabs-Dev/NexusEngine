import { createCoreCapabilityKit } from '../core-capability-kit.js';
import { createCameraControlUtilityKit } from './camera-control-utility-kit.js';
import { createDebugDrawUtilityKit } from './debug-draw-utility-kit.js';
import { createQuaternionUtilityKit } from './quaternion-utility-kit.js';
import { createRigTransformUtilityKit } from './rig-transform-utility-kit.js';
import { createTransformMathUtilityKit } from './transform-math-utility-kit.js';
import { createTwoBoneIKUtilityKit } from './two-bone-ik-utility-kit.js';
import { createUtilityRegistry, NEXUS_UTILITY_DOMAIN } from './utility-registry.js';

export * from './camera-control-utility-kit.js';
export * from './debug-draw-utility-kit.js';
export * from './quaternion-utility-kit.js';
export * from './rig-transform-utility-kit.js';
export * from './transform-math-utility-kit.js';
export * from './two-bone-ik-utility-kit.js';
export * from './utility-registry.js';

export function createCoreUtilityKit(config = {}) {
  const utilities = Object.freeze({
    transformMath: createTransformMathUtilityKit(),
    cameraControl: createCameraControlUtilityKit(),
    rigTransform: createRigTransformUtilityKit(),
    twoBoneIK: createTwoBoneIKUtilityKit(),
    quaternion: createQuaternionUtilityKit(),
    debugDraw: createDebugDrawUtilityKit()
  });

  return createCoreCapabilityKit({
    ...config,
    domain: 'core-utility',
    apiName: config.apiName ?? 'coreUtility',
    purpose: 'Nexus Utility Domain: shared utility kits for transform math, camera control, rig transforms, IK, quaternions, and debug draw descriptors.',
    owns: ['utility registry', 'transform math helpers', 'camera control helpers', 'rig transform helpers', 'IK helpers', 'quaternion helpers', 'debug draw descriptors'],
    doesNotOwn: ['gameplay rules', 'renderer objects', 'physics integration', 'animation clips'],
    services: ['utilityKits', 'utilityRegistry'],
    metadata: { ...(config.metadata ?? {}), utilityDomain: NEXUS_UTILITY_DOMAIN },
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getUtilityRegistry() {
          return createUtilityRegistry();
        },
        getUtilityKit(name) {
          return utilities[name] ?? null;
        },
        utilities
      };
    }
  });
}
