import { modifyAuthoringSelection } from "./selection.js";
import {
  authoringError as error,
  requireFields,
  requireText,
} from "../contracts/value.js";

export function installAuthoringEditingServices(project, mesh) {
  project.registerKind({
    id: "selection",
    version: 1,
    normalize(input) {
      requireFields(input, ["meshId", "mode", "ids"], "selection");
      requireText(input.meshId, "mesh ID");
      if (
        !["object", "vertex", "edge", "face"].includes(input.mode) ||
        !Array.isArray(input.ids) ||
        new Set(input.ids).size !== input.ids.length
      )
        throw error("AUTHORING_INVALID_SELECTION", "Invalid selection.");
      for (const id of input.ids) requireText(id, "element ID");
      return input;
    },
    dependencies: (content) => [
      { id: content.meshId, kind: "mesh", revision: "latest" },
    ],
    validateReferences(content, get) {
      mesh.resolveContentSelection(get(content.meshId).content, content);
    },
  });
  project.registerOperation({
    id: "editing.select",
    domainPath: "n:authoring:editing",
    schemaVersion: 1,
    parameters: { fields: ["id", "expectedRevision", "meshId", "mode", "ids"] },
    effects: { writes: ["selection"], reads: ["mesh"], atomic: true },
    profile: "explicit-element-selection/1",
    cancellation: "before-submit",
    execute(tx, args) {
      requireFields(
        args,
        ["id", "expectedRevision", "meshId", "mode", "ids"],
        "editing.select",
      );
      const doc = tx.get(args.meshId);
      if (doc.kind !== "mesh")
        throw error("AUTHORING_DEPENDENCY_KIND", "Selection requires a mesh.");
      // Validate against staged data, including a mesh created earlier in this transaction.
      mesh.resolveContentSelection(doc.content, args);
      tx.put(
        {
          id: args.id,
          kind: "selection",
          content: { meshId: args.meshId, mode: args.mode, ids: args.ids },
        },
        args.expectedRevision,
      );
      return { id: args.id, count: args.ids.length };
    },
  });
  project.registerOperation({
    id: "editing.modify",
    domainPath: "n:authoring:editing",
    schemaVersion: 1,
    parameters: { fields: ["id", "expectedRevision", "action", "ids"] },
    effects: {
      reads: ["mesh", "selection"],
      writes: ["selection"],
      atomic: true,
    },
    profile: "adjacency-selection-quad-loops/1",
    cancellation: "before-submit",
    execute(tx, args) {
      requireFields(
        args,
        ["id", "expectedRevision", "action", "ids"],
        "editing.modify",
      );
      const d = tx.get(args.id, args.expectedRevision);
      if (d.kind !== "selection")
        throw error("AUTHORING_DEPENDENCY_KIND", "Expected selection.");
      const source = tx.get(d.content.meshId);
      tx.put(
        {
          ...d,
          content: modifyAuthoringSelection(source.content, d.content, args),
        },
        args.expectedRevision,
      );
      return { id: d.id };
    },
  });
  project.registerKind({
    id: "object-selection",
    version: 1,
    normalize(input) {
      requireFields(input, ["assemblyId", "ids"], "object selection");
      requireText(input.assemblyId, "assembly ID");
      if (
        !Array.isArray(input.ids) ||
        new Set(input.ids).size !== input.ids.length
      )
        throw error(
          "AUTHORING_INVALID_SELECTION",
          "Object selection IDs must be unique.",
        );
      input.ids.forEach((id) => requireText(id, "object node ID"));
      return input;
    },
    dependencies: (c) => [
      { id: c.assemblyId, kind: "assembly", revision: "latest" },
    ],
    validateReferences(c, get) {
      const ids = new Set(get(c.assemblyId).content.nodes.map((n) => n.id));
      if (c.ids.some((id) => !ids.has(id)))
        throw error(
          "AUTHORING_ELEMENT_MISSING",
          "Selected assembly node is missing.",
        );
    },
  });
  project.registerOperation({
    id: "editing.object-select",
    domainPath: "n:authoring:editing",
    schemaVersion: 1,
    parameters: { fields: ["id", "expectedRevision", "assemblyId", "ids"] },
    effects: {
      reads: ["assembly"],
      writes: ["object-selection"],
      atomic: true,
    },
    requiredKits: ["authoring-assembly-service-kit"],
    profile: "assembly-instance-selection/1",
    cancellation: "before-submit",
    execute(tx, args) {
      requireFields(
        args,
        ["id", "expectedRevision", "assemblyId", "ids"],
        "editing.object-select",
      );
      tx.put(
        {
          id: args.id,
          kind: "object-selection",
          content: { assemblyId: args.assemblyId, ids: args.ids },
        },
        args.expectedRevision,
      );
      return { id: args.id };
    },
  });
  return Object.freeze({
    modifyContent: modifyAuthoringSelection,
    cancelPreview(preview) {
      return { status: "cancelled", baseClock: preview.baseClock };
    },
    preview: (request) => project.preview(request),
    acceptPreview: (preview) => project.acceptPreview(preview),
    inspect(id) {
      const selection = project.getDocument(id);
      if (selection.kind !== "selection")
        throw error(
          "AUTHORING_DEPENDENCY_KIND",
          "Expected a selection document.",
        );
      return {
        ...selection.content,
        vertices: mesh.resolveSelection(
          selection.content.meshId,
          selection.content,
        ),
      };
    },
  });
}
