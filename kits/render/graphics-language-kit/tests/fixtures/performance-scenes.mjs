// Small bounded workload shared by the repeatable renderer benchmark.
export function performanceScene(instances = 24) {
  if (!Number.isSafeInteger(instances) || instances < 1 || instances > 4096) throw RangeError('instances must be 1..4096');
  const quad = { positions: [-.12,-.14,0,.12,-.14,0,.12,.14,0,-.12,.14,0], normals: [0,0,1,0,0,1,0,0,1,0,0,1], uvs: [0,1,1,1,1,0,0,0], indices: [0,1,2,0,2,3], castsShadow: true };
  const resources = [
    { id: 'tile', kind: 'geometry', data: quad },
    { id: 'pattern', kind: 'texture', data: { width: 2, height: 2, rgba: [255,180,70,255,50,150,240,255,40,200,80,0,220,90,110,255], filter: 'bilinear' } },
    { id: 'opaque', kind: 'material', data: { shading: 'pbr', tint: [.8,.9,1], colorTexture: 'pattern', roughness: .7, metallic: .1 } },
    { id: 'mask', kind: 'material', data: { shading: 'toon', colorTexture: 'pattern', alphaMode: 'mask', alphaCutoff: .5 } },
    { id: 'blend', kind: 'material', data: { shading: 'unlit', tint: [.3,.5,1], alphaMode: 'blend', opacity: .45 } }
  ];
  const draws = [];
  const columns = Math.ceil(Math.sqrt(instances * 1.5)), rows = Math.ceil(instances / columns);
  for (let index = 0; index < instances; index++) {
    const row = Math.floor(index / columns), column = index % columns;
    const x = instances === 24 ? (column - 2.5) * .3 : (column - (columns-1)/2) * (1.8/columns);
    const y = instances === 24 ? (row - 1.5) * .42 : (row - (rows-1)/2) * (1.68/rows);
    const z = instances === 24 ? .45 + row * .025 : .45 + row * (.1/rows);
    draws.push({ geometryId: 'tile', materialId: ['opaque','mask','blend'][(row + column) % 3], transform: [6/columns,0,0,0,0,4/rows,0,0,0,0,1,0,x,y,z,1] });
  }
  return { resources, draws, triangles: draws.length * 2 };
}
export function performanceFrame(id, { width = 320, height = 180, quality = 'native', camera = 0, light = 0 } = {}) {
  return { frameId: id, width, height, quality, clear: [22,29,43,255], view: { projection: [1,0,0,0,0,1,0,0,0,0,1,0,camera,0,0,1], camera: [camera,0,3], shadowResolution: 64, exposure: 1 }, light: { intensity: 1.2 + light, fill: .3 } };
}
