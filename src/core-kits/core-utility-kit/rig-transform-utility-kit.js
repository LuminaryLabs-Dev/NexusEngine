import { directionBetween, midpoint, segmentLength } from './transform-math-utility-kit.js';

export function createJointDescriptor(name, localPosition = { x: 0, y: 0, z: 0 }, radius = 0.05) {
  return { name, localPosition: { ...localPosition }, radius };
}

export function createLimbDescriptor(name, startJoint, endJoint, radius = 0.025) {
  return { name, startJoint, endJoint, radius };
}

export function describeSegment(start, end, radius = 0.025) {
  return {
    start: { ...start },
    end: { ...end },
    center: midpoint(start, end),
    direction: directionBetween(start, end),
    length: segmentLength(start, end),
    radius
  };
}

export function createHumanoidJointSet() {
  return {
    root: createJointDescriptor('root', { x: 0, y: 0, z: 0 }),
    pelvis: createJointDescriptor('pelvis', { x: 0, y: 0.82, z: 0 }),
    spine01: createJointDescriptor('spine01', { x: 0, y: 1.12, z: 0 }),
    chest: createJointDescriptor('chest', { x: 0, y: 1.42, z: 0 }),
    neck: createJointDescriptor('neck', { x: 0, y: 1.58, z: 0 }),
    head: createJointDescriptor('head', { x: 0, y: 1.72, z: 0 }),
    leftUpperArm: createJointDescriptor('leftUpperArm', { x: -0.48, y: 1.42, z: 0 }),
    leftForeArm: createJointDescriptor('leftForeArm', { x: -0.88, y: 1.18, z: 0 }),
    leftHand: createJointDescriptor('leftHand', { x: -1.08, y: 0.93, z: 0 }),
    rightUpperArm: createJointDescriptor('rightUpperArm', { x: 0.48, y: 1.42, z: 0 }),
    rightForeArm: createJointDescriptor('rightForeArm', { x: 0.88, y: 1.18, z: 0 }),
    rightHand: createJointDescriptor('rightHand', { x: 1.08, y: 0.93, z: 0 }),
    leftThigh: createJointDescriptor('leftThigh', { x: -0.28, y: 0.62, z: 0 }),
    leftCalf: createJointDescriptor('leftCalf', { x: -0.33, y: 0.32, z: 0 }),
    leftFoot: createJointDescriptor('leftFoot', { x: -0.33, y: 0.08, z: -0.22 }),
    rightThigh: createJointDescriptor('rightThigh', { x: 0.28, y: 0.62, z: 0 }),
    rightCalf: createJointDescriptor('rightCalf', { x: 0.33, y: 0.32, z: 0 }),
    rightFoot: createJointDescriptor('rightFoot', { x: 0.33, y: 0.08, z: -0.22 })
  };
}

export function createHumanoidLimbSet() {
  return [
    createLimbDescriptor('root_to_pelvis', 'root', 'pelvis'),
    createLimbDescriptor('pelvis_to_spine01', 'pelvis', 'spine01'),
    createLimbDescriptor('spine01_to_chest', 'spine01', 'chest'),
    createLimbDescriptor('chest_to_neck', 'chest', 'neck'),
    createLimbDescriptor('neck_to_head', 'neck', 'head'),
    createLimbDescriptor('leftUpperArm_to_leftForeArm', 'leftUpperArm', 'leftForeArm'),
    createLimbDescriptor('leftForeArm_to_leftHand', 'leftForeArm', 'leftHand'),
    createLimbDescriptor('rightUpperArm_to_rightForeArm', 'rightUpperArm', 'rightForeArm'),
    createLimbDescriptor('rightForeArm_to_rightHand', 'rightForeArm', 'rightHand'),
    createLimbDescriptor('leftThigh_to_leftCalf', 'leftThigh', 'leftCalf'),
    createLimbDescriptor('leftCalf_to_leftFoot', 'leftCalf', 'leftFoot'),
    createLimbDescriptor('rightThigh_to_rightCalf', 'rightThigh', 'rightCalf'),
    createLimbDescriptor('rightCalf_to_rightFoot', 'rightCalf', 'rightFoot')
  ];
}

export function createRigTransformUtilityKit() {
  return Object.freeze({
    id: 'rig-transform-utility-kit',
    createJointDescriptor,
    createLimbDescriptor,
    describeSegment,
    createHumanoidJointSet,
    createHumanoidLimbSet
  });
}
