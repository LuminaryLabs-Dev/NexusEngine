import { bevelConvexAuthoringMesh } from "./bevel.js";
import {
  normalizeAuthoringMesh,
  triangulateAuthoringPolygon,
} from "./geometry.js";
import {
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
  requireText,
  vector,
} from "../contracts/value.js";
export const meshEdgeId = (a, b) => `edge:${JSON.stringify([a, b].sort())}`;
export function meshEdges(mesh) {
  const out = new Map();
  for (const f of mesh.faces)
    f.vertices.forEach((a, i) => {
      const b = f.vertices[(i + 1) % f.vertices.length],
        id = meshEdgeId(a, b);
      if (!out.has(id)) out.set(id, { id, a, b, uses: [] });
      out.get(id).uses.push({ face: f.id, index: i, a, b });
    });
  return out;
}
const same = (id) => [[id, 1]];
const average = (ids) => ids.map((id) => [id, 1 / ids.length]);
function elements(mesh) {
  return {
    vertex: mesh.vertices.map((v) => v.id),
    face: mesh.faces.map((f) => f.id),
    corner: mesh.faces.flatMap((f) => f.corners),
    edge: [...meshEdges(mesh).keys()],
  };
}
export function remapAuthoringMesh(source, vertices, faces, maps = {}) {
  const result = normalizeAuthoringMesh({ vertices, faces, attributes: [] }),
    before = elements(source),
    after = elements(result),
    mapping = {};
  for (const domain of Object.keys(after)) {
    const prior = new Set(before[domain]);
    mapping[domain] = Object.fromEntries(
      after[domain].map((id) => [
        id,
        maps[domain]?.[id] ?? (prior.has(id) ? same(id) : []),
      ]),
    );
  }
  result.attributes = source.attributes.map((attribute) => ({
    ...attribute,
    values: Object.fromEntries(
      after[attribute.domain].flatMap((id) => {
        const weights = mapping[attribute.domain][id];
        if (
          !weights.length ||
          weights.some(([old]) => !Object.hasOwn(attribute.values, old))
        )
          return [];
        return [
          [
            id,
            Array.from({ length: attribute.arity }, (_, i) =>
              weights.reduce(
                (n, [old, w]) => n + attribute.values[old][i] * w,
                0,
              ),
            ),
          ],
        ];
      }),
    ),
  }));
  const changes = Object.fromEntries(
    Object.keys(after).map((domain) => {
      const old = new Set(before[domain]),
        next = new Set(after[domain]);
      return [
        domain,
        {
          created: after[domain].filter((id) => !old.has(id)),
          removed: before[domain].filter((id) => !next.has(id)),
          retained: after[domain].filter((id) => old.has(id)),
        },
      ];
    }),
  );
  return {
    mesh: normalizeAuthoringMesh(result),
    mapping,
    changes,
    attributePolicy:
      "linear interpolation for numeric vertex/corner values; copied parent face values; new unparented edges have no authored seam/crease",
  };
}
export function editAuthoringTopology(input, args) {
  const mesh = normalizeAuthoringMesh(input);
  requireFields(
    args,
    [
      "operation",
      "faces",
      "edges",
      "vertices",
      "offset",
      "factor",
      "segments",
      "pairs",
      "position",
      "tolerance",
      "boundary",
      "prefix",
      "plane",
      "width",
    ],
    "topology edit",
  );
  const { operation } = args,
    selected = new Set(args.faces ?? []),
    byFace = new Map(mesh.faces.map((f) => [f.id, f])),
    byVertex = new Map(mesh.vertices.map((v) => [v.id, v]));
  for (const id of selected)
    if (!byFace.has(id))
      throw error("AUTHORING_ELEMENT_MISSING", `Unknown face ${id}.`);
  const prefix = args.prefix ?? `edit:${operation}`;
  requireText(prefix, "prefix");
  const maps = {
    vertex: Object.create(null),
    face: Object.create(null),
    corner: Object.create(null),
    edge: Object.create(null),
  };
  let vertices = mesh.vertices.map((v) => ({
      ...v,
      position: [...v.position],
    })),
    faces = mesh.faces.map((f) => ({
      ...f,
      vertices: [...f.vertices],
      corners: [...f.corners],
    }));
  const usedV = new Set(vertices.map((v) => v.id)),
    usedF = new Set(faces.map((f) => f.id)),
    usedC = new Set(faces.flatMap((f) => f.corners));
  let vi = 0,
    fi = 0,
    ci = 0;
  const unique = (set, kind, next) => {
    let id;
    do {
      id = `${prefix}:${kind}:${next()}`;
    } while (set.has(id));
    set.add(id);
    return id;
  };
  const addVertex = (position, weights) => {
    const id = unique(usedV, "v", () => vi++);
    vertices.push({ id, position });
    maps.vertex[id] = weights;
    return id;
  };
  const addFace = (ids, parent, cornerWeights) => {
    const id = unique(usedF, "f", () => fi++),
      corners = ids.map((_, i) => {
        const c = unique(usedC, "c", () => ci++);
        maps.corner[c] = cornerWeights?.[i] ?? [];
        return c;
      });
    faces.push({ id, vertices: ids, corners });
    maps.face[id] = parent ? same(parent) : [];
    return id;
  };
  const choose = (allowEmpty = false) => {
    if (!selected.size && !allowEmpty)
      throw error("AUTHORING_INVALID_SELECTION", "Select at least one face.");
    return mesh.faces.filter((f) => selected.has(f.id));
  };
  if (operation === "bevel") {
    const result = bevelConvexAuthoringMesh(mesh, meshEdges(mesh), {
      width: args.width,
      selectedEdges: args.edges ?? null,
      prefix,
    });
    vertices = result.vertices;
    faces = result.faces;
  } else if (operation === "delete" || operation === "extract") {
    choose();
    faces = faces.filter((f) =>
      operation === "delete" ? !selected.has(f.id) : selected.has(f.id),
    );
    const live = new Set(faces.flatMap((f) => f.vertices));
    vertices = vertices.filter((v) => live.has(v.id));
  } else if (operation === "duplicate" || operation === "split") {
    const chosen = choose(),
      mapping = new Map(),
      offset = vector(args.offset ?? [0, 0, 0]);
    for (const id of new Set(chosen.flatMap((f) => f.vertices)))
      mapping.set(
        id,
        addVertex(
          byVertex.get(id).position.map((n, i) => n + offset[i]),
          same(id),
        ),
      );
    if (operation === "split") faces = faces.filter((f) => !selected.has(f.id));
    for (const f of chosen)
      addFace(
        f.vertices.map((id) => mapping.get(id)),
        f.id,
        f.corners.map(same),
      );
  } else if (operation === "triangulate") {
    const chosen = selected.size ? choose() : mesh.faces;
    const ids = new Set(chosen.map((f) => f.id));
    faces = faces.filter((f) => !ids.has(f.id));
    for (const f of chosen)
      for (const tri of triangulateAuthoringPolygon(
        f.vertices.map((id) => byVertex.get(id).position),
      ).triangles)
        addFace(
          tri.map((i) => f.vertices[i]),
          f.id,
          tri.map((i) => same(f.corners[i])),
        );
  } else if (operation === "weld") {
    const tolerance = requireNumber(
        args.tolerance ?? 1e-6,
        "tolerance",
        0,
        1e6,
      ),
      replace = new Map();
    if (!Array.isArray(args.pairs) || !args.pairs.length)
      throw error(
        "AUTHORING_INVALID_INPUT",
        "Weld requires explicit [removed, retained] pairs.",
      );
    for (const pair of args.pairs) {
      if (
        !Array.isArray(pair) ||
        pair.length !== 2 ||
        !pair.every((id) => byVertex.has(id)) ||
        pair[0] === pair[1] ||
        replace.has(pair[0])
      )
        throw error("AUTHORING_INVALID_INPUT", "Invalid weld pair.");
      if (
        Math.hypot(
          ...byVertex
            .get(pair[0])
            .position.map((n, i) => n - byVertex.get(pair[1]).position[i]),
        ) > tolerance
      )
        throw error("AUTHORING_WELD_DISTANCE", "Weld pair exceeds tolerance.");
      replace.set(pair[0], pair[1]);
    }
    const resolve = (id) => {
      const seen = new Set();
      while (replace.has(id)) {
        if (seen.has(id))
          throw error("AUTHORING_INVALID_INPUT", "Cyclic weld mapping.");
        seen.add(id);
        id = replace.get(id);
      }
      return id;
    };
    for (const v of vertices)
      if (!replace.has(v.id)) {
        const ids = mesh.vertices
          .filter((old) => resolve(old.id) === v.id)
          .map((old) => old.id);
        maps.vertex[v.id] = average(ids);
      }
    vertices = vertices.filter((v) => !replace.has(v.id));
    faces = faces.map((f) => ({ ...f, vertices: f.vertices.map(resolve) }));
    // Do not silently collapse degenerate faces or UV corners.
  } else if (operation === "fill") {
    if (!Array.isArray(args.boundary) || args.boundary.length < 3)
      throw error("AUTHORING_INVALID_INPUT", "Fill needs an ordered boundary.");
    const edges = meshEdges(mesh);
    for (let i = 0; i < args.boundary.length; i++) {
      const a = args.boundary[i],
        b = args.boundary[(i + 1) % args.boundary.length];
      if (!byVertex.has(a) || !byVertex.has(b))
        throw error("AUTHORING_ELEMENT_MISSING", "Unknown boundary vertex.");
      const edge = edges.get(meshEdgeId(a, b));
      if (edge && (edge.uses.length !== 1 || edge.uses[0].a === a))
        throw error(
          "AUTHORING_INVALID_TOPOLOGY",
          "Fill must oppose an open boundary.",
        );
    }
    addFace(args.boundary, null);
  } else if (operation === "extrude" || operation === "inset") {
    const chosen = choose(),
      selectedVertices = new Set(chosen.flatMap((f) => f.vertices)),
      mapping = new Map(),
      offset = vector(args.offset ?? [0, 1, 0]);
    if (operation === "inset" && chosen.length !== 1)
      throw error(
        "AUTHORING_UNSUPPORTED_PROFILE",
        "Inset supports one planar convex face.",
      );
    const factor = requireNumber(args.factor ?? 0.8, "factor", 1e-6, 0.999999),
      center = [0, 1, 2].map(
        (i) =>
          [...selectedVertices].reduce(
            (n, id) => n + byVertex.get(id).position[i],
            0,
          ) / selectedVertices.size,
      );
    if (operation === "inset") {
      const p = chosen[0].vertices.map((id) => byVertex.get(id).position),
        cross = (a, b) => [
          a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0],
        ],
        sub = (a, b) => a.map((n, i) => n - b[i]),
        n = cross(sub(p[1], p[0]), sub(p[2], p[1]));
      for (let i = 0; i < p.length; i++) {
        const turn = cross(
          sub(p[(i + 1) % p.length], p[i]),
          sub(p[(i + 2) % p.length], p[(i + 1) % p.length]),
        );
        if (turn.reduce((sum, v, k) => sum + v * n[k], 0) <= 1e-12)
          throw error(
            "AUTHORING_UNSUPPORTED_PROFILE",
            "Inset requires a strictly convex face.",
          );
      }
    }
    for (const id of selectedVertices) {
      const p = byVertex.get(id).position;
      mapping.set(
        id,
        addVertex(
          p.map((n, i) =>
            operation === "extrude"
              ? n + offset[i]
              : center[i] + (n - center[i]) * factor,
          ),
          same(id),
        ),
      );
    }
    faces = faces.filter((f) => !selected.has(f.id));
    for (const f of chosen)
      addFace(
        f.vertices.map((id) => mapping.get(id)),
        f.id,
        f.corners.map(same),
      );
    for (const edge of meshEdges(mesh).values()) {
      const uses = edge.uses.filter((u) => selected.has(u.face));
      if (uses.length !== 1) continue;
      const u = uses[0],
        f = byFace.get(u.face),
        i = u.index,
        j = (i + 1) % f.vertices.length;
      const newA = mapping.get(u.a),
        newB = mapping.get(u.b);
      addFace([u.a, u.b, newB, newA], f.id, [
        same(f.corners[i]),
        same(f.corners[j]),
        same(f.corners[j]),
        same(f.corners[i]),
      ]);
      maps.edge[meshEdgeId(newA, newB)] = same(edge.id);
    }
    const live = new Set(faces.flatMap((f) => f.vertices));
    vertices = vertices.filter((v) => live.has(v.id));
  } else if (operation === "subdivide-edge") {
    const edges = meshEdges(mesh),
      selectedEdges = new Set(args.edges ?? []),
      count = requireInteger(args.segments ?? 2, "segments", 2, 64),
      inserted = new Map();
    if (!selectedEdges.size)
      throw error("AUTHORING_INVALID_SELECTION", "Select edges.");
    for (const id of selectedEdges) {
      const e = edges.get(id);
      if (!e) throw error("AUTHORING_ELEMENT_MISSING", `Unknown edge ${id}.`);
      const points = [];
      for (let j = 1; j < count; j++) {
        const t = j / count;
        points.push(
          addVertex(
            byVertex
              .get(e.a)
              .position.map(
                (n, i) => n * (1 - t) + byVertex.get(e.b).position[i] * t,
              ),
            [
              [e.a, 1 - t],
              [e.b, t],
            ],
          ),
        );
      }
      inserted.set(id, { ...e, points });
      let prior = e.a;
      for (const next of [...points, e.b]) {
        maps.edge[meshEdgeId(prior, next)] = same(id);
        prior = next;
      }
    }
    faces = [];
    for (const f of mesh.faces) {
      const ids = [],
        weights = [];
      for (let i = 0; i < f.vertices.length; i++) {
        const a = f.vertices[i],
          b = f.vertices[(i + 1) % f.vertices.length],
          entry = inserted.get(meshEdgeId(a, b));
        ids.push(a);
        weights.push(same(f.corners[i]));
        if (entry) {
          const points =
            entry.a === a ? entry.points : [...entry.points].reverse();
          points.forEach((id, j) => {
            const t = (j + 1) / count;
            ids.push(id);
            weights.push([
              [f.corners[i], 1 - t],
              [f.corners[(i + 1) % f.corners.length], t],
            ]);
          });
        }
      }
      addFace(ids, f.id, weights);
    }
  } else if (operation === "knife") {
    const chosen = choose();
    if (
      chosen.length !== 1 ||
      !Array.isArray(args.vertices) ||
      args.vertices.length !== 2
    )
      throw error(
        "AUTHORING_UNSUPPORTED_PROFILE",
        "Knife chord requires one planar face and two existing nonadjacent vertices.",
      );
    const f = chosen[0],
      a = f.vertices.indexOf(args.vertices[0]),
      b = f.vertices.indexOf(args.vertices[1]);
    if (
      a < 0 ||
      b < 0 ||
      a === b ||
      Math.abs(a - b) === 1 ||
      Math.abs(a - b) === f.vertices.length - 1
    )
      throw error(
        "AUTHORING_INVALID_SELECTION",
        "Knife endpoints must be nonadjacent vertices of the selected face.",
      );
    const walk = (start, end) => {
      const indices = [];
      for (let i = start; ; i = (i + 1) % f.vertices.length) {
        indices.push(i);
        if (i === end) break;
      }
      return indices;
    };
    faces = faces.filter((face) => face.id !== f.id);
    for (const indices of [walk(a, b), walk(b, a)])
      addFace(
        indices.map((i) => f.vertices[i]),
        f.id,
        indices.map((i) => same(f.corners[i])),
      );
  } else if (operation === "dissolve") {
    if (!Array.isArray(args.edges) || args.edges.length !== 1)
      throw error(
        "AUTHORING_UNSUPPORTED_PROFILE",
        "Dissolve profile accepts one shared edge.",
      );
    const edge = meshEdges(mesh).get(args.edges[0]);
    if (!edge || edge.uses.length !== 2)
      throw error(
        "AUTHORING_INVALID_SELECTION",
        "Dissolve requires an interior edge.",
      );
    const [u, v] = edge.uses,
      a = byFace.get(u.face),
      b = byFace.get(v.face);
    for (const attr of mesh.attributes) {
      if (attr.domain === "edge" && attr.values[edge.id]?.some((n) => n !== 0))
        throw error(
          "AUTHORING_ATTRIBUTE_CONFLICT",
          "Dissolve would remove a seam, crease or authored edge value.",
        );
      if (
        attr.domain === "face" &&
        JSON.stringify(attr.values[a.id]) !== JSON.stringify(attr.values[b.id])
      )
        throw error(
          "AUTHORING_ATTRIBUTE_CONFLICT",
          "Adjacent face attributes differ.",
        );
      if (attr.domain === "corner")
        for (const id of [edge.a, edge.b])
          if (
            JSON.stringify(attr.values[a.corners[a.vertices.indexOf(id)]]) !==
            JSON.stringify(attr.values[b.corners[b.vertices.indexOf(id)]])
          )
            throw error(
              "AUTHORING_ATTRIBUTE_CONFLICT",
              "Dissolve would erase a corner attribute discontinuity.",
            );
    }
    const walk = (f, i) =>
        Array.from(
          { length: f.vertices.length },
          (_, j) => (i + 1 + j) % f.vertices.length,
        ),
      aa = walk(a, u.index),
      bb = walk(b, v.index).slice(1, -1),
      ids = [...aa.map((i) => a.vertices[i]), ...bb.map((i) => b.vertices[i])],
      weights = [
        ...aa.map((i) => same(a.corners[i])),
        ...bb.map((i) => same(b.corners[i])),
      ];
    if (new Set(ids).size !== ids.length)
      throw error(
        "AUTHORING_UNSUPPORTED_PROFILE",
        "Faces share more than one edge.",
      );
    const normal = triangulateAuthoringPolygon(
      ids.map((id) => byVertex.get(id).position),
    );
    if (!normal)
      throw error("AUTHORING_INVALID_TOPOLOGY", "Dissolve is not planar.");
    faces = faces.filter((f) => f.id !== a.id && f.id !== b.id);
    addFace(ids, a.id, weights);
  } else if (operation === "loop-cut") {
    if (!Array.isArray(args.edges) || args.edges.length !== 1)
      throw error(
        "AUTHORING_UNSUPPORTED_PROFILE",
        "Loop cut starts from one edge in a quad strip.",
      );
    const edges = meshEdges(mesh),
      seed = edges.get(args.edges[0]);
    if (!seed)
      throw error("AUTHORING_ELEMENT_MISSING", "Loop seed edge missing.");
    const cuts = new Set([seed.id]),
      pending = [seed.id],
      affected = new Set();
    while (pending.length) {
      const edge = edges.get(pending.pop());
      for (const use of edge.uses) {
        const face = byFace.get(use.face);
        if (face.vertices.length !== 4)
          throw error(
            "AUTHORING_UNSUPPORTED_PROFILE",
            "Loop cut requires a quad strip terminating at a boundary or closing on itself.",
          );
        affected.add(face.id);
        const i = (use.index + 2) % 4,
          opposite = meshEdgeId(face.vertices[i], face.vertices[(i + 1) % 4]);
        if (!cuts.has(opposite)) {
          cuts.add(opposite);
          pending.push(opposite);
        }
      }
    }
    const count = requireInteger(args.segments ?? 2, "loop segments", 2, 32),
      points = new Map();
    for (const id of cuts) {
      const edge = edges.get(id),
        row = [edge.a];
      for (let i = 1; i < count; i++) {
        const t = i / count;
        row.push(
          addVertex(
            byVertex
              .get(edge.a)
              .position.map(
                (n, k) => n * (1 - t) + byVertex.get(edge.b).position[k] * t,
              ),
            [
              [edge.a, 1 - t],
              [edge.b, t],
            ],
          ),
        );
      }
      row.push(edge.b);
      points.set(id, row);
      for (let i = 0; i < count; i++)
        maps.edge[meshEdgeId(row[i], row[i + 1])] = same(id);
    }
    faces = faces.filter((f) => !affected.has(f.id));
    for (const id of affected) {
      const f = byFace.get(id),
        cutIndices = f.vertices
          .map((a, i) =>
            cuts.has(meshEdgeId(a, f.vertices[(i + 1) % 4])) ? i : -1,
          )
          .filter((i) => i >= 0);
      if (cutIndices.length !== 2 || cutIndices[1] - cutIndices[0] !== 2)
        throw error(
          "AUTHORING_UNSUPPORTED_PROFILE",
          "Loop strip crosses itself.",
        );
      const i = cutIndices[0],
        v = [0, 1, 2, 3].map((j) => f.vertices[(i + j) % 4]),
        c = [0, 1, 2, 3].map((j) => f.corners[(i + j) % 4]),
        oriented = (a, b) => {
          const row = points.get(meshEdgeId(a, b));
          return row[0] === a ? row : [...row].reverse();
        },
        a = oriented(v[0], v[1]),
        b = oriented(v[3], v[2]),
        w = (x, y, t) => [
          [x, 1 - t],
          [y, t],
        ];
      for (let j = 0; j < count; j++)
        addFace([a[j], a[j + 1], b[j + 1], b[j]], f.id, [
          w(c[0], c[1], j / count),
          w(c[0], c[1], (j + 1) / count),
          w(c[3], c[2], (j + 1) / count),
          w(c[3], c[2], j / count),
        ]);
    }
  } else if (operation === "bridge") {
    if (!Array.isArray(args.pairs) || args.pairs.length !== 2)
      throw error(
        "AUTHORING_INVALID_INPUT",
        "Bridge needs two ordered vertex loops.",
      );
    const [a, b] = args.pairs;
    if (
      !Array.isArray(a) ||
      !Array.isArray(b) ||
      a.length !== b.length ||
      a.length < 3
    )
      throw error(
        "AUTHORING_UNSUPPORTED_PROFILE",
        "Bridge requires matching closed loops.",
      );
    for (let i = 0; i < a.length; i++) {
      const j = (i + 1) % a.length;
      addFace([a[i], a[j], b[j], b[i]], null);
    }
  } else
    throw error(
      "AUTHORING_UNSUPPORTED_TOPOLOGY",
      `Unsupported topology operation ${operation}.`,
    );
  return remapAuthoringMesh(mesh, vertices, faces, maps);
}
