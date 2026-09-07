import {
  registerDocumentService,
  reference,
  typedDocument,
} from "../contracts/services.js";
import {
  authoringError as error,
  canonical,
  hash,
  requireFields,
  requireText,
} from "../contracts/value.js";
import { modifierAlgorithms, shrinkwrapAuthoringMesh } from "./evaluate.js";
import { booleanAuthoringMesh } from "./boolean.js";
import { decimateAuthoringMesh, remeshAuthoringMesh } from "./decimation.js";
const parameters = {
  mirror: ["axis", "offset", "tolerance", "merge"],
  array: ["count", "offset"],
  subdivision: ["levels"],
  solidify: ["thickness"],
  smooth: ["iterations", "factor", "preserveBoundary"],
  shrinkwrap: ["targetId", "offset", "strength"],
  deform: ["mode", "axis", "amount"],
  boolean: ["targetId", "operation", "tolerance", "materialOffset"],
  decimation: ["ratio", "preserveBoundary"],
  remesh: ["iterations", "relaxation"],
};
export function normalizeAuthoringModifier(input) {
  const c = canonical(input);
  requireFields(c, ["meshId", "stack"], "modifier");
  requireText(c.meshId, "mesh ID");
  if (
    !Array.isArray(c.stack) ||
    c.stack.length > 32 ||
    new Set(c.stack.map((m) => m.id)).size !== c.stack.length
  )
    throw error(
      "AUTHORING_INVALID_MODIFIER",
      "Stack needs at most 32 unique modifiers.",
    );
  for (const m of c.stack) {
    requireFields(m, ["id", "type", "enabled", "parameters"], "modifier entry");
    requireText(m.id, "modifier ID");
    if (!Object.hasOwn(parameters, m.type))
      throw error(
        "AUTHORING_UNSUPPORTED_MODIFIER",
        `Unknown modifier ${m.type}.`,
      );
    m.enabled ??= true;
    if (typeof m.enabled !== "boolean")
      throw error("AUTHORING_INVALID_MODIFIER", "Enabled must be boolean.");
    m.parameters ??= {};
    requireFields(m.parameters, parameters[m.type], m.type);
    if (["boolean", "shrinkwrap"].includes(m.type))
      requireText(m.parameters.targetId, "target mesh ID");
  }
  return c;
}
export function evaluateAuthoringModifiers(c, get) {
  let mesh = get(c.meshId).content;
  const stages = [];
  for (const m of c.stack) {
    if (!m.enabled) continue;
    const args = m.parameters;
    if (m.type === "shrinkwrap")
      mesh = shrinkwrapAuthoringMesh(mesh, get(args.targetId).content, args);
    else if (m.type === "boolean")
      mesh = booleanAuthoringMesh(mesh, get(args.targetId).content, args);
    else if (m.type === "decimation") mesh = decimateAuthoringMesh(mesh, args);
    else if (m.type === "remesh") mesh = remeshAuthoringMesh(mesh, args);
    else mesh = modifierAlgorithms[m.type](mesh, args);
    stages.push({
      id: m.id,
      type: m.type,
      vertices: mesh.vertices.length,
      faces: mesh.faces.length,
    });
  }
  return { mesh, stages, algorithm: "native-js-modifier-stack/1" };
}
export function installAuthoringModifierServices(project) {
  const register = registerDocumentService(project, {
    kind: "modifier",
    normalize: normalizeAuthoringModifier,
    dependencies: (c) => [
      reference(c.meshId, "mesh"),
      ...c.stack
        .filter((m) => m.enabled && ["boolean", "shrinkwrap"].includes(m.type))
        .map((m) => reference(m.parameters.targetId, "mesh")),
    ],
    profile: "binary-crease-catmull-clark-bsp-csg-validated-edge-collapse/1",
  });
  register("entry", ["id", "expectedRevision", "entry"], (tx, a) => {
    const d = typedDocument(tx, a.id, "modifier", a.expectedRevision),
      stack = d.content.stack.filter((m) => m.id !== a.entry.id);
    stack.push(a.entry);
    tx.put({ ...d, content: { ...d.content, stack } }, a.expectedRevision);
    return { id: d.id };
  });
  register("reorder", ["id", "expectedRevision", "order"], (tx, a) => {
    const d = typedDocument(tx, a.id, "modifier", a.expectedRevision);
    if (
      !Array.isArray(a.order) ||
      new Set(a.order).size !== d.content.stack.length ||
      a.order.length !== d.content.stack.length ||
      a.order.some((id) => !d.content.stack.some((m) => m.id === id))
    )
      throw error(
        "AUTHORING_INVALID_MODIFIER",
        "Order must name each stack entry once.",
      );
    tx.put(
      {
        ...d,
        content: {
          ...d.content,
          stack: a.order.map((id) => d.content.stack.find((m) => m.id === id)),
        },
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  register("remove", ["id", "expectedRevision", "entryId"], (tx, a) => {
    const d = typedDocument(tx, a.id, "modifier", a.expectedRevision);
    if (!d.content.stack.some((m) => m.id === a.entryId))
      throw error("AUTHORING_ELEMENT_MISSING", "Modifier missing.");
    tx.put(
      {
        ...d,
        content: {
          ...d.content,
          stack: d.content.stack.filter((m) => m.id !== a.entryId),
        },
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  register(
    "apply",
    ["id", "expectedRevision", "meshRevision", "outputId"],
    (tx, a) => {
      const d = typedDocument(tx, a.id, "modifier", a.expectedRevision),
        m = typedDocument(tx, d.content.meshId, "mesh", a.meshRevision),
        result = evaluateAuthoringModifiers(d.content, (id) => tx.get(id));
      tx.put(
        { id: a.outputId ?? m.id, kind: "mesh", content: result.mesh },
        a.outputId ? undefined : a.meshRevision,
      );
      if (!a.outputId)
        tx.put(
          { ...d, content: { ...d.content, stack: [] } },
          a.expectedRevision,
        );
      return { id: a.outputId ?? m.id, stages: result.stages };
    },
  );
  return {
    normalize: normalizeAuthoringModifier,
    evaluateContent: evaluateAuthoringModifiers,
    evaluate(id) {
      const d = project.getDocument(id);
      if (d.kind !== "modifier")
        throw error("AUTHORING_DEPENDENCY_KIND", "Expected modifier stack.");
      const sources = [
        d,
        ...d.dependencies.map((r) => project.getDocument(r.id)),
      ];
      return {
        ...evaluateAuthoringModifiers(d.content, (id) =>
          project.getDocument(id),
        ),
        key: hash(sources.map((s) => [s.id, s.revision, s.hash])),
      };
    },
  };
}
