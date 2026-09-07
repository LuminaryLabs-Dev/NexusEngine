import {
  normalizeAuthoringMesh,
  resolveAuthoringSelection,
} from "../mesh/geometry.js";
import { meshEdges, meshEdgeId } from "../mesh/topology.js";
import { authoringError as error } from "../contracts/value.js";
export function modifyAuthoringSelection(
  meshInput,
  selection,
  { action, ids = [] },
) {
  const mesh = normalizeAuthoringMesh(meshInput);
  resolveAuthoringSelection(mesh, selection);
  if (selection.mode === "object")
    throw error(
      "AUTHORING_INVALID_SELECTION",
      "Object selection has no editable element set.",
    );
  const edges = meshEdges(mesh),
    selected = new Set(selection.ids),
    adj = new Map();
  const link = (a, b) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a).add(b);
  };
  if (selection.mode === "vertex") {
    mesh.vertices.forEach((v) => adj.set(v.id, new Set()));
    for (const e of edges.values()) {
      link(e.a, e.b);
      link(e.b, e.a);
    }
  }
  if (selection.mode === "face") {
    mesh.faces.forEach((f) => adj.set(f.id, new Set()));
    for (const e of edges.values())
      for (const a of e.uses)
        for (const b of e.uses) if (a.face !== b.face) link(a.face, b.face);
  }
  if (selection.mode === "edge") {
    const incident = new Map();
    for (const e of edges.values()) {
      adj.set(e.id, new Set());
      for (const v of [e.a, e.b]) {
        if (!incident.has(v)) incident.set(v, []);
        incident.get(v).push(e.id);
      }
    }
    for (const ids of incident.values())
      for (const a of ids) for (const b of ids) if (a !== b) link(a, b);
  }
  if (["add", "remove", "toggle"].includes(action)) {
    resolveAuthoringSelection(mesh, { mode: selection.mode, ids });
    for (const id of ids) {
      if (action === "remove" || (action === "toggle" && selected.has(id)))
        selected.delete(id);
      else selected.add(id);
    }
  } else if (action === "expand") {
    for (const id of selection.ids)
      for (const neighbor of adj.get(id)) selected.add(neighbor);
  } else if (action === "contract") {
    const original = new Set(selected);
    for (const id of selection.ids)
      if ([...adj.get(id)].some((n) => !original.has(n))) selected.delete(id);
  } else if (action === "connected") {
    const pending = [...selected];
    while (pending.length) {
      const id = pending.pop();
      for (const neighbor of adj.get(id))
        if (!selected.has(neighbor)) {
          selected.add(neighbor);
          pending.push(neighbor);
        }
    }
  } else if (action === "loop" || action === "ring") {
    if (selection.mode !== "edge")
      throw error(
        "AUTHORING_INVALID_SELECTION",
        "Loop/ring selection requires edges.",
      );
    const byFace = new Map(mesh.faces.map((f) => [f.id, f])),
      incident = new Map(mesh.vertices.map((v) => [v.id, []]));
    for (const e of edges.values()) {
      incident.get(e.a).push(e);
      incident.get(e.b).push(e);
    }
    const pending = [...selected];
    while (pending.length) {
      const id = pending.pop(),
        e = edges.get(id),
        next = [];
      if (action === "ring") {
        for (const use of e.uses) {
          const f = byFace.get(use.face);
          if (f.vertices.length !== 4) continue;
          const index = (use.index + 2) % 4,
            a = f.vertices[index],
            b = f.vertices[(index + 1) % 4];
          next.push(meshEdgeId(a, b));
        }
      } else
        for (const v of [e.a, e.b]) {
          const candidates = incident.get(v);
          if (candidates.length !== 4) continue;
          const adjacentFaces = new Set(e.uses.map((u) => u.face)),
            opposite = candidates.filter(
              (other) =>
                other.id !== id &&
                !other.uses.some((u) => adjacentFaces.has(u.face)),
            );
          if (opposite.length === 1) next.push(opposite[0].id);
        }
      for (const id of next)
        if (!selected.has(id)) {
          selected.add(id);
          pending.push(id);
        }
    }
  } else
    throw error("AUTHORING_INVALID_SELECTION", "Unknown selection action.");
  return { ...selection, ids: [...selected].sort() };
}
