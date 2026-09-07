import { createAuthoringPrimitive } from "./primitives.js";
import { editAuthoringTopology } from "./topology.js";
import { evaluateAuthoringMesh } from "./evaluate.js";
import {
  createAuthoringCube,
  inspectAuthoringMesh,
  normalizeAuthoringMesh,
  resolveAuthoringSelection,
  transformAuthoringMesh,
} from "./geometry.js";
import { authoringError as error, requireFields } from "../contracts/value.js";

export function installAuthoringMeshServices(project) {
  project.registerKind({
    id: "mesh",
    version: 1,
    normalize: normalizeAuthoringMesh,
    dependencies: () => [],
  });
  const register = (id, fields, execute) =>
    project.registerOperation({
      id,
      domainPath: "n:authoring:mesh",
      schemaVersion: 1,
      parameters: { type: "object", fields, additionalProperties: false },
      effects: { writes: ["mesh"], atomic: true },
      profile: "planar-manifold-polygons/1",
      cancellation: "before-submit",
      execute(tx, args) {
        requireFields(args, fields, id);
        return execute(tx, args);
      },
    });
  register("mesh.create", ["id", "mesh"], (tx, args) => {
    tx.put({ id: args.id, kind: "mesh", content: args.mesh });
    return { id: args.id };
  });
  register("mesh.replace", ["id", "expectedRevision", "mesh"], (tx, args) => {
    const doc = tx.get(args.id, args.expectedRevision);
    if (doc.kind !== "mesh")
      throw error("AUTHORING_DEPENDENCY_KIND", "Expected mesh.");
    tx.put({ ...doc, content: args.mesh }, args.expectedRevision);
    return { id: doc.id };
  });
  register("mesh.cube", ["id", "size"], (tx, args) => {
    tx.put({
      id: args.id,
      kind: "mesh",
      content: createAuthoringCube({ size: args.size }),
    });
    return { id: args.id };
  });
  register(
    "mesh.transform",
    [
      "id",
      "expectedRevision",
      "selection",
      "translation",
      "rotation",
      "scale",
      "pivot",
      "coordinateFrame",
      "proportionalRadius",
    ],
    (tx, args) => {
      const doc = tx.get(args.id, args.expectedRevision);
      if (doc.kind !== "mesh")
        throw error(
          "AUTHORING_DEPENDENCY_KIND",
          "Transform requires a mesh document.",
        );
      const { id, expectedRevision, ...transform } = args;
      const next = transformAuthoringMesh(doc.content, transform);
      tx.put({ id, kind: "mesh", content: next }, expectedRevision);
      return {
        id,
        changedVertices: resolveAuthoringSelection(
          doc.content,
          transform.selection ?? { mode: "object", ids: [] },
        ).length,
      };
    },
  );
  register("mesh.primitive", ["id", "parameters"], (tx, args) => {
    tx.put({
      id: args.id,
      kind: "mesh",
      content: createAuthoringPrimitive(args.parameters),
    });
    return { id: args.id };
  });
  register(
    "mesh.topology",
    ["id", "expectedRevision", "parameters", "outputId"],
    (tx, args) => {
      const doc = tx.get(args.id, args.expectedRevision);
      if (doc.kind !== "mesh")
        throw error("AUTHORING_DEPENDENCY_KIND", "Expected mesh.");
      const result = editAuthoringTopology(doc.content, args.parameters);
      tx.put(
        { id: args.outputId ?? args.id, kind: "mesh", content: result.mesh },
        args.outputId ? undefined : args.expectedRevision,
      );
      return {
        id: args.outputId ?? args.id,
        changedElements: Object.fromEntries(
          Object.entries(result.changes).map(([kind, value]) => [
            kind,
            Object.fromEntries(
              Object.entries(value).map(([field, ids]) => [field, ids.length]),
            ),
          ]),
        ),
        attributePolicy: result.attributePolicy,
      };
    },
  );
  register(
    "mesh.attribute",
    ["id", "expectedRevision", "attribute"],
    (tx, args) => {
      const doc = tx.get(args.id, args.expectedRevision);
      if (doc.kind !== "mesh")
        throw error("AUTHORING_DEPENDENCY_KIND", "Expected mesh.");
      tx.put(
        {
          id: args.id,
          kind: "mesh",
          content: {
            ...doc.content,
            attributes: [
              ...doc.content.attributes.filter(
                (a) => a.id !== args.attribute.id,
              ),
              args.attribute,
            ],
          },
        },
        args.expectedRevision,
      );
      return { id: args.id, attribute: args.attribute.id };
    },
  );
  return Object.freeze({
    normalize: normalizeAuthoringMesh,
    createPrimitive: createAuthoringPrimitive,
    editTopology: editAuthoringTopology,
    evaluateContent: evaluateAuthoringMesh,
    evaluate(id, options) {
      return evaluateAuthoringMesh(project.getDocument(id).content, options);
    },
    createCube: createAuthoringCube,
    transform: transformAuthoringMesh,
    inspect(id) {
      const doc = project.getDocument(id);
      if (doc.kind !== "mesh")
        throw error("AUTHORING_DEPENDENCY_KIND", "Expected a mesh.");
      return inspectAuthoringMesh(doc.content);
    },
    resolveSelection(id, selection) {
      return resolveAuthoringSelection(
        project.getDocument(id).content,
        selection,
      );
    },
  });
}
