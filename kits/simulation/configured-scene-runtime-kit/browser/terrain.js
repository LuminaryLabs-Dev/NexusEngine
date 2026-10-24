import * as THREE from "three";
// Host adapter: sample authored render geometry. Engine locomotion/contact owns
// integration, gravity, ground correction and recovery; this supplies surfaces.
export function createTerrainSampler(objects, bindings) {
  const solids = objects.filter((o) => bindings[o.userData.id]?.collider);
  const ray = new THREE.Raycaster();
  return (position, ceiling, previous = null, radius = 0.5) => {
    if (previous) {
      const direction = new THREE.Vector3(
          position[0] - previous[0],
          0,
          position[2] - previous[2],
        ),
        distance = direction.length();
      if (distance > 1e-8) {
        ray.set(new THREE.Vector3(...previous), direction.normalize());
        ray.far = distance + radius;
        const wall = ray
          .intersectObjects(solids, false)
          .find(
            (h) =>
              Math.abs(
                h.face.normal
                  .clone()
                  .applyNormalMatrix(
                    new THREE.Matrix3().getNormalMatrix(h.object.matrixWorld),
                  ).y,
              ) < 0.5,
          );
        ray.far = Infinity;
        if (wall) {
          const normal = wall.face.normal
            .clone()
            .applyNormalMatrix(
              new THREE.Matrix3().getNormalMatrix(wall.object.matrixWorld),
            );
          return {
            wall: true,
            groundHeight: position[1] - radius,
            normal: { x: normal.x, y: normal.y, z: normal.z },
            surface: { fallZone: false, colliderId: wall.object.userData.id },
          };
        }
      }
    }
    ray.set(
      new THREE.Vector3(position[0], ceiling, position[2]),
      new THREE.Vector3(0, -1, 0),
    );
    const hit = ray
      .intersectObjects(solids, false)
      .find(
        (h) =>
          h.face.normal
            .clone()
            .applyNormalMatrix(
              new THREE.Matrix3().getNormalMatrix(h.object.matrixWorld),
            ).y > 0.2,
      );
    if (!hit)
      return {
        groundHeight: -1000,
        normal: { x: 0, y: 1, z: 0 },
        surface: { fallZone: true },
      };
    const n = hit.face.normal
      .clone()
      .applyNormalMatrix(
        new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld),
      );
    return {
      groundHeight: hit.point.y,
      normal: { x: n.x, y: n.y, z: n.z },
      surface: {
        fallZone: false,
        traction: 0.8,
        colliderId: hit.object.userData.id,
      },
    };
  };
}
