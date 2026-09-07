import {
  normalizeCompositionTree,
  validateCompositionTree,
  planCompositionTree,
  createEngineRegistrySnapshot,
} from "nexusengine/domains/composition";
import {
  registerDocumentService,
  typedDocument,
} from "../contracts/services.js";
import {
  authoringError as error,
  canonical,
  requireFields,
  requireInteger,
  requireText,
} from "../contracts/value.js";
export function normalizeAuthoringDomainComposition(input) {
  const c = canonical(input);
  requireFields(
    c,
    ["schema", "id", "revision", "registryHash", "rootNodeId", "nodes"],
    "composition",
  );
  requireText(c.id, "composition ID");
  requireText(c.rootNodeId, "root node ID");
  requireInteger(c.revision ?? 1, "composition revision");
  if (!Array.isArray(c.nodes) || !c.nodes.length || c.nodes.length > 1024)
    throw error(
      "AUTHORING_INVALID_COMPOSITION",
      "Composition needs 1–1024 nodes.",
    );
  for (const n of c.nodes) {
    requireFields(
      n,
      [
        "id",
        "kind",
        "registryId",
        "parentNodeId",
        "order",
        "enabled",
        "labelOverride",
        "config",
      ],
      "composition node",
    );
    if (n.order !== undefined) requireInteger(n.order, "node order");
    if (n.enabled !== undefined && typeof n.enabled !== "boolean")
      throw error("AUTHORING_INVALID_COMPOSITION", "Enabled must be boolean.");
  }
  return canonical(normalizeCompositionTree(c));
}
export function installAuthoringDomainCompositionServices(project) {
  const registry = () => createEngineRegistrySnapshot(),
    validate = (c) => validateCompositionTree(c, registry());
  const register = registerDocumentService(project, {
    kind: "domain-composition",
    normalize: normalizeAuthoringDomainComposition,
    validateReferences(c) {
      const result = validate(c);
      if (!result.ok)
        throw error(
          "AUTHORING_INVALID_COMPOSITION",
          "Composition does not match the trusted Core registry.",
          { errors: result.errors },
        );
    },
    profile: "trusted-core-registry-composition-tree/1",
  });
  register("node", ["id", "expectedRevision", "node"], (tx, a) => {
    const d = typedDocument(tx, a.id, "domain-composition", a.expectedRevision),
      nodes = d.content.nodes.filter((n) => n.id !== a.node.id);
    nodes.push(a.node);
    tx.put(
      {
        ...d,
        content: { ...d.content, nodes, revision: d.content.revision + 1 },
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  register("remove-node", ["id", "expectedRevision", "nodeId"], (tx, a) => {
    const d = typedDocument(tx, a.id, "domain-composition", a.expectedRevision);
    if (!d.content.nodes.some((n) => n.id === a.nodeId))
      throw error("AUTHORING_ELEMENT_MISSING", "Composition node missing.");
    tx.put(
      {
        ...d,
        content: {
          ...d.content,
          nodes: d.content.nodes.filter((n) => n.id !== a.nodeId),
          revision: d.content.revision + 1,
        },
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  return {
    normalize: normalizeAuthoringDomainComposition,
    discover: () => registry(),
    validate,
    plan: (id) =>
      planCompositionTree(project.getDocument(id).content, registry()),
  };
}
