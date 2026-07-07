export const NEXUS_UTILITY_DOMAIN = Object.freeze({
  id: 'nexus-utility-domain',
  domain: 'core-utility',
  title: 'Nexus Utility Domain',
  purpose: 'Core utility kits for shared transform, angle, vector, quaternion, camera, rig, IK, and debug math.',
  kits: Object.freeze([
    'transform-math-utility-kit',
    'camera-control-utility-kit',
    'rig-transform-utility-kit',
    'two-bone-ik-utility-kit',
    'quaternion-utility-kit',
    'debug-draw-utility-kit'
  ])
});

export function createUtilityRegistry(extraKits = []) {
  return Object.freeze({
    ...NEXUS_UTILITY_DOMAIN,
    kits: Object.freeze([...NEXUS_UTILITY_DOMAIN.kits, ...extraKits])
  });
}
