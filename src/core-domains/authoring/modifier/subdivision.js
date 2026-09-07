import { normalizeAuthoringMesh } from "../mesh/geometry.js";
import { meshEdges, meshEdgeId, remapAuthoringMesh } from "../mesh/topology.js";
import { authoringError as error } from "../contracts/value.js";
const mean = (ids) => ids.map((id) => [id, 1 / ids.length]);
function combine(terms) {
  const weights = new Map();
  for (const [list, factor] of terms)
    for (const [id, w] of list)
      weights.set(id, (weights.get(id) ?? 0) + w * factor);
  return [...weights].filter(([, w]) => Math.abs(w) > 1e-15);
}
export function subdivideAuthoringMesh(input, { prefix = "subdivision" } = {}) {
  const m = normalizeAuthoringMesh(input),
    edges = meshEdges(m),
    byVertex = new Map(m.vertices.map((v) => [v.id, v])),
    byFace = new Map(m.faces.map((f) => [f.id, f])),
    crease = m.attributes.find((a) => a.id === "crease"),
    incident = new Map(
      m.vertices.map((v) => [v.id, { edges: [], faces: new Set() }]),
    );
  for (const e of edges.values())
    for (const id of [e.a, e.b]) {
      incident.get(id).edges.push(e);
      e.uses.forEach((u) => incident.get(id).faces.add(u.face));
    }
  if (
    crease &&
    Object.values(crease.values).some((v) => v[0] !== 0 && v[0] !== 1)
  )
    throw error(
      "AUTHORING_UNSUPPORTED_CREASE",
      "Subdivision supports binary smooth/hard creases.",
    );
  const maps = {
      vertex: Object.create(null),
      edge: Object.create(null),
      face: Object.create(null),
      corner: Object.create(null),
    },
    vertices = [],
    faces = [],
    facePoint = new Map(),
    edgePoint = new Map(),
    used = new Set(m.vertices.map((v) => v.id));
  let counter = 0;
  const fresh = () => {
    let id;
    do {
      id = `${prefix}:v${counter++}`;
    } while (used.has(id));
    used.add(id);
    return id;
  };
  const add = (id, weights) => {
    maps.vertex[id] = weights;
    vertices.push({
      id,
      position: [0, 1, 2].map((i) =>
        weights.reduce(
          (n, [old, w]) => n + byVertex.get(old).position[i] * w,
          0,
        ),
      ),
    });
  };
  for (const f of m.faces) {
    const id = fresh();
    facePoint.set(f.id, id);
    add(id, mean(f.vertices));
  }
  for (const e of edges.values()) {
    const id = fresh();
    edgePoint.set(e.id, id);
    const hard = e.uses.length === 1 || crease?.values[e.id]?.[0] === 1;
    add(
      id,
      hard
        ? mean([e.a, e.b])
        : combine([
            [mean([e.a, e.b]), 0.5],
            ...[...e.uses].map((u) => [
              mean(byFace.get(u.face).vertices),
              0.25,
            ]),
          ]),
    );
  }
  for (const v of m.vertices) {
    const inc = incident.get(v.id),
      hard = inc.edges.filter(
        (e) => e.uses.length === 1 || crease?.values[e.id]?.[0] === 1,
      );
    let weights = [[v.id, 1]];
    if (hard.length === 2)
      weights = combine([
        [[[v.id, 1]], 0.75],
        [mean(hard.map((e) => (e.a === v.id ? e.b : e.a))), 0.25],
      ]);
    else if (!hard.length && inc.edges.length) {
      const n = inc.faces.size;
      weights = combine([
        [[[v.id, 1]], (n - 3) / n],
        ...inc.edges.map((e) => [mean([e.a, e.b]), 2 / (n * inc.edges.length)]),
        ...[...inc.faces].map((id) => [
          mean(byFace.get(id).vertices),
          1 / (n * n),
        ]),
      ]);
    }
    add(v.id, weights);
  }
  for (const f of m.faces)
    for (let i = 0; i < f.vertices.length; i++) {
      const j = (i + 1) % f.vertices.length,
        k = (i + f.vertices.length - 1) % f.vertices.length,
        vertex = f.vertices[i],
        nextEdge = meshEdgeId(vertex, f.vertices[j]),
        priorEdge = meshEdgeId(f.vertices[k], vertex),
        id = `${prefix}:${f.id}:${i}`,
        corners = [0, 1, 2, 3].map((j) => `${id}:c${j}`),
        weights = [
          [[f.corners[i], 1]],
          mean([f.corners[i], f.corners[j]]),
          mean(f.corners),
          mean([f.corners[k], f.corners[i]]),
        ];
      corners.forEach((c, j) => (maps.corner[c] = weights[j]));
      maps.face[id] = [[f.id, 1]];
      faces.push({
        id,
        vertices: [
          vertex,
          edgePoint.get(nextEdge),
          facePoint.get(f.id),
          edgePoint.get(priorEdge),
        ],
        corners,
      });
      maps.edge[meshEdgeId(vertex, edgePoint.get(nextEdge))] = [[nextEdge, 1]];
      maps.edge[meshEdgeId(vertex, edgePoint.get(priorEdge))] = [
        [priorEdge, 1],
      ];
    }
  return remapAuthoringMesh(m, vertices, faces, maps);
}
