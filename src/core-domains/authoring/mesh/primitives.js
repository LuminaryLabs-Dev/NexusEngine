import { normalizeAuthoringMesh, createAuthoringCube } from "./geometry.js";
import {
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
} from "../contracts/value.js";
const tau = 2 * Math.PI;
export function createAuthoringPrimitive(input) {
  requireFields(
    input,
    [
      "type",
      "size",
      "radius",
      "minorRadius",
      "height",
      "segments",
      "rings",
      "widthSegments",
      "depthSegments",
      "topRadius",
    ],
    "primitive",
  );
  const { type } = input;
  if (type === "box") return createAuthoringCube({ size: input.size });
  const vertices = [],
    faces = [];
  const vertex = (p) => {
    const id = `v${vertices.length}`;
    vertices.push({ id, position: p });
    return id;
  };
  const face = (ids) => faces.push({ id: `f${faces.length}`, vertices: ids });
  const size = requireNumber(input.size ?? 2, "size", 1e-6, 1e9);
  const radius = requireNumber(input.radius ?? 1, "radius", 1e-6, 1e9);
  const segments = requireInteger(input.segments ?? 32, "segments", 3, 512);
  const rings = requireInteger(input.rings ?? 16, "rings", 3, 512);
  if (type === "plane" || type === "grid") {
    const x = requireInteger(input.widthSegments ?? 1, "widthSegments", 1, 512),
      z = requireInteger(input.depthSegments ?? 1, "depthSegments", 1, 512);
    if ((x + 1) * (z + 1) > 100000)
      throw error(
        "AUTHORING_MESH_BUDGET",
        "Grid exceeds 100000 source vertices.",
      );
    for (let j = 0; j <= z; j++)
      for (let i = 0; i <= x; i++)
        vertex([(i / x - 0.5) * size, 0, (j / z - 0.5) * size]);
    for (let j = 0; j < z; j++)
      for (let i = 0; i < x; i++) {
        const a = j * (x + 1) + i;
        face([a, a + x + 1, a + x + 2, a + 1].map((n) => `v${n}`));
      }
  } else if (type === "disc" || type === "circle") {
    // Circle is a filled polygon boundary; wire curves belong to Curve.
    for (let i = 0; i < segments; i++)
      vertex([
        radius * Math.cos((tau * i) / segments),
        0,
        -radius * Math.sin((tau * i) / segments),
      ]);
    face(vertices.map((v) => v.id));
  } else if (type === "cylinder" || type === "cone") {
    const height = requireNumber(input.height ?? 2, "height", 1e-6, 1e9),
      top = requireNumber(
        input.topRadius ?? (type === "cone" ? 0 : radius),
        "topRadius",
        0,
        1e9,
      );
    const bottom = Array.from({ length: segments }, (_, i) =>
      vertex([
        radius * Math.cos((tau * i) / segments),
        -height / 2,
        radius * Math.sin((tau * i) / segments),
      ]),
    );
    const upper =
      top === 0
        ? [vertex([0, height / 2, 0])]
        : Array.from({ length: segments }, (_, i) =>
            vertex([
              top * Math.cos((tau * i) / segments),
              height / 2,
              top * Math.sin((tau * i) / segments),
            ]),
          );
    face(bottom);
    if (top > 0) face([...upper].reverse());
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments;
      face(
        top === 0
          ? [bottom[j], bottom[i], upper[0]]
          : [bottom[j], bottom[i], upper[i], upper[j]],
      );
    }
  } else if (type === "sphere") {
    const north = vertex([0, radius, 0]),
      rows = [];
    for (let j = 1; j < rings; j++)
      rows.push(
        Array.from({ length: segments }, (_, i) => {
          const phi = (Math.PI * j) / rings,
            a = (tau * i) / segments;
          return vertex([
            radius * Math.sin(phi) * Math.cos(a),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(a),
          ]);
        }),
      );
    const south = vertex([0, -radius, 0]);
    for (let i = 0; i < segments; i++) {
      const k = (i + 1) % segments;
      face([north, rows[0][k], rows[0][i]]);
      face([south, rows.at(-1)[i], rows.at(-1)[k]]);
    }
    for (let j = 0; j < rows.length - 1; j++)
      for (let i = 0; i < segments; i++) {
        const k = (i + 1) % segments;
        face([rows[j][i], rows[j][k], rows[j + 1][k], rows[j + 1][i]]);
      }
  } else if (type === "torus") {
    const minor = requireNumber(
      input.minorRadius ?? 0.35,
      "minorRadius",
      1e-6,
      radius * 0.999999,
    );
    for (let j = 0; j < rings; j++)
      for (let i = 0; i < segments; i++) {
        const u = (tau * i) / segments,
          v = (tau * j) / rings;
        vertex([
          (radius + minor * Math.cos(v)) * Math.cos(u),
          minor * Math.sin(v),
          (radius + minor * Math.cos(v)) * Math.sin(u),
        ]);
      }
    for (let j = 0; j < rings; j++)
      for (let i = 0; i < segments; i++) {
        const k = (i + 1) % segments,
          l = (j + 1) % rings;
        face([
          `v${j * segments + i}`,
          `v${l * segments + i}`,
          `v${l * segments + k}`,
          `v${j * segments + k}`,
        ]);
      }
  } else
    throw error(
      "AUTHORING_UNSUPPORTED_PRIMITIVE",
      `Unknown primitive ${type}.`,
    );
  return normalizeAuthoringMesh({ vertices, faces, attributes: [] });
}
