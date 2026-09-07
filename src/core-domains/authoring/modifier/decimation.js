import {
  normalizeAuthoringMesh,
  triangulateAuthoringPolygon,
} from "../mesh/geometry.js";
import {
  meshEdges,
  remapAuthoringMesh,
  editAuthoringTopology,
} from "../mesh/topology.js";
import {
  requireInteger,
  requireNumber,
  authoringError as error,
} from "../contracts/value.js";
import { vdot } from "../mesh/evaluate.js";
import { subdivideAuthoringMesh } from "./subdivision.js";
import { smoothAuthoringMesh } from "./evaluate.js";
export function decimateAuthoringMesh(
  input,
  { ratio = 0.5, preserveBoundary = true } = {},
) {
  let mesh = normalizeAuthoringMesh(input);
  requireNumber(ratio, "ratio", 0.05, 1);
  if (mesh.vertices.length > 5000)
    throw error(
      "AUTHORING_DECIMATION_BUDGET",
      "Validated edge-collapse profile supports at most 5000 vertices.",
    );
  mesh = editAuthoringTopology(mesh, {
    operation: "triangulate",
    prefix: "decimate-triangles",
  }).mesh;
  const target = Math.max(4, Math.ceil(mesh.faces.length * ratio));
  let attempts = 0;
  while (mesh.faces.length > target) {
    const vertices = new Map(mesh.vertices.map((v) => [v.id, v])),
      edges = [...meshEdges(mesh).values()],
      protectedVertices = new Set();
    for (const edge of edges)
      if (
        (preserveBoundary && edge.uses.length === 1) ||
        mesh.attributes.some(
          (a) =>
            a.domain === "edge" &&
            ["seam", "sharp", "crease"].includes(a.id) &&
            a.values[edge.id]?.[0] > 0,
        )
      ) {
        protectedVertices.add(edge.a);
        protectedVertices.add(edge.b);
      }
    edges.sort((a, b) => {
      const distance = (e) =>
        Math.hypot(
          ...vertices
            .get(e.a)
            .position.map((n, i) => n - vertices.get(e.b).position[i]),
        );
      return distance(a) - distance(b) || a.id.localeCompare(b.id);
    });
    let changed = false;
    for (const edge of edges) {
      if (protectedVertices.has(edge.a) || protectedVertices.has(edge.b))
        continue;
      if (++attempts > 10000)
        throw error(
          "AUTHORING_DECIMATION_BUDGET",
          "Edge-collapse attempt budget exceeded.",
        );
      const point = vertices
          .get(edge.a)
          .position.map((n, i) => (n + vertices.get(edge.b).position[i]) / 2),
        nextVertices = mesh.vertices
          .filter((v) => v.id !== edge.b)
          .map((v) => (v.id === edge.a ? { ...v, position: point } : v)),
        nextFaces = mesh.faces
          .filter(
            (f) =>
              !(f.vertices.includes(edge.a) && f.vertices.includes(edge.b)),
          )
          .map((f) => ({
            ...f,
            vertices: f.vertices.map((id) => (id === edge.b ? edge.a : id)),
          }));
      try {
        const next = remapAuthoringMesh(mesh, nextVertices, nextFaces, {
            vertex: {
              [edge.a]: [
                [edge.a, 0.5],
                [edge.b, 0.5],
              ],
            },
          }).mesh,
          positions = new Map(next.vertices.map((v) => [v.id, v.position])),
          before = new Map(
            mesh.faces.map((f) => [
              f.id,
              triangulateAuthoringPolygon(
                f.vertices.map((id) => vertices.get(id).position),
              ).normal,
            ]),
          );
        if (
          next.faces.some(
            (f) =>
              vdot(
                before.get(f.id),
                triangulateAuthoringPolygon(
                  f.vertices.map((id) => positions.get(id)),
                ).normal,
              ) <= 0,
          )
        )
          continue;
        mesh = next;
        changed = true;
        break;
      } catch (cause) {
        if (!cause.code?.startsWith("AUTHORING_")) throw cause;
      }
    }
    if (!changed)
      throw error(
        "AUTHORING_DECIMATION_LIMIT",
        "Requested ratio would violate protected boundaries, orientation or manifold topology.",
      );
  }
  return mesh;
}
export function remeshAuthoringMesh(
  input,
  { iterations = 1, relaxation = 0.2 } = {},
) {
  requireInteger(iterations, "remesh iterations", 1, 3);
  requireNumber(relaxation, "relaxation", 0, 0.5);
  let mesh = normalizeAuthoringMesh(input);
  for (let i = 0; i < iterations; i++) {
    mesh = subdivideAuthoringMesh(mesh, { prefix: `remesh${i}` }).mesh;
    mesh = editAuthoringTopology(mesh, {
      operation: "triangulate",
      prefix: `remesh${i}:tri`,
    }).mesh;
    mesh = smoothAuthoringMesh(mesh, {
      iterations: 1,
      factor: relaxation,
      preserveBoundary: true,
    });
  }
  return mesh;
}
