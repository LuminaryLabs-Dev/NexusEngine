import { materialResource } from 'nexusengine/domains/render/graphics-language';
import { createMaterialDescriptor } from 'nexusengine/domains/material';
export const identity = () => [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export function transform(x = 0, y = 0, z = 0, angle = 0, sx = 1, sy = 1) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c*sx,s*sx,0,0,-s*sy,c*sy,0,0,0,0,1,0,x,y,z,1];
}
const quad = (id, width, height) => ({ id, kind: 'geometry', data: {
  positions: [-width/2,-height/2,0,width/2,-height/2,0,width/2,height/2,0,-width/2,height/2,0],
  normals: [0,0,1,0,0,1,0,0,1,0,0,1], uvs: [0,1,1,1,1,0,0,0], indices: [0,1,2,0,2,3], castsShadow: false
} });
export function sceneResources() {
  const pixels = [], cutout = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const c = (x+y)%2 ? [230,165,55,255] : [45,135,200,255];
    pixels.push(...c); cutout.push(70,220,135,(x+y)%2 ? 255 : 0);
  }
  return [
    { id: 'checker', kind: 'texture', data: { width: 8, height: 8, rgba: pixels, filter: 'nearest' } },
    { id: 'holes', kind: 'texture', data: { width: 8, height: 8, rgba: cutout, filter: 'nearest' } },
    materialResource(createMaterialDescriptor({ id: 'opaque', kind: 'standard', color: [1,1,1], roughness: .7, metalness: .1, textures: { baseColor: 'checker' } })),
    materialResource(createMaterialDescriptor({ id: 'cutout', kind: 'basic', textures: { baseColor: 'holes' } }), { alphaMode: 'mask', alphaCutoff: .5 }),
    materialResource(createMaterialDescriptor({ id: 'glass', kind: 'basic', color: [.18,.45,1], transparent: true, opacity: .48 })),
    quad('panel', .75, 1.15), quad('window', .85, 1.05), quad('overlay', .9, .9)
  ];
}
export async function populate(graphics) {
  for (const resource of sceneResources()) await graphics.createResource(resource);
}
export function sceneFrame(frameId = 'scene', angle = 0, width = 480, height = 280, quality = 'native') {
  const cameraX = Math.sin(angle)*.12;
  // Right-handed orthographic camera at +Z looking toward -Z, near .1/far 10.
  const projection = identity(); projection[10] = -1/9.9; projection[14] = 4.9/9.9; projection[12] = -cameraX;
  return { frame: { frameId, width, height, quality, clear: [22,29,43,255], view: { projection, camera: [cameraX,0,5], shadowResolution: 64, exposure: 1 }, light: { intensity: 1.4, fill: .4 } },
    draws: [
      { instanceId: 'panel', geometryId: 'panel', materialId: 'opaque', transform: transform(-.56,0,0,angle,1,1) },
      { instanceId: 'window', geometryId: 'window', materialId: 'cutout', transform: transform(.02,0,.2,-angle*.6) },
      { instanceId: 'overlay', geometryId: 'overlay', materialId: 'glass', transform: transform(.5,-.12,.4,angle*.4) }
    ] };
}

// Camera-only fixture deliberately leaves every instance transform unchanged.
export function cameraFrame(frameId='camera', angle=0, width=480, height=280, quality='native') {
  const scene=sceneFrame(frameId,0,width,height,quality);
  scene.frame.view=sceneFrame(frameId,angle,width,height,quality).frame.view;
  return scene;
}
