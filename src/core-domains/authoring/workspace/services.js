import {
  registerDocumentService,
  reference,
  typedDocument,
} from "../contracts/services.js";
import {
  authoringError as error,
  requireFields,
  requireText,
} from "../contracts/value.js";
export function normalizeAuthoringWorkspace(input) {
  requireFields(
    input,
    ["open", "active", "mode", "views", "tool"],
    "workspace",
  );
  if (
    !Array.isArray(input.open) ||
    new Set(input.open.map((r) => r.id)).size !== input.open.length
  )
    throw error(
      "AUTHORING_INVALID_WORKSPACE",
      "Open references must be unique.",
    );
  for (const r of input.open) {
    requireFields(r, ["id", "kind"], "open reference");
    requireText(r.id, "document ID");
    requireText(r.kind, "kind");
  }
  if (input.active !== null && !input.open.some((r) => r.id === input.active))
    throw error("AUTHORING_INVALID_WORKSPACE", "Active document must be open.");
  if (
    ![
      "object",
      "vertex",
      "edge",
      "face",
      "sculpt",
      "paint",
      "pose",
      "animation",
    ].includes(input.mode)
  )
    throw error("AUTHORING_INVALID_WORKSPACE", "Unknown editing mode.");
  if (!Array.isArray(input.views))
    throw error("AUTHORING_INVALID_WORKSPACE", "Views must be references.");
  for (const view of input.views) {
    requireFields(view, ["name", "id", "kind"], "view");
    requireText(view.name, "view name");
    requireText(view.id, "view ID");
    requireText(view.kind, "view kind");
  }
  if (input.tool !== null) requireText(input.tool, "tool ID");
  return input;
}
export function installAuthoringWorkspaceServices(project) {
  const register = registerDocumentService(project, {
    kind: "workspace",
    normalize: normalizeAuthoringWorkspace,
    dependencies: (c) =>
      [...c.open, ...c.views].map((r) => reference(r.id, r.kind)),
    profile: "document-reference-workspaces/1",
  });
  register("open", ["id", "expectedRevision", "documentId"], (tx, a) => {
    const w = typedDocument(tx, a.id, "workspace", a.expectedRevision),
      d = tx.get(a.documentId);
    if (d.kind === "workspace")
      throw error(
        "AUTHORING_INVALID_WORKSPACE",
        "Workspace references cannot open another workspace.",
      );
    const open = w.content.open.filter((r) => r.id !== d.id);
    open.push({ id: d.id, kind: d.kind });
    tx.put(
      { ...w, content: { ...w.content, open, active: d.id } },
      a.expectedRevision,
    );
    return { id: w.id };
  });
  register("close", ["id", "expectedRevision", "documentId"], (tx, a) => {
    const w = typedDocument(tx, a.id, "workspace", a.expectedRevision),
      open = w.content.open.filter((r) => r.id !== a.documentId);
    tx.put(
      {
        ...w,
        content: {
          ...w.content,
          open,
          active:
            w.content.active === a.documentId
              ? (open[0]?.id ?? null)
              : w.content.active,
        },
      },
      a.expectedRevision,
    );
    return { id: w.id };
  });
  return {
    normalize: normalizeAuthoringWorkspace,
    empty: () => ({
      open: [],
      active: null,
      mode: "object",
      views: [],
      tool: null,
    }),
    inspect: (id) => project.getDocument(id).content,
  };
}
