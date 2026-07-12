export function getThreeSubjectBounds(THREE, subject, options = {}) {
  if (!THREE?.Box3) throw new TypeError("getThreeSubjectBounds requires the active Three.js module.");
  const subjects = Array.isArray(subject) ? subject : [subject];
  const box = new THREE.Box3();
  box.makeEmpty();
  for (const entry of subjects) {
    if (!entry) continue;
    entry.updateMatrixWorld?.(true);
    entry.computeBoundingBox?.();
    if (typeof box.expandByObject === "function") box.expandByObject(entry, options.precise !== false);
    else box.union(new THREE.Box3().setFromObject(entry));
  }
  if (box.isEmpty()) {
    return { minimum: [0, 0, 0], maximum: [0, 0, 0], center: [0, 0, 0], size: [0, 0, 0], empty: true };
  }
  if (Number(options.padding ?? 0) > 0) box.expandByScalar(Number(options.padding));
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);
  return {
    minimum: box.min.toArray(),
    maximum: box.max.toArray(),
    center: center.toArray(),
    size: size.toArray(),
    empty: false
  };
}

export function createThreeSubjectBoundsAdapter(THREE, options = {}) {
  return Object.freeze({
    measure: (subject, overrides = {}) => getThreeSubjectBounds(THREE, subject, { ...options, ...overrides })
  });
}
