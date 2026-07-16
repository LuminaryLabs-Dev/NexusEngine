export function createUvSphereGeometry(segments = 28, rings = 18, radius = 1) {
  const positions = [];
  const normals = [];
  const uv = [];
  const indices = [];
  for (let y = 0; y <= rings; y += 1) {
    const v = y / rings;
    const phi = v * Math.PI;
    for (let x = 0; x <= segments; x += 1) {
      const u = x / segments;
      const theta = u * Math.PI * 2;
      const sx = Math.sin(phi) * Math.cos(theta);
      const sy = Math.cos(phi);
      const sz = Math.sin(phi) * Math.sin(theta);
      positions.push(radius * sx, radius * sy, radius * sz);
      normals.push(sx, sy, sz);
      uv.push(u, v);
    }
  }
  const stride = segments + 1;
  for (let y = 0; y < rings; y += 1) {
    for (let x = 0; x < segments; x += 1) {
      const a = y * stride + x;
      const b = a + stride;
      const c = b + 1;
      const d = a + 1;
      if (y > 0) indices.push(a, b, d);
      if (y < rings - 1) indices.push(d, b, c);
    }
  }
  return {
    positions,
    indices,
    attributes: {
      normal: { itemSize: 3, values: normals },
      uv: { itemSize: 2, values: uv }
    }
  };
}

export function createRockGeometry(segments = 24, rings = 14) {
  const geometry = createUvSphereGeometry(segments, rings, 1);
  for (let index = 0; index < geometry.positions.length; index += 3) {
    const x = geometry.positions[index];
    const y = geometry.positions[index + 1];
    const z = geometry.positions[index + 2];
    const direction = Math.atan2(z, x);
    const height = y;
    const noise = 1 + 0.13 * Math.sin(direction * 5 + height * 3) + 0.07 * Math.cos(direction * 9 - height * 4);
    geometry.positions[index] = x * noise * 1.15;
    geometry.positions[index + 1] = y * (0.82 + 0.1 * Math.cos(direction * 3));
    geometry.positions[index + 2] = z * noise;
  }
  return geometry;
}

function rotateY(x, z, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [x * cosine - z * sine, x * sine + z * cosine];
}

export function rasterizeSilhouette(geometry, angle = 0, width = 128, height = 128) {
  const projected = [];
  let minX = Infinity; let maxX = -Infinity;
  let minY = Infinity; let maxY = -Infinity;
  for (let index = 0; index < geometry.positions.length; index += 3) {
    const [x] = rotateY(geometry.positions[index], geometry.positions[index + 2], angle);
    const y = geometry.positions[index + 1];
    projected.push(x, y);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const padding = 6;
  const scale = Math.min(
    (width - padding * 2) / Math.max(1e-9, maxX - minX),
    (height - padding * 2) / Math.max(1e-9, maxY - minY)
  );
  const points = [];
  for (let index = 0; index < projected.length; index += 2) {
    points.push(
      padding + (projected[index] - minX) * scale,
      height - padding - (projected[index + 1] - minY) * scale
    );
  }
  const pixels = new Uint8Array(width * height);
  function edge(ax, ay, bx, by, px, py) {
    return (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  }
  for (let index = 0; index < geometry.indices.length; index += 3) {
    const ia = geometry.indices[index] * 2;
    const ib = geometry.indices[index + 1] * 2;
    const ic = geometry.indices[index + 2] * 2;
    const ax = points[ia]; const ay = points[ia + 1];
    const bx = points[ib]; const by = points[ib + 1];
    const cx = points[ic]; const cy = points[ic + 1];
    const left = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const right = Math.min(width - 1, Math.ceil(Math.max(ax, bx, cx)));
    const top = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const bottom = Math.min(height - 1, Math.ceil(Math.max(ay, by, cy)));
    const area = edge(ax, ay, bx, by, cx, cy);
    if (Math.abs(area) < 1e-9) continue;
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const w0 = edge(bx, by, cx, cy, x + 0.5, y + 0.5);
        const w1 = edge(cx, cy, ax, ay, x + 0.5, y + 0.5);
        const w2 = edge(ax, ay, bx, by, x + 0.5, y + 0.5);
        if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) {
          pixels[y * width + x] = 255;
        }
      }
    }
  }
  return { width, height, pixels };
}

export function silhouetteMetrics(image) {
  let count = 0;
  let minX = image.width; let maxX = -1;
  let minY = image.height; let maxY = -1;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (!image.pixels[y * image.width + x]) continue;
      count += 1;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  return {
    occupancy: count / (image.width * image.height),
    bounds: { minX, maxX, minY, maxY },
    grounded: maxY >= image.height - 7
  };
}

export function silhouetteIou(left, right) {
  let intersection = 0;
  let union = 0;
  for (let index = 0; index < left.pixels.length; index += 1) {
    const a = left.pixels[index] > 0;
    const b = right.pixels[index] > 0;
    if (a && b) intersection += 1;
    if (a || b) union += 1;
  }
  return union ? intersection / union : 1;
}

export function writeSilhouetteSvg(pairs, cellSize = 128) {
  const columns = 2;
  const rows = pairs.length;
  const width = columns * cellSize;
  const height = rows * cellSize;
  const images = [];
  function pathFor(image, offsetX, offsetY) {
    const rects = [];
    for (let y = 0; y < image.height; y += 1) {
      let start = -1;
      for (let x = 0; x <= image.width; x += 1) {
        const filled = x < image.width && image.pixels[y * image.width + x] > 0;
        if (filled && start < 0) start = x;
        if (!filled && start >= 0) {
          rects.push(`<rect x="${offsetX + start}" y="${offsetY + y}" width="${x - start}" height="1"/>`);
          start = -1;
        }
      }
    }
    return rects.join("");
  }
  for (let row = 0; row < pairs.length; row += 1) {
    images.push(`<g fill="#18361f">${pathFor(pairs[row].source, 0, row * cellSize)}</g>`);
    images.push(`<g fill="#79b96a">${pathFor(pairs[row].result, cellSize, row * cellSize)}</g>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#e8f1f3"/>${images.join("")}</svg>`;
}
