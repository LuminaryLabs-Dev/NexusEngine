const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function validatePortableTriangleGeometry(input = {}) {
  const positions = Array.from(input.positions ?? []);
  const indices = Array.from(input.indices ?? []);
  if (positions.length < 9 || positions.length % 3 !== 0) {
    throw new TypeError("Triangle geometry positions must contain at least three xyz vertices.");
  }
  if (indices.length < 3 || indices.length % 3 !== 0) {
    throw new TypeError("Triangle geometry indices must contain complete triangles.");
  }
  if (positions.some((value) => !Number.isFinite(Number(value)))) {
    throw new TypeError("Triangle geometry positions must be finite.");
  }
  const vertexCount = positions.length / 3;
  if (indices.some((value) => !Number.isInteger(Number(value)) || value < 0 || value >= vertexCount)) {
    throw new RangeError("Triangle geometry indices reference an invalid vertex.");
  }
  const attributes = {};
  for (const [name, attribute] of Object.entries(input.attributes ?? {})) {
    const values = Array.from(attribute.values ?? attribute);
    const itemSize = Math.max(1, Math.floor(Number(attribute.itemSize ?? (name === "uv" ? 2 : 3))));
    if (values.length !== vertexCount * itemSize) {
      throw new TypeError(`Geometry attribute ${name} must contain ${vertexCount * itemSize} values.`);
    }
    if (values.some((value) => !Number.isFinite(Number(value)))) {
      throw new TypeError(`Geometry attribute ${name} must contain finite values.`);
    }
    attributes[name] = { itemSize, values };
  }
  return { positions, indices, attributes };
}

export function computeShapeMetrics(input = {}) {
  const geometry = validatePortableTriangleGeometry(input);
  const { positions, indices } = geometry;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let index = 0; index < positions.length; index += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = positions[index + axis];
      min[axis] = Math.min(min[axis], value);
      max[axis] = Math.max(max[axis], value);
    }
  }
  let surfaceArea = 0;
  let signedVolume = 0;
  const used = new Set();
  let degenerateTriangles = 0;
  for (let index = 0; index < indices.length; index += 3) {
    const ia = indices[index] * 3;
    const ib = indices[index + 1] * 3;
    const ic = indices[index + 2] * 3;
    used.add(indices[index]);
    used.add(indices[index + 1]);
    used.add(indices[index + 2]);
    const ax = positions[ia]; const ay = positions[ia + 1]; const az = positions[ia + 2];
    const bx = positions[ib]; const by = positions[ib + 1]; const bz = positions[ib + 2];
    const cx = positions[ic]; const cy = positions[ic + 1]; const cz = positions[ic + 2];
    const abx = bx - ax; const aby = by - ay; const abz = bz - az;
    const acx = cx - ax; const acy = cy - ay; const acz = cz - az;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    const twiceArea = Math.hypot(nx, ny, nz);
    if (twiceArea <= 1e-12) degenerateTriangles += 1;
    surfaceArea += twiceArea * 0.5;
    signedVolume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
  }
  const size = max.map((value, axis) => value - min[axis]);
  const center = max.map((value, axis) => (value + min[axis]) * 0.5);
  return {
    vertexCount: positions.length / 3,
    usedVertexCount: used.size,
    triangleCount: indices.length / 3,
    degenerateTriangles,
    bounds: { min, max, size, center, radius: 0.5 * Math.hypot(...size) },
    surfaceArea,
    volume: Math.abs(signedVolume)
  };
}

export function compareShapeMetrics(source, result) {
  const sourceMetrics = source.triangleCount == null ? computeShapeMetrics(source) : source;
  const resultMetrics = result.triangleCount == null ? computeShapeMetrics(result) : result;
  const boundsDelta = Math.hypot(...sourceMetrics.bounds.size.map((value, axis) => value - resultMetrics.bounds.size[axis]));
  const sourceExtent = Math.max(1e-9, Math.hypot(...sourceMetrics.bounds.size));
  return {
    triangleRatio: resultMetrics.triangleCount / Math.max(1, sourceMetrics.triangleCount),
    vertexRatio: resultMetrics.usedVertexCount / Math.max(1, sourceMetrics.usedVertexCount),
    surfaceAreaRatio: resultMetrics.surfaceArea / Math.max(1e-9, sourceMetrics.surfaceArea),
    volumeRatio: resultMetrics.volume / Math.max(1e-9, sourceMetrics.volume),
    normalizedBoundsDeviation: boundsDelta / sourceExtent,
    degenerateTriangles: resultMetrics.degenerateTriangles
  };
}

export function clonePortableGeometry(value) {
  return clone(validatePortableTriangleGeometry(value));
}
